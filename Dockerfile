FROM node:9

WORKDIR /usr/src/app
RUN chown node:node -R /usr/src/app

COPY . .
RUN yarn

EXPOSE 3000 3001
CMD ["yarn", "start"]
