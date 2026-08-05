# Start Development Servers for Fabric Infinity
# This script loads environment variables and starts both API server and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Fabric Infinity Development " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env file
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  Set $key" -ForegroundColor Gray
        }
    }
    Write-Host "[OK] Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "Please run setup-windows.ps1 first or create .env file manually" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Environment Configuration:" -ForegroundColor Cyan
Write-Host "  DATABASE_URL: $($env:DATABASE_URL)" -ForegroundColor White
Write-Host "  PORT: $($env:PORT)" -ForegroundColor White
Write-Host "  SESSION_SECRET: $(if($env:SESSION_SECRET){'[SET]'}else{'[NOT SET]'})" -ForegroundColor White
Write-Host ""

# Check if database is accessible
Write-Host "Checking database connection..." -ForegroundColor Yellow
if ($env:DATABASE_URL -match "localhost") {
    try {
        $pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
        if ($pgTest.TcpTestSucceeded) {
            Write-Host "[OK] PostgreSQL is accessible on port 5432" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Cannot connect to PostgreSQL on port 5432" -ForegroundColor Yellow
            Write-Host "       Make sure PostgreSQL is installed and running" -ForegroundColor Yellow
            Write-Host "       See POSTGRESQL_SETUP.md for installation guide" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[WARN] Could not test database connection" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "You need to start two servers:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Manual (Recommended for debugging)" -ForegroundColor White
Write-Host "  Terminal 1:" -ForegroundColor Cyan
Write-Host "    cd artifacts/api-server" -ForegroundColor Gray
Write-Host "    `$env:DATABASE_URL='$($env:DATABASE_URL)'" -ForegroundColor Gray
Write-Host "    `$env:SESSION_SECRET='$($env:SESSION_SECRET)'" -ForegroundColor Gray
Write-Host "    `$env:PORT='$($env:PORT)'" -ForegroundColor Gray
Write-Host "    pnpm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2:" -ForegroundColor Cyan
Write-Host "    cd artifacts/fabric-infinity" -ForegroundColor Gray
Write-Host "    pnpm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use start-api.ps1 and start-frontend.ps1 scripts" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Press Enter to exit, or type 'api' to start API server now"
if ($response -eq "api") {
    Write-Host ""
    Write-Host "Starting API server..." -ForegroundColor Green
    Push-Location artifacts/api-server
    pnpm run dev
    Pop-Location
}
