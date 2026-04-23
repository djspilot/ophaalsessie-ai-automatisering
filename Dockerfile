FROM node:20-alpine
WORKDIR /app
COPY server.js .
RUN mkdir -p /app/data
EXPOSE 3210
CMD ["node", "server.js"]
