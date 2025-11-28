# Use Node.js 14 LTS
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies and PM2 globally
RUN npm install --production && npm install -g pm2

# Copy the rest of the project
COPY . .

# Expose ports
EXPOSE 5000 5001

# Set environment variable (can be overridden by docker run)
ENV NODE_ENV=production

# Start the API with PM2 using ecosystem file
CMD ["pm2-runtime", "src/eco.config.js", "--env", "production"]
