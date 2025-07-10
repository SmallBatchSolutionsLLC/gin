FROM "ubuntu:oracular"
RUN apt-get update && apt-get -y install nodejs npm
RUN npm install -g @smallbatchsolutions/gin
