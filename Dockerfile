# Use official Node.js LTS
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies only
RUN npm install --production && npm install -g pm2

# Copy the rest of the application code
COPY . .

# Expose your app port (from config.js → 5000)
EXPOSE 5000

# Set environment (optional)
ENV NODE_ENV=production
ENV PORT=5000

# Start the app with pm2-runtime + ecosystem config
CMD ["pm2-runtime", "src/eco.config.js", "--env", "production"]

