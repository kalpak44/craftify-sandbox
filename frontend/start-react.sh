#!/bin/bash

# Navigate to the frontend directory relative to this script's location
cd "$(dirname "$0")/craftify-app/"

# Start the React app
npm install && npm run dev
