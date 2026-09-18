FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]