#!/usr/bin/env python3
# /server/app.py

# Remote library imports
from flask import request, make_response, jsonify, redirect, url_for, session
from flask_restful import Api, Resource
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_security import Security, SQLAlchemySessionUserDatastore, UserDatastore
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate

# Local imports
from config import app, db, api
from models import User, Role, Recipient, Parcel, UserAddress, RecipientAddress, BillingAddress

# Adding Migration support
migrate = Migrate(app, db)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.before_request
def check_if_logged_in():
    whitelist = ['index', 'signup', 'login', 'check_session', 'clear']
    if request.endpoint not in whitelist and 'user_id' not in session:
        return make_response(jsonify({"message": "Unauthorized access"}), 401)
    
'''
class SecureResource(Resource):
    @login_required
    def get(self):
        # Some secure resource that is only accessible if user is logged in 
        # I could use this for the admin panel
        return {"message": "You are logged in!"}, 200

api.add_resource(SecureResource, '/secure')
'''


@app.route('/')
def index():
    return '<h1>Project Server</h1>'

class Signup(Resource):
    def post(self):
        data = request.get_json()

        # Making sure the user fills in all the fields
        if not all(k in data for k in ('first_name', 'last_name', 'email', 'password')):
            return {"message": "Missing required fields"}, 400

        # Check if the email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return {"message": "Email is already in use"}, 400

        # Create a new user if email is unique
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()

        # Log in the new user and set the session
        login_user(new_user)
        session['user_id'] = new_user.id  # Set user ID in the session

        return {"message": "User created successfully", "user": new_user.to_dict()}, 201

api.add_resource(Signup, '/signup', endpoint='signup')


class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password, data['password']):
            login_user(user)
            session['user_id'] = user.id  # Set user ID in the session
            return {"message": "Login successful"}, 200
        
        return {"message": "Invalid credentials"}, 401
    
api.add_resource(Login, '/login', endpoint='login')

class Logout(Resource):
    def delete(self):
        logout_user()
        session.pop('user_id', None)  # Remove user ID from session
        return {}, 204
    
api.add_resource(Logout, '/logout', endpoint='logout')

class ClearSession(Resource):
    def delete(self):
        logout_user()
        return {}, 204
    
api.add_resource(ClearSession, '/clear', endpoint='clear')

class CheckSession(Resource):
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict()
        return {}, 204
    
api.add_resource(CheckSession, '/check_session', endpoint='check_session')

# User resource
class Users(Resource):
    def get(self):
        response_dict_list = [user.to_dict() for user in User.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return make_response(jsonify(new_user.to_dict()), 201)

api.add_resource(Users, '/users')

class UsersByID(Resource):
    def get(self, id):
        user_specific = User.query.filter_by(id=id).first()
        if user_specific:
            return make_response(jsonify(user_specific.to_dict()), 200)
        return make_response(jsonify({"message": "User not found"}), 404)

    def patch(self, id):
        user_specific = User.query.filter_by(id=id).first()
        if user_specific:
            data = request.get_json()
            for key, value in data.items():
                if key == 'password':
                    value = generate_password_hash(value)
                setattr(user_specific, key, value)
            db.session.commit()
            return make_response(jsonify(user_specific.to_dict()), 200)
        return make_response(jsonify({"message": "User not found"}), 404)

    def delete(self, id):
        user_specific = User.query.filter_by(id=id).first()
        if user_specific:
            db.session.delete(user_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "User not found"}), 404)

api.add_resource(UsersByID, '/users/<int:id>')

# Role resource
class Roles(Resource):
    def get(self):
        response_dict_list = [role.to_dict() for role in Role.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        new_role = Role(name=data['name'])
        db.session.add(new_role)
        db.session.commit()
        return make_response(jsonify(new_role.to_dict()), 201)

api.add_resource(Roles, '/roles')

class RolesByID(Resource):
    def get(self, id):
        role_specific = Role.query.filter_by(id=id).first()
        if role_specific:
            return make_response(jsonify(role_specific.to_dict()), 200)
        return make_response(jsonify({"message": "Role not found"}), 404)

    def patch(self, id):
        role_specific = Role.query.filter_by(id=id).first()
        if role_specific:
            data = request.get_json()
            for key, value in data.items():
                setattr(role_specific, key, value)
            db.session.commit()
            return make_response(jsonify(role_specific.to_dict()), 200)
        return make_response(jsonify({"message": "Role not found"}), 404)

    def delete(self, id):
        role_specific = Role.query.filter_by(id=id).first()
        if role_specific:
            db.session.delete(role_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "Role not found"}), 404)

