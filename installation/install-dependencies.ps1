# StackIt - System Dependencies Installation Script for Windows
# This script checks for and installs all required system dependencies on Windows

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

function Install-Chocolatey {
    Write-Status "Installing Chocolatey package manager..."
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Success "Chocolatey installed successfully"
        return $true
    }
    catch {
        Write-Error "Failed to install Chocolatey: $($_.Exception.Message)"
        return $false
    }
}

function Install-NodeJS {
    Write-Status "Installing Node.js..."
    try {
        if (Test-Command "choco") {
            choco install nodejs -y
        }
        else {
            Write-Warning "Chocolatey not available. Please install Node.js manually from https://nodejs.org/"
            return $false
        }
        Write-Success "Node.js installed successfully"
        return $true
    }
    catch {
        Write-Error "Failed to install Node.js: $($_.Exception.Message)"
        return $false
    }
}

function Install-Git {
    Write-Status "Installing Git..."
    try {
        if (Test-Command "choco") {
            choco install git -y
        }
        else {
            Write-Warning "Chocolatey not available. Please install Git manually from https://git-scm.com/"
            return $false
        }
        Write-Success "Git installed successfully"
        return $true
    }
    catch {
        Write-Error "Failed to install Git: $($_.Exception.Message)"
        return $false
    }
}

function Install-VSCodeBuildTools {
    Write-Status "Installing Visual Studio Build Tools..."
    try {
        if (Test-Command "choco") {
            choco install visualstudio2022buildtools -y
            choco install visualstudio2022-workload-vctools -y
        }
        else {
            Write-Warning "Chocolatey not available. Please install Visual Studio Build Tools manually"
            return $false
        }
        Write-Success "Visual Studio Build Tools installed successfully"
        return $true
    }
    catch {
        Write-Error "Failed to install Visual Studio Build Tools: $($_.Exception.Message)"
        return $false
    }
}

function Test-NodeJSVersion {
    if (Test-Command "node") {
        $version = node --version
        $versionNumber = $version -replace 'v', ''
        $majorVersion = ($versionNumber -split '\.')[0]
        
        if ([int]$majorVersion -ge 18) {
            Write-Success "Node.js version $version is compatible"
            return $true
        }
        else {
            Write-Warning "Node.js version $version is too old. Minimum required: 18.x"
            return $false
        }
    }
    else {
        return $false
    }
}

function Install-NPMPackages {
    Write-Status "Installing npm dependencies in project directory..."
    try {
        if (Test-Path "package.json") {
            # Ensure we're in the project directory
            $ProjectDir = Get-Location
            Write-Status "Installing dependencies in: $ProjectDir"
            
            # Clean install to avoid conflicts
            if (Test-Path "node_modules") {
                Write-Status "Cleaning existing node_modules..."
                Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
                Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
            }
            
            # Install dependencies locally (not globally)
            npm install --no-fund --no-audit
            
            # Verify installation
            if ((Test-Path "node_modules") -and (Test-Path "package-lock.json")) {
                Write-Success "npm dependencies installed successfully in project directory"
                
                # Check if backend dependencies are installed
                if (Test-Path "node_modules/@types/express") {
                    Write-Success "Backend dependencies verified"
                }
                
                # Check if frontend dependencies are installed  
                if (Test-Path "node_modules/react") {
                    Write-Success "Frontend dependencies verified"
                }
                return $true
            }
            else {
                Write-Error "npm installation failed"
                return $false
            }
        }
        else {
            Write-Error "package.json not found. Please run this script from the project root directory."
            return $false
        }
    }
    catch {
        Write-Error "Failed to install npm dependencies: $($_.Exception.Message)"
        return $false
    }
}

function Test-ProjectStructure {
    Write-Status "Verifying project structure..."
    
    $errors = 0
    
    # Check project structure
    if (-not (Test-Path "src")) {
        Write-Error "Frontend source directory (src/) not found"
        $errors++
    }
    
    if (-not (Test-Path "backend")) {
        Write-Error "Backend directory not found"
        $errors++
    }
    
    if (-not (Test-Path "vite.config.ts")) {
        Write-Error "Vite config not found"
        $errors++
    }
    
    # Check node_modules in correct location
    if (-not (Test-Path "node_modules")) {
        Write-Error "node_modules not found in project directory"
        $errors++
    }
    else {
        Write-Success "node_modules found in project directory"
    }
    
    # Check package.json scripts
    $packageContent = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageContent.scripts.dev) {
        Write-Success "Development scripts found"
    }
    else {
        Write-Error "Development scripts missing from package.json"
        $errors++
    }
    
    if ($errors -eq 0) {
        Write-Success "Project structure verified successfully"
        return $true
    }
    else {
        Write-Error "Found $errors project structure issues"
        return $false
    }
}

function Setup-Database {
    Write-Status "Setting up database structure..."
    try {
        # Ensure we're in project directory
        if (-not (Test-Path "package.json")) {
            Write-Error "Not in project directory. Cannot setup database."
            return $false
        }
        
        # Navigate to backend
        Push-Location "backend"
        
        # Install backend dependencies if needed
        if (-not (Test-Path "node_modules" -PathType Container)) {
            Write-Status "Installing backend dependencies..."
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to install backend dependencies"
            }
        }
        
        # Build backend first if needed
        if (Test-Path "tsconfig.json") {
            Write-Status "Compiling TypeScript backend..."
            npx tsc -p tsconfig.json 2>$null
        }
        
        # Initialize empty database (create tables only)
        Write-Status "Initializing database tables..."
        $success = $false
        
        # Try different initialization commands
        try {
            npm run db:init 2>$null
            $success = ($LASTEXITCODE -eq 0)
        } catch {}
        
        if (-not $success) {
            try {
                npm run setup:empty 2>$null
                $success = ($LASTEXITCODE -eq 0)
            } catch {}
        }
        
        if ($success) {
            Write-Success "Database tables created successfully"
        } else {
            Write-Warning "Database initialization script not found or failed"
            Write-Status "You can seed the database later using: .\script\seed-database.ps1"
        }
        
        Pop-Location
        
        Write-Success "Database setup complete!"
        Write-Host ""
        Write-Status "To seed the database with sample data, run:"
        Write-Host "  .\script\seed-database.ps1        # Interactive seeding" -ForegroundColor Green
        Write-Host "  .\script\seed-database.ps1 -Basic # Basic dataset" -ForegroundColor Green
        Write-Host "  .\script\seed-database.ps1 -Large # Large dataset" -ForegroundColor Green

        return $true
    }
    catch {
        Write-Error "Failed to setup database: $($_.Exception.Message)"
        return $false
    }
}

function Show-Help {
    Write-Host @"
StackIt - System Dependencies Installation Script for Windows

USAGE:
    .\install-dependencies.ps1 [OPTIONS]

OPTIONS:
    -Force      Force installation even if dependencies are already present
    -Help       Show this help message

DESCRIPTION:
    This script automatically installs all required system dependencies for the StackIt project:
    - Node.js (version 18+)
    - npm
    - Git
    - Visual Studio Build Tools
    - Project npm dependencies
    - Database structure setup

NOTE:
    Database seeding is handled by a separate script:
    .\script\seed-database.ps1

EXAMPLES:
    .\install-dependencies.ps1
    .\install-dependencies.ps1 -Force

"@ -ForegroundColor $Colors.White
}

