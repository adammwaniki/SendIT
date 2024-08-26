#!/usr/bin/env python3
# /server/app.py

# Remote library imports
from flask import request, make_response, jsonify, session, send_from_directory
from flask_restful import Api, Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate
from flask_mail import Mail, Message
import functools
from dotenv import load_dotenv
import os

load_dotenv()


from config import app, db, api
from models import User, Role, Recipient, Parcel, BillingAddress

migrate = Migrate(app, db)

mail_server = os.getenv('mail_server')
mail_port = os.getenv('mail_port')
mail_username = os.getenv('mail_username')
mail_password = os.getenv('mail_password')
mail_defaul_sender = os.getenv('mail_defaul_sender')

# Configuring mail
# app.config['DEBUG'] = True
# app.config['TESTING'] = False # This will be true while testing 
app.config['MAIL_SERVER'] = f'{mail_server}'
app.config['MAIL_PORT'] = f'{mail_port}' # May be another value based on the server
app.config['MAIL_USE_TLS'] = True # Test first to see whether true or false works
app.config['MAIL_USE_SSL'] = False # Test first to see whether true or false works
# app.config['MAIL_DEBUG'] = True # same value as the debug
app.config['MAIL_USERNAME'] = f'{mail_username}'
app.config['MAIL_PASSWORD'] = f'{mail_password}' # will move this to a .env file for safety
app.config['MAIL_DEFAULT_SENDER'] = f'{mail_defaul_sender}'
# app.config['MAIL_MAX_EMAILS'] = None
# app.config['MAIL_SUPPRESS_SEND'] = False # Same value as the testing value so that it doesn't have to send emails every time
# app.config['MAIL_ASCII_ATTACHMENTS'] = False # This will convert the characters that look like normal English

# Initialising Flask-Mail
mail = Mail(app)

def load_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(int(user_id))
    return None

@app.before_request
def check_if_logged_in():
    # List of static file serving paths or patterns
    static_paths = ['/static', '/favicon.ico', '/']
    
    # Check if the request path starts with any of the static paths
    if any(request.path.startswith(path) for path in static_paths):
        return
    
    whitelist = ['index', 'signup', 'login', 'check_session', 'logout', 'serve_static_files']
    if request.endpoint is None:
        return make_response(jsonify({"message": "Invalid endpoint"}), 404)
    if request.endpoint not in whitelist and not request.endpoint.startswith('admin'):
        user = load_user()
        if not user:
            return make_response(jsonify({"message": "Unauthorized access"}), 401)
        if request.endpoint.startswith('admin') and not any(role.name == 'admin' for role in user.roles):
            return make_response(jsonify({"message": "Admin access required"}), 403)


@app.route('/')
def home():
    return jsonify({"message": "SendIT API is running"}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "":
        full_path = os.path.join(app.static_folder, path)
        if os.path.exists(full_path):
            print(f"Serving file from: {full_path}")  # Debug log
            return send_from_directory(app.static_folder, path)
        else:
            print(f"File not found: {full_path}")  # Debug log
    return send_from_directory(app.static_folder, 'index.html')



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
        new_user = User.create_with_default_role(
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
            roles = [role.name for role in user.roles]
            return {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "roles": roles,
                    "isAdmin": 'admin' in roles,
                    "isUser": 'user' in roles
                }
            }, 200
        return {"message": "Invalid credentials"}, 401


api.add_resource(Login, '/login', endpoint='login')

class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204
    
api.add_resource(Logout, '/logout', endpoint='logout')

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(int(user_id))
            if user:
                roles = [role.name for role in user.roles]
                return {
                    "message": "Session active",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "roles": roles,
                        "isAdmin": 'admin' in roles,
                        "isUser": 'user' in roles
                    }
                }, 200
        return {"message": "No active session"}, 204

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
            try:
                user_data = user_specific.to_dict()
                return user_data, 200
            except Exception as e:
                app.logger.error(f"Error serializing user data: {str(e)}")
                return {"message": "Error serializing user data", "error": str(e)}, 500
        return {"message": "User not found"}, 404


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

# SendEmail resource # Work in progress
class SendEmail(Resource):
    def post(self):
        data = request.get_json()
        
        # Validate the incoming data
        required_fields = ['to', 'subject', 'body']
        if not all(field in data for field in required_fields):
            return {"message": "Missing required fields"}, 400

        recipients = data['to']
        subject = data['subject']
        body = data['body']
        
        try:
            # Create a new email message
            # Ensured recipients is a list, even if a single email address is provided.
            msg = Message(subject=subject,
                          recipients=[recipients] if isinstance(recipients, str) else recipients,
                          body=body,
                          sender=app.config['MAIL_USERNAME'])
            
            # Send the email
            mail.send(msg)
            return {"message": "Email sent successfully"}, 200
        
        except Exception as e:
            return {"message": f"Error sending email: {str(e)}"}, 500

# Add the SendEmail resource to the API
api.add_resource(SendEmail, '/send-email')

def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user = load_user()
        if user and any(role.name == 'admin' for role in user.roles):
            return f(*args, **kwargs)
        return {"message": "Admin access required"}, 403
    return decorated_function

class AdminDashboard(Resource):
    @admin_required
    def get(self):
        # I will see what admin-specific logic to add here
        return {"message": "Welcome to the admin dashboard"}, 200

api.add_resource(AdminDashboard, '/admin/dashboard')

class ParcelsByUserID(Resource):
    def get(self):
        current_user = load_user()
        if not current_user:
            return make_response(jsonify({"message": "Unauthorized"}), 401)
        
        parcels = Parcel.query.filter_by(user_id=current_user.id).all()
        return jsonify([parcel.to_dict() for parcel in parcels])

api.add_resource(ParcelsByUserID, '/user/parcels')

if __name__ == '__main__':
    #app.run(port=5555, debug=True) # Commenting out so that it doesn't conflict with deployment server
    #app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5555)), debug=False)
    #pass
    app.run()


