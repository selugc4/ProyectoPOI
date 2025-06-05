FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g @ionic/cli
RUN npm install

COPY . .

EXPOSE 8100

CMD ["ionic", "serve", "--host", "0.0.0.0", "--port", "8100"]
