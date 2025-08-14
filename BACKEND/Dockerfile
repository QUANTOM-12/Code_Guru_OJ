# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose the port your app runs on
EXPOSE 8001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8001

# Start the application
CMD ["npm", "start"]
