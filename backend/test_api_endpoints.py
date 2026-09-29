import sys
import os
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from main import app

client = TestClient(app)

def test_full_system():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health check OK.")

    print("--- 2. Testing Admin Login ---")
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@pms.com",
        "password": "admin123"
    })
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Admin login successful. Token acquired.")

    print("--- 3. Testing Public Property API & Privacy Isolation ---")
    props_res = client.get("/api/v1/properties")
    assert props_res.status_code == 200, f"Get properties failed: {props_res.text}"
    props_data = props_res.json()
    assert props_data["total"] >= 4, f"Expected at least 4 properties, got {props_data['total']}"
    
    # Verify single property details
    sample_code = props_data["items"][0]["property_code"]
    detail_res = client.get(f"/api/v1/properties/{sample_code}")
    assert detail_res.status_code == 200, f"Property detail failed: {detail_res.text}"
    prop_detail = detail_res.json()

    # STRICT PRIVACY CHECKS:
    assert "flat_number" not in prop_detail, "SECURITY ISSUE: flat_number leaked in public API!"
    assert "tower" not in prop_detail, "SECURITY ISSUE: tower leaked in public API!"
    assert "brokerage" not in prop_detail, "SECURITY ISSUE: brokerage leaked in public API!"
    print(f"Public property {sample_code} retrieved with 100% privacy compliance.")

    print("--- 4. Testing Customer Deduplication by Mobile ---")
    enq1_res = client.post("/api/v1/enquiries", json={
        "name": "Rohan Verma",
        "mobile": "+91 9811223344",
        "email": "rohan@example.com",
        "property_code": sample_code,
        "message": "Interested in renting this flat immediately.",
        "source": "Instagram",
        "utm_source": "instagram_ad"
    })
    assert enq1_res.status_code == 200, f"Enquiry 1 failed: {enq1_res.text}"

    enq2_res = client.post("/api/v1/enquiries", json={
        "name": "Rohan Verma",
        "mobile": "9811223344",  # Same mobile, different formatting
        "email": "rohan.v@example.com",
        "property_code": "PROP-0002",
        "message": "Also looking at this builder floor.",
        "source": "Website"
    })
    assert enq2_res.status_code == 200, f"Enquiry 2 failed: {enq2_res.text}"

    # Check Admin Customer List
    cust_res = client.get("/api/v1/admin/customers?search=9811223344", headers=headers)
    assert cust_res.status_code == 200, f"Admin customer lookup failed: {cust_res.text}"
    cust_data = cust_res.json()
    assert cust_data["total"] == 1, f"Expected exactly 1 deduplicated customer record, found {cust_data['total']}!"
    customer_record = cust_data["items"][0]
    assert customer_record["total_enquiries"] == 2, f"Customer should have 2 enquiries, found {customer_record['total_enquiries']}"
    print(f"Customer deduplication verified. Customer ID {customer_record['id']} has {customer_record['total_enquiries']} linked enquiries.")

    print("--- 5. Testing Public Visit Booking ---")
    visit_res = client.post("/api/v1/visits", json={
        "name": "Rohan Verma",
        "mobile": "9811223344",
        "property_code": sample_code,
        "scheduled_date": "2026-09-25",
        "scheduled_time": "04:00 PM",
        "message": "Please arrange a physical visit."
    })
    assert visit_res.status_code == 200, f"Visit booking failed: {visit_res.text}"
    print("Visit request scheduled successfully.")

    print("--- 6. Testing Admin Property Duplication ---")
    admin_props = client.get("/api/v1/admin/properties", headers=headers).json()
    prop_to_dup = admin_props["items"][0]
    dup_res = client.post(f"/api/v1/admin/properties/{prop_to_dup['id']}/duplicate", headers=headers)
    assert dup_res.status_code == 200, f"Duplicate property failed: {dup_res.text}"
    duplicated_prop = dup_res.json()
    assert duplicated_prop["property_code"] != prop_to_dup["property_code"], "Duplicated property must have unique code"
    assert duplicated_prop["publication_status"] == "Draft", "Duplicated property must default to Draft"
    assert duplicated_prop["property_status"] == "Available", "Duplicated property must default to Available"
    print(f"Property duplicated safely: {duplicated_prop['property_code']} (Status: {duplicated_prop['publication_status']})")

    print("--- 7. Testing Soft-Delete & Historical Record Preservation ---")
    # Soft delete the duplicated property
    del_res = client.delete(f"/api/v1/admin/properties/{duplicated_prop['id']}", headers=headers)
    assert del_res.status_code == 200
    
    # Confirm it does not appear in normal admin list
    normal_list = client.get("/api/v1/admin/properties?include_archived=false", headers=headers).json()
    assert not any(p["id"] == duplicated_prop["id"] for p in normal_list["items"]), "Archived property still in normal list!"

    # Confirm it appears in archived list
    archived_list = client.get("/api/v1/admin/properties?include_archived=true", headers=headers).json()
    assert any(p["id"] == duplicated_prop["id"] for p in archived_list["items"]), "Archived property missing from archived query!"
    print("Soft-deletion verified with full archive query support.")

    print("--- 8. Testing Public Settings & Dynamic WhatsApp ---")
    settings_res = client.get("/api/v1/settings/public")
    assert settings_res.status_code == 200
    settings_data = settings_res.json()
    assert "whatsapp" in settings_data
    assert "default_whatsapp_message" in settings_data
    print(f"Dynamic Settings verified. WhatsApp: {settings_data['whatsapp']}")

    print("--- 9. Testing Dashboard Metrics ---")
    dash_res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_properties"] >= 4
    assert dash_data["total_enquiries"] >= 2
    assert dash_data["pending_visits"] >= 1
    print(f"Dashboard metrics verified. Active Properties: {dash_data['total_properties']}, Enquiries: {dash_data['total_enquiries']}, Visits: {dash_data['pending_visits']}.")

    print("\nALL BACKEND API AND ARCHITECTURE TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_full_system()
