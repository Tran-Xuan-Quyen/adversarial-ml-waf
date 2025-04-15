FROM node:20.9.0-alpine

WORKDIR /identity/

COPY package.json ./

# RUN npm i @nestjs/cli

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]
