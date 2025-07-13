# StackIt - Database Seeding Script for Windows
# This script allows users to seed the database with either basic or large sample data

param(
    [switch]$Basic,
    [switch]$Large,
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

function Get-MenuChoice {
    $choice = $null
    
    do {
        $userInput = Read-Host "[PROMPT] Please select an option (1/2/n)"
        
        switch ($userInput.ToLower()) {
            '1' { return 'basic' }
            'basic' { return 'basic' }
            '2' { return 'large' }
            'large' { return 'large' }
            'n' { return 'exit' }
            'no' { return 'exit' }
            'exit' { return 'exit' }
            'quit' { return 'exit' }
            default { 
                Write-Warning "Invalid choice. Please enter 1 (basic), 2 (large), or n (no/exit)"
                continue
            }
        }
    } while ($true)
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

function Test-SeedingScripts {
    $hasBasic = Test-Path "backend/scripts/seedData.ts"
    $hasLarge = Test-Path "backend/scripts/seedDataLarge.ts"
    
    if (-not $hasBasic -and -not $hasLarge) {
        Write-Error "No seeding scripts found in backend/scripts/"
        Write-Error "Expected: seedData.ts (basic) or seedDataLarge.ts (large)"
        exit 1
    }
    
    return @{
        Basic = $hasBasic
        Large = $hasLarge
    }
}

function Invoke-DatabaseSeeding {
    param(
        [string]$SeedType
    )
    
    Write-Status "Preparing to seed database..."
    try {
        # Check if node_modules exists
        if (-not (Test-Path "node_modules" -PathType Container)) {
            Write-Status "Installing project dependencies..."
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to install project dependencies"
            }
        }
        
        switch ($SeedType) {
            "basic" {
                Write-Status "Seeding database with basic sample data..."
                Write-Warning "This will replace existing data if any."
                
                npm run seed
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Database seeded with basic sample data successfully!"
                    Write-Host ""
                    Write-Status "Basic dataset includes:"
                    Write-Host "  • ~12 sample users" -ForegroundColor $Colors.White
                    Write-Host "  • ~6 sample questions" -ForegroundColor $Colors.White
                    Write-Host "  • ~5 sample answers" -ForegroundColor $Colors.White
                    Write-Host "  • Perfect for development and testing" -ForegroundColor $Colors.White
                } else {
                    throw "Failed to seed database with basic data"
                }
            }
            "large" {
                Write-Status "Seeding database with large sample data..."
                Write-Warning "This will replace existing data if any."
                Write-Warning "This may take a few moments..."
                
                npm run seed:large
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Database seeded with large sample data successfully!"
                    Write-Host ""
                    Write-Status "Large dataset includes:"
                    Write-Host "  • ~50 sample users" -ForegroundColor $Colors.White
                    Write-Host "  • ~500+ sample questions" -ForegroundColor $Colors.White
                    Write-Host "  • ~1000+ sample answers" -ForegroundColor $Colors.White
                    Write-Host "  • Great for testing with realistic data volumes" -ForegroundColor $Colors.White
                } else {
                    throw "Failed to seed database with large data"
                }
            }
            default {
                throw "Invalid seed type: $SeedType"
            }
        }
    }
    catch {
        Write-Error $_.Exception.Message
        exit 1
    }
}

function Show-TestAccounts {
    Write-Host ""
    Write-Status "Test Accounts Available (password: password123):"
    Write-Host "  Admin User:" -ForegroundColor $Colors.Green
    Write-Host "    • Username: alice_dev" -ForegroundColor $Colors.White
    Write-Host "    • Role: Admin (can manage users, questions, answers)" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "  Regular Users:" -ForegroundColor $Colors.Green
    Write-Host "    • Username: bob_coder" -ForegroundColor $Colors.White
    Write-Host "    • Username: charlie_js" -ForegroundColor $Colors.White
    Write-Host "    • Role: User (can ask/answer questions, vote)" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Status "Login at: http://localhost:5173"
}

function Show-Usage {
    Write-Host "StackIt Database Seeding Script" -ForegroundColor $Colors.Blue
    Write-Host ""
    Write-Host "Usage: .\seed-database.ps1 [OPTIONS]" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $Colors.White
    Write-Host "  -Basic              Seed with basic dataset (no prompts)" -ForegroundColor $Colors.White
    Write-Host "  -Large              Seed with large dataset (no prompts)" -ForegroundColor $Colors.White
    Write-Host "  -Help               Show this help message" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Colors.White
    Write-Host "  .\seed-database.ps1                  # Interactive menu - choose 1, 2, or n" -ForegroundColor $Colors.White
    Write-Host "  .\seed-database.ps1 -Basic           # Seed with basic dataset directly" -ForegroundColor $Colors.White
    Write-Host "  .\seed-database.ps1 -Large           # Seed with large dataset directly" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Interactive Menu:" -ForegroundColor $Colors.White
    Write-Host "  1 - Basic dataset (recommended for development)" -ForegroundColor $Colors.White
    Write-Host "  2 - Large dataset (for comprehensive testing)" -ForegroundColor $Colors.White
    Write-Host "  n - No/Exit (cancel seeding)" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "From project root:" -ForegroundColor $Colors.White
    Write-Host "  .\script\seed-database.ps1 -Basic" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Dataset Information:" -ForegroundColor $Colors.White
    Write-Host "  Basic:  ~12 users, ~6 questions, ~5 answers (recommended for development)" -ForegroundColor $Colors.White
    Write-Host "  Large:  ~50 users, ~500+ questions, ~1000+ answers (for testing)" -ForegroundColor $Colors.White
    Write-Host ""
}

