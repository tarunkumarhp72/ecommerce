#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python3 manage.py collectstatic --noinput

# Run migrations
python3 manage.py migrate
