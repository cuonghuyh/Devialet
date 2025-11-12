FROM php:8.4-cli

# System deps
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
 && docker-php-ext-install pdo_mysql mbstring zip exif pcntl

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy application
COPY . /var/www

# Install PHP dependencies (if composer.json exists)
RUN if [ -f composer.json ]; then composer install --no-interaction --prefer-dist --optimize-autoloader || true; fi

# Generate app key if not present
RUN if [ -f artisan ]; then php artisan key:generate || true; fi

EXPOSE 8000

# Use artisan serve for simplicity (suitable for development/testing)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
