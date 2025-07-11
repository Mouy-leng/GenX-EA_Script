# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app (adjust if your build command is different)
RUN npm run build

# Expose the port the app runs on (adjust if needed)
EXPOSE 3000

# Start the app (adjust if your start command is different)
CMD ["npm", "start"]
