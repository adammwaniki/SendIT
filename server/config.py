# /server/config.py

# Standard library imports

# Remote library imports
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from dotenv import load_dotenv
import os
import re

load_dotenv()
# Local imports

# Environment attributes
DATABASE_URI = os.getenv("DATABASE_URI")
#CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')

# Instantiate app, set attributes
app = Flask(__name__)
# In production it is preferable to use a fixed and securely generated secret key instead of a random one each time the server restarts.
app.config['SECRET_KEY'] = os.urandom(24) # This will generate a random 24bit secret key
app.config['SQLALCHEMY_DATABASE_URI'] = f'{DATABASE_URI}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False


# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

# Instantiate REST API
api = Api(app)


# Instantiate CORS now including explicit definition of allowed methods
#CORS(app, supports_credentials=True, resources={r"/*": {"origins": CORS_ALLOWED_ORIGINS}})
#CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
#CORS(app, origins=['https://send-it-eight.vercel.app'], supports_credentials=True) origins_regex=True,
CORS(app, 
     origins=[r"https://.*\.vercel\.app$"], 
     supports_credentials=True, 
     origins_regex=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['*'],
     expose_headers=['Set-Cookie'])

@app.after_request
def after_request(response):
    #origin = request.headers.get('Origin')
    #if origin and re.match(r"https://.*\.vercel\.app$", origin): # This allows handling of the preview deployments
    #    response.headers.add('Access-Control-Allow-Origin', origin)
    #response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', '*')
    #response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Expose-Headers', 'Set-Cookie')
    return response


