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

# Instantiate app, set attributes
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)  # This will generate a random 24bit secret key
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

# Instantiate CORS with updated configuration
CORS(app,
     origins=[r"https://.*\.vercel\.app$", "https://send-it-eight.vercel.app"],
     supports_credentials=True,
     origins_regex=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     expose_headers=['Set-Cookie'])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Expose-Headers', 'Set-Cookie')
    return response
