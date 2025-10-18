#!/bin/bash

# Quick Test Script for D3po v1.0

echo "🧪 D3po v1.0 - Quick Test Suite"
echo "================================="
echo ""

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed"
    echo "Run: npm install"
    exit 1
fi

echo "✅ Dependencies found"
echo ""

# Run linting
echo "🔍 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi
echo "✅ Linting passed"
echo ""

# Run tests
echo "🧪 Running Jest tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi
echo "✅ All tests passed"
echo ""

# Run build
echo "🏗️  Building production bundle..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Check output files
echo "📦 Build artifacts:"
ls -lh dist/
echo ""

echo "🎉 All checks passed!"
echo ""
echo "📊 Summary:"
echo "  - Linting: ✅ PASS"
echo "  - Tests: ✅ PASS"
echo "  - Build: ✅ PASS"
echo ""
echo "Next steps:"
echo "  1. npm run dev    - Start development server"
echo "  2. Open examples/index.html to see visualizations"
echo "  3. Integrate dist/d3po.min.js with R package"
echo ""
