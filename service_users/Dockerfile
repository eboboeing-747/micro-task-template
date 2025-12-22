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

COPY service_users/package*.json ./

RUN npm install

COPY service_users .

RUN npm run build

EXPOSE 8001

CMD ["npm", "start"]
