from setuptools import setup, find_packages

setup(
    name="service_profile",
    version="1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "requests",
    ],
)
