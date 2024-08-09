# /server/models.py

from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import DateTime, func
from flask_security import UserMixin, RoleMixin
import uuid

from config import db

# Association table for the many-to-many relationship between users and roles
roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'))
)

# Join table for the one-to-one relationship between users and user addresses
class UserAddressAssociation(db.Model):
    __tablename__ = 'user_address_association'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    address_id = db.Column(db.Integer, db.ForeignKey('user_addresses.id'), primary_key=True)

    user = db.relationship('User', back_populates='user_address_associations')
    address = db.relationship('UserAddress', back_populates='user_address_associations')

class UserAddress(db.Model, SerializerMixin):
    __tablename__ = 'user_addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    user_address_associations = db.relationship('UserAddressAssociation', back_populates='address')
    
    def __repr__(self):
        return f"<UserAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class User(db.Model, UserMixin, SerializerMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(130), nullable=False)
    last_name = db.Column(db.String(130), nullable=False)
    email = db.Column(db.String(130), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String(50))
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Many-to-many relationship with roles
    roles = db.relationship('Role', secondary=roles_users, back_populates='users')

    # One-to-one relationship with billing address
    billing_address_id = db.Column(db.Integer, db.ForeignKey('billing_addresses.id'))
    billing_address = db.relationship('BillingAddress', back_populates='user', uselist=False, foreign_keys=[billing_address_id])

    # One-to-many relationship with user address associations
    user_address_associations = db.relationship('UserAddressAssociation', back_populates='user')
    
    # One-to-many relationship with parcels
    parcels = db.relationship('Parcel', back_populates='user')

    # Serialization rules
    serialize_rules = ('-roles.users', '-billing_address.user', '-parcels.user')

    def __repr__(self):
        return f"<User(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"
    
class Role(db.Model, RoleMixin, SerializerMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)  # Primary key for the role
    name = db.Column(db.String(80), unique=True)  # Role name, must be unique
    
    # Many-to-many relationship with users
    users = db.relationship('User', secondary=roles_users, back_populates='roles')

    # Serialization rule to prevent circular references
    serialize_rules = ('-users.roles',)

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"

# Join table for the one-to-one relationship between recipients and recipient addresses
class RecipientAddressAssociation(db.Model):
    __tablename__ = 'recipient_address_association'
    
    recipient_id = db.Column(db.Integer, db.ForeignKey('recipients.id'), primary_key=True)
    address_id = db.Column(db.Integer, db.ForeignKey('recipient_addresses.id'), primary_key=True)

    recipient = db.relationship('Recipient', backref=db.backref('recipient_address_association', uselist=False))
    address = db.relationship('RecipientAddress', backref=db.backref('recipient_address_association', uselist=False))

class RecipientAddress(db.Model, SerializerMixin):
    __tablename__ = 'recipient_addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Correct reference; should match the Recipient model
    recipients = db.relationship('Recipient', secondary='recipient_address_association', back_populates='delivery_address')

    def __repr__(self):
        return f"<RecipientAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class Recipient(db.Model, SerializerMixin):
    __tablename__ = 'recipients'
    
    id = db.Column(db.Integer, primary_key=True)
    recipient_full_name = db.Column(db.String(130), nullable=False)
    phone_number = db.Column(db.String(50), nullable=False)
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # One-to-many relationship with parcels
    parcels = db.relationship('Parcel', back_populates='recipient')

    # One-to-one relationship with delivery address via join table
    delivery_address = db.relationship('RecipientAddress', secondary='recipient_address_association', back_populates='recipients')

    def __repr__(self):
        return f"<Recipient(id={self.id}, recipient_full_name='{self.recipient_full_name}', phone_number='{self.phone_number}')>"

class BillingAddress(db.Model, SerializerMixin):
    __tablename__ = 'billing_addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # One-to-one relationship with User
    user = db.relationship('User', back_populates='billing_address')

    def __repr__(self):
        return f"<BillingAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class Parcel(db.Model, SerializerMixin):
    __tablename__ = 'parcels'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    recipient_id = db.Column(db.Integer, db.ForeignKey('recipients.id'))
    length = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    weight = db.Column(db.Integer)
    cost = db.Column(db.Float)  # Cost of the parcel
    status = db.Column(db.String(50))
    tracking_number = db.Column(db.String(32), unique=True, default=lambda: str(uuid.uuid4().hex))
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Many-to-one relationship with User
    user = db.relationship('User', back_populates='parcels')
    
    # Many-to-one relationship with Recipient
    recipient = db.relationship('Recipient', back_populates='parcels')

    # Serialization rules
    serialize_rules = ('-user.parcels', '-recipient.parcels')

    def __repr__(self):
        return f"<Parcel(id={self.id}, length={self.length}, width={self.width}, height={self.height}, weight={self.weight}, cost={self.cost}, tracking_number='{self.tracking_number}')>"
