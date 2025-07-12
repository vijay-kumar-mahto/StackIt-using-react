#!/bin/bash

# StackIt - System Dependencies Installation Script
# This script checks for and installs all required system dependencies

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get OS information
get_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        elif command_exists pacman; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to install Node.js
install_nodejs() {
    local os=$(get_os)
    print_status "Installing Node.js..."
    
    case $os in
        "ubuntu")
            # Install Node.js 20.x LTS
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "centos")
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs npm
            ;;
        "arch")
            sudo pacman -S --noconfirm nodejs npm
            ;;
        "macos")
            if command_exists brew; then
                brew install node
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
            ;;
        *)
            print_error "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
            exit 1
            ;;
    esac
}

# Function to install build tools
install_build_tools() {
    local os=$(get_os)
    print_status "Installing build tools..."
    
    case $os in
        "ubuntu")
            sudo apt-get update
            sudo apt-get install -y build-essential python3 python3-pip git curl sqlite3
            ;;
        "centos")
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y python3 python3-pip git curl sqlite
            ;;
        "arch")
            sudo pacman -S --noconfirm base-devel python python-pip git curl sqlite
            ;;
        "macos")
            if command_exists brew; then
                brew install python git sqlite
                # Xcode command line tools
                xcode-select --install 2>/dev/null || true
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
            ;;
        *)
            print_warning "Unknown OS. Please install build tools manually."
            ;;
    esac
}

# Function to check Node.js version
check_nodejs_version() {
    if command_exists node; then
        local version=$(node --version | sed 's/v//')
        local major_version=$(echo $version | cut -d. -f1)
        
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js version $version is compatible"
            return 0
        else
            print_warning "Node.js version $version is too old. Minimum required: 18.x"
            return 1
        fi
    else
        return 1
    fi
}

# Function to install npm packages
install_npm_packages() {
    print_status "Installing npm dependencies in project directory..."
    
    if [ -f "package.json" ]; then
        # Ensure we're in the project directory
        PROJECT_DIR=$(pwd)
        print_status "Installing dependencies in: $PROJECT_DIR"
        
        # Clean install to avoid conflicts
        if [ -d "node_modules" ]; then
            print_status "Cleaning existing node_modules..."
            rm -rf node_modules package-lock.json
        fi
        
        # Install dependencies locally (not globally)
        npm install --no-fund --no-audit
        
        # Verify installation
        if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
            print_success "npm dependencies installed successfully in project directory"
            
            # Check if backend dependencies are installed
            if [ -d "node_modules/@types/express" ]; then
                print_success "Backend dependencies verified"
            fi
            
            # Check if frontend dependencies are installed  
            if [ -d "node_modules/react" ]; then
                print_success "Frontend dependencies verified"
            fi
        else
            print_error "npm installation failed"
            return 1
        fi
    else
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Ensure we're in project directory
    if [ ! -f "package.json" ]; then
        print_error "Not in project directory. Cannot setup database."
        return 1
    fi
    
    # Build backend first if needed
    if [ -f "backend/tsconfig.json" ]; then
        print_status "Compiling TypeScript backend..."
        npx tsc -p backend/tsconfig.json 2>/dev/null || print_warning "TypeScript compilation had warnings"
    fi
    
    # Initialize database
    if [ -f "backend/scripts/seedDataLarge.ts" ]; then
        print_status "Initializing database with sample data..."
        npm run seed:large
        print_success "Database initialized with sample data"
    elif [ -f "backend/scripts/seedData.ts" ]; then
        print_status "Initializing database with basic data..."
        npm run seed
        print_success "Database initialized"
    else
        print_warning "Database initialization script not found"
        return 1
    fi
}

# Function to verify project setup
verify_project_setup() {
    print_status "Verifying project setup..."
    
    local errors=0
    
    # Check project structure
    if [ ! -d "src" ]; then
        print_error "Frontend source directory (src/) not found"
        errors=$((errors + 1))
    fi
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        errors=$((errors + 1))
    fi
    
    if [ ! -f "vite.config.ts" ]; then
        print_error "Vite config not found"
        errors=$((errors + 1))
    fi
    
    # Check node_modules in correct location
    if [ ! -d "node_modules" ]; then
        print_error "node_modules not found in project directory"
        errors=$((errors + 1))
    else
        print_success "node_modules found in project directory"
    fi
    
    # Check package.json scripts
    if grep -q "\"dev\":" package.json; then
        print_success "Development scripts found"
    else
        print_error "Development scripts missing from package.json"
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Project structure verified successfully"
        return 0
    else
        print_error "Found $errors project structure issues"
        return 1
    fi
}

# Main installation process
main() {
    print_status "Starting StackIt dependency installation..."
    print_status "Working directory: $(pwd)"
    print_status "OS detected: $(get_os)"
    
    # Verify we're in the correct project directory
    if [ ! -f "package.json" ] || [ ! -d "src" ] || [ ! -d "backend" ]; then
        print_error "This doesn't appear to be the StackIt project root directory"
        print_error "Please ensure you're in the directory containing package.json, src/, and backend/"
        exit 1
    fi
    
    # Show project info
    if command_exists jq && [ -f "package.json" ]; then
        local project_name=$(jq -r '.name' package.json 2>/dev/null || echo "unknown")
        print_status "Project: $project_name"
    fi
    
    # Check if running as root (not recommended)
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root is not recommended. Consider running as a regular user."
        print_warning "Dependencies will be installed in project directory, not globally."
    fi
    
    # Verify project structure first
    verify_project_setup || print_warning "Project structure verification failed, continuing anyway..."
    
    # Check and install Node.js
    if ! check_nodejs_version; then
        print_status "Node.js not found or version too old. Installing Node.js..."
        install_nodejs
        
        # Verify installation
        if ! check_nodejs_version; then
            print_error "Node.js installation failed"
            exit 1
        fi
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm not found. Please install npm manually."
        exit 1
    else
        local npm_version=$(npm --version)
        print_success "npm version $npm_version found"
        
        # Configure npm to avoid global installations in this session
        npm config set prefix "$(pwd)/node_modules"
        print_status "npm configured for local installation"
    fi
    
    # Install build tools
    install_build_tools
    
    # Install npm packages (locally in project)
    install_npm_packages
    
    # Setup database
    setup_database
    
    # Final verification
    print_status "Performing final verification..."
    
    if verify_project_setup && command_exists node && command_exists npm; then
        print_success "All dependencies installed successfully!"
        echo ""
        print_status "Installation Summary:"
        echo -e "  ✓ Node.js version: $(node --version)"
        echo -e "  ✓ npm version: $(npm --version)"
        echo -e "  ✓ Project dependencies: $(ls node_modules | wc -l) packages"
        echo -e "  ✓ Database: Initialized"
        echo ""
        print_status "You can now run the following commands:"
        echo -e "  ${GREEN}npm run dev${NC}     - Start development server"
        echo -e "  ${GREEN}npm run build${NC}   - Build for production"
        echo -e "  ${GREEN}npm run seed${NC}    - Seed database with sample data"
        echo ""
        print_status "Development URLs:"
        echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
        echo -e "  Backend:  ${BLUE}http://localhost:3001${NC}"
        echo ""
        print_status "To start development, run: ${GREEN}npm run dev${NC}"
    else
        print_error "Installation completed but some dependencies are still missing"
        print_status "Please check the error messages above and try manual installation"
        exit 1
    fi
}

# Check if script is being run from project root
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the StackIt project root directory"
    print_status "Please navigate to the directory containing package.json and run again"
    exit 1
fi

# Run main function
main "$@"
