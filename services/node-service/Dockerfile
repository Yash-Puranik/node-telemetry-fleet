FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev --loglevel verbose

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]