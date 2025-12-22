FROM node:18-alpine

WORKDIR /lib/database
COPY ../lib/database ./
RUN npm install
RUN npm run build

WORKDIR /lib/types
COPY ../lib/types ./
RUN npm install
RUN npm run build

WORKDIR /app

COPY service_orders/package*.json ./

RUN npm install

COPY service_orders .

EXPOSE 8002

CMD ["npm", "start"]
