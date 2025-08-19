#!/bin/bash
# build-production.sh

# Build the Next.js application
echo "Building Next.js application..."
npm run build

echo "Setup complete! Your application is ready for deployment to Render."
echo ""
echo "Deployment Instructions:"
echo "------------------------"
echo "1. Create a new Web Service on Render"
echo "2. Connect to your GitHub repository"
echo "3. Use the following settings:"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm run start:server"
echo "4. Add the following environment variables:"
echo "   - PORT: 10000 (or let Render assign one)"
echo "   - NODE_ENV: production"
echo ""
echo "Once deployed, update your .env.local file with the correct WebSocket URL:"
echo "NEXT_PUBLIC_WS_HOST=your-service-name.onrender.com"
