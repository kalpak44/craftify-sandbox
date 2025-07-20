FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY bootstrap/ ./bootstrap
COPY user/ ./user

CMD ["node", "bootstrap/main.js"]
