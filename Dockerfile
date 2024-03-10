FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5111

CMD ["npm", "start"]
#CMD ["npm", "run", "dev"]
