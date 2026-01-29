FROM node:18-alpine

WORKDIR /app

# Install dependencies (Production only)
COPY package*.json ./
RUN npm install --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
