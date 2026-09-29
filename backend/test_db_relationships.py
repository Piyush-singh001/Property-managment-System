import sys
import os
from datetime import date, datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.property import Property
from app.models.customer import Customer
from app.models.enquiry import Enquiry
from app.models.visit import Visit
from app.services.property_service import PropertyService

def test_historical_record_preservation():
    db = SessionLocal()
    try:
        print("1. Creating test property...")
        code = PropertyService.generate_property_code(db)
        test_prop = Property(
            property_code=code,
            title="Relationship Test Apartment",
            property_type="Apartment",
            bhk="2 BHK",
            furnishing="Semi Furnished",
            property_status="Available",
            publication_status="Published",
            locality="Baner",
            society_name="Test Meadows",
            address="Test Address, Baner, Pune",
            rent=30000,
            security_deposit=60000
        )
        db.add(test_prop)
        db.commit()
        db.refresh(test_prop)
        prop_id = test_prop.id
        prop_code = test_prop.property_code
        print(f"   Created property {prop_code} (ID: {prop_id})")

        print("2. Creating test customer...")
        test_customer = Customer(
            name="Relationship Tester",
            mobile="9876500001",
            email="tester@example.com"
        )
        db.add(test_customer)
        db.commit()
        db.refresh(test_customer)
        cust_id = test_customer.id
        print(f"   Created customer {test_customer.name} (ID: {cust_id})")

        print("3. Creating test enquiry linked to property...")
        test_enquiry = Enquiry(
            customer_id=cust_id,
            property_id=prop_id,
            property_code=prop_code,
            status="New",
            message="Testing non-destructive FK"
        )
        db.add(test_enquiry)
        db.commit()
        db.refresh(test_enquiry)
        enq_id = test_enquiry.id
        print(f"   Created enquiry (ID: {enq_id}) with property_id: {test_enquiry.property_id}")

        print("4. Creating test visit linked to property...")
        test_visit = Visit(
            enquiry_id=enq_id,
            customer_id=cust_id,
            property_id=prop_id,
            property_code=prop_code,
            scheduled_date=date.today(),
            scheduled_time="11:00 AM",
            status="Confirmed"
        )
        db.add(test_visit)
        db.commit()
        db.refresh(test_visit)
        visit_id = test_visit.id
        print(f"   Created visit (ID: {visit_id}) with property_id: {test_visit.property_id}")

        print("\n5. Testing Soft Deletion of Property...")
        PropertyService.soft_delete_property(db, prop_id)
        
        # Verify property is soft deleted
        soft_deleted_prop = db.query(Property).filter(Property.id == prop_id).first()
        assert soft_deleted_prop.deleted_at is not None, "Property should have deleted_at timestamp set"
        print(f"   Property soft-deleted at {soft_deleted_prop.deleted_at}")

        # Verify Enquiry and Visit are still present and intact
        enq_after_soft_del = db.query(Enquiry).filter(Enquiry.id == enq_id).first()
        visit_after_soft_del = db.query(Visit).filter(Visit.id == visit_id).first()
        assert enq_after_soft_del is not None, "Enquiry must NOT be deleted when property is soft-deleted"
        assert visit_after_soft_del is not None, "Visit must NOT be deleted when property is soft-deleted"
        assert enq_after_soft_del.property_code == prop_code, "Enquiry property_code must be preserved"
        assert visit_after_soft_del.property_code == prop_code, "Visit property_code must be preserved"
        print("   SUCCESS: Enquiry and Visit remain completely intact after property soft-deletion!")

        print("\n6. Testing Hard Deletion / Database Cascade Safety (SET NULL behavior)...")
        # Now delete the property row directly to test ON DELETE SET NULL
        db.delete(soft_deleted_prop)
        db.commit()

        enq_after_hard_del = db.query(Enquiry).filter(Enquiry.id == enq_id).first()
        visit_after_hard_del = db.query(Visit).filter(Visit.id == visit_id).first()
        assert enq_after_hard_del is not None, "Enquiry must survive property hard-delete"
        assert visit_after_hard_del is not None, "Visit must survive property hard-delete"
        assert visit_after_hard_del.property_code == prop_code, "Visit property_code snapshot preserved"
        assert enq_after_hard_del.property_code == prop_code, "Enquiry property_code snapshot preserved"
        print(f"   Enquiry property_id after hard-delete: {enq_after_hard_del.property_id}")
        print(f"   Visit property_id after hard-delete: {visit_after_hard_del.property_id}")
        print(f"   Enquiry property_code snapshot: {enq_after_hard_del.property_code}")
        print(f"   Visit property_code snapshot: {visit_after_hard_del.property_code}")
        print("   SUCCESS: Visit and Enquiry preserved with property_code snapshot even if property row is removed!")

        # Clean up test entities
        db.delete(visit_after_hard_del)
        db.delete(enq_after_hard_del)
        db.delete(test_customer)
        db.commit()
        print("\nAll relationship and historical preservation assertions passed cleanly!")

    finally:
        db.close()

if __name__ == "__main__":
    test_historical_record_preservation()
