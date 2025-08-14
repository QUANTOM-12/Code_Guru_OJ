# Use Node.js LTS version
FROM node:18-alpine

# Install Docker CLI (needed for your compiler service)
RUN apk add --no-cache docker-cli

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p temp

# Expose the port
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Start the application
CMD ["npm", "start"]
