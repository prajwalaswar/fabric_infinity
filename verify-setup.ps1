# Fabric Infinity Setup Verification Script
# Run this script to verify your installation is correct

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fabric Infinity Setup Verification   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Function to check command existence
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to print status
function Print-Status($message, $status) {
    $symbol = if ($status -eq "OK") { "[OK]" } elseif ($status -eq "WARN") { "[WARN]" } else { "[ERROR]" }
    $color = if ($status -eq "OK") { "Green" } elseif ($status -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "$symbol " -ForegroundColor $color -NoNewline
    Write-Host $message
}

# 1. Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -ge 20) {
        Print-Status "Node.js $nodeVersion installed" "OK"
    } else {
        Print-Status "Node.js $nodeVersion is too old (need v20+)" "ERROR"
        $errors++
    }
} else {
    Print-Status "Node.js not found" "ERROR"
    $errors++
}

# 2. Check pnpm
Write-Host "`n2. Checking pnpm..." -ForegroundColor Yellow
if (Test-Command "pnpm") {
    $pnpmVersion = pnpm --version
    Print-Status "pnpm v$pnpmVersion installed" "OK"
} else {
    Print-Status "pnpm not found - Install with: npm install -g pnpm" "ERROR"
    $errors++
}

# 3. Check Git
Write-Host "`n3. Checking Git..." -ForegroundColor Yellow
if (Test-Command "git") {
    $gitVersion = git --version
    Print-Status "$gitVersion installed" "OK"
} else {
    Print-Status "Git not found (optional but recommended)" "WARN"
    $warnings++
}

# 4. Check PostgreSQL
Write-Host "`n4. Checking PostgreSQL..." -ForegroundColor Yellow
if (Test-Command "psql") {
    $pgVersion = psql --version
    Print-Status "$pgVersion installed" "OK"
} else {
    Print-Status "PostgreSQL client not found (ensure PostgreSQL is installed)" "WARN"
    $warnings++
}

# 5. Check project files
Write-Host "`n5. Checking project structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "pnpm-workspace.yaml",
    "artifacts/api-server/package.json",
    "artifacts/fabric-infinity/package.json",
    "lib/db/package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Print-Status "$file exists" "OK"
    } else {
        Print-Status "$file missing" "ERROR"
        $errors++
    }
}

# 6. Check node_modules
Write-Host "`n6. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Print-Status "Root node_modules exists" "OK"
    
    if (Test-Path "artifacts/api-server/node_modules") {
        Print-Status "API server dependencies installed" "OK"
    } else {
        Print-Status "API server dependencies not installed" "WARN"
        $warnings++
    }
    
    if (Test-Path "artifacts/fabric-infinity/node_modules") {
        Print-Status "Frontend dependencies installed" "OK"
    } else {
        Print-Status "Frontend dependencies not installed" "WARN"
        $warnings++
    }
} else {
    Print-Status "Dependencies not installed - Run: pnpm install" "ERROR"
    $errors++
}

# 7. Check uploads directory
Write-Host "`n7. Checking uploads directory..." -ForegroundColor Yellow
if (Test-Path "uploads") {
    Print-Status "uploads/ directory exists" "OK"
} else {
    Print-Status "uploads/ directory missing (will be created automatically)" "WARN"
    $warnings++
}

# 8. Check environment variables
Write-Host "`n8. Checking environment variables..." -ForegroundColor Yellow

if ($env:DATABASE_URL) {
    Print-Status "DATABASE_URL is set" "OK"
} else {
    Print-Status "DATABASE_URL not set (required)" "ERROR"
    $errors++
}

if ($env:SESSION_SECRET) {
    $secretLength = $env:SESSION_SECRET.Length
    if ($secretLength -ge 32) {
        Print-Status "SESSION_SECRET is set (length: $secretLength)" "OK"
    } else {
        Print-Status "SESSION_SECRET too short (length: $secretLength, need 32+)" "WARN"
        $warnings++
    }
} else {
    Print-Status "SESSION_SECRET not set (required)" "ERROR"
    $errors++
}

if ($env:PORT) {
    Print-Status "PORT is set to $env:PORT" "OK"
} else {
    Print-Status "PORT not set (will default to config)" "WARN"
    $warnings++
}

if ($env:GROQ_API_KEY) {
    Print-Status "GROQ_API_KEY is set (AI features enabled)" "OK"
} else {
    Print-Status "GROQ_API_KEY not set (AI features disabled)" "WARN"
    $warnings++
}

# 9. Check lock file
Write-Host "`n9. Checking lock file..." -ForegroundColor Yellow
if (Test-Path "pnpm-lock.yaml") {
    Print-Status "pnpm-lock.yaml exists" "OK"
} else {
    Print-Status "pnpm-lock.yaml missing" "WARN"
    $warnings++
}

# 10. Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "              SUMMARY                   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n[SUCCESS] All checks passed! Your setup is ready." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Set up database: cd lib/db && pnpm run push" -ForegroundColor White
    Write-Host "2. Start API server: cd artifacts/api-server && pnpm run dev" -ForegroundColor White
    Write-Host "3. Start frontend: cd artifacts/fabric-infinity && pnpm run dev" -ForegroundColor White
} else {
    Write-Host "`nFound $errors error(s) and $warnings warning(s)" -ForegroundColor Yellow
    
    if ($errors -gt 0) {
        Write-Host "`n[CRITICAL] Critical errors found. Please fix them before proceeding." -ForegroundColor Red
        Write-Host "`nCommon fixes:" -ForegroundColor Yellow
        Write-Host "- Install pnpm: npm install -g pnpm" -ForegroundColor White
        Write-Host "- Install dependencies: pnpm install" -ForegroundColor White
        Write-Host "- Set environment variables in your shell or .env file" -ForegroundColor White
    }
    
    if ($warnings -gt 0) {
        Write-Host "`n[WARNING] Warnings found. These may not prevent the app from running," -ForegroundColor Yellow
        Write-Host "  but should be addressed for full functionality." -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host ""

# Exit with appropriate code
if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
