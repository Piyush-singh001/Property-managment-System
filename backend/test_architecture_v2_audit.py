import sys
import os
from datetime import date, datetime, timezone
import httpx

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.property import Property
from app.models.customer import Customer
from app.models.enquiry import Enquiry
from app.models.visit import Visit
from app.models.amenity import Amenity
from app.models.media import PropertyImage
from app.services.property_service import PropertyService
from app.services.customer_service import CustomerService, normalize_indian_mobile
from app.services.setting_service import SettingService

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_audit():
    print("=" * 70)
    print("PMS ARCHITECTURE V2 AUDIT & VERIFICATION SUITE")
    print("=" * 70)
    
    db = SessionLocal()
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 0. Admin Login
    print("\n[Step 0] Admin Authentication Check...")
    login_resp = client.post("/auth/login", json={"email": "admin@pms.com", "password": "admin123"})
    assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
    admin_token = login_resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("  -> Admin authenticated successfully (JWT received)")

    # 1. Property Status Verification (2 independent status systems)
    print("\n[Audit 1] Property Status Verification (Two Independent Statuses)...")
    prop_code = PropertyService.generate_property_code(db)
    prop = Property(
        property_code=prop_code,
        title="Audit Status Property",
        property_type="Apartment",
        bhk="2 BHK",
        furnishing="Fully Furnished",
        property_status="Available",
        publication_status="Draft",
        locality="Aundh",
        society_name="Status Heights",
        address="101, Status Heights, Aundh, Pune",
        flat_number="402",
        tower="Tower C",
        brokerage=15000,
        rent=35000,
        security_deposit=70000
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    prop_id = prop.id

    # Test independent update of property_status via admin API
    for p_status in ["Reserved", "Rented", "Inactive", "Available"]:
        patch_res = client.patch(f"/admin/properties/{prop_id}/status", json={"property_status": p_status}, headers=admin_headers)
        assert patch_res.status_code == 200, f"Failed updating property_status to {p_status}: {patch_res.text}"
        assert patch_res.json()["property_status"] == p_status
        assert patch_res.json()["publication_status"] == "Draft", "publication_status was altered unexpectedly!"
    print("  -> property_status independently updated through all 4 valid states without affecting publication_status")

    # Test independent update of publication_status via admin API
    for pub_status in ["Published", "Unpublished", "Draft"]:
        patch_res = client.patch(f"/admin/properties/{prop_id}/publication", json={"publication_status": pub_status}, headers=admin_headers)
        assert patch_res.status_code == 200, f"Failed updating publication_status to {pub_status}: {patch_res.text}"
        assert patch_res.json()["publication_status"] == pub_status
        assert patch_res.json()["property_status"] == "Available", "property_status was altered unexpectedly!"
    print("  -> publication_status independently updated through all 3 valid states without affecting property_status")

    # 2. Public Property Visibility Matrix
    print("\n[Audit 2] Public Property Visibility Matrix Testing...")
    # Permutations:
    # (publication_status, property_status, is_soft_deleted) -> expected visible
    matrix = [
        ("Published", "Available", False, True),
        ("Published", "Reserved", False, True),
        ("Published", "Rented", False, True),
        ("Published", "Inactive", False, False),   # Inactive must be hidden
        ("Draft", "Available", False, False),       # Draft must be hidden
        ("Unpublished", "Available", False, False), # Unpublished must be hidden
        ("Published", "Available", True, False),    # Soft-deleted must be hidden
    ]

    for pub_st, prop_st, is_del, expected_visible in matrix:
        prop.publication_status = pub_st
        prop.property_status = prop_st
        prop.deleted_at = datetime.now(timezone.utc) if is_del else None
        db.commit()
        db.refresh(prop)

        # Check list endpoint
        list_res = client.get(f"/properties?search={prop_code}")
        assert list_res.status_code == 200
        found_in_list = any(item["property_code"] == prop_code for item in list_res.json()["items"])

        # Check detail endpoint
        detail_res = client.get(f"/properties/{prop_code}")
        found_in_detail = (detail_res.status_code == 200)

        assert found_in_list == expected_visible, f"List visibility mismatch for ({pub_st}, {prop_st}, deleted={is_del}): expected {expected_visible}, got {found_in_list}"
        assert found_in_detail == expected_visible, f"Detail visibility mismatch for ({pub_st}, {prop_st}, deleted={is_del}): expected {expected_visible}, got {found_in_detail}"
        print(f"  -> Combination [pub={pub_st:<11} status={prop_st:<9} deleted={str(is_del):<5}] => Visible: {found_in_list} (Expected: {expected_visible}) [PASS]")

    # Restore to Published + Available for privacy audit
    prop.publication_status = "Published"
    prop.property_status = "Available"
    prop.deleted_at = None
    db.commit()

    # 3. Public/Admin Response Privacy Audit
    print("\n[Audit 3] Public Response Privacy Audit (No Private/Internal Fields Exposed)...")
    pub_detail = client.get(f"/properties/{prop_code}").json()
    pub_list = client.get(f"/properties?search={prop_code}").json()["items"][0]

    forbidden_fields = ["flat_number", "tower", "brokerage", "deleted_at", "internal_notes", "owner_name", "owner_mobile"]
    for f in forbidden_fields:
        assert f not in pub_detail, f"PRIVACY VIOLATION: Field '{f}' exposed in public detail response!"
        assert f not in pub_list, f"PRIVACY VIOLATION: Field '{f}' exposed in public list response!"
    print(f"  -> Public detail response strictly sanitized. Verified forbidden fields absent: {forbidden_fields}")
    print(f"  -> Public list response strictly sanitized.")

    # Verify admin response DOES contain flat_number, tower, brokerage
    admin_detail = client.get(f"/admin/properties/{prop_id}", headers=admin_headers).json()
    assert admin_detail.get("flat_number") == "402", "Admin response missing flat_number"
    assert admin_detail.get("tower") == "Tower C", "Admin response missing tower"
    assert float(admin_detail.get("brokerage")) == 15000.0, "Admin response missing brokerage"
    print("  -> Admin response correctly preserves operational fields (flat_number, tower, brokerage)")

    # 4. Property Duplication
    print("\n[Audit 4] Property Duplication Workflow Testing...")
    # Add dummy image and amenity to source property
    amenity = db.query(Amenity).first()
    if amenity:
        prop.amenities.append(amenity)
    img = PropertyImage(property_id=prop.id, image_url="https://images.unsplash.com/photo-test", sort_order=0, is_cover=True)
    db.add(img)
    db.commit()

    # Add dummy enquiry and visit to source property to ensure they are NOT copied
    cust = CustomerService.get_or_create_customer(db, name="Lead Source", mobile="9876540001")
    enq = Enquiry(customer_id=cust.id, property_id=prop.id, property_code=prop.property_code, status="New")
    db.add(enq)
    db.commit()
    db.refresh(enq)
    vis = Visit(enquiry_id=enq.id, customer_id=cust.id, property_id=prop.id, property_code=prop.property_code, scheduled_date=date.today(), scheduled_time="12:00 PM")
    db.add(vis)
    db.commit()

    dup_res = client.post(f"/admin/properties/{prop_id}/duplicate", headers=admin_headers)
    assert dup_res.status_code == 200, f"Duplication failed: {dup_res.text}"
    dup_data = dup_res.json()
    new_prop_id = dup_data["id"]
    new_prop_code = dup_data["property_code"]

    assert new_prop_id != prop_id, "Duplicate property must have a NEW id"
    assert new_prop_code != prop_code, "Duplicate property must have a NEW property_code"
    assert dup_data["property_status"] == "Available", f"Expected Available, got {dup_data['property_status']}"
    assert dup_data["publication_status"] == "Draft", f"Expected Draft, got {dup_data['publication_status']}"
    assert len(dup_data["amenities"]) == len(prop.amenities), "Amenities not copied"
    assert len(dup_data["images"]) == len(prop.images), "Images not copied"

    # Verify enquiries and visits were NOT copied
    dup_enquiries = db.query(Enquiry).filter(Enquiry.property_id == new_prop_id).count()
    dup_visits = db.query(Visit).filter(Visit.property_id == new_prop_id).count()
    assert dup_enquiries == 0, f"CRITICAL: Duplicated property copied {dup_enquiries} enquiries!"
    assert dup_visits == 0, f"CRITICAL: Duplicated property copied {dup_visits} visits!"
    print(f"  -> Source {prop_code} duplicated to {new_prop_code} (ID: {new_prop_id})")
    print(f"  -> Reset to Available + Draft; 0 enquiries and 0 visits copied [PASS]")

    # 5. Customer Deduplication Testing
    print("\n[Audit 5] Customer Deduplication with Indian Mobile Variations...")
    mobile_variations = [
        ("Aarav Initial", "9876522222"),
        ("Aarav Second", "+91 98765 22222"),
        ("Aarav Third", "09876522222"),
        ("Aarav Fourth", "+91-98765-22222"),
        ("Aarav Fifth", "+9109876522222"),
    ]

    # Clean up prior test runs for this test number
    existing_c = db.query(Customer).filter(Customer.mobile == "9876522222").first()
    if existing_c:
        db.query(Enquiry).filter(Enquiry.customer_id == existing_c.id).delete()
        db.delete(existing_c)
        db.commit()

    for name_var, mobile_var in mobile_variations:
        enq_payload = {
            "name": name_var,
            "mobile": mobile_var,
            "property_code": prop_code,
            "message": f"Enquiry from {name_var}",
            "source": "Website"
        }
        res = client.post("/enquiries", json=enq_payload)
        assert res.status_code == 200, f"Failed submitting enquiry for {mobile_var}: {res.text}"

    # Check total customers with normalized mobile '9876522222'
    matching_custs = db.query(Customer).filter(Customer.mobile == "9876522222").all()
    assert len(matching_custs) == 1, f"Deduplication failed! Expected 1 customer, found {len(matching_custs)}"
    cust_record = matching_custs[0]
    enq_count = db.query(Enquiry).filter(Enquiry.customer_id == cust_record.id).count()
    assert enq_count == len(mobile_variations), f"Expected {len(mobile_variations)} enquiries for customer, found {enq_count}"
    print(f"  -> 5 enquiries submitted with different mobile formats (+91, 0, hyphens, spaces)")
    print(f"  -> Result: Exactly 1 customer record created (ID: {cust_record.id}, Mobile: {cust_record.mobile}) with {enq_count} linked enquiries [PASS]")

    # 6. Enquiry Source Tracking & UTM Verification
    print("\n[Audit 6] Enquiry Source Tracking & UTM Support...")
    sources = ["Instagram", "OLX", "Facebook", "Google", "WhatsApp", "Referral", "Direct", "Other"]
    for src in sources:
        enq_res = client.post("/enquiries", json={
            "name": f"Lead {src}",
            "mobile": f"987653333{sources.index(src)}",
            "property_code": prop_code,
            "source": src,
            "utm_source": f"{src.lower()}_campaign",
            "utm_medium": "cpc",
            "utm_campaign": "monsoon_sale"
        })
        assert enq_res.status_code == 200
        enq_id = enq_res.json()["id"]

        # Verify admin retrieves correct source and UTM tags
        admin_enq = client.get(f"/admin/enquiries/{enq_id}", headers=admin_headers).json()
        assert admin_enq["source"] == src
        assert admin_enq["utm_source"] == f"{src.lower()}_campaign"
        assert admin_enq["utm_medium"] == "cpc"
        assert admin_enq["utm_campaign"] == "monsoon_sale"
    print(f"  -> Verified persistence and admin retrieval for all sources ({', '.join(sources)}) and UTM params [PASS]")

    # 7. Soft Deletion & Archive Verification
    print("\n[Audit 7] Soft Deletion & Restore Workflow...")
    # Soft delete
    del_res = client.delete(f"/admin/properties/{prop_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Verify normal admin listing excludes it
    admin_list_active = client.get(f"/admin/properties?search={prop_code}", headers=admin_headers).json()
    assert not any(p["id"] == prop_id for p in admin_list_active["items"]), "Archived property showed in normal admin listing"

    # Verify archived list includes it
    admin_list_archived = client.get(f"/admin/properties?search={prop_code}&include_archived=true", headers=admin_headers).json()
    assert any(p["id"] == prop_id for p in admin_list_archived["items"]), "Archived property not found with include_archived=true"

    # Verify restore
    restore_res = client.post(f"/admin/properties/{prop_id}/restore", headers=admin_headers)
    assert restore_res.status_code == 200
    assert restore_res.json()["deleted_at"] is None
    print("  -> Soft-delete sets deleted_at, hides from active admin list, shows under archived list, and restores cleanly [PASS]")

    # 8. Dynamic System Settings Verification
    print("\n[Audit 8] Dynamic System Settings...")
    settings_res = client.get("/settings/public")
    assert settings_res.status_code == 200
    s_data = settings_res.json()
    for req_key in ["phone", "whatsapp", "email", "business_name", "default_whatsapp_message"]:
        assert req_key in s_data and s_data[req_key], f"Missing setting key: {req_key}"
    print(f"  -> Public settings endpoint returns dynamic business contact and template: {s_data['phone']}, {s_data['whatsapp']}")

    # 9. Security & Error Handling Verification
    print("\n[Audit 9] Security & Error Handling...")
    # Admin endpoint without token
    unauth_res = client.get("/admin/properties")
    assert unauth_res.status_code in [401, 403], f"Expected 401/403 without token, got {unauth_res.status_code}"

    # Invalid mobile format
    bad_mobile_res = client.post("/enquiries", json={"name": "Bad Mobile", "mobile": "12345", "property_code": prop_code})
    assert bad_mobile_res.status_code == 400, f"Expected 400 for bad mobile, got {bad_mobile_res.status_code}"

    # Non-existent property code
    not_found_res = client.get("/properties/NON-EXISTENT-CODE-9999")
    assert not_found_res.status_code == 404, f"Expected 404 for missing property, got {not_found_res.status_code}"
    print("  -> Security guards, auth validation, mobile validation, and 404 handlers verified [PASS]")

    # Cleanup audit records
    db.delete(vis)
    db.delete(enq)
    db.delete(cust)
    db.delete(img)
    db.delete(prop)
    # clean dup
    dup_prop_obj = db.query(Property).filter(Property.id == new_prop_id).first()
    if dup_prop_obj:
        for d_img in dup_prop_obj.images:
            db.delete(d_img)
        db.delete(dup_prop_obj)
    db.commit()
    db.close()

    print("\n" + "=" * 70)
    print("ALL 15 ARCHITECTURE V2 AUDIT CHECKS PASSED WITH ZERO FAILURES!")
    print("=" * 70)

if __name__ == "__main__":
    run_audit()
