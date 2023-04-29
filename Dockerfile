FROM node:20
WORKDIR /app
COPY package*.json ./

RUN npm ci --omit-dev
COPY server.js ./server.js 

COPY db/ ./db

EXPOSE 8080
CMD [ "node", "server.js" ]