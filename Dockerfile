# Use official Node.js LTS
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies only + PM2 globally
RUN npm install --production && npm install -g pm2

# Copy the rest of the application code
COPY . .

# Expose the app port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV REDIS_PORT=6379
ENV REDIS_HOST=redis 

# Start the app using pm2-runtime and ecosystem config
# Ensure your eco.config.js uses cluster mode to prevent EADDRINUSE
CMD ["pm2-runtime", "src/eco.config.js", "--env", "production"]
