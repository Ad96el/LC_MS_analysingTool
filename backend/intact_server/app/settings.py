import os
from datetime import timedelta
from dotenv import load_dotenv


load_dotenv()


class Development(object):
    DEBUG = True
    TESTING = False
    THREADED = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1, hours=12)
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL_DEVELOPMENT')
    CORS_HEADERS = "Content-Type"


class Production(object):
    DEBUG = False
    TESTING = False
    HOST = "0.0.0.0"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1, hours=12)
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')


class Testing(object):
    TESTING = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_TEST_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False


app_config = {
    'development': Development,
    'production': Production,
    'testing': Testing
}
