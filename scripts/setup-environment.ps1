[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Assert-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

Assert-Command "node"
Assert-Command "npm"
Assert-Command "python"

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Created Python virtual environment at .venv"
}

$pythonExe = Join-Path $root ".venv\Scripts\python.exe"
& $pythonExe -m pip install --upgrade pip
& $pythonExe -m pip install -r requirements.txt

foreach ($dir in @(".", "backend", "frontend")) {
    Push-Location $dir
    if (Test-Path "package-lock.json") {
        npm ci
    } else {
        npm install
    }
    Pop-Location
}

Write-Host ""
Write-Host "Environment setup complete."
Write-Host "Use start.bat to launch the app."
Write-Host "Use RunGraphify.bat to refresh graphify artifacts when the semantic cache is complete."
