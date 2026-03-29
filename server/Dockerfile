FROM node:18

WORKDIR /app

# Install dependencies required for bcrypt
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Remove existing node_modules and install dependencies
RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm install -g node-gyp && \
    npm install && \v
    npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"] 