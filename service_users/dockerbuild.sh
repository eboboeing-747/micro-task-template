#!/bin/bash

cd ..
docker build -f service_users/Dockerfile -t "service_users" .
