# Use the Node.js 18 image as the base image for the frontend build
FROM node:18 AS frontend-builder

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy everything from the frontend directory to the container
COPY frontend/ ./

# Install frontend dependencies
RUN npm install

# Build the frontend
RUN npm run build

# Use the Node.js 18 image as the base image for the backend build
FROM node:18 AS backend-builder

# Set the working directory for the backend
WORKDIR /app/backend

# Copy everything from the backend directory to the container
COPY backend/ ./

# Install backend dependencies and build the TypeScript code
RUN npm install
RUN npm run build

# Use the Node.js 18 image as the final base image
FROM node:18

# Set the working directory for the backend in the final stage
WORKDIR /app/

# Copy the backend's built files from the backend-builder stage
COPY --from=backend-builder /app/backend/dist ./dist

# Copy package.json and package-lock.json to the final stage
COPY --from=backend-builder /app/backend/package*.json ./

# Install backend dependencies again (including dotenv)
RUN npm install

# Copy the frontend's built files from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./dist

# Expose the port used by the backend (adjust if needed)
EXPOSE 5000

# Start the backend app
CMD ["node", "dist/app.js"]