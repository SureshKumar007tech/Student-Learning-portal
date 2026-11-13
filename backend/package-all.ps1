# PowerShell script to package all microservices into production JARs
$ErrorActionPreference = "Stop"

# Check Java Home
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Java\jdk-23") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
    } elseif (Test-Path "C:\Program Files\Java\latest") {
        $env:JAVA_HOME = "C:\Program Files\Java\latest"
    }
}

# Locate Maven
$mvn = "mvn"
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    $wrapperMvn = "C:\Users\s\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
    if (Test-Path $wrapperMvn) {
        $mvn = $wrapperMvn
    }
}

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$services = @("api-gateway", "user-service", "course-service", "resource-service", "engagement-service")

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Packaging Student Learning Portal Microservices Suite     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "`n--> Packaging $service..." -ForegroundColor Yellow
    Set-Location "$baseDir\$service"
    & $mvn clean package -DskipTests=false -o
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED to package $service" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: $service packaged." -ForegroundColor Green
}

Write-Host "`nAll microservices built and packaged successfully!" -ForegroundColor Green
