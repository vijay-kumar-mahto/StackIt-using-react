#!/bin/bash

# StackIt - Database Clearing Script
# This script removes all data from the database while preserving table structure

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

# Function to confirm user choice
confirm_choice() {
    local prompt="$1"
    local default="$2"
    local choice

    while true; do
        if [ -n "$default" ]; then
            read -p "[PROMPT] $prompt [y/n] (default: $default): " choice
            choice=${choice:-$default}
        else
            read -p "[PROMPT] $prompt [y/n]: " choice
        fi

        case "$choice" in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) print_warning "Please answer y/n (yes/no)";;
        esac
    done
}

# Function to check project directory
check_project_directory() {
    # Check if we're in script directory - if so, go up one level
    if [[ "$(basename "$PWD")" == "script" && -f "../package.json" ]]; then
        print_status "Detected script directory, moving to project root..."
        cd ".." || exit 1
    fi
    
    if [[ ! -f "package.json" || ! -d "backend" ]]; then
        print_error "This script must be run from the StackIt project root directory or script/ subdirectory"
        print_error "Please navigate to the directory containing package.json and backend/ folder"
        exit 1
    fi
    
    # Check if this is a StackIt project
    if ! grep -q '"name": "stackit"' package.json 2>/dev/null; then
        print_warning "This doesn't appear to be the StackIt project"
    fi
}

# Function to check if database exists
check_database() {
    if [[ ! -f "backend/database.sqlite" ]]; then
        print_error "Database file not found at backend/database.sqlite"
        print_error "Please ensure the database has been initialized first"
        exit 1
    fi
}

# Function to clear database data
clear_database() {
    print_status "Preparing to clear database..."
    
    # Create temporary SQL script
    local sql_script=$(mktemp)
    
    cat > "$sql_script" << 'EOF'
-- StackIt Database Clear Script
-- This removes all data while preserving table structure

-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Clear all tables in dependency order (child tables first)
DELETE FROM votes;
DELETE FROM notifications;
DELETE FROM question_tags;
DELETE FROM comments;
DELETE FROM answers;
DELETE FROM questions;
DELETE FROM tags;
DELETE FROM users;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Reset auto-increment counters
DELETE FROM sqlite_sequence WHERE name IN (
    'users', 'questions', 'answers', 'tags', 
    'votes', 'notifications', 'comments'
);

-- Vacuum the database to reclaim space
VACUUM;
EOF

    # Execute the SQL script
    if command_exists sqlite3; then
        print_status "Clearing database data..."
        if sqlite3 "backend/database.sqlite" < "$sql_script"; then
            print_success "Database cleared successfully!"
            
            # Show what was cleared
            echo ""
            print_status "Cleared data from the following tables:"
            echo -e "  ${GREEN}•${NC} users"
            echo -e "  ${GREEN}•${NC} questions"
            echo -e "  ${GREEN}•${NC} answers"
            echo -e "  ${GREEN}•${NC} tags"
            echo -e "  ${GREEN}•${NC} question_tags (relationships)"
            echo -e "  ${GREEN}•${NC} votes"
            echo -e "  ${GREEN}•${NC} notifications"
            echo -e "  ${GREEN}•${NC} comments"
            echo ""
            echo -e "  ${BLUE}ℹ${NC}  Table structures have been preserved"
            echo -e "  ${BLUE}ℹ${NC}  Auto-increment counters have been reset"
            echo -e "  ${BLUE}ℹ${NC}  Database has been vacuumed to reclaim space"
        else
            print_error "Failed to clear database"
            rm -f "$sql_script"
            exit 1
        fi
    else
        print_error "sqlite3 command not found"
        print_error "Please install SQLite3 to use this script"
        rm -f "$sql_script"
        exit 1
    fi
    
    # Clean up temporary file
    rm -f "$sql_script"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}StackIt Database Clearing Script${NC}"
    echo ""
    echo -e "${NC}Usage: ./clear-database.sh [OPTIONS]${NC}"
    echo ""
    echo -e "${NC}Options:${NC}"
    echo -e "  -f, --force         Clear database without confirmation prompts"
    echo -e "  -h, --help          Show this help message"
    echo ""
    echo -e "${NC}Examples:${NC}"
    echo -e "  ./clear-database.sh                    # Interactive mode with confirmations"
    echo -e "  ./clear-database.sh --force            # Clear database directly"
    echo ""
    echo -e "${NC}From project root:${NC}"
    echo -e "  ./script/clear-database.sh"
    echo ""
    echo -e "${YELLOW}Warning:${NC} This operation cannot be undone!"
    echo -e "${NC}This script removes ALL data from the database but preserves table structure.${NC}"
    echo -e "${NC}Use the seeding scripts to repopulate with sample data after clearing.${NC}"
    echo ""
}

# Main function
main() {
    local force_mode=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                force_mode=true
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
    
    print_status "StackIt Database Clearing Tool"
    echo ""
    
    # Verify we're in the correct directory
    check_project_directory
    
    # Check if database exists
    check_database
    
    # Show current database status
    if command_exists sqlite3; then
        local user_count=$(sqlite3 "backend/database.sqlite" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        local question_count=$(sqlite3 "backend/database.sqlite" "SELECT COUNT(*) FROM questions;" 2>/dev/null || echo "0")
        local answer_count=$(sqlite3 "backend/database.sqlite" "SELECT COUNT(*) FROM answers;" 2>/dev/null || echo "0")
        
        print_status "Current database contents:"
        echo -e "  ${NC}• Users: ${YELLOW}$user_count${NC}"
        echo -e "  ${NC}• Questions: ${YELLOW}$question_count${NC}"
        echo -e "  ${NC}• Answers: ${YELLOW}$answer_count${NC}"
        echo ""
    fi
    
    # Confirmation prompts (skip if force mode)
    if [[ "$force_mode" != true ]]; then
        print_warning "⚠️  This will permanently delete ALL data from the database!"
        print_warning "   Table structures will be preserved, but all content will be lost."
        echo ""
        
        if ! confirm_choice "Are you sure you want to clear the database?" "n"; then
            print_status "Operation cancelled by user"
            exit 0
        fi
        
        echo ""
        print_warning "⚠️  Last chance! This action cannot be undone!"
        if ! confirm_choice "Confirm: Clear all database data?" "n"; then
            print_status "Operation cancelled by user"
            exit 0
        fi
        echo ""
    else
        print_warning "Force mode enabled - clearing database without confirmation"
        echo ""
    fi
    
    # Clear the database
    clear_database
    
    echo ""
    print_success "Database clearing completed successfully!"
    echo ""
    print_status "Next steps:"
    echo -e "  ${NC}• Use seeding scripts to add sample data: ${BLUE}./script/seed-database.sh${NC}"
    echo -e "  ${NC}• Or start with a fresh database and create your own content${NC}"
    echo -e "  ${NC}• Start the development server: ${BLUE}npm run dev${NC}"
}

# Check if sqlite3 is available
if ! command_exists sqlite3; then
    print_error "SQLite3 is not installed or not available in PATH"
    print_error "Please install SQLite3 first"
    echo ""
    print_status "Installation commands:"
    echo -e "  ${NC}Ubuntu/Debian: ${BLUE}sudo apt-get install sqlite3${NC}"
    echo -e "  ${NC}CentOS/RHEL: ${BLUE}sudo yum install sqlite${NC}"
    echo -e "  ${NC}macOS: ${BLUE}brew install sqlite${NC}"
    exit 1
fi

# Run main function
main "$@"
