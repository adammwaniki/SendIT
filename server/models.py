# /server/models.py

from sqlalchemy import DateTime, func, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_security import UserMixin, RoleMixin
import uuid
import re

from config import db

# Association tables for many-to-many relationships
roles_users = db.Table('roles_users',
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

# Association table for one-to-one relationships
user_address_association = db.Table('user_address_association',
    Column('id', Integer, primary_key=True),  # New column as primary key
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('address_id', Integer, ForeignKey('user_addresses.id'))
)

recipient_address_association = db.Table('recipient_address_association',
    Column('id', Integer, primary_key=True),  # New column as primary key
    Column('recipient_id', Integer, ForeignKey('recipients.id')),
    Column('address_id', Integer, ForeignKey('recipient_addresses.id'))
)

class UserAddress(db.Model, SerializerMixin):
    __tablename__ = 'user_addresses'
    
    id = Column(Integer, primary_key=True)
    street = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relationship to User
    user_associations = relationship('User', secondary=user_address_association, back_populates='user_addresses')
    
    def __repr__(self):
        return f"<UserAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class User(db.Model, UserMixin, SerializerMixin):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(130), nullable=False)
    last_name = Column(String(130), nullable=False)
    email = Column(String(130), unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone_number = Column(String(50))
    fs_uniquifier = Column(String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Many-to-many relationship with roles
    roles = relationship('Role', secondary=roles_users, back_populates='users')

    # One-to-one relationship with billing address
    billing_address_id = Column(Integer, ForeignKey('billing_addresses.id'))
    billing_address = relationship('BillingAddress', back_populates='user', uselist=False, foreign_keys=[billing_address_id])

    # Many-to-many relationship with user addresses
    user_addresses = relationship('UserAddress', secondary=user_address_association, back_populates='user_associations')
    # user_associations = relationship('User', secondary=user_address_association, back_populates='user_addresses') # Works with proxy
    # user_addresses = association_proxy('user_associations', 'user_address') # Commenting out since user proxy is good for targeting specific things while relationships allows me to target the object

    # One-to-many relationship with parcels
    parcels = relationship('Parcel', back_populates='user')

    # Serialization rules
    serialize_rules = ('-roles.users', '-billing_address.user', '-parcels.user')

    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError("Invalid email format")
        if User.query.filter(User.email == email).first():
            raise ValueError("Email must be unique")
        return email

    @validates('password')
    def validates_password(self, key, password):
        if len(password) < 6:
            raise ValueError("Password should be more than 6 characters")
        return password
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __repr__(self):
        return f"<User(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"

class Role(db.Model, RoleMixin, SerializerMixin):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True)
    
    # Many-to-many relationship with users
    users = relationship('User', secondary=roles_users, back_populates='roles')

    serialize_rules = ('-users.roles',)

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"

class RecipientAddress(db.Model, SerializerMixin):
    __tablename__ = 'recipient_addresses'
    
    id = Column(Integer, primary_key=True)
    street = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relationship to Recipient using relationship instead of proxy to target the object like in user addresses
    recipients = relationship('Recipient', secondary=recipient_address_association, back_populates='delivery_addresses')

    def __repr__(self):
        return f"<RecipientAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class Recipient(db.Model, SerializerMixin):
    __tablename__ = 'recipients'
    
    id = Column(Integer, primary_key=True)
    recipient_full_name = Column(String(130))
    phone_number = Column(String(50))
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # One-to-many relationship with parcels
    parcels = relationship('Parcel', back_populates='recipient')

    # Many-to-many relationship with delivery addresses
    delivery_addresses = relationship('RecipientAddress', secondary=recipient_address_association, back_populates='recipients')

    def __repr__(self):
        return f"<Recipient(id={self.id}, recipient_full_name='{self.recipient_full_name}', phone_number='{self.phone_number}')>"

class BillingAddress(db.Model, SerializerMixin):
    __tablename__ = 'billing_addresses'
    
    id = Column(Integer, primary_key=True)
    street = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # One-to-one relationship with User
    user = relationship('User', back_populates='billing_address')

    def __repr__(self):
        return f"<BillingAddress(id={self.id}, city='{self.city}', state='{self.state}', country='{self.country}')>"

class Parcel(db.Model, SerializerMixin):
    __tablename__ = 'parcels'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    recipient_id = Column(Integer, ForeignKey('recipients.id'))
    length = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    weight = Column(Integer)
    cost = Column(Float)
    status = Column(String(50))
    tracking_number = Column(String(32), unique=True, default=lambda: str(uuid.uuid4().hex))
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Many-to-one relationship with User
    user = relationship('User', back_populates='parcels')
    
    # Many-to-one relationship with Recipient
    recipient = relationship('Recipient', back_populates='parcels')

    serialize_rules = ('-user.parcels', '-recipient.parcels')

    def __repr__(self):
        return f"<Parcel(id={self.id}, length={self.length}, width={self.width}, height={self.height}, weight={self.weight}, cost={self.cost}, tracking_number='{self.tracking_number}')>"

