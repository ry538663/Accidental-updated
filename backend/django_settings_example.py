# Minimal Django settings example showing how to read DB URIs from env
import os
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'change-me')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

# Postgres
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'railway'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', ''),
        'HOST': os.getenv('POSTGRES_HOST', 'shortline.proxy.rlwy.net'),
        'PORT': os.getenv('POSTGRES_PORT', '47374'),
    }
}

# Alternatively parse full URL from POSTGRESQL_URI
_pg = os.getenv('POSTGRESQL_URI')
if _pg:
    parsed = urlparse(_pg)
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': parsed.path.lstrip('/'),
        'USER': parsed.username,
        'PASSWORD': parsed.password,
        'HOST': parsed.hostname,
        'PORT': parsed.port,
    }

# MongoDB connection for unstructured data (used by motor/mongoengine)
MONGODB_URI = os.getenv('MONGODB_URI')

# Rest of Django settings omitted for brevity
