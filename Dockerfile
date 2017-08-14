FROM node:6-alpine

WORKDIR /cohousing

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY dist dist

RUN ls -la

EXPOSE 3000

CMD ["node", "dist/index.js"]
