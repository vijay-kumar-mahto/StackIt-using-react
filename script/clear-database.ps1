# StackIt - Database Clearing Script for Windows
# This script removes all data from the database while preserving table structure

param(
    [switch]$Force,
    [switch]$Help
)

# Colors for output
$Colors = @{
    Red    = "Red"
    Green  = "Green" 
    Yellow = "Yellow"
    Blue   = "Blue"
    White  = "White"
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Get-UserChoice {
    param(
        [string]$Prompt,
        [string]$Default = ""
    )
    
    do {
        if ($Default) {
            $userInput = Read-Host "$Prompt [y/n] (default: $Default)"
            if ([string]::IsNullOrEmpty($userInput)) {
                $userInput = $Default
            }
        } else {
            $userInput = Read-Host "$Prompt [y/n]"
        }
        
        switch ($userInput.ToLower()) {
            'y' { return $true }
            'yes' { return $true }
            'n' { return $false }
            'no' { return $false }
            default { 
                Write-Warning "Please answer y/n (yes/no)"
                continue
            }
        }
    } while ($true)
}

function Test-ProjectDirectory {
    # Check if we're in script directory - if so, go up one level
    if ((Split-Path -Leaf $PWD) -eq "script" -and (Test-Path "../package.json")) {
        Write-Status "Detected script directory, moving to project root..."
        Set-Location ".."
    }
    
    if (-not (Test-Path "package.json") -or -not (Test-Path "backend" -PathType Container)) {
        Write-Error "This script must be run from the StackIt project root directory or script/ subdirectory"
        Write-Error "Please navigate to the directory containing package.json and backend/ folder"
        exit 1
    }
    
    # Check if this is a StackIt project by looking for specific markers
    if (-not (Select-String -Pattern '"name": "stackit"' -Path "package.json" -Quiet)) {
        Write-Warning "This doesn't appear to be the StackIt project"
    }
}

function Test-Database {
    if (-not (Test-Path "backend/database.sqlite")) {
        Write-Error "Database file not found at backend/database.sqlite"
        Write-Error "Please ensure the database has been initialized first"
        exit 1
    }
}

function Clear-Database {
    Write-Status "Preparing to clear database..."
    
    # Create temporary SQL script
    $sqlScript = @'
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
'@

    # Write SQL to temporary file
    $tempFile = [System.IO.Path]::GetTempFileName()
    $sqlScript | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        # Execute the SQL script
        Write-Status "Clearing database data..."
        
        # Use sqlite3 command if available
        if (Test-Command "sqlite3") {
            $result = & sqlite3 "backend/database.sqlite" ".read `"$tempFile`""
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database cleared successfully!"
                
                # Show what was cleared
                Write-Host ""
                Write-Status "Cleared data from the following tables:"
                Write-Host "  • users" -ForegroundColor $Colors.Green
                Write-Host "  • questions" -ForegroundColor $Colors.Green
                Write-Host "  • answers" -ForegroundColor $Colors.Green
                Write-Host "  • tags" -ForegroundColor $Colors.Green
                Write-Host "  • question_tags (relationships)" -ForegroundColor $Colors.Green
                Write-Host "  • votes" -ForegroundColor $Colors.Green
                Write-Host "  • notifications" -ForegroundColor $Colors.Green
                Write-Host "  • comments" -ForegroundColor $Colors.Green
                Write-Host ""
                Write-Host "  ℹ  Table structures have been preserved" -ForegroundColor $Colors.Blue
                Write-Host "  ℹ  Auto-increment counters have been reset" -ForegroundColor $Colors.Blue
                Write-Host "  ℹ  Database has been vacuumed to reclaim space" -ForegroundColor $Colors.Blue
            } else {
                throw "Failed to clear database"
            }
        } else {
            throw "sqlite3 command not found"
        }
    }
    catch {
        Write-Error $_.Exception.Message
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
        exit 1
    }
    finally {
        # Clean up temporary file
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

function Get-DatabaseStatus {
    if (Test-Command "sqlite3") {
        try {
            $userCount = & sqlite3 "backend/database.sqlite" "SELECT COUNT(*) FROM users;" 2>$null
            $questionCount = & sqlite3 "backend/database.sqlite" "SELECT COUNT(*) FROM questions;" 2>$null
            $answerCount = & sqlite3 "backend/database.sqlite" "SELECT COUNT(*) FROM answers;" 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Status "Current database contents:"
                Write-Host "  • Users: $userCount" -ForegroundColor $Colors.Yellow
                Write-Host "  • Questions: $questionCount" -ForegroundColor $Colors.Yellow
                Write-Host "  • Answers: $answerCount" -ForegroundColor $Colors.Yellow
                Write-Host ""
            }
        }
        catch {
            # Silently continue if we can't get status
        }
    }
}

function Show-Usage {
    Write-Host "StackIt Database Clearing Script" -ForegroundColor $Colors.Blue
    Write-Host ""
    Write-Host "Usage: .\clear-database.ps1 [OPTIONS]" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $Colors.White
    Write-Host "  -Force              Clear database without confirmation prompts" -ForegroundColor $Colors.White
    Write-Host "  -Help               Show this help message" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Colors.White
    Write-Host "  .\clear-database.ps1                  # Interactive mode with confirmations" -ForegroundColor $Colors.White
    Write-Host "  .\clear-database.ps1 -Force           # Clear database directly" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "From project root:" -ForegroundColor $Colors.White
    Write-Host "  .\script\clear-database.ps1"
    Write-Host ""
    Write-Host "Warning: This operation cannot be undone!" -ForegroundColor $Colors.Yellow
    Write-Host "This script removes ALL data from the database but preserves table structure." -ForegroundColor $Colors.White
    Write-Host "Use the seeding scripts to repopulate with sample data after clearing." -ForegroundColor $Colors.White
    Write-Host ""
}

# Main execution
function Main {
    # Show help if requested
    if ($Help) {
        Show-Usage
        exit 0
    }
    
    Write-Status "StackIt Database Clearing Tool"
    Write-Host ""
    
    # Verify we're in the correct directory
    Test-ProjectDirectory
    
    # Check if database exists
    Test-Database
    
    # Show current database status
    Get-DatabaseStatus
    
    # Confirmation prompts (skip if force mode)
    if (-not $Force) {
        Write-Warning "⚠️  This will permanently delete ALL data from the database!"
        Write-Warning "   Table structures will be preserved, but all content will be lost."
        Write-Host ""
        
        if (-not (Get-UserChoice "Are you sure you want to clear the database?" "n")) {
            Write-Status "Operation cancelled by user"
            exit 0
        }
        
        Write-Host ""
        Write-Warning "⚠️  Last chance! This action cannot be undone!"
        if (-not (Get-UserChoice "Confirm: Clear all database data?" "n")) {
            Write-Status "Operation cancelled by user"
            exit 0
        }
        Write-Host ""
    } else {
        Write-Warning "Force mode enabled - clearing database without confirmation"
        Write-Host ""
    }
    
    # Clear the database
    Clear-Database
    
    Write-Host ""
    Write-Success "Database clearing completed successfully!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "  • Use seeding scripts to add sample data: .\script\seed-database.ps1" -ForegroundColor $Colors.Blue
    Write-Host "  • Or start with a fresh database and create your own content" -ForegroundColor $Colors.White
    Write-Host "  • Start the development server: npm run dev" -ForegroundColor $Colors.Blue
}

# Check if sqlite3 is available
if (-not (Test-Command "sqlite3")) {
    Write-Error "SQLite3 is not installed or not available in PATH"
    Write-Error "Please install SQLite3 first"
    Write-Host ""
    Write-Status "Installation options:"
    Write-Host "  • Download from: https://www.sqlite.org/download.html" -ForegroundColor $Colors.Blue
    Write-Host "  • Or use package manager like Chocolatey: choco install sqlite" -ForegroundColor $Colors.Blue
    Write-Host "  • Ensure sqlite3.exe is in your PATH" -ForegroundColor $Colors.White
    exit 1
}

# Run main function
Main
