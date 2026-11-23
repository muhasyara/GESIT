FROM nginx:alpine

# Ganti konfigurasi default Nginx
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Salin hanya aset frontend statis ke root web
COPY src/*.html src/*.css src/*.js /var/www/html/