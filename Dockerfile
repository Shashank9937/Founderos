FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /var/data \
  && chown -R node:node /var/data /app

ENV NODE_ENV=production
ENV DB_PATH=/var/data/founder-os.db
EXPOSE 3000

USER node

CMD ["npm", "start"]
