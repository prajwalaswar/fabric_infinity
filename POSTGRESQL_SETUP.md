# PostgreSQL Setup Guide for Windows

## Why You Need PostgreSQL

This application requires PostgreSQL database to store:
- Products and categories
- Customer orders
- User accounts
- Reviews and ratings
- All other data

## Installation Options

### Option 1: Download Official Installer (Recommended)

1. **Download PostgreSQL 16**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Select PostgreSQL 16.x for Windows x86-64
   - Download and run the installer

2. **Installation Steps**
   - Run the downloaded .exe file
   - Installation directory: Keep default (C:\Program Files\PostgreSQL\16)
   - Select components: Keep all checked (PostgreSQL Server, pgAdmin, Command Line Tools)
   - Data directory: Keep default
   - **Password**: Set a password for 'postgres' user (REMEMBER THIS!)
   - Port: Keep default 5432
   - Locale: Keep default
   - Click "Next" and wait for installation

3. **Verify Installation**
   ```powershell
   # Open PowerShell and run:
   psql --version
   # Should show: psql (PostgreSQL) 16.x
   ```

### Option 2: Use Chocolatey (if you have it)

```powershell
# Run as Administrator
choco install postgresql

# Verify
psql --version
```

### Option 3: Use Docker (Advanced)

```powershell
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run --name fabric-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

### Option 4: Use Cloud Database (No local install needed)

Use a managed PostgreSQL service:
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **ElephantSQL**: https://elephantsql.com (Free tier available)
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **Heroku Postgres**: https://www.heroku.com/postgres

## Post-Installation Setup

### 1. Create Database

```powershell
# Login to PostgreSQL (enter password when prompted)
psql -U postgres

# In psql prompt, run:
CREATE DATABASE fabric_infinity;

# Verify database created
\l

# Exit psql
\q
```

### 2. Update .env File

Edit the `.env` file in your project root:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fabric_infinity
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

### 3. Push Database Schema

```powershell
# Navigate to database directory
cd lib/db

# Push schema to create tables
pnpm run push

# Go back to root
cd ../..
```

## Verification

### Check if PostgreSQL is Running

```powershell
# Check service status
Get-Service -Name "postgresql*"

# Should show Status: Running
```

### Start PostgreSQL if Stopped

```powershell
# Start PostgreSQL service
Start-Service -Name "postgresql-x64-16"
```

### Test Database Connection

```powershell
# Try connecting to the database
psql -U postgres -d fabric_infinity

# If successful, you'll see:
# fabric_infinity=#

# Exit with:
\q
```

## Common Issues

### Issue: psql command not found

**Solution**: Add PostgreSQL to PATH

1. Find PostgreSQL bin folder (usually: `C:\Program Files\PostgreSQL\16\bin`)
2. Add to System PATH:
   - Open Start → Search "Environment Variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables"
   - Under "System variables", find "Path", click "Edit"
   - Click "New" and add: `C:\Program Files\PostgreSQL\16\bin`
   - Click OK on all dialogs
   - Restart PowerShell

### Issue: Connection refused

**Solutions**:
1. Check if PostgreSQL service is running
2. Verify port 5432 is not blocked by firewall
3. Check DATABASE_URL format in .env file

### Issue: Password authentication failed

**Solutions**:
1. Verify password in DATABASE_URL matches postgres user password
2. Reset password if forgotten:
   ```powershell
   # Edit pg_hba.conf to trust connections temporarily
   # Then login and change password
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```

### Issue: Database does not exist

**Solution**:
```powershell
psql -U postgres
CREATE DATABASE fabric_infinity;
\q
```

## Cloud Database Setup (Alternative)

If you don't want to install PostgreSQL locally, use a cloud service:

### Supabase Example

1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the Connection String (URI mode)
5. Update .env:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Neon Example

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update .env with the provided connection string

## Next Steps After PostgreSQL Setup

1. ✅ PostgreSQL installed and running
2. ✅ Database `fabric_infinity` created
3. ✅ DATABASE_URL updated in .env
4. ✅ Run database migration:
   ```powershell
   cd lib/db
   pnpm run push
   cd ../..
   ```
5. ✅ Start the application:
   ```powershell
   # Terminal 1
   cd artifacts/api-server
   pnpm run dev
   
   # Terminal 2
   cd artifacts/fabric-infinity
   pnpm run dev
   ```

## Support

If you encounter issues:
- Check PostgreSQL logs: `C:\Program Files\PostgreSQL\16\data\log\`
- Review error messages in terminal
- Verify all connection details in .env file
- Try connecting with pgAdmin (installed with PostgreSQL)

---

**Quick Summary Commands**:
```powershell
# Install PostgreSQL from website above, then:
psql -U postgres
CREATE DATABASE fabric_infinity;
\q

# Update .env with your password, then:
cd lib/db
pnpm run push
cd ../..

# Start servers:
# Terminal 1: cd artifacts/api-server && pnpm run dev
# Terminal 2: cd artifacts/fabric-infinity && pnpm run dev
```
