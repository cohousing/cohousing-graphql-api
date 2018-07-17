FROM node:8

WORKDIR /cohousing

COPY package.json .
COPY yarn.lock .
RUN yarn install --production

COPY private.pem .
COPY public.pem .
COPY dist dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
