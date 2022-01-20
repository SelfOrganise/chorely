#!/bin/bash

export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=postgres
export DB_DATABASE=postgres
export DB_PASSWORD=test

export SENDGRID_API_KEY=SG.notset

export USER_1_SEMAPHORE_VALUE=1
export USER_1_USERNAME=first
export USER_1_EMAIL=first@gmail.com

export USER_2_SEMAPHORE_VALUE=-1
export USER_2_USERNAME=second
export USER_2_EMAIL=second@gmail.com

export PORT=4001
node -r ts-node/register ./src/index.ts
