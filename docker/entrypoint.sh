#!/bin/bash

usermod -u $USER_ID meteor
groupmod -g $USER_ID meteor

cd /app
meteor npm install
meteor npm run start:dev
