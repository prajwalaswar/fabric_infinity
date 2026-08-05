# Quick Start Guide - Windows

This guide will get Fabric Infinity running on your Windows machine in 5 steps.

## Current Status (Verified)

✅ **What's Working:**
- Node.js v24.18.0 installed
- Git installed
- Project files present
- pnpm-lock.yaml exists

❌ **What Needs Setup:**
1. pnpm not installed
2. Dependencies not installed
3. Environment variables not set
4. PostgreSQL may not be installed

## 5-Step Setup

### Step 1: Install pnpm

Open PowerShell as Administrator and run:

```powershell
npm install -g pnpm
```

Verify installation:
```powershell
pnpm --version
```

### Step 2: Install Dependencies

```powershell
# Navigate to project root
cd C:\Users\DELL\fabric_infinity

# Install all dependencies (this will take 2-5 minutes)
pnpm install
```

### Step 3: Install PostgreSQL

**Option A: Download Installer** (Recommended)
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16
3. Run installer (keep default settings)
4. Remember the password you set for 'postgres' user

**Option B: Use Chocolatey** (if you have it)
```powershell
choco install postgresql
```

After installation, verify:
```powershell
psql --version
```

Create a database for the project:
```powershell
# Login to PostgreSQL (password from installation)
psql -U postgres

# In psql prompt:
CREATE DATABASE fabric_infinity;
\q
```

### Step 4: Set Environment Variables

#### For Development (Current Session Only)

Open PowerShell in project root and run:

```powershell
# Set DATABASE_URL (replace 'yourpassword' with your postgres password)
$env:DATABASE_URL = "postgresql://postgres:yourpassword@localhost:5432/fabric_infinity"

# Generate and set SESSION_SECRET
$env:SESSION_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Set PORT
$env:PORT = "5000"

# Verify they're set
echo $env:DATABASE_URL
echo $env:SESSION_SECRET
echo $env:PORT
```

#### For Persistent Setup (Recommended)

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fabric_infinity
SESSION_SECRET=your-32-character-random-string-here
PORT=5000
```

Then install dotenv support:
```powershell
pnpm add -D dotenv
```

### Step 5: Set Up Database & Run

```powershell
# Set up database tables
cd lib/db
pnpm run push
cd ../..

# Verify setup
powershell -ExecutionPolicy Bypass -File verify-setup.ps1
```

## Running the Application

You need TWO terminal windows:

### Terminal 1: API Server

```powershell
# Set environment variables (if not using .env)
$env:DATABASE_URL = "postgresql://postgres:yourpassword@localhost:5432/fabric_infinity"
$env:SESSION_SECRET = "your-secret-here"
$env:PORT = "5000"

# Start API server
cd artifacts/api-server
pnpm run dev
```

Wait for: `Server listening` message

### Terminal 2: Frontend

```powershell
# Start frontend (in NEW terminal window)
cd C:\Users\DELL\fabric_infinity
cd artifacts/fabric-infinity
pnpm run dev
```

Wait for: `Local: http://localhost:5173/`

## Access the Application

Open your browser:
- **Customer Store**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **Shop Page**: http://localhost:5173/shop

## Quick Verification Checklist

After starting both servers, test these:

1. [ ] Frontend loads without errors
2. [ ] API responds: http://localhost:5000/api/health (should show "healthy")
3. [ ] Shop page shows products (may be empty at first)
4. [ ] Admin login page accessible
5. [ ] No red errors in browser console (F12)

## Create First Admin User

You'll need to manually add an admin user to the database:

```sql
-- Connect to database
psql -U postgres -d fabric_infinity

-- Insert admin user (adjust as needed based on your schema)
-- Check the customers or admin table structure first
\d customers

-- Then insert appropriately
```

## Owner Mode Password

By default, the owner mode password is `owner123`.

**CHANGE THIS IMMEDIATELY:**

1. Open: `artifacts/fabric-infinity/src/pages/Shop.tsx`
2. Find line: `const OWNER_PASSWORD = 'owner123';`
3. Change to your secure password
4. Save file

## Common Issues on Windows

### Issue: PowerShell Execution Policy Error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Port Already in Use

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Issue: Cannot Connect to PostgreSQL

1. Check PostgreSQL service is running:
   ```powershell
   Get-Service -Name postgresql*
   ```

2. Start if stopped:
   ```powershell
   Start-Service -Name "postgresql-x64-16"
   ```

### Issue: Environment Variables Not Persisting

Instead of setting in PowerShell, use Windows System Environment Variables:

1. Open Start → Search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "User variables", click "New"
5. Add each variable (DATABASE_URL, SESSION_SECRET, PORT)

OR create a `.env` file (easier and recommended).

### Issue: pnpm install fails

```powershell
# Clear cache and try again
pnpm store prune
pnpm install --force
```

## Optional: Set Up AI Features

To enable AI-powered fabric analysis:

1. Get free API key from: https://console.groq.com
2. Add to environment:
   ```powershell
   $env:GROQ_API_KEY = "your-groq-api-key"
   ```
   Or add to `.env` file:
   ```env
   GROQ_API_KEY=your-groq-api-key
   ```
3. Restart API server

## Next Steps After Setup

1. **Add Products**: Go to Admin → Products → Add Product
2. **Upload Images**: Use the upload button in product form
3. **Test AI**: Upload an image and click "Auto-fill with AI"
4. **Test Owner Mode**: Go to Shop page, enable Owner Mode
5. **Customize**: Update branding, colors, business info

## Daily Development Workflow

```powershell
# Morning: Start development servers

# Terminal 1: API
cd C:\Users\DELL\fabric_infinity\artifacts\api-server
$env:DATABASE_URL = "postgresql://postgres:yourpassword@localhost:5432/fabric_infinity"
$env:SESSION_SECRET = "your-secret"
$env:PORT = "5000"
pnpm run dev

# Terminal 2: Frontend (new window)
cd C:\Users\DELL\fabric_infinity\artifacts\fabric-infinity
pnpm run dev
```

## Production Deployment

For production deployment on Windows Server:

1. Build the project:
   ```powershell
   pnpm run build
   ```

2. Use a process manager (PM2):
   ```powershell
   npm install -g pm2
   pm2 start artifacts/api-server/dist/index.mjs
   ```

3. Serve frontend with IIS or nginx
4. Set up SSL certificates
5. Configure firewall rules

## Support Resources

- **README.md**: Complete documentation
- **OWNER_GUIDE.md**: Owner mode features
- **SETUP_CHECKLIST.md**: Detailed setup checklist
- **WhatsApp Support**: +91 8530361444

## Troubleshooting Helper

Run the verification script anytime to check your setup:

```powershell
powershell -ExecutionPolicy Bypass -File verify-setup.ps1
```

---

**Platform**: Windows 11/10  
**Shell**: PowerShell  
**Last Updated**: August 2026
