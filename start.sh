#!/bin/bash

# Install backend dependencies
cd backend
composer install --no-dev --optimize-autoloader

# Run database migrations
php artisan migrate --force

# Start the backend server
php artisan serve --host=0.0.0.0 --port=8000 &

# Install frontend dependencies
cd ../client
npm install

# Build the frontend
npm run build

# Serve the frontend (if using a static server)
npx serve -s dist -l 3000 &

# Keep the script running
wait