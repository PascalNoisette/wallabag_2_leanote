FROM openapitools/openapi-generator-cli as generator

COPY definition /definition

RUN docker-entrypoint.sh generate -i /definition/leanote.yml -g javascript -c /definition/leanote.json -o /app/leanote_openapi_client
RUN docker-entrypoint.sh generate -i /definition/wallabag.yml -g javascript -c /definition/wallabag.json -o /app/wallabag_openapi_client


FROM node:buster-slim
COPY --from=generator /app/ /app/
RUN cd /app/leanote_openapi_client && npm install && npm run build
RUN cd /app/wallabag_openapi_client && npm install && npm run build
COPY package.json *.js /app/
WORKDIR /app
RUN npm install
CMD [ "node" ]