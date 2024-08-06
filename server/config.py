# /server/config.py

# Standard library imports

# Remote library imports
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
import os

# Local imports

# Instantiate app, set attributes
app = Flask(__name__)
# In production it is preferable to use a fixed and securely generated secret key instead of a random one each time the server restarts.
app.config['SECRET_KEY'] = os.urandom(24) # This will generate a random 24bit secret key
# app.config['SECRET_KEY'] = 'Y\xf1Xz\x00\xad|eQ\x80t \xca\x1a\x10K' # commented out for tests with postman
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://mysuperuser2:mysuperpass2@localhost:5432/sendit"
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

# Instantiate CORS
CORS(app)
