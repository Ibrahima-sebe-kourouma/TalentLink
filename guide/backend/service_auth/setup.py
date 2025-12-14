from setuptools import setup, find_packages

setup(
    name="service_auth",
    version="1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic[email]",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "requests",
    ],
)