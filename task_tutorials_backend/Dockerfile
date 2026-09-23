# ==========================================================
# Production Laravel PHP 8.2-FPM Container
# ==========================================================
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies & build tools needed for PHP extensions
RUN apk update && apk add --no-cache \
    curl \
    git \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    libzip-dev

# Install PHP extensions required for Laravel and MySQL
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    opcache \
    zip

# Install Composer globally from official trusted image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files first to leverage Docker layer caching
COPY composer.json composer.lock ./

# Install production dependencies only (no dev packages, optimized autoloader)
RUN composer install --no-dev --no-interaction --no-plugins --no-scripts --prefer-dist --optimize-autoloader

# Copy application source code
COPY . .

# Set proper permissions for Laravel writable directories
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Switch to unprivileged user for security
USER www-data

# Expose FastCGI port
EXPOSE 9000

# Start PHP-FPM in foreground
CMD ["php-fpm"]