api.add_resource(RolesByID, '/roles/<int:id>')

# Recipient resource
class Recipients(Resource):
    def get(self):
        response_dict_list = [recipient.to_dict() for recipient in Recipient.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        new_recipient = Recipient(
            recipient_full_name=data['recipient_full_name'],
            phone_number=data['phone_number']
        )
        db.session.add(new_recipient)
        db.session.commit()
        return make_response(jsonify(new_recipient.to_dict()), 201)

api.add_resource(Recipients, '/recipients')

class RecipientsByID(Resource):
    def get(self, id):
        recipient_specific = Recipient.query.filter_by(id=id).first()
        if recipient_specific:
            return make_response(jsonify(recipient_specific.to_dict()), 200)
        return make_response(jsonify({"message": "Recipient not found"}), 404)

    def patch(self, id):
        recipient_specific = Recipient.query.filter_by(id=id).first()
        if recipient_specific:
            data = request.get_json()
            for key, value in data.items():
                setattr(recipient_specific, key, value)
            db.session.commit()
            return make_response(jsonify(recipient_specific.to_dict()), 200)
        return make_response(jsonify({"message": "Recipient not found"}), 404)

    def delete(self, id):
        recipient_specific = Recipient.query.filter_by(id=id).first()
        if recipient_specific:
            db.session.delete(recipient_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "Recipient not found"}), 404)

api.add_resource(RecipientsByID, '/recipients/<int:id>')

# Parcel resource
class Parcels(Resource):
    def get(self):
        response_dict_list = [parcel.to_dict() for parcel in Parcel.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        new_parcel = Parcel(
            user_id=data['user_id'],
            recipient_id=data['recipient_id'],
            length=data['length'],
            width=data['width'],
            height=data['height'],
            weight=data['weight'],
            status=data['status']
        )
        db.session.add(new_parcel)
        db.session.commit()
        return make_response(jsonify(new_parcel.to_dict()), 201)

api.add_resource(Parcels, '/parcels')

class ParcelsByID(Resource):
    def get(self, id):
        parcel_specific = Parcel.query.filter_by(id=id).first()
        if parcel_specific:
            return make_response(jsonify(parcel_specific.to_dict()), 200)
        return make_response(jsonify({"message": "Parcel not found"}), 404)

    def patch(self, id):
        parcel_specific = Parcel.query.filter_by(id=id).first()
        if parcel_specific:
            data = request.get_json()
            for key, value in data.items():
                setattr(parcel_specific, key, value)
            db.session.commit()
            return make_response(jsonify(parcel_specific.to_dict()), 200)
        return make_response(jsonify({"message": "Parcel not found"}), 404)

    def delete(self, id):
        parcel_specific = Parcel.query.filter_by(id=id).first()
        if parcel_specific:
            db.session.delete(parcel_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "Parcel not found"}), 404)

api.add_resource(ParcelsByID, '/parcels/<int:id>')

