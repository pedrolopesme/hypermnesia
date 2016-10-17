FROM node:6

MAINTAINER Pedro Mendes <pedrolopesme@gmail.com> 

# Module dir
RUN mkdir -p /usr/src/hypermnesia
WORKDIR /usr/src/hypermnesia

# Instaling module dependencies
COPY package.json /usr/src/hypermnesia/
RUN npm install jasmine-node -g
RUN npm install uglify-js -g
RUN npm install

# Bundle module source
COPY . /usr/src/hypermnesia