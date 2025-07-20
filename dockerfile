FROM node:22-slim
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --omit dev

# Bundle app source
COPY . .

EXPOSE 3000
ENV NODE_ENV=production
ENV ORIGIN http://codevert.org:5173
RUN npm run build

CMD [ "node", "build"]