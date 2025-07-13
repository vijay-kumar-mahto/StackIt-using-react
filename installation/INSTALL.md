# StackIt - System Dependencies Installation

> **🚀 Automated setup for StackIt project dependencies**  
> All dependencies are installed locally within the project directory, not globally.

## Table of Contents
- [Quick Start](#quick-start)
- [What Gets Installed](#what-gets-installed)
- [Prerequisites](#prerequisites)
- [Manual Installation](#manual-installation)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)
- [Support](#support)

---

## Quick Start

### 🐧 Linux / 🍎 macOS

```bash
# Make scripts executable
chmod +x install-dependencies.sh verify-setup.sh

# Run the installation script
./install-dependencies.sh

# Verify installation (optional)
./verify-setup.sh
```

### 🪟 Windows (PowerShell)

```powershell
# Run PowerShell as Administrator (recommended)
# Navigate to the project directory

# Run the installation script
.\install-dependencies.ps1

# Force reinstallation if needed
.\install-dependencies.ps1 -Force
```

### 🌐 Alternative Setup (All Platforms)

```bash
# Quick setup using npm scripts
npm run setup          # Install dependencies + seed database
npm run setup:clean     # Clean install (removes node_modules first)
npm run verify          # Verify installation
```

---

## What Gets Installed

### ✅ Local Installation (Project Directory Only)

| Component | Location | Description |
|-----------|----------|-------------|
| **npm packages** | `./node_modules/` | All project dependencies (NOT global) |
| **TypeScript** | Local binaries | Compiler and development tools |
| **Database** | `./backend/` | SQLite database files |
| **Build artifacts** | `./dist/` | Compiled production code |

### ✅ System Dependencies (If Missing)

<details>
<summary><strong>Core Tools</strong></summary>

- **Node.js** (version 18+ LTS) - JavaScript runtime
- **npm** (comes with Node.js) - Package manager
- **Git** (version control) - Source control
- **SQLite3** - Database engine

</details>

<details>
<summary><strong>Build Tools by Platform</strong></summary>

| Platform | Tools | Purpose |
|----------|-------|---------|
| **Linux** | `build-essential`, `python3` | Compiling native modules |
| **macOS** | Xcode Command Line Tools | Native compilation |
| **Windows** | Visual Studio Build Tools | C++ compilation |

</details>

### ✅ Project Setup

- 🗄️ Initializes SQLite database in `./backend/database.sqlite`
- 🌱 Seeds database with sample data (186 questions, 15 users, 25 tags)
- 🔧 Compiles TypeScript backend code
- ✅ Verifies all dependencies are correctly installed

---

## Prerequisites

### 🐧 Linux (Ubuntu/Debian)
```bash
# Required tools
sudo apt-get update
sudo apt-get install curl wget sudo
```

### 🍎 macOS
```bash
# Install Homebrew if missing
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Xcode Command Line Tools (if prompted)
xcode-select --install
```

### 🪟 Windows
- **PowerShell 5.0+** (included in Windows 10+)
- **Administrator privileges** (recommended)
- **Internet connection** for downloads

---

## Troubleshooting

### 🔧 Common Issues

<details>
<summary><strong>Dependencies installing in wrong location</strong></summary>

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

</details>

<details>
<summary><strong>"Permission denied" error</strong></summary>

```bash
chmod +x install-dependencies.sh verify-setup.sh
```

</details>

<details>
<summary><strong>Node.js version too old</strong></summary>

The scripts require Node.js 18+. Update your Node.js installation:

```bash
# Check current version
node --version

# Update via package manager or download from nodejs.org
```

</details>

<details>
<summary><strong>Build tools missing (Windows)</strong></summary>

Install Visual Studio Build Tools manually:
1. Download from [Microsoft Visual Studio](https://visualstudio.microsoft.com/downloads/)
2. Select "Build Tools for Visual Studio 2022"
3. Install with C++ build tools workload

</details>

<details>
<summary><strong>npm install fails</strong></summary>

```bash
# Clear npm cache and clean install
npm run setup:clean

# Or manually:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

</details>

<details>
<summary><strong>Database issues</strong></summary>

```bash
# Reinitialize database
rm -f backend/database.sqlite
npm run seed:large
```

</details>

### 🔍 Verification Commands

```bash
# Comprehensive check
./verify-setup.sh                    # Linux/macOS only

# Quick checks
npm run check                         # List installed packages  
npm run verify                        # Build verification
ls node_modules | head -10           # Show first 10 packages
node --version && npm --version      # Show tool versions

# Check project structure
ls -la                                # Should show all project files
du -sh node_modules                  # Check node_modules size
```

### 📦 Package Verification

| Check | Command | Expected Result |
|-------|---------|-----------------|
| **Node.js** | `node --version` | `v18.x.x` or higher |
| **npm** | `npm --version` | `8.x.x` or higher |
| **Dependencies** | `ls node_modules \| wc -l` | 50+ packages |
| **TypeScript** | `npx tsc --version` | Version 4.x+ |
| **Database** | `ls backend/database.sqlite` | File exists |

---

## Configuration

### 🎯 Script Options

#### Linux/macOS Script
```bash
./install-dependencies.sh
```

#### Windows Script
```powershell
# Show help
.\install-dependencies.ps1 -Help

# Force reinstallation
.\install-dependencies.ps1 -Force

# Quiet installation
.\install-dependencies.ps1 -Quiet
```

### 🔧 Environment Variables

You can customize the installation with these environment variables:

```bash
# Set Node.js version (optional)
export NODE_VERSION="18.17.0"

# Set npm registry (optional)
export NPM_REGISTRY="https://registry.npmjs.org/"

# Skip build tools installation
export SKIP_BUILD_TOOLS="true"
```

---

## After Installation

### 🚀 Development Commands

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Seed database with sample data
npm run seed:large

# Start individual services
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
```

### 🌐 Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | React development server |
| **Backend API** | [http://localhost:3001](http://localhost:3001) | Express.js API server |
| **Database** | `./backend/database.sqlite` | SQLite database file |

---
