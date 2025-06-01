#!/bin/bash

migrate-db.sh

node -r ./setup-aliases.js main/fleetbot
