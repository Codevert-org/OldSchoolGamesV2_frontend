FROM node

WORKDIR /usr/app

COPY . .

RUN npm install
RUN npm run build

FROM staticdeploy/app-server:v4.1.0

COPY /dist /build