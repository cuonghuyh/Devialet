#!/bin/bash

echo "======================================"
echo "Devialet - Prepare for Byethost Deploy"
echo "======================================"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Step 2: Create deployment package
echo ""
echo "Step 2: Creating deployment package..."

# Create deploy directory
mkdir -p ../deploy-byethost
rm -rf ../deploy-byethost/*

# Copy necessary files
echo "Copying files..."
cp -r config ../deploy-byethost/
cp -r core ../deploy-byethost/
cp -r controllers ../deploy-byethost/
cp -r middleware ../deploy-byethost/
cp -r services ../deploy-byethost/
cp -r routes ../deploy-byethost/
cp -r public ../deploy-byethost/
cp -r vendor ../deploy-byethost/
cp .htaccess ../deploy-byethost/
cp .env.production ../deploy-byethost/.env
cp composer.json ../deploy-byethost/
cp README.md ../deploy-byethost/
cp DEPLOY-BYETHOST.md ../deploy-byethost/

echo ""
echo "======================================"
echo "✅ Deployment package ready!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Edit ../deploy-byethost/.env with your Byethost credentials"
echo "2. Upload all files in ../deploy-byethost/ to Byethost htdocs/"
echo "3. Import database schema to Byethost MySQL"
echo "4. Test your API at: https://your-domain.byet.host/api/products"
echo ""
