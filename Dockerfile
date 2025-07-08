FROM "ubuntu:oracular"
RUN apt-get update && apt-get -y install nodejs npm
WORKDIR /src
COPY . .
RUN npm ci