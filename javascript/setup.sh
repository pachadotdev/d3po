#!/bin/bash

# D3po Setup Script
# This script helps you get started with the new d3po library

echo "🎨 D3po JavaScript Library Setup"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the javascript-new directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 Available commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm test           - Run tests"
echo "  npm test:watch     - Run tests in watch mode"
echo "  npm run lint       - Check code quality"
echo "  npm run format     - Format code"
echo "  npm run docs       - Generate documentation"
echo ""
echo "📖 Documentation:"
echo "  README.md              - Main documentation"
echo "  GETTING_STARTED.md     - Quick start guide"
echo "  MIGRATION.md           - Migration from v0.x"
echo "  IMPLEMENTATION_SUMMARY.md - Technical overview"
echo ""
echo "🎯 Quick Start:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:5173/examples/"
echo "  3. Explore the examples!"
echo ""
echo "🧪 Run Tests:"
echo "  npm test"
echo ""
echo "🔧 Build for Production:"
echo "  npm run build"
echo "  Output: dist/d3po.esm.js and dist/d3po.min.js"
echo ""
echo "Happy coding! 🎉"
