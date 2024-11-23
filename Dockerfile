
FROM node:23

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 2002

CMD ["npm", "start"]