# StackIt Installation Scripts

> **⚡ Automated setup and database management for StackIt project**  
> Complete toolset for installation, seeding, and database management.

## Table of Contents
- [Scripts Overview](#scripts-overview)
- [Test Accounts](#test-accounts)
- [Command Reference](#command-reference)
- [Troubleshooting](#troubleshooting)

---

## Scripts Overview

### 🔧 System Dependencies Installation

<div align="center">

| Platform | Script | Purpose |
|----------|--------|---------|
| **Linux/macOS** | `./installation/install-dependencies.sh` | Install Node.js, npm, dependencies |
| **Windows** | `.\installation\install-dependencies.ps1` | Install Node.js, npm, dependencies |

</div>

**What gets installed:**
- ✅ Node.js (version 18+)
- ✅ npm package manager
- ✅ All project dependencies
- ✅ Database structure (tables only)

### ⚙️ Environment Configuration

Before running the project, set up your environment variables:

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
- `NODE_ENV` - Development environment (usually "development")
- `JWT_SECRET` - **IMPORTANT**: Change to a secure random string for production
- `FRONTEND_URL` - Frontend application URL (default: http://localhost:5173)

### 🌱 Database Seeding

<div align="center">

| Platform | Script | Purpose |
|----------|--------|---------|
| **Linux/macOS** | `./script/seed-database.sh` | Populate database with sample data |
| **Windows** | `.\script\seed-database.ps1` | Populate database with sample data |

</div>

### 🗑️ Database Clearing

<div align="center">

| Platform | Script | Purpose |
|----------|--------|---------|
| **Linux/macOS** | `./script/clear-database.sh` | Remove all data (preserve structure) |
| **Windows** | `.\script\clear-database.ps1` | Remove all data (preserve structure) |

</div>

> ⚠️ **Warning:** Database clearing permanently deletes ALL data. Use with caution!

---

## Seed Database

```bash
# Interactive mode - choose dataset size
./installation/seed-database.sh

# Or directly specify dataset
./installation/seed-database.sh --basic  # Quick setup
./installation/seed-database.sh --large  # Comprehensive data
```

---

## Test Accounts

> **🔐 Default Password:** `1234` (for all test accounts)

### 👨‍💼 Admin Account

<div align="center">

| Field | Value | Permissions |
|-------|-------|-------------|
| **Username** | `admin` | Full system access |
| **Role** | Admin | Manage users, questions, answers |
| **Capabilities** | | Delete content, ban users, system settings |
| **Email** | | `admin@example.com` |

</div>

### 👥 Regular User Accounts

<div align="center">

| Username | Role | Email | Activity Level |
|----------|------|---------------|----------------|
| `bob_coder` | User | `bob_coder@example.com` | High |
| `charlie_js` | User | `charlie_js@example.com` | Medium |
| `alice_data` | User | `alice_data@example.com` | Medium |
| `dave_mobile` | User | `dave_mobile@example.com` | Low |

</div>


---

## Command Reference

### 🔧 Installation Scripts

<details>
<summary><strong>Available Options</strong></summary>

| Option | Description | Example |
|--------|-------------|---------|
| `--auto` | Run in automated mode (no prompts) | `./install-dependencies.sh --auto` |
| `--help` | Show usage information | `./install-dependencies.sh --help` |
| `--force` | Force reinstallation | `.\install-dependencies.ps1 -Force` |
| `--quiet` | Minimal output | `.\install-dependencies.ps1 -Quiet` |

</details>

### 🌱 Seeding Scripts

<details>
<summary><strong>Available Options</strong></summary>

| Option | Description | Example |
|--------|-------------|---------|
| `--basic` | Seed with basic dataset (no prompts) | `./seed-database.sh --basic` |
| `--large` | Seed with large dataset (no prompts) | `./seed-database.sh --large` |
| `--help` | Show usage information | `./seed-database.sh --help` |
| `--reset` | Clear database before seeding | `./seed-database.sh --reset --large` |

</details>

### 🗑️ Clearing Scripts

<details>
<summary><strong>Available Options</strong></summary>

| Option | Description | Example |
|--------|-------------|---------|
| `--force` | Clear database without confirmation | `./clear-database.sh --force` |
| `--help` | Show usage information | `./clear-database.sh --help` |
| `--preserve-users` | Keep user accounts, clear content only | `./clear-database.sh --preserve-users` |
| `--backup` | Create backup before clearing | `./clear-database.sh --backup` |

</details>

### 🔄 Advanced Usage

```bash
# Complete reset and setup
./script/clear-database.sh --force && ./script/seed-database.sh --large

# Backup current data before clearing
./script/clear-database.sh --backup

# Quick development setup
./installation/install-dependencies.sh --auto && ./script/seed-database.sh --basic

# Production-ready setup
./installation/install-dependencies.sh && ./script/seed-database.sh --large
```

---

### 🔧 Development Commands

<details>
<summary><strong>Available npm Scripts</strong></summary>

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Start both frontend and backend | Daily development |
| `npm run dev:frontend` | Frontend only | Frontend-focused work |
| `npm run dev:backend` | Backend only | API development |
| `npm run build` | Production build | Before deployment |
| `npm run test` | Run all tests | Before committing |
| `npm run lint` | Code quality check | Before committing |
| `npm run db:backup` | Create database backup | Before major changes |
| `npm run db:restore` | Restore from backup | After issues |

</details>

---

## Troubleshooting

### 🔧 Common Issues

<details>
<summary><strong>Permission Errors (Linux/macOS)</strong></summary>

```bash
# Make scripts executable
chmod +x installation/*.sh
chmod +x script/*.sh

# Alternative: Run with bash
bash installation/install-dependencies.sh
```

</details>

<details>
<summary><strong>Node.js Version Issues</strong></summary>

```bash
# Check current version
node --version

# Should be 18.0.0 or higher
# If not, update Node.js:

# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

</details>

<details>
<summary><strong>Database Issues</strong></summary>

```bash
# Full database reset
./script/clear-database.sh --force
./script/seed-database.sh --large

# Check database file
ls -la backend/database.sqlite

# Verify database structure
sqlite3 backend/database.sqlite ".schema"

# Check database content
sqlite3 backend/database.sqlite "SELECT COUNT(*) FROM users;"
```

</details>

<details>
<summary><strong>Windows PowerShell Execution Policy</strong></summary>

```powershell
# Check current policy
Get-ExecutionPolicy

# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Alternative: Bypass for single session
powershell -ExecutionPolicy Bypass -File .\installation\install-dependencies.ps1
```

</details>

<details>
<summary><strong>Port Conflicts</strong></summary>

```bash
# Check what's using ports
netstat -tulpn | grep :3001  # Backend port
netstat -tulpn | grep :5173  # Frontend port

# Kill processes using ports
sudo kill -9 $(sudo lsof -t -i:3001)
sudo kill -9 $(sudo lsof -t -i:5173)

# Use different ports
PORT=3002 npm run dev:backend
PORT=5174 npm run dev:frontend
```

</details>

### 🚨 Error Resolution

<div align="center">

| Error Type | Quick Fix | Detailed Solution |
|------------|-----------|-------------------|
| **Scripts not executable** | `chmod +x installation/*.sh` | Check file permissions |
| **Node.js too old** | Update to Node.js 18+ | Use nvm or download installer |
| **Database locked** | Restart development server | Kill all Node.js processes |
| **Port already in use** | `kill -9 $(lsof -t -i:3001)` | Find and kill process |
| **npm install fails** | `npm cache clean --force` | Clear cache and reinstall |

</div>

---
