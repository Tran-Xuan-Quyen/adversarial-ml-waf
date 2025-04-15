FROM node:20.9.0-alpine AS web_builder

WORKDIR /ui_web/
COPY package.json ./
# RUN npm i -g npm@10
RUN npm i
COPY . .
RUN npm run build

WORKDIR /ui_web/bin
RUN npm i
CMD [ "/bin/sh" , "-c" , "npm start" ]

