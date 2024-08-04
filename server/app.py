#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, render_template, redirect, url_for
from flask_restful import Resource

# Local imports
from config import app, db, api

# Add your model imports
from models import User, Role

# import required libraries from flask_login and flask_security
from flask_login import LoginManager, login_manager, login_user
from flask_security import Security, SQLAlchemySessionUserDatastore

# load users, roles for a session
user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
security = Security(app, user_datastore)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'


if __name__ == '__main__':
    app.run(port=5555, debug=True)

