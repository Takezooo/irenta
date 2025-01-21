# Use the official Node.js LTS version as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy only the package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build your app
RUN npm run build

# Expose the backend's port
EXPOSE 5000

# Command to start the server
CMD ["npm", "run", "dev"]
