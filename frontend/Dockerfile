FROM node:14.19.1

# set working directory
WORKDIR /app/

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
# ENV http_proxy=http://chvproxy.lonzagroup.net:8080
# ENV https_proxy=http://chvproxy.lonzagroup.net:8080
# ENV HTTP_PROXY=http://chvproxy.lonzagroup.net:8080
# ENV HTTPS_PROXY=http://chvproxy.lonzagroup.net:8080

# install app dependencies and build 
COPY . .
RUN npm install
RUN npm run build
RUN npm install -g serve
#RUN npm run build  
