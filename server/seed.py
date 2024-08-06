# Made changes to schema so not entirely applicable anymore
# TO DO: Update seed to reflect schema changes
'''#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        # Connect to the database
        with db.engine.connect() as connection:
            # Start a transaction
            with connection.begin():
                # Insert data into roles
                connection.execute(text("""
                INSERT INTO roles (name) VALUES 
                ('User'),
                ('Admin');
                """))

                # Insert data into user_addresses
                connection.execute(text("""
                INSERT INTO user_addresses (street, city, state, zip_code, country, latitude, longitude) VALUES 
                ('123 Elm St', 'Springfield', 'IL', '62701', 'USA', 39.7817, -89.6501),
                ('456 Oak St', 'Springfield', 'IL', '62702', 'USA', 39.7817, -89.6501);
                """))

                # Insert data into recipient_addresses
                connection.execute(text("""
                INSERT INTO recipient_addresses (street, city, state, zip_code, country, latitude, longitude) VALUES 
                ('789 Pine St', 'Springfield', 'IL', '62703', 'USA', 39.7817, -89.6501),
                ('101 Maple St', 'Springfield', 'IL', '62704', 'USA', 39.7817, -89.6501);
                """))

                # Insert data into billing_addresses
                connection.execute(text("""
                INSERT INTO billing_addresses (street, city, state, zip_code, country, latitude, longitude) VALUES 
                ('202 Birch St', 'Springfield', 'IL', '62705', 'USA', 39.7817, -89.6501),
                ('303 Cedar St', 'Springfield', 'IL', '62706', 'USA', 39.7817, -89.6501);
                """))

                # Insert data into users
                connection.execute(text("""
                INSERT INTO users (first_name, last_name, email, password, fs_uniquifier, user_address_id, billing_address_id, created_at, updated_at) VALUES 
                ('John', 'Doe', 'john.doe@example.com', 'password123', uuid_generate_v4()::text, 1, 2, current_timestamp, current_timestamp),
                ('Jane', 'Smith', 'jane.smith@example.com', 'password123', uuid_generate_v4()::text, 2, 1, current_timestamp, current_timestamp),
                ('Emily', 'Johnson', 'emily.johnson@example.com', 'password123', uuid_generate_v4()::text, 1, 2, current_timestamp, current_timestamp);
                """))

                # Insert Admins
                connection.execute(text("""
                INSERT INTO users (first_name, last_name, email, password, fs_uniquifier, user_address_id, billing_address_id, created_at, updated_at) VALUES 
                ('Admin', 'User', 'admin1@sendit.com', 'adminpass', uuid_generate_v4()::text, 2, 1, current_timestamp, current_timestamp),
                ('Admin', 'User', 'admin2@sendit.com', 'adminpass', uuid_generate_v4()::text, 2, 2, current_timestamp, current_timestamp);
                """))

                # Insert data into recipients
                connection.execute(text("""
                INSERT INTO recipients (recipient_full_name, phone_number, delivery_address_id, created_at, updated_at) VALUES 
                ('Alice Brown', '555-1234', 1, current_timestamp, current_timestamp),
                ('Bob White', '555-5678', 2, current_timestamp, current_timestamp);
                """))

                # Insert data into parcels
                connection.execute(text("""
                INSERT INTO parcels (user_id, recipient_id, length, width, height, weight, status, tracking_number, created_at, updated_at) VALUES 
                (1, 1, 10, 5, 5, 2, 'Shipped', substring(uuid_generate_v4()::text, 1, 32), current_timestamp, current_timestamp),
                (2, 2, 15, 10, 10, 5, 'Delivered', substring(uuid_generate_v4()::text, 1, 32), current_timestamp, current_timestamp);
                """))

                # Insert data into roles_users
                connection.execute(text("""
                INSERT INTO roles_users (user_id, role_id) VALUES 
                (1, 1), -- John Doe is a User
                (2, 1), -- Jane Smith is a User
                (3, 1), -- Emily Johnson is a User
                (4, 2), -- Admin User 1 is an Admin
                (5, 2); -- Admin User 2 is an Admin
                """))

        print("Database seeded!")

if __name__ == "__main__":
    seed_data()

'''

