FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore=scripts && \
    npm cache clean --force
COPY . .
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["CMD-SHELL","wget --no-verbose --tries=1  --spider http://localhost:3000/health || exit 1"]
CMD ["node","server.js"]
