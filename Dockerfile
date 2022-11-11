FROM node:18-alpine

ARG ZEITHROLD_MYSQL_HOST
ARG ZEITHROLD_MYSQL_USERNAME
ARG ZEITHROLD_MYSQL_PASSWORD
ARG ZEITHROLD_MYSQL_PORT
ARG ZEITHROLD_MYSQL_DATABASE
ARG ZEITHROLD_REDIS_URI
ARG ZEITHROLD_OIDC_ISSUER
ARG ZEITHROLD_OIDC_CLIENT_ID
ARG ZEITHROLD_OIDC_CLIENT_SECERT
ARG ZEITHROLD_ENDPOINT
ARG ZEITHROLD_ALIYUN_STS_ACCESSKEY_ID
ARG ZEITHROLD_ALIYUN_STS_ACCESSKEY_SECRET
ARG ZEITHROLD_ALIYUN_OSS_REGION
ARG ZEITHROLD_ALIYUN_OSS_BUCKET
ARG ZEITHROLD_ALIYUN_OSS_ENDPOINT
ARG ZEITHROLD_ALIYUN_OSS_ACCESSKEY_ID
ARG ZEITHROLD_ALIYUN_OSS_ACCESSKEY_SECRET

RUN npm install --global yarn

# Install dependencies
COPY . /workspace
WORKDIR /workspace
RUN yarn install
RUN yarn build

EXPOSE 3000

# Run the app
ENTRYPOINT [ "yarn", "start" ]
