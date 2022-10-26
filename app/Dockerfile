ARG NODE_ENV

FROM node:16-alpine AS dev
WORKDIR /app
COPY . /app
RUN yarn install
CMD yarn dev

FROM node:16-alpine AS production
WORKDIR /app
COPY . /app
RUN yarn install
CMD yarn build
