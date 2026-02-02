FROM node:25-alpine as base 

FROM base as deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base as builder 
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . . 
RUN npm run build

FROM base as runner 
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Create static directory with proper permissions
RUN mkdir -p /app/static/image /app/static/track && \
    chown -R nestjs:nodejs /app/static

USER nestjs

COPY --from=deps --chown=nestjs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist /app 

ENV PORT=4000
ENV MONGO_DB_CONNECT_LINK="mongodb+srv://root:61234094@cluster0.2kx6ce3.mongodb.net/?appName=Cluster0"
ENV HOSTNAME="0.0.0.0"

EXPOSE 4000

CMD [ "node", "main.js" ]
