#!/bin/bash

# StackIt - Database Seeding Script
# This script allows users to seed the database with either basic or large sample data

# Color definitions for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
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

# Function to prompt user for menu choice
prompt_menu_choice() {
    local choice
    
    while true; do
        echo -n -e "${BLUE}[PROMPT]${NC} Please select an option (1/2/n): "
        read -r choice
        
        case "$choice" in
            1|"basic")
                return 1  # Basic
                ;;
            2|"large")
                return 2  # Large
                ;;
            [Nn]|[Nn][Oo]|"exit"|"quit")
                return 0  # No/Exit
                ;;
            *)
                print_warning "Invalid choice. Please enter 1 (basic), 2 (large), or n (no/exit)"
                ;;
        esac
    done
}

# Function to prompt user for yes/no confirmation
prompt_confirmation() {
    local prompt="$1"
    local default="$2"
    local response
    
    while true; do
        if [ -n "$default" ]; then
            echo -n -e "${BLUE}[PROMPT]${NC} $prompt [y/n] (default: $default): "
        else
            echo -n -e "${BLUE}[PROMPT]${NC} $prompt [y/n]: "
        fi
        
        read -r response
        
        # Use default if no response
        if [ -z "$response" ] && [ -n "$default" ]; then
            response="$default"
        fi
        
        case "$response" in
            [Yy]|[Yy][Ee][Ss])
                return 0
                ;;
            [Nn]|[Nn][Oo])
                return 1
                ;;
            *)
                print_warning "Please answer y/n (yes/no)"
                ;;
        esac
    done
}

# Function to check if we're in the correct project directory
verify_project_directory() {
    # Check if we're in script directory - if so, go up one level
    if [ "$(basename "$PWD")" = "script" ] && [ -f "../package.json" ]; then
        print_status "Detected script directory, moving to project root..."
        cd .. || {
            print_error "Failed to navigate to project root"
            exit 1
        }
    fi
    
    if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
        print_error "This script must be run from the StackIt project root directory or script/ subdirectory"
        print_error "Please navigate to the directory containing package.json and backend/ folder"
        exit 1
    fi
    
    # Check if this is a StackIt project by looking for specific markers
    if ! grep -q '"name": "stackit"' package.json 2>/dev/null; then
        print_warning "This doesn't appear to be the StackIt project"
    fi
}

# Function to check available seeding scripts
check_seeding_scripts() {
    local has_basic=false
    local has_large=false
    
    if [ -f "script/seedData.ts" ]; then
        has_basic=true
    fi
    
    if [ -f "script/seedDataLarge.ts" ]; then
        has_large=true
    fi
    
    if [ "$has_basic" = false ] && [ "$has_large" = false ]; then
        print_error "No seeding scripts found in script/"
        print_error "Expected: seedData.ts (basic) or seedDataLarge.ts (large)"
        exit 1
    fi
    
    echo "$has_basic:$has_large"
}

# Function to seed database
seed_database() {
    local seed_type="$1"
    
    print_status "Preparing to seed database..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing project dependencies..."
        npm install || {
            print_error "Failed to install project dependencies"
            exit 1
        }
    fi
    
    case "$seed_type" in
        "basic")
            print_status "Seeding database with basic sample data..."
            print_warning "This will replace existing data if any."
            
            if npm run seed; then
                print_success "Database seeded with basic sample data successfully!"
                echo ""
                print_status "Basic dataset includes:"
                echo "  • ~12 sample users"
                echo "  • ~6 sample questions"
                echo "  • ~5 sample answers"
                echo "  • Perfect for development and testing"
            else
                print_error "Failed to seed database with basic data"
                exit 1
            fi
            ;;
        "large")
            print_status "Seeding database with large sample data..."
            print_warning "This will replace existing data if any."
            print_warning "This may take a few moments..."
            
            if npm run seed:large; then
                print_success "Database seeded with large sample data successfully!"
                echo ""
                print_status "Large dataset includes:"
                echo "  • ~50 sample users"
                echo "  • ~500+ sample questions"
                echo "  • ~1000+ sample answers"
                echo "  • Great for testing with realistic data volumes"
            else
                print_error "Failed to seed database with large data"
                exit 1
            fi
            ;;
        *)
            print_error "Invalid seed type: $seed_type"
            exit 1
            ;;
    esac
}

# Function to show available test accounts
show_test_accounts() {
    echo ""
    print_status "Test Accounts Available (password: password123):"
    echo -e "  ${GREEN}Admin User:${NC}"
    echo "    • Username: alice_dev"
    echo "    • Role: Admin (can manage users, questions, answers)"
    echo ""
    echo -e "  ${GREEN}Regular Users:${NC}"
    echo "    • Username: bob_coder"
    echo "    • Username: charlie_js"
    echo "    • Role: User (can ask/answer questions, vote)"
    echo ""
    print_status "Login at: ${BLUE}http://localhost:5173${NC}"
}

