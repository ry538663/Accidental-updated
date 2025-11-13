import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB
MONGODB_URI = os.getenv('MONGODB_URI')

# Postgres
SQLALCHEMY_DATABASE_URI = os.getenv('POSTGRESQL_URI')

# Flask
SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'change-me')

# Google Maps
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
