#!/bin/bash

# Django Ecommerce API Startup Script

echo "Starting Django Ecommerce API..."

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Please create one with your configuration."
    echo "See README.md for details."
fi

# Run migrations if needed
echo "Checking for database migrations..."
python manage.py makemigrations --check --dry-run > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Running migrations..."
    python manage.py migrate
fi

# Collect static files (if needed for production)
if [ "$DJANGO_ENV" = "production" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

# Start the development server
echo "Starting development server on http://localhost:8000/"
echo "Admin interface: http://localhost:8000/admin/"
echo "API documentation: See README.md"
echo ""
echo "Press Ctrl+C to stop the server"

python manage.py runserver 0.0.0.0:8000
