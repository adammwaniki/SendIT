# /server/create_roles.py
from app import Role, User, db

def create_roles():
    admin = Role(id=1, name='Admin')
    user = Role(id=2, name='User')

    db.session.add(admin)
    db.session.add(user)

    db.session.commit()
    print("Roles created successfully!")

# Function calling will create 2 roles as planned!
create_roles()
