FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create result_audio directory
RUN mkdir -p public/result_audio

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "app.js"]

