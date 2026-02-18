FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev || npm install

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
