#!/bin/sh

cd /app
npm run build:prod
cp -r /app/build/* /var/www/html/
rm -rf /app/*
nginx -g "daemon off;"
