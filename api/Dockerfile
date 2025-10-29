FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY . /app

RUN npm install -g nodemon

RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT ["nodemon", "/app/server.js"]  
CMD ["npm", "run", "dev"]