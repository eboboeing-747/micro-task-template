#!/bin/bash

cd "$(dirname $0)"
cd ..
docker build -f service_users/Dockerfile -t "service_users" .
