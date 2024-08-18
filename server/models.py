# /server/models.py

from sqlalchemy import DateTime, func, Column, Integer, String, Float, ForeignKey, Text, BigInteger, Numeric
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

class Role(db.Model, RoleMixin, SerializerMixin):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True)
    
    # Many-to-many relationship with users
    users = relationship('User', secondary=roles_users, back_populates='roles')

    serialize_rules = ('-users.roles',)

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"

class User(db.Model, UserMixin, SerializerMixin):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(130), nullable=False)
    last_name = Column(String(130), nullable=False)
    email = Column(String(130), unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    phone_number = Column(String(50), nullable=True)
    fs_uniquifier = Column(String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    street = Column(Text)
    city = Column(Text, nullable=True) # Will handle this as not nullable if handled during signup
    state = Column(Text)
    zip_code = Column(String(20))
    country = Column(String(100), nullable=True) # Will handle this as not nullable if handled during signup
    latitude = Column(Numeric(10, 6)) # Accurate to one micrometer)
    longitude = Column(Numeric(10, 6)) # Accurate to one micrometer)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp()) # adding current timezone to the timestamp
    updated_at = Column(DateTime(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Many-to-many relationship with roles
    roles = relationship('Role', secondary=roles_users, back_populates='users')

    # One-to-many relationship with parcels
    parcels = relationship('Parcel', back_populates='user')

    # Relationship to BillingAddress
    billing_addresses = relationship('BillingAddress', back_populates='user')

    # Serialization rules
    serialize_rules = ('-roles.users', '-parcels.user', '-password', '-fs_uniquifier') # excluding the password and uniquifier from serialisation since they are sensitive
    # exclude = ('password', 'fs_uniquifier') # Still learning how to implement this one

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
            raise ValueError("Password should be at least 6 characters")
        return password
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    @classmethod
    def create_with_default_role(cls, **kwargs):
        user = cls(**kwargs)
        default_role = Role.query.filter_by(name='user').first()
        if default_role:
            user.roles.append(default_role)
        db.session.add(user)
        db.session.commit()
        return user

    def __repr__(self):
        return f"<User(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}', phone_number='{self.phone_number}')>"




class Recipient(db.Model, SerializerMixin):
    __tablename__ = 'recipients'
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(130), nullable=False)
    last_name = Column(String(130), nullable=False)
    email = Column(String(130), unique=False, nullable=False, index=True)
    phone_number = Column(String(50))
    fs_uniquifier = Column(String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    street = Column(Text)
    city = Column(Text, nullable=True) # Will see whether to handle as nullable based on google maps API
    state = Column(Text)
    zip_code = Column(String(20))
    country = Column(String(100), nullable=True) # Will see whether to handle as nullable based on google maps API
    latitude = Column(Numeric(10, 6)) # Accurate to one micrometer)
    longitude = Column(Numeric(10, 6)) # Accurate to one micrometer)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # One-to-many relationship with parcels
    parcels = relationship('Parcel', back_populates='recipient')

    def __repr__(self):
        return f"<Recipient(id={self.id}, full_name='{self.first_name} {self.last_name}', email='{self.email}', phone_number='{self.phone_number}')>"

class Parcel(db.Model, SerializerMixin):
    __tablename__ = 'parcels'
    
    id = Column(BigInteger, primary_key=True) # We expect that with scale the parcels will be significantly more than the users and recipients
    user_id = Column(Integer, ForeignKey('users.id'))
    recipient_id = Column(Integer, ForeignKey('recipients.id'))
    length = Column(Numeric(10, 2)) # Precision = 10 digits total. Scale = 2 digits to the right of the decimal point
    width = Column(Numeric(10, 2)) # Precision and scale for measurements
    height = Column(Numeric(10, 2)) # Precision and scale for measurements
    weight = Column(Numeric(10, 2)) # Precision and scale for measurements
    cost = Column(Numeric(10, 2)) # Precision and scale for measurements
    status = Column(String(50), default='Pending') # Status is either "Accepted", "Out For Delivery" or "Delivered". Default is pending
    tracking_number = Column(String(32), unique=True, default=lambda: str(uuid.uuid4().hex), index=True)
    street = Column(Text)
    city = Column(Text, nullable=True) # Will see whether to handle as nullable based on google maps API
    state = Column(Text)
    zip_code = Column(String(20))
    country = Column(String(100), nullable=True) # Will see whether to handle as nullable based on google maps API
    latitude = Column(Numeric(10, 6)) # Accurate to one micrometer)
    longitude = Column(Numeric(10, 6)) # Accurate to one micrometer)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Many-to-one relationship with User
    user = relationship('User', back_populates='parcels')
    
    # Many-to-one relationship with Recipient
    recipient = relationship('Recipient', back_populates='parcels')

    serialize_rules = ('-user.parcels', '-recipient.parcels')

    def __repr__(self):
        return f"<Parcel(id={self.id}, length={self.length}, width={self.width}, height={self.height}, weight={self.weight}, cost={self.cost}, tracking_number='{self.tracking_number}')>"

class BillingAddress(db.Model, SerializerMixin):
    __tablename__ = 'billing_addresses'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Will make this false if it works
    street = Column(Text)
    city = Column(Text, nullable=True) # Will see whether to handle as nullable based on google maps API
    state = Column(Text)
    zip_code = Column(String(20))
    country = Column(String(100), nullable=True) # Will see whether to handle as nullable based on google maps API
    latitude = Column(Numeric(10, 6)) # Accurate to one micrometer
    longitude = Column(Numeric(10, 6)) # Accurate to one micrometer
    
    # Relationship to User
    user = relationship('User', back_populates='billing_addresses')

    serialize_rules = ('-user.billing_addresses',)

    def __repr__(self):
        return f"<BillingAddress(id={self.id}, user_id={self.user_id}, street={self.street}, city={self.city}, state={self.state}, zip_code={self.zip_code}, country={self.country})>"