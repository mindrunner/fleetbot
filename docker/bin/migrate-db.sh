#!/bin/bash

wait-for-it.sh "${DATABASE_HOST}:${DATABASE_PORT}" --strict --timeout=300

/app/migrate.js
