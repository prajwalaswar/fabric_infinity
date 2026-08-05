# Start Frontend Development Server

Write-Host "Starting Frontend..." -ForegroundColor Cyan

# Load .env file for any frontend env vars
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Navigate to frontend directory
Push-Location artifacts/fabric-infinity

Write-Host "Starting Vite dev server..." -ForegroundColor Yellow
pnpm run dev

Pop-Location