# Main execution
function Main {
    # Show help if requested
    if ($Help) {
        Show-Usage
        exit 0
    }
    
    Write-Status "StackIt Database Seeding Tool"
    Write-Host ""
    
    # Verify we're in the correct directory
    Test-ProjectDirectory
    
    # Check available seeding scripts
    $scriptInfo = Test-SeedingScripts
    
    # Handle command line arguments
    if ($Basic -and $Large) {
        Write-Error "Cannot specify both -Basic and -Large options"
        Show-Usage
        exit 1
    }
    
    if ($Basic) {
        if ($scriptInfo.Basic) {
            Invoke-DatabaseSeeding "basic"
            Show-TestAccounts
            exit 0
        } else {
            Write-Error "Basic seeding script not found"
            exit 1
        }
    }
    
    if ($Large) {
        if ($scriptInfo.Large) {
            Invoke-DatabaseSeeding "large"
            Show-TestAccounts
            exit 0
        } else {
            Write-Error "Large seeding script not found"
            exit 1
        }
    }
    
    # Interactive mode
    Write-Status "Available seeding options:"
    Write-Host ""
    
    $menuShown = $false
    
    if ($scriptInfo.Basic) {
        Write-Host "  1. Basic Dataset" -ForegroundColor $Colors.Green
        Write-Host "     • ~12 users, ~6 questions, ~5 answers" -ForegroundColor $Colors.White
        Write-Host "     • Quick setup, perfect for development" -ForegroundColor $Colors.White
        Write-Host "     • Recommended for most users" -ForegroundColor $Colors.White
        Write-Host ""
        $menuShown = $true
    }
    
    if ($scriptInfo.Large) {
        Write-Host "  2. Large Dataset" -ForegroundColor $Colors.Green
        Write-Host "     • ~50 users, ~500+ questions, ~1000+ answers" -ForegroundColor $Colors.White
        Write-Host "     • Comprehensive data for testing" -ForegroundColor $Colors.White
        Write-Host "     • Takes longer to seed but provides realistic data volumes" -ForegroundColor $Colors.White
        Write-Host ""
        $menuShown = $true
    }
    
    if ($menuShown) {
        Write-Host "  n. No - Exit without seeding" -ForegroundColor $Colors.Yellow
        Write-Host ""
    }
    
    # Get user choice
    $choice = ""
    
    if ($scriptInfo.Basic -and $scriptInfo.Large) {
        # Both options available
        $menuChoice = Get-MenuChoice
        switch ($menuChoice) {
            'basic' { $choice = "basic" }
            'large' { $choice = "large" }
            'exit' { 
                Write-Status "Seeding cancelled by user"
                exit 0
            }
        }
    } elseif ($scriptInfo.Large) {
        # Only large available
        Write-Host "  1. Large Dataset" -ForegroundColor $Colors.Green -NoNewline
        Write-Host " (only option available)" -ForegroundColor $Colors.White
        Write-Host "  n. No - Exit without seeding" -ForegroundColor $Colors.Yellow
        Write-Host ""
        
        do {
            $singleChoice = Read-Host "[PROMPT] Please select an option (1/n)"
            
            switch ($singleChoice.ToLower()) {
                '1' { $choice = "large"; break }
                'large' { $choice = "large"; break }
                'n' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                'no' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                'exit' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                'quit' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                default { 
                    Write-Warning "Invalid choice. Please enter 1 (large) or n (no/exit)"
                    continue
                }
            }
        } while ($true)
    } elseif ($scriptInfo.Basic) {
        # Only basic available
        Write-Host "  1. Basic Dataset" -ForegroundColor $Colors.Green -NoNewline
        Write-Host " (only option available)" -ForegroundColor $Colors.White
        Write-Host "  n. No - Exit without seeding" -ForegroundColor $Colors.Yellow
        Write-Host ""
        
        do {
            $singleChoice = Read-Host "[PROMPT] Please select an option (1/n)"
            
            switch ($singleChoice.ToLower()) {
                '1' { $choice = "basic"; break }
                'basic' { $choice = "basic"; break }
                'n' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                'no' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                'exit' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                'quit' { 
                    Write-Status "Seeding cancelled by user"
                    exit 0
                }
                default { 
                    Write-Warning "Invalid choice. Please enter 1 (basic) or n (no/exit)"
                    continue
                }
            }
        } while ($true)
    }
    
    # Confirm seeding action
    Write-Host ""
    Write-Warning "⚠️  This will replace all existing data in the database!"
    if (-not (Get-UserChoice "Are you sure you want to continue?" "n")) {
        Write-Status "Seeding cancelled by user"
        exit 0
    }
    
    # Perform seeding
    Write-Host ""
    Invoke-DatabaseSeeding $choice
    Show-TestAccounts
    
    Write-Host ""
    Write-Success "Database seeding completed successfully!"
    Write-Status "You can now start the development server with: npm run dev"
}

# Check if Node.js is available
if (-not (Test-Command "node")) {
    Write-Error "Node.js is not installed or not available in PATH"
    Write-Error "Please install Node.js first using the install-dependencies.ps1 script"
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Error "npm is not installed or not available in PATH"
    Write-Error "Please install npm first using the install-dependencies.ps1 script"
    exit 1
}

# Run main function
Main
