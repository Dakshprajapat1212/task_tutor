#!/bin/sh
set -e

echo "🚀 Starting Laravel Backend Container..."

chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

echo "📦 Running automated database migrations..."
php artisan migrate --force

echo "🌱 Running automated database seeders..."
php artisan db:seed --force || true

echo "✅ Database ready! Launching PHP-FPM..."
exec "$@"
