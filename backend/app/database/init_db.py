from sqlalchemy.orm import Session
from datetime import datetime, timezone, date
from app.database.session import engine, Base, SessionLocal
from app.models.admin import Admin
from app.models.amenity import Amenity
from app.models.setting import SystemSetting
from app.models.property import Property
from app.models.media import PropertyImage
from app.models.customer import Customer
from app.models.enquiry import Enquiry
from app.models.visit import Visit
from app.core.security import get_password_hash
from app.services.setting_service import DEFAULT_SETTINGS

INITIAL_AMENITIES = [
    ("Air Conditioning", "AirVent"),
    ("Refrigerator", "Refrigerator"),
    ("Washing Machine", "WashingMachine"),
    ("Television", "Tv"),
    ("Bed", "Bed"),
    ("Sofa", "Armchair"),
    ("Dining Table", "Utensils"),
    ("Wardrobe", "DoorClosed"),
    ("Modular Kitchen", "CookingPot"),
    ("Geyser", "Flame"),
    ("Chimney", "Wind"),
    ("Microwave", "Microwave"),
    ("RO", "Droplets"),
    ("Wi-Fi", "Wifi"),
    ("Power Backup", "Zap"),
    ("Lift", "ArrowUpDown"),
    ("Security", "ShieldCheck"),
    ("CCTV", "Camera"),
    ("Swimming Pool", "Waves"),
    ("Gym", "Dumbbell"),
    ("Club House", "Home"),
    ("Park", "Trees"),
    ("Covered Parking", "Car"),
    ("Open Parking", "ParkingSquare")
]

