# StackIt - System Dependencies Installation

This directory contains automated installation scripts to set up all required system dependencies for the StackIt project. **All dependencies are installed locally within the project directory, not globally.**

## Quick Start

### Linux/macOS

```bash
# Make scripts executable
chmod +x install-dependencies.sh verify-setup.sh

# Run the installation script
./install-dependencies.sh

# Verify installation (optional)
./verify-setup.sh
```

### Windows (PowerShell)

```powershell
# Run PowerShell as Administrator (recommended)
# Navigate to the project directory

# Run the installation script
.\install-dependencies.ps1

# Force reinstallation if needed
.\install-dependencies.ps1 -Force
```

### Alternative Setup (All Platforms)

```bash
# Quick setup using npm scripts
npm run setup          # Install dependencies + seed database
npm run setup:clean     # Clean install (removes node_modules first)
npm run verify          # Verify installation
```

## What Gets Installed

### ✅ Local Installation (Project Directory Only)
- All npm packages in `./node_modules/` (NOT global)
- TypeScript compiler and tools
- Development dependencies
- Database files in `./backend/`

### ✅ System Dependencies (If Missing)
- **Node.js** (version 18+ LTS)
- **npm** (comes with Node.js)
- **Git** (version control)
- **Build tools** (for compiling native modules)
  - Linux: `build-essential`, `python3`
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools
- **SQLite3** (database)

### ✅ Project Setup
- Initializes SQLite database in `./backend/database.sqlite`
- Seeds database with sample data (186 questions, 15 users, 25 tags)
- Compiles TypeScript backend code
- Verifies all dependencies are correctly installed

## Prerequisites

### Linux (Ubuntu/Debian)
- `curl` or `wget`
- `sudo` access for system package installation

### macOS
- Homebrew (will be installed if missing)
- Xcode Command Line Tools (will be prompted to install)

### Windows
- PowerShell 5.0+ (included in Windows 10+)
- Administrator privileges (recommended)
- Internet connection

## Manual Installation (if scripts fail)

If the automated scripts don't work for your system, follow these manual steps:

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/) (LTS version 18+)
- Or use a package manager:
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  
  # macOS (with Homebrew)
  brew install node
  
  # Windows (with Chocolatey)
  choco install nodejs
  ```

### 2. Install Build Tools

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential python3 python3-pip git sqlite3
```

**macOS:**
```bash
xcode-select --install
brew install git sqlite
```

**Windows:**
- Install Visual Studio Build Tools 2022
- Or install Visual Studio Community with C++ workload

### 3. Install Project Dependencies
```bash
npm install
```

### 4. Setup Database
```bash
npm run seed:large
```

## Troubleshooting

### Common Issues

**Dependencies installing in wrong location:**
```bash
# Verify you're in the project root
pwd
ls package.json  # Should exist

# Clean and reinstall in project directory
npm run setup:clean

# Verify installation
./verify-setup.sh  # Linux/macOS
npm run verify     # All platforms
```

**"Permission denied" error:**
```bash
chmod +x install-dependencies.sh verify-setup.sh
```

**Node.js version too old:**
- The scripts require Node.js 18+
- Uninstall old version and run the script again

**Build tools missing (Windows):**
- Install Visual Studio Build Tools manually
- Or install Visual Studio Community

**npm install fails:**
```bash
# Clear npm cache and clean install
npm run setup:clean

# Or manually:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Database issues:**
```bash
# Reinitialize database
rm -f backend/database.sqlite
npm run seed:large
```

**Global vs Local installation:**
- Scripts ensure dependencies install in `./node_modules/` (project directory)
- NOT in global npm directory
- Verify with: `ls node_modules | wc -l` (should show 50+ packages)

### Verification Commands

```bash
# Check project structure
./verify-setup.sh                    # Comprehensive check (Linux/macOS)

# Quick checks
npm run check                         # List installed packages  
npm run verify                        # Build verification
ls node_modules | head -10           # Show first 10 packages
node --version && npm --version      # Show tool versions
```

### Getting Help

1. Check the error messages in the script output
2. Ensure you're running from the project root directory
3. Try running with elevated privileges (sudo/Administrator)
4. For Windows: Try running in PowerShell ISE or Windows Terminal

## Script Options

### Linux/macOS Script
```bash
./install-dependencies.sh
```

### Windows Script
```powershell
# Show help
.\install-dependencies.ps1 -Help

# Force reinstallation
.\install-dependencies.ps1 -Force
```

## After Installation

Once installation is complete, you can:

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Seed database with sample data
npm run seed:large
```

**Development URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## System Requirements

- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection required for downloads
- **OS:** 
  - Linux: Ubuntu 18.04+, CentOS 7+, Arch Linux
  - macOS: 10.15+
  - Windows: 10/11 with PowerShell 5.0+
