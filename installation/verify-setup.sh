#!/bin/bash

# StackIt - Quick Setup Verification Script
# This script verifies that all dependencies are correctly installed in the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "🔍 StackIt Project Verification"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in StackIt project directory (package.json not found)"
    exit 1
fi

PROJECT_NAME=$(grep '"name"' package.json | cut -d'"' -f4)
print_success "Found project: $PROJECT_NAME"

# Check project structure
print_status "Checking project structure..."
errors=0

if [ -d "src" ]; then
    print_success "Frontend source directory (src/) found"
else
    print_error "Frontend source directory (src/) missing"
    errors=$((errors + 1))
fi

if [ -d "backend" ]; then
    print_success "Backend directory found"
else
    print_error "Backend directory missing"
    errors=$((errors + 1))
fi

if [ -d "node_modules" ]; then
    print_success "Dependencies directory (node_modules/) found"
    PACKAGE_COUNT=$(ls node_modules | wc -l)
    print_status "Total packages installed: $PACKAGE_COUNT"
else
    print_error "Dependencies directory (node_modules/) missing"
    print_warning "Run: npm install"
    errors=$((errors + 1))
fi

# Check key files
print_status "Checking configuration files..."

config_files=("package.json" "tsconfig.json" "vite.config.ts" "tailwind.config.js" "backend/tsconfig.json")
for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file found"
    else
        print_error "$file missing"
        errors=$((errors + 1))
    fi
done

# Check Node.js and npm
print_status "Checking Node.js environment..."

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
    
    # Check if version is 18+
    MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js version is compatible (18+ required)"
    else
        print_warning "Node.js version might be too old (18+ recommended)"
    fi
else
    print_error "Node.js not found"
    errors=$((errors + 1))
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm not found"
    errors=$((errors + 1))
fi

# Check key dependencies
print_status "Checking key dependencies..."

key_deps=("react" "@types/express" "typescript" "vite" "tailwindcss")
for dep in "${key_deps[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        VERSION=$(grep '"version"' "node_modules/$dep/package.json" 2>/dev/null | cut -d'"' -f4)
        print_success "$dep ($VERSION)"
    else
        print_error "$dep missing"
        errors=$((errors + 1))
    fi
done

# Check database
print_status "Checking database..."

if [ -f "backend/database.sqlite" ]; then
    print_success "Database file found"
    
    # Check if database has data
    if command -v sqlite3 >/dev/null 2>&1; then
        QUESTION_COUNT=$(sqlite3 backend/database.sqlite "SELECT COUNT(*) FROM questions;" 2>/dev/null || echo "0")
        USER_COUNT=$(sqlite3 backend/database.sqlite "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        print_status "Database contains: $QUESTION_COUNT questions, $USER_COUNT users"
    fi
else
    print_warning "Database file not found"
    print_status "Run: npm run seed:large"
fi

# Check build capability
print_status "Checking build capability..."

if npm run build:server >/dev/null 2>&1; then
    print_success "Backend builds successfully"
else
    print_warning "Backend build failed - check TypeScript configuration"
fi

# Summary
echo ""
echo "📊 Verification Summary"
echo "======================"

if [ $errors -eq 0 ]; then
    print_success "All checks passed! ✨"
    echo ""
    echo "🚀 Ready to start development:"
    echo "   npm run dev"
    echo ""
    echo "🌐 Development URLs:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:3001"
else
    print_error "Found $errors issues"
    echo ""
    echo "🔧 To fix issues:"
    echo "   ./install-dependencies.sh  # Run full setup"
    echo "   npm install               # Install dependencies only"
    echo "   npm run setup:clean       # Clean install"
fi

exit $errors
