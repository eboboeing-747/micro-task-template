#!/bin/bash

cd "$(dirname $0)"
cd ..
docker build -f api_gateway/Dockerfile -t "api_gateway" .
