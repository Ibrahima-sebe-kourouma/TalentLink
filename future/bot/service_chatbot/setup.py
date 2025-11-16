from setuptools import setup, find_packages

setup(
    name="service_chatbot",
    version="1.0.0",
    description="Service de chatbot personnalisé avec intégration Ollama pour TalentLink",
    author="TalentLink Team",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.100.0",
        "uvicorn[standard]>=0.22.0",
        "sqlalchemy>=2.0.0",
        "pydantic>=2.0.0",
        "requests>=2.31.0",
        "python-multipart>=0.0.6",
    ],
    python_requires=">=3.9",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "httpx>=0.24.0"
        ]
    }
)