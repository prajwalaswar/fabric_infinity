# Start API Server with environment variables loaded

Write-Host "Starting API Server..." -ForegroundColor Cyan

# Load .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Navigate to API server directory
Push-Location artifacts/api-server

Write-Host "Building and starting..." -ForegroundColor Yellow
pnpm run dev

Pop-Location
