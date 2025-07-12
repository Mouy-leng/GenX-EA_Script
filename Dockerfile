# Stage 1: Build client
FROM node:18 AS client-builder
WORKDIR /app/client
COPY client/package.json client/yarn.lock ./
RUN yarn install
COPY client/. .
RUN yarn build

# Stage 2: Build server
FROM node:18 AS server-builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 3: Setup Python environment
FROM python:3.9 AS python-builder
WORKDIR /app/python
COPY services/python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/python/. .

# Stage 4: Production image
FROM node:18-slim
WORKDIR /app

# Copy server files
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/node_modules ./node_modules
COPY package.json .

# Copy client files
COPY --from=client-builder /app/client/dist ./client/dist

# Copy Python files
COPY --from=python-builder /app/python ./services/python

EXPOSE 5173 3000

CMD ["yarn", "start"]