# Display usage information
show_usage() {
    echo "StackIt Database Seeding Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --basic             Seed with basic dataset (no prompts)"
    echo "  --large             Seed with large dataset (no prompts)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Interactive menu - choose 1, 2, or n"
    echo "  $0 --basic          # Seed with basic dataset directly"
    echo "  $0 --large          # Seed with large dataset directly"
    echo ""
    echo "Interactive Menu:"
    echo "  1 - Basic dataset (recommended for development)"
    echo "  2 - Large dataset (for comprehensive testing)"
    echo "  n - No/Exit (cancel seeding)"
    echo ""
    echo "From project root:"
    echo "  ./script/seed-database.sh --basic"
    echo ""
    echo "Dataset Information:"
    echo "  Basic:  ~12 users, ~6 questions, ~5 answers (recommended for development)"
    echo "  Large:  ~50 users, ~500+ questions, ~1000+ answers (for testing)"
    echo ""
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --basic)
                SEED_TYPE="basic"
                AUTO_MODE=true
                shift
                ;;
            --large)
                SEED_TYPE="large"
                AUTO_MODE=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Main function
main() {
    print_status "StackIt Database Seeding Tool"
    echo ""
    
    # Verify we're in the correct directory
    verify_project_directory
    
    # Check available seeding scripts
    local script_info
    script_info=$(check_seeding_scripts)
    local has_basic=$(echo "$script_info" | cut -d: -f1)
    local has_large=$(echo "$script_info" | cut -d: -f2)
    
    # If running in auto mode (command line arg provided)
    if [ "$AUTO_MODE" = true ]; then
        case "$SEED_TYPE" in
            "basic")
                if [ "$has_basic" = true ]; then
                    seed_database "basic"
                    show_test_accounts
                    exit 0
                else
                    print_error "Basic seeding script not found"
                    exit 1
                fi
                ;;
            "large")
                if [ "$has_large" = true ]; then
                    seed_database "large"
                    show_test_accounts
                    exit 0
                else
                    print_error "Large seeding script not found"
                    exit 1
                fi
                ;;
        esac
    fi
    
    # Interactive mode
    print_status "Available seeding options:"
    echo ""
    
    local menu_shown=false
    
    if [ "$has_basic" = true ]; then
        echo -e "  ${GREEN}1. Basic Dataset${NC}"
        echo "     • ~12 users, ~6 questions, ~5 answers"
        echo "     • Quick setup, perfect for development"
        echo "     • Recommended for most users"
        echo ""
        menu_shown=true
    fi
    
    if [ "$has_large" = true ]; then
        echo -e "  ${GREEN}2. Large Dataset${NC}"
        echo "     • ~50 users, ~500+ questions, ~1000+ answers"
        echo "     • Comprehensive data for testing"
        echo "     • Takes longer to seed but provides realistic data volumes"
        echo ""
        menu_shown=true
    fi
    
    if [ "$menu_shown" = true ]; then
        echo -e "  ${YELLOW}n. No - Exit without seeding${NC}"
        echo ""
    fi
    
    # Get user choice
    local choice=""
    
    if [ "$has_basic" = true ] && [ "$has_large" = true ]; then
        # Both options available
        prompt_menu_choice
        local menu_result=$?
        case $menu_result in
            1)
                choice="basic"
                ;;
            2)
                choice="large"
                ;;
            0)
                print_status "Seeding cancelled by user"
                exit 0
                ;;
        esac
    elif [ "$has_large" = true ]; then
        # Only large available
        echo -e "  ${GREEN}1. Large Dataset${NC} (only option available)"
        echo -e "  ${YELLOW}n. No - Exit without seeding${NC}"
        echo ""
        
        local single_choice
        while true; do
            echo -n -e "${BLUE}[PROMPT]${NC} Please select an option (1/n): "
            read -r single_choice
            
            case "$single_choice" in
                1|"large")
                    choice="large"
                    break
                    ;;
                [Nn]|[Nn][Oo]|"exit"|"quit")
                    print_status "Seeding cancelled by user"
                    exit 0
                    ;;
                *)
                    print_warning "Invalid choice. Please enter 1 (large) or n (no/exit)"
                    ;;
            esac
        done
    elif [ "$has_basic" = true ]; then
        # Only basic available
        echo -e "  ${GREEN}1. Basic Dataset${NC} (only option available)"
        echo -e "  ${YELLOW}n. No - Exit without seeding${NC}"
        echo ""
        
        local single_choice
        while true; do
            echo -n -e "${BLUE}[PROMPT]${NC} Please select an option (1/n): "
            read -r single_choice
            
            case "$single_choice" in
                1|"basic")
                    choice="basic"
                    break
                    ;;
                [Nn]|[Nn][Oo]|"exit"|"quit")
                    print_status "Seeding cancelled by user"
                    exit 0
                    ;;
                *)
                    print_warning "Invalid choice. Please enter 1 (basic) or n (no/exit)"
                    ;;
            esac
        done
    fi
    
    # Confirm seeding action
    echo ""
    print_warning "⚠️  This will replace all existing data in the database!"
    if ! prompt_confirmation "Are you sure you want to continue?" "n"; then
        print_status "Seeding cancelled by user"
        exit 0
    fi
    
    # Perform seeding
    echo ""
    seed_database "$choice"
    show_test_accounts
    
    echo ""
    print_success "Database seeding completed successfully!"
    print_status "You can now start the development server with: ${GREEN}npm run dev${NC}"
}

# Initialize variables
SEED_TYPE=""
AUTO_MODE=false

# Parse command line arguments
parse_args "$@"

# Run main function
main
