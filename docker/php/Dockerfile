FROM php:8.3-fpm-alpine

# Install ekstensi mysqli untuk koneksi ke MariaDB/MySQL
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

WORKDIR /var/www/html

# Salin hanya folder api ke dalam container PHP
COPY src/api /var/www/html/api

# Atur hak akses folder kerja
RUN chown -R www-data:www-data /var/www/html