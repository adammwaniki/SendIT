# /server/models.py

from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy import DateTime, func
from flask_security import UserMixin, RoleMixin
import uuid


from config import db

# Models go here!
# creating a table in database for assigning roles
roles_users = db.Table('roles_users',
        db.Column('user_id', db.Integer(), db.ForeignKey('users.id')),
        db.Column('role_id', db.Integer(), db.ForeignKey('roles.id'))) 

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(130), nullable=False)
    last_name = db.Column(db.String(130), nullable=False)
    email = db.Column(db.String(130), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4())) # This field is used by Flask-Security to provide unique identification for users.
    # is_admin = db.Column(db.Boolean, default=False) # I've seen on GfG that we can use RoleMixin to handle admin access for Role-based access control
    user_address = db.Column(db.Integer, db.ForeignKey('user_address.id')) #Foreign Key to the user addresses)
    billing_address = db.Column(db.Integer, db.ForeignKey('billing_address.id')) #Foreign Key to the address that the user will be billed at
    parcel_id = db.Column(db.Integer, db.ForeignKey('parcel.id')) # Foreign Key for parcel id
    created_at = db.Column(DateTime, server_default=func.current_timestamp())
    updated_at = db.Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    def __repr__(self):
        return f"<User(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"

# Best practice involves making a separate roles table to handle user roles instead of adding it as a column to prevent
# creation of a one-to-many relationship between users and roles, where each user can have multiple roles associated with them
class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    # description = db.Column(db.String(255)) # This just an example of a more complex relationship for the role

    # Establishing a bidirectional relationship with User
    users = db.relationship('User', secondary=roles_users, back_populates='roles')

# Updating the User model
User.roles = db.relationship('Role', secondary=roles_users, back_populates='users')
