## build
FROM node:10-alpine as builder

COPY package.json package-lock.json ./

## store node modules on a separate layer to prevent unnecessary npm installs at each build
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

## build angular app in production mode and store the artifacts in dist folder
RUN npm run ng build -- --prod --output-path=dist

## setup nginx
FROM nginx:1.14.1-alpine

## copy default nginx config (if required, store files in root folder, these will be copied to container)
# COPY nginx/default.conf /etc/nginx/conf.d

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

## run with "docker run -p 8080:80 myapp" in command line