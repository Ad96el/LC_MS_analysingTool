#!/bin/sh
docker-compose up --build -d 
PGPASSWORD=1lUZkt2tF3BUZ0ch psql -d lonza -U admin -h 0.0.0.0 -a -f ./fill.sql