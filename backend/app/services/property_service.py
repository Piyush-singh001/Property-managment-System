from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, asc
from datetime import datetime, timezone
import re
from typing import Optional, List, Tuple
from app.models.property import Property
from app.models.media import PropertyImage, PropertyVideo
from app.models.amenity import Amenity
from app.schemas.property_admin import PropertyCreate, PropertyUpdate
from app.core.exceptions import NotFoundException, BadRequestException

class PropertyService:
    @staticmethod
    def generate_property_code(db: Session) -> str:
        """Generates the next unique property code e.g. PROP-0001, PROP-0002."""
        # Find all codes matching PROP-%
        codes = db.query(Property.property_code).filter(Property.property_code.like("PROP-%")).all()
        max_num = 0
        for (code,) in codes:
            match = re.search(r"PROP-(\d+)", code)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
        next_num = max_num + 1
        return f"PROP-{next_num:04d}"

    @staticmethod
    def get_public_properties(
        db: Session,
        page: int = 1,
        limit: int = 12,
        search: Optional[str] = None,
        locality: Optional[str] = None,
        bhk: Optional[str] = None,
        property_type: Optional[str] = None,
        furnishing: Optional[str] = None,
        min_rent: Optional[float] = None,
        max_rent: Optional[float] = None,
        amenities: Optional[List[str]] = None,
        sort: Optional[str] = "latest"
    ) -> Tuple[List[Property], int]:
        query = db.query(Property).options(joinedload(Property.images), joinedload(Property.amenities))
        
        # Public visibility rules
        query = query.filter(
            Property.deleted_at.is_(None),
            Property.publication_status == "Published",
            Property.property_status != "Inactive"
        )

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Property.title.ilike(search_pattern),
                    Property.locality.ilike(search_pattern),
                    Property.society_name.ilike(search_pattern),
                    Property.property_code.ilike(search_pattern)
                )
            )

        if locality:
            query = query.filter(Property.locality.ilike(f"%{locality}%"))

        if bhk:
            query = query.filter(Property.bhk == bhk)

        if property_type:
            query = query.filter(Property.property_type == property_type)

        if furnishing:
            query = query.filter(Property.furnishing == furnishing)

        if min_rent is not None:
            query = query.filter(Property.rent >= min_rent)

        if max_rent is not None:
            query = query.filter(Property.rent <= max_rent)

        if amenities and len(amenities) > 0:
            for am in amenities:
                query = query.filter(Property.amenities.any(Amenity.name.ilike(am)))

        # Sorting
        if sort == "rent_asc":
            query = query.order_by(asc(Property.rent))
        elif sort == "rent_desc":
            query = query.order_by(desc(Property.rent))
        elif sort == "area_asc":
            query = query.order_by(asc(Property.built_up_area))
        elif sort == "area_desc":
            query = query.order_by(desc(Property.built_up_area))
        else:
            query = query.order_by(desc(Property.created_at))

        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_public_property_by_code(db: Session, property_code: str) -> Property:
        prop = db.query(Property).options(
            joinedload(Property.images),
            joinedload(Property.videos),
            joinedload(Property.amenities)
        ).filter(
            Property.property_code == property_code,
            Property.deleted_at.is_(None),
            Property.publication_status == "Published",
            Property.property_status != "Inactive"
        ).first()

        if not prop:
            raise NotFoundException("Property not found or is currently not publicly available", "PROPERTY_NOT_FOUND")
        return prop

    @staticmethod
    def get_admin_properties(
        db: Session,
        page: int = 1,
        limit: int = 15,
        search: Optional[str] = None,
        property_status: Optional[str] = None,
        publication_status: Optional[str] = None,
        bhk: Optional[str] = None,
        include_archived: bool = False
    ) -> Tuple[List[Property], int]:
        query = db.query(Property).options(joinedload(Property.images), joinedload(Property.amenities))

        if not include_archived:
            query = query.filter(Property.deleted_at.is_(None))
        else:
            query = query.filter(Property.deleted_at.isnot(None))

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Property.property_code.ilike(search_pattern),
                    Property.title.ilike(search_pattern),
                    Property.locality.ilike(search_pattern),
                    Property.society_name.ilike(search_pattern)
                )
            )

        if property_status:
            query = query.filter(Property.property_status == property_status)

        if publication_status:
            query = query.filter(Property.publication_status == publication_status)

        if bhk:
            query = query.filter(Property.bhk == bhk)

        query = query.order_by(desc(Property.created_at))
        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def create_property(db: Session, data: PropertyCreate) -> Property:
        code = PropertyService.generate_property_code(db)
        prop_data = data.model_dump(exclude={"amenity_ids", "image_urls", "video_urls"})
        
        prop = Property(
            property_code=code,
            **prop_data
        )

        if data.amenity_ids:
            amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
            prop.amenities = amenities

        db.add(prop)
        db.commit()
        db.refresh(prop)

        # Add initial images if provided
        if data.image_urls:
            for idx, img_url in enumerate(data.image_urls):
                img = PropertyImage(
                    property_id=prop.id,
                    image_url=img_url,
                    sort_order=idx,
                    is_cover=(idx == 0)
                )
                db.add(img)

        # Add initial videos if provided
        if data.video_urls:
            for vid_url in data.video_urls:
                vid = PropertyVideo(
                    property_id=prop.id,
                    video_url=vid_url
                )
                db.add(vid)

        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def get_property_by_id(db: Session, property_id: int) -> Property:
        prop = db.query(Property).options(
            joinedload(Property.images),
            joinedload(Property.videos),
            joinedload(Property.amenities)
        ).filter(Property.id == property_id).first()

        if not prop:
            raise NotFoundException("Property not found", "PROPERTY_NOT_FOUND")
        return prop

    @staticmethod
    def update_property(db: Session, property_id: int, data: PropertyUpdate) -> Property:
        prop = PropertyService.get_property_by_id(db, property_id)
        update_dict = data.model_dump(exclude_unset=True, exclude={"amenity_ids"})

        for field, val in update_dict.items():
            setattr(prop, field, val)

        if data.amenity_ids is not None:
            amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
            prop.amenities = amenities

        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def update_property_status(db: Session, property_id: int, new_status: str) -> Property:
        valid_statuses = ["Available", "Reserved", "Rented", "Inactive"]
        if new_status not in valid_statuses:
            raise BadRequestException(f"Invalid property status. Must be one of: {valid_statuses}", "INVALID_STATUS")
        prop = PropertyService.get_property_by_id(db, property_id)
        prop.property_status = new_status
        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def update_publication_status(db: Session, property_id: int, new_status: str) -> Property:
        valid_statuses = ["Draft", "Published", "Unpublished"]
        if new_status not in valid_statuses:
            raise BadRequestException(f"Invalid publication status. Must be one of: {valid_statuses}", "INVALID_STATUS")
        prop = PropertyService.get_property_by_id(db, property_id)
        prop.publication_status = new_status
        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def soft_delete_property(db: Session, property_id: int) -> Property:
        prop = PropertyService.get_property_by_id(db, property_id)
        prop.deleted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def restore_property(db: Session, property_id: int) -> Property:
        prop = PropertyService.get_property_by_id(db, property_id)
        prop.deleted_at = None
        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def duplicate_property(db: Session, property_id: int) -> Property:
        source = PropertyService.get_property_by_id(db, property_id)
        new_code = PropertyService.generate_property_code(db)

        # Clone property fields
        new_prop = Property(
            property_code=new_code,
            title=f"{source.title} (Copy)",
            property_type=source.property_type,
            bhk=source.bhk,
            furnishing=source.furnishing,
            property_status="Available",       # Safe default
            publication_status="Draft",        # Safe default
            description=source.description,
            locality=source.locality,
            society_name=source.society_name,
            tower=source.tower,
            flat_number=source.flat_number,
            address=source.address,
            pincode=source.pincode,
            maps_url=source.maps_url,
            latitude=source.latitude,
            longitude=source.longitude,
            built_up_area=source.built_up_area,
            carpet_area=source.carpet_area,
            floor=source.floor,
            total_floors=source.total_floors,
            bedrooms=source.bedrooms,
            bathrooms=source.bathrooms,
            balconies=source.balconies,
            facing=source.facing,
            property_age=source.property_age,
            parking=source.parking,
            lift=source.lift,
            rent=source.rent,
            security_deposit=source.security_deposit,
            maintenance=source.maintenance,
            maintenance_included=source.maintenance_included,
            electricity_included=source.electricity_included,
            water_charges=source.water_charges,
            brokerage=source.brokerage,
            other_charges=source.other_charges,
            lock_in_period=source.lock_in_period,
            minimum_stay=source.minimum_stay,
            family_allowed=source.family_allowed,
            bachelor_allowed=source.bachelor_allowed,
            male_allowed=source.male_allowed,
            female_allowed=source.female_allowed,
            pets_allowed=source.pets_allowed,
            smoking_allowed=source.smoking_allowed,
            non_veg_allowed=source.non_veg_allowed,
            available_from=source.available_from,
            notice_period=source.notice_period,
            deleted_at=None
        )

        # Copy amenities
        new_prop.amenities = list(source.amenities)
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)

        # Copy images
        for img in source.images:
            cloned_img = PropertyImage(
                property_id=new_prop.id,
                image_url=img.image_url,
                sort_order=img.sort_order,
                is_cover=img.is_cover
            )
            db.add(cloned_img)

        # Copy videos
        for vid in source.videos:
            cloned_vid = PropertyVideo(
                property_id=new_prop.id,
                video_url=vid.video_url
            )
            db.add(cloned_vid)

        db.commit()
        db.refresh(new_prop)
        return new_prop