# UserAddress resource
class UserAddresses(Resource):
    def get(self):
        response_dict_list = [user_address.to_dict() for user_address in UserAddress.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        new_user_address = UserAddress(
            user_id=data['user_id'],
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zip_code'],
            country=data['country'],
            latitude=data['latitude'],
            longitude=data['longitude']
        )
        db.session.add(new_user_address)
        db.session.commit()
        return make_response(jsonify(new_user_address.to_dict()), 201)

api.add_resource(UserAddresses, '/user_addresses')

class UserAddressesByID(Resource):
    def get(self, id):
        user_address_specific = UserAddress.query.filter_by(id=id).first()
        if user_address_specific:
            return make_response(jsonify(user_address_specific.to_dict()), 200)
        return make_response(jsonify({"message": "UserAddress not found"}), 404)

    def patch(self, id):
        user_address_specific = UserAddress.query.filter_by(id=id).first()
        if user_address_specific:
            data = request.get_json()
            for key, value in data.items():
                setattr(user_address_specific, key, value)
            db.session.commit()
            return make_response(jsonify(user_address_specific.to_dict()), 200)
        return make_response(jsonify({"message": "UserAddress not found"}), 404)

    def delete(self, id):
        user_address_specific = UserAddress.query.filter_by(id=id).first()
        if user_address_specific:
            db.session.delete(user_address_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "UserAddress not found"}), 404)

api.add_resource(UserAddressesByID, '/user_addresses/<int:id>')

# RecipientAddress resource
class RecipientAddresses(Resource):
    def get(self):
        response_dict_list = [recipient_address.to_dict() for recipient_address in RecipientAddress.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        new_recipient_address = RecipientAddress(
            recipient_id=data['recipient_id'],
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zip_code'],
            country=data['country'],
            latitude=data['latitude'],
            longitude=data['longitude']
        )
        db.session.add(new_recipient_address)
        db.session.commit()
        return make_response(jsonify(new_recipient_address.to_dict()), 201)

api.add_resource(RecipientAddresses, '/recipient_addresses')

class RecipientAddressesByID(Resource):
    def get(self, id):
        recipient_address_specific = RecipientAddress.query.filter_by(id=id).first()
        if recipient_address_specific:
            return make_response(jsonify(recipient_address_specific.to_dict()), 200)
        return make_response(jsonify({"message": "RecipientAddress not found"}), 404)

    def patch(self, id):
        recipient_address_specific = RecipientAddress.query.filter_by(id=id).first()
        if recipient_address_specific:
            data = request.get_json()
            for key, value in data.items():
                setattr(recipient_address_specific, key, value)
            db.session.commit()
            return make_response(jsonify(recipient_address_specific.to_dict()), 200)
        return make_response(jsonify({"message": "RecipientAddress not found"}), 404)

    def delete(self, id):
        recipient_address_specific = RecipientAddress.query.filter_by(id=id).first()
        if recipient_address_specific:
            db.session.delete(recipient_address_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "RecipientAddress not found"}), 404)

api.add_resource(RecipientAddressesByID, '/recipient_addresses/<int:id>')

# BillingAddress resource
class BillingAddresses(Resource):
    def get(self):
        response_dict_list = [billing_address.to_dict() for billing_address in BillingAddress.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        new_billing_address = BillingAddress(
            user_id=data['user_id'],
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zip_code'],
            country=data['country'],
            latitude=data['latitude'],
            longitude=data['longitude']
        )
        db.session.add(new_billing_address)
        db.session.commit()
        return make_response(jsonify(new_billing_address.to_dict()), 201)

api.add_resource(BillingAddresses, '/billing_addresses')

class BillingAddressesByID(Resource):
    def get(self, id):
        billing_address_specific = BillingAddress.query.filter_by(id=id).first()
        if billing_address_specific:
            return make_response(jsonify(billing_address_specific.to_dict()), 200)
        return make_response(jsonify({"message": "BillingAddress not found"}), 404)

    def patch(self, id):
        billing_address_specific = BillingAddress.query.filter_by(id=id).first()
        if billing_address_specific:
            data = request.get_json()
            for key, value in data.items():
                setattr(billing_address_specific, key, value)
            db.session.commit()
            return make_response(jsonify(billing_address_specific.to_dict()), 200)
        return make_response(jsonify({"message": "BillingAddress not found"}), 404)

    def delete(self, id):
        billing_address_specific = BillingAddress.query.filter_by(id=id).first()
        if billing_address_specific:
            db.session.delete(billing_address_specific)
            db.session.commit()
            return make_response({}, 204)
        return make_response(jsonify({"message": "BillingAddress not found"}), 404)

api.add_resource(BillingAddressesByID, '/billing_addresses/<int:id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