function Main {
    if ($Help) {
        Show-Help
        return
    }

    Write-Status "Starting StackIt dependency installation for Windows..."
    Write-Status "Working directory: $(Get-Location)"
    
    # Verify we're in the correct project directory
    if (-not (Test-Path "package.json") -or -not (Test-Path "src") -or -not (Test-Path "backend")) {
        Write-Error "This doesn't appear to be the StackIt project root directory"
        Write-Error "Please ensure you're in the directory containing package.json, src/, and backend/"
        return
    }
    
    # Show project info
    try {
        $packageContent = Get-Content "package.json" -Raw | ConvertFrom-Json
        Write-Status "Project: $($packageContent.name)"
    }
    catch {
        Write-Status "Project: Unknown"
    }
    
    # Check if running as Administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (-not $isAdmin) {
        Write-Warning "Running as Administrator is recommended for installing system dependencies."
        Write-Status "Some installations may fail without Administrator privileges."
        Write-Warning "Dependencies will be installed in project directory, not globally."
    }

    # Verify project structure first
    if (-not (Test-ProjectStructure)) {
        Write-Warning "Project structure verification failed, continuing anyway..."
    }

    # Install Chocolatey if not present
    if (-not (Test-Command "choco")) {
        if (-not (Install-Chocolatey)) {
            Write-Error "Chocolatey installation failed. Manual installation required."
        }
    }
    else {
        Write-Success "Chocolatey package manager found"
    }

    # Check and install Node.js
    if (-not (Test-NodeJSVersion) -or $Force) {
        if (-not (Install-NodeJS)) {
            Write-Error "Node.js installation failed"
            return
        }
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        if (-not (Test-NodeJSVersion)) {
            Write-Error "Node.js installation verification failed"
            return
        }
    }

    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Error "npm not found. Please install npm manually."
        return
    }
    else {
        $npmVersion = npm --version
        Write-Success "npm version $npmVersion found"
        
        # Configure npm to avoid global installations in this session
        npm config set prefix "$(Get-Location)/node_modules"
        Write-Status "npm configured for local installation"
    }

    # Install Git if not present
    if (-not (Test-Command "git") -or $Force) {
        Install-Git | Out-Null
    }
    else {
        Write-Success "Git found"
    }

    # Install build tools
    if ($Force -or -not (Test-Path "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools")) {
        Install-VSCodeBuildTools | Out-Null
    }
    else {
        Write-Success "Visual Studio Build Tools found"
    }

    # Install npm packages (locally in project)
    if (-not (Install-NPMPackages)) {
        Write-Error "npm package installation failed"
        return
    }

    # Setup database
    Setup-Database | Out-Null

    # Final verification
    Write-Status "Performing final verification..."
    
    if ((Test-ProjectStructure) -and (Test-Command "node") -and (Test-Command "npm")) {
        Write-Success "All dependencies installed successfully!"
        Write-Host ""
        Write-Status "Installation Summary:"
        Write-Host "  ✓ Node.js version: $(node --version)" -ForegroundColor $Colors.Green
        Write-Host "  ✓ npm version: $(npm --version)" -ForegroundColor $Colors.Green
        Write-Host "  ✓ Project dependencies: $((Get-ChildItem node_modules).Count) packages" -ForegroundColor $Colors.Green
        
        # Check if database file exists
        if (Test-Path "backend/database.sqlite") {
            Write-Host "  ✓ Database: Tables initialized" -ForegroundColor $Colors.Green
        } else {
            Write-Host "  ⚠ Database: Not initialized" -ForegroundColor $Colors.Yellow
        }
        
        Write-Host ""
        Write-Status "Available commands:"
        Write-Host "  npm run dev                          - Start development server" -ForegroundColor $Colors.Green
        Write-Host "  npm run build                        - Build for production" -ForegroundColor $Colors.Green
        Write-Host "  .\script\seed-database.ps1           - Seed database with sample data" -ForegroundColor $Colors.Green
        Write-Host ""
        Write-Status "Development URLs:"
        Write-Host "  Frontend: http://localhost:5173" -ForegroundColor $Colors.Blue
        Write-Host "  Backend:  http://localhost:3001" -ForegroundColor $Colors.Blue
        Write-Host ""
        Write-Status "Next Steps:"
        Write-Host "  1. Seed the database: .\script\seed-database.ps1" -ForegroundColor $Colors.Green
        Write-Host "  2. Start development:  npm run dev" -ForegroundColor $Colors.Green
    }
    else {
        Write-Error "Installation completed but some dependencies are still missing"
        Write-Status "Please check the error messages above and try manual installation"
    }
}

# Check if script is being run from project root
if (-not (Test-Path "package.json")) {
    Write-Error "This script must be run from the StackIt project root directory"
    Write-Status "Please navigate to the directory containing package.json and run again"
    exit 1
}

# Run main function
Main
