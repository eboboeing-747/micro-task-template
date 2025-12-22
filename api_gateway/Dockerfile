FROM node:18-alpine

WORKDIR /lib/types
COPY ../lib/types ./

RUN npm install
RUN npm run build

WORKDIR /app
COPY api_gateway/package*.json ./
RUN npm install

COPY api_gateway .
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
