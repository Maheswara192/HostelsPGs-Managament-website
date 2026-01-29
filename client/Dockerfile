FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Argument for API URL (Default to localhost)
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the project
RUN npm run build

# Install a static file server
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the 'dist' folder on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
