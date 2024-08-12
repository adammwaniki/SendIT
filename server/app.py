#!/usr/bin/env python3
# /server/app.py

# Remote library imports
from flask import request, make_response, jsonify, session
from flask_restful import Api, Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate

from config import app, db, api
from models import User, Role, Recipient, Parcel, BillingAddress

migrate = Migrate(app, db)

def load_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(int(user_id))
    return None

@app.before_request
def check_if_logged_in():
    whitelist = ['index', 'signup', 'login', 'check_session', 'logout']
    if request.endpoint not in whitelist and not load_user():
        return make_response(jsonify({"message": "Unauthorized access"}), 401)

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

# User resource
class Signup(Resource):
    def post(self):
        data = request.get_json()
        if not all(k in data for k in ('first_name', 'last_name', 'email', 'password')):
            return {"message": "Missing required fields"}, 400

        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return {"message": "Email is already in use"}, 400

        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id

        return {"message": "User created successfully", "user": new_user.to_dict()}, 201

api.add_resource(Signup, '/signup', endpoint='signup')

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password, data['password']):
            session['user_id'] = user.id
            return {"message": "Login successful"}, 200
        
        return {"message": "Invalid credentials"}, 401

api.add_resource(Login, '/login', endpoint='login')

class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204
    
api.add_resource(Logout, '/logout', endpoint='logout')

class CheckSession(Resource):
    def get(self):
        user = load_user()
        if user:
            return user.to_dict()
        return {}, 204
    
api.add_resource(CheckSession, '/check_session', endpoint='check_session')

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
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone_number=data['phone_number'],
            street=data['street'],
            city=data['city'],
            state=data['state'],
            zip_code=data['zip_code'],
            country=data['country'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
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
        current_user = load_user()
        new_parcel = Parcel(
            user_id=current_user.id,  # Automatically set the user_id from the current session user
            recipient_id=data['recipient_id'],
            length=data['length'],
            width=data['width'],
            height=data['height'],
            weight=data['weight'],
            cost=data.get('cost'),  # Make cost optional
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

# BillingAddress resource
class BillingAddresses(Resource):
    def get(self):
        response_dict_list = [billing_address.to_dict() for billing_address in BillingAddress.query.all()]
        return make_response(jsonify(response_dict_list), 200)

    def post(self):
        data = request.get_json()
        current_user = load_user()
        if not current_user:
            return make_response(jsonify({"message": "Unauthorized"}), 401)

        new_billing_address = BillingAddress(
            user_id=current_user.id,  # Automatically set the user_id from the current session user
            street=data['street'],
            city=data['city'],
            state=data.get('state'),  # Use .get() to handle optional fields
            zip_code=data.get('zip_code'),
            country=data['country'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
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



