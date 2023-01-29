#!/bin/bash

wait-for-it.sh "${DATABASE_HOST}:${DATABASE_PORT}" --strict --timeout=300

npx typeorm migration:run -d ./db/db-data-source.js
