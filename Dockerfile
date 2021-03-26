# FROM node:10-alpine as builder

# # install and cache app dependencies
# COPY package.json ./
# RUN npm install && mkdir /app && mv ./node_modules ./app

# WORKDIR /app

# COPY . .

# RUN npm run build:prod



# # ------------------------------------------------------
# # Production Build
# # ------------------------------------------------------

# FROM nginx:1.16.0-alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx/nginx.conf /etc/nginx/conf.d
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM node:14.14.0-stretch

RUN apt-get update && apt-get install nginx -y

WORKDIR /app

COPY package*.json /app/
RUN npm install
COPY ./ /app/
COPY ./nginx.conf /etc/nginx/sites-enabled/default
RUN chmod +x run.sh

CMD ["./run.sh"]
