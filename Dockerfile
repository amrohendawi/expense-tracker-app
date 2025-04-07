FROM node:20-alpine

WORKDIR /app

# Install dependencies including netcat for health checks
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Make the init script executable
RUN chmod +x ./docker-init.sh

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Run the application with the init script
CMD ["./docker-init.sh"]
