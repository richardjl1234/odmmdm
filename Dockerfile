FROM ubuntu:latest 

RUN apt-get update
RUN apt-get install --yes curl
RUN apt-get autoclean
#RUN apt-get install --yes git
#RUN apt-get install --yes wget
#RUN apt-get install openjdk-8-jdk
#ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.10.2
#ENV NODE_VERSION 8.17.0 

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 

EXPOSE 8080

# Install npm
RUN apt-get install --yes npm
RUN apt-get install --yes libxml2  
# Clean up
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get clean

RUN mkdir -p /app
WORKDIR /app

COPY . /app
RUN rm -rf node_modules

RUN npm install 
RUN cp db2consv_zs.lic ./node_modules/ibm_db/installer/clidriver/license/
