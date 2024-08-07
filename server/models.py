from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy import DateTime, func
from flask_security import UserMixin, RoleMixin
import uuid

from config import db

# Table to assign roles to users
roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('users.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('roles.id'))
)

class User(db.Model, UserMixin, SerializerMixin):

    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)  # Primary key for the user
    first_name = db.Column(db.String(130), nullable=False)  # User's first name
    last_name = db.Column(db.String(130), nullable=False)  # User's last name
    email = db.Column(db.String(130), unique=True, nullable=False)  # User's email, must be unique
    password = db.Column(db.String, nullable=False)  # User's password
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))  # Unique identifier for Flask-Security
    user_address_id = db.Column(db.Integer, db.ForeignKey('user_addresses.id'))  # Foreign key to user address
    billing_address_id = db.Column(db.Integer, db.ForeignKey('billing_addresses.id'))  # Foreign key to billing address
    created_at = db.Column(DateTime, server_default=func.current_timestamp())  # Timestamp of when the user was created
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())  # Timestamp of last update

    # Many-to-many relationship with roles
    roles = db.relationship('Role', secondary=roles_users, back_populates='users')
    # Many-to-one relationship with user address
    user_address = db.relationship('UserAddress', back_populates='user', foreign_keys=[user_address_id])
    # Many-to-one relationship with billing address
    billing_address = db.relationship('BillingAddress', back_populates='user', foreign_keys=[billing_address_id])
    
    # Many-to-many relationship with parcels
    parcels = db.relationship('Parcel', back_populates='user')

    # Required by Flask-Security and Flask-Login for compatibility
    active = db.Column(db.Boolean(), default=True)  

    # Serialization rules to prevent circular references
    serialize_rules = ('-roles.users', '-user_address.user', '-billing_address.user', '-parcels.user')

    def __repr__(self):
        return f"<User(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"

class Role(db.Model, RoleMixin, SerializerMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    users = db.relationship('User', secondary=roles_users, back_populates='roles') # Many-to-many relationship with users

    serialize_rules = ('-users.roles',) # Avoiding recursion

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"

class Recipient(db.Model, SerializerMixin):
    __tablename__ = 'recipients'
    id = db.Column(db.Integer, primary_key=True)
    recipient_full_name = db.Column(db.String(130), nullable=False)
    phone_number = db.Column(db.String(50), nullable=False)
    delivery_address_id = db.Column(db.Integer, db.ForeignKey('recipient_addresses.id')) # Foreign Key to the delivery addresses
    parcel_id = db.Column(db.Integer, db.ForeignKey('parcels.id')) # Foreign Key to the parcels
    created_at = db.Column(DateTime, server_default=func.current_timestamp()) # Timestamp for when the recipient is created
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp()) # Timestamp for when the recipient is updated

    parcels = db.relationship('Parcel', back_populates='recipient', cascade='all, delete-orphan') # One-to-many relationship with parcels
    delivery_address = db.relationship('RecipientAddress', back_populates='recipient') # One-to-one relationship with delivery addresses

    serialize_rules = ('-parcels.recipient', '-delivery_address.recipient') # Avoiding recursion

    def __repr__(self):
        return f"<Recipient(id={self.id}, recipient_full_name='{self.recipient_full_name}', phone_number='{self.phone_number}')>"

class Parcel(db.Model, SerializerMixin):
    __tablename__ = 'parcels'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id')) # Foreign Key to the users
    recipient_id = db.Column(db.Integer, db.ForeignKey('recipients.id')) # Foreign Key to the recipients
    length = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    weight = db.Column(db.Integer)
    status = db.Column(db.String(50))
    created_at = db.Column(DateTime, server_default=func.current_timestamp()) # Timestamp for when the parcel is created
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp()) # Timestamp for when the parcel is updated

    user = db.relationship('User', back_populates='parcels') # Many-to-one relationship with users
    recipient = db.relationship('Recipient', back_populates='parcels') # Many-to-one relationship with recipients

    serialize_rules = ('-user.parcels', '-recipient.parcels') # Avoiding recursion

    def __repr__(self):
        return f"<Parcel(id={self.id}, length={self.length}, width={self.width}, height={self.height}, weight={self.weight})>"

class UserAddress(db.Model, SerializerMixin):
    __tablename__ = 'user_addresses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id')) # Foreign Key to the users
    street = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(DateTime, server_default=func.current_timestamp()) # Timestamp for when the address is created
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp()) # Timestamp for when the address is updated

    user = db.relationship('User', back_populates='user_address') # One-to-one relationship with users

    serialize_rules = ('-user.user_address',) # Avoiding recursion

    def __repr__(self):
        return f"<UserAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class RecipientAddress(db.Model, SerializerMixin):
    __tablename__ = 'recipient_addresses'
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('recipients.id')) # Foreign Key to the recipients
    street = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(DateTime, server_default=func.current_timestamp()) # Timestamp for when the address is created
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp()) # Timestamp for when the address is updated

    recipient = db.relationship('Recipient', back_populates='delivery_address') # One-to-one relationship with recipients

    serialize_rules = ('-recipient.delivery_address',) # Avoiding recursion

    def __repr__(self):
        return f"<RecipientAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class BillingAddress(db.Model, SerializerMixin):
    __tablename__ = 'billing_addresses'
    id = db.Column(db.Integer, primary_key=True)  # Primary key for the billing address
    street = db.Column(db.String(255))  # Street address
    city = db.Column(db.String(100), nullable=False)  # City
    state = db.Column(db.String(100))  # State
    zip_code = db.Column(db.String(20))  # Zip code
    country = db.Column(db.String(100), nullable=False)  # Country
    latitude = db.Column(db.Float)  # Latitude of the address
    longitude = db.Column(db.Float)  # Longitude of the address
    created_at = db.Column(DateTime, server_default=func.current_timestamp())  # Timestamp of when the address was created
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())  # Timestamp of last update

    # Adding this relationship to complete the bidirectional link same as in UserAddress
    user = db.relationship('User', back_populates='billing_address')

    # Updated serialization rules
    serialize_rules = ('-user.billing_address',)

    def __repr__(self):
        return f"<BillingAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"
