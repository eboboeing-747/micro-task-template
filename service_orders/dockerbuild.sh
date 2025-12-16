#!/bin/bash

cd "$(dirname $0)"
cd ..
docker build -f service_orders/Dockerfile -t "service_orders" .
