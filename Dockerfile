FROM node:22-alpine

WORKDIR /usr/src/app

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Copy shared package.json (which contains dependencies for all services)
COPY services/package.json ./services/
COPY services/package-lock.json ./services/

# Install dependencies for all services inside the services folder
RUN cd services && npm install --production

# Copy shared library
COPY services/shared ./services/shared

# Copy the specific microservice
COPY services/${APP_NAME} ./services/${APP_NAME}

# Copy the public folder (used by api-gateway)
COPY public ./public

WORKDIR /usr/src/app/services/${APP_NAME}

CMD ["node", "index.js"]
