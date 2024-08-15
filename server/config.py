# /server/config.py

# Standard library imports

# Remote library imports
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from dotenv import load_dotenv
import os

load_dotenv()
# Local imports

# Environment attributes
DATABASE_URI = os.getenv("DATABASE_URI")

# Instantiate app, set attributes
app = Flask(__name__, static_folder='../client/build', static_url_path='')
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

# CORS CONFIGURATIONS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

# Instantiate CORS
CORS(app, origins=CORS_ALLOWED_ORIGINS)