def init_db():
    print("Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db: Session = SessionLocal()
    try:
        # 1. Seed Admin
        admin = db.query(Admin).filter(Admin.email == "admin@pms.com").first()
        if not admin:
            print("Seeding default Admin (admin@pms.com / admin123)...")
            admin = Admin(
                name="Ayush Sengar (Broker Admin)",
                email="admin@pms.com",
                password_hash=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Admin created.")

        # 2. Seed Amenities
        print("Checking amenities...")
        for name, icon in INITIAL_AMENITIES:
            existing = db.query(Amenity).filter(Amenity.name == name).first()
            if not existing:
                db.add(Amenity(name=name, icon=icon, is_active=True))
        db.commit()
        print("Amenities ready.")

        # 3. Seed System Settings
        print("Checking system settings...")
        for k, v in DEFAULT_SETTINGS.items():
            existing = db.query(SystemSetting).filter(SystemSetting.key == k).first()
            if not existing:
                db.add(SystemSetting(key=k, value=v, is_public=True))
        db.commit()
        print("Settings ready.")

        # 4. Seed initial properties if none exist
        prop_count = db.query(Property).count()
        if prop_count == 0:
            print("Seeding initial rich sample properties...")
            all_amenities = db.query(Amenity).all()
            amenity_map = {a.name: a for a in all_amenities}

            sample_props = [
                {
                    "code": "PROP-0001",
                    "title": "Luxury 3 BHK High-Rise Flat with Panoramic View",
                    "type": "Apartment",
                    "bhk": "3 BHK",
                    "furnishing": "Fully Furnished",
                    "status": "Available",
                    "pub": "Published",
                    "locality": "Sector 62",
                    "society": "Stellar Park Residences",
                    "tower": "Tower B",
                    "flat": "1402",
                    "address": "B-1402, Stellar Park, Near Metro Station, Sector 62, Noida",
                    "pincode": "201309",
                    "built_up": 1850.0,
                    "carpet": 1520.0,
                    "floor": 14,
                    "total_floors": 24,
                    "bed": 3,
                    "bath": 3,
                    "balc": 3,
                    "facing": "North-East",
                    "age": "2 Years",
                    "parking": "1 Covered, 1 Open",
                    "lift": True,
                    "rent": 42000.0,
                    "deposit": 84000.0,
                    "maintenance": 4500.0,
                    "m_inc": False,
                    "e_inc": False,
                    "brokerage": 21000.0,
                    "desc": "Stunning 3 BHK apartment featuring designer Italian marble flooring, false ceiling with ambient LED lighting, premium modular kitchen with Chimney and RO, spacious balconies overlooking green park views, and 24x7 clubhouse access with Olympic-sized pool and gym.",
                    "images": [
                        ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", True),
                        ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", False),
                        ("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80", False)
                    ],
                    "amenities": ["Air Conditioning", "Modular Kitchen", "Power Backup", "Lift", "Security", "CCTV", "Swimming Pool", "Gym", "Covered Parking", "Wi-Fi"]
                },
                {
                    "code": "PROP-0002",
                    "title": "Spacious 2 BHK Semi-Furnished Builder Floor",
                    "type": "Builder Floor",
                    "bhk": "2 BHK",
                    "furnishing": "Semi Furnished",
                    "status": "Available",
                    "pub": "Published",
                    "locality": "Indirapuram",
                    "society": "Vaibhav Khand Enclave",
                    "tower": "Block C",
                    "flat": "201",
                    "address": "Plot C-24, Vaibhav Khand, Indirapuram, Ghaziabad",
                    "pincode": "201014",
                    "built_up": 1150.0,
                    "carpet": 980.0,
                    "floor": 2,
                    "total_floors": 4,
                    "bed": 2,
                    "bath": 2,
                    "balc": 2,
                    "facing": "East",
                    "age": "1 Year",
                    "parking": "Covered Reserved",
                    "lift": True,
                    "rent": 24000.0,
                    "deposit": 48000.0,
                    "maintenance": 1500.0,
                    "m_inc": True,
                    "e_inc": False,
                    "brokerage": 12000.0,
                    "desc": "Prime location builder floor near Shipra Mall and Habitat Centre. Wide roads, gated society with security guard, modular wardrobes in both bedrooms, solar water heater, and separate covered car parking.",
                    "images": [
                        ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", True),
                        ("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80", False)
                    ],
                    "amenities": ["Modular Kitchen", "Wardrobe", "Geyser", "Lift", "Security", "Covered Parking", "Power Backup"]
                },
                {
                    "code": "PROP-0003",
                    "title": "Cozy 1 BHK Studio Apartment for Working Professionals",
                    "type": "Apartment",
                    "bhk": "1 BHK",
                    "furnishing": "Fully Furnished",
                    "status": "Available",
                    "pub": "Published",
                    "locality": "Sector 137",
                    "society": "Paras Tierea",
                    "tower": "Tower 6",
                    "flat": "804",
                    "address": "Tower 6, Paras Tierea, Expressway, Sector 137, Noida",
                    "pincode": "201305",
                    "built_up": 650.0,
                    "carpet": 520.0,
                    "floor": 8,
                    "total_floors": 18,
                    "bed": 1,
                    "bath": 1,
                    "balc": 1,
                    "facing": "North",
                    "age": "4 Years",
                    "parking": "Open Parking",
                    "lift": True,
                    "rent": 18000.0,
                    "deposit": 36000.0,
                    "maintenance": 1800.0,
                    "m_inc": False,
                    "e_inc": False,
                    "brokerage": 9000.0,
                    "desc": "Ready-to-move fully furnished 1 BHK with double bed with mattress, 43-inch Smart TV, 1.5-ton Inverter AC, 240L Double-door Refrigerator, automatic washing machine, and high-speed Wi-Fi router. Just 2 mins walk to Sector 137 Metro Station.",
                    "images": [
                        ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", True),
                        ("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", False)
                    ],
                    "amenities": ["Air Conditioning", "Refrigerator", "Washing Machine", "Television", "Bed", "Wi-Fi", "Power Backup", "Lift", "Security"]
                },
                {
                    "code": "PROP-0004",
                    "title": "Lavish 4 BHK Independent Villa with Private Lawn",
                    "type": "Villa",
                    "bhk": "4 BHK",
                    "furnishing": "Fully Furnished",
                    "status": "Available",
                    "pub": "Published",
                    "locality": "Jaypee Greens",
                    "society": "The Castille Villas",
                    "tower": "Villa 12",
                    "flat": "V-12",
                    "address": "Villa 12, Boulevard Walk, Jaypee Greens, Greater Noida",
                    "pincode": "201310",
                    "built_up": 3800.0,
                    "carpet": 3200.0,
                    "floor": 1,
                    "total_floors": 2,
                    "bed": 4,
                    "bath": 5,
                    "balc": 3,
                    "facing": "North-East",
                    "age": "3 Years",
                    "parking": "2 Covered Car Porch",
                    "lift": False,
                    "rent": 95000.0,
                    "deposit": 190000.0,
                    "maintenance": 8000.0,
                    "m_inc": False,
                    "e_inc": False,
                    "brokerage": 47500.0,
                    "desc": "Ultra-exclusive golf course villa with lush landscaped private lawn, modular island kitchen, servant quarters, private jacuzzi in master bedroom, and premium club membership access.",
                    "images": [
                        ("https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80", True),
                        ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", False)
                    ],
                    "amenities": ["Air Conditioning", "Swimming Pool", "Gym", "Club House", "Park", "Covered Parking", "Security", "CCTV", "Power Backup"]
                }
            ]

            for sp in sample_props:
                p = Property(
                    property_code=sp["code"],
                    title=sp["title"],
                    property_type=sp["type"],
                    bhk=sp["bhk"],
                    furnishing=sp["furnishing"],
                    property_status=sp["status"],
                    publication_status=sp["pub"],
                    locality=sp["locality"],
                    society_name=sp["society"],
                    tower=sp["tower"],
                    flat_number=sp["flat"],
                    address=sp["address"],
                    pincode=sp["pincode"],
                    built_up_area=sp["built_up"],
                    carpet_area=sp["carpet"],
                    floor=sp["floor"],
                    total_floors=sp["total_floors"],
                    bedrooms=sp["bed"],
                    bathrooms=sp["bath"],
                    balconies=sp["balc"],
                    facing=sp["facing"],
                    property_age=sp["age"],
                    parking=sp["parking"],
                    lift=sp["lift"],
                    rent=sp["rent"],
                    security_deposit=sp["deposit"],
                    maintenance=sp["maintenance"],
                    maintenance_included=sp["m_inc"],
                    electricity_included=sp["e_inc"],
                    brokerage=sp["brokerage"],
                    description=sp["desc"],
                    family_allowed=True,
                    bachelor_allowed=True,
                    available_from=date.today()
                )

                # Attach amenities
                p_amenities = [amenity_map[a_name] for a_name in sp["amenities"] if a_name in amenity_map]
                p.amenities = p_amenities
                db.add(p)
                db.commit()
                db.refresh(p)

                # Attach images
                for idx, (img_url, is_cov) in enumerate(sp["images"]):
                    db.add(PropertyImage(
                        property_id=p.id,
                        image_url=img_url,
                        sort_order=idx,
                        is_cover=is_cov
                    ))
                db.commit()
            print("Sample properties seeded successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    init_db()
