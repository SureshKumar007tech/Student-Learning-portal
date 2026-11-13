# PowerShell script to start all 5 microservices independently
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Load project-root .env values for child service processes without printing secrets.
$envFile = Join-Path $baseDir "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
            $parts = $line.Split('=', 2)
            $value = $parts[1].Trim().Trim('"')
            Set-Item -Path "Env:$($parts[0].Trim())" -Value $value
        }
    }
}
if (-not $env:JWT_SECRET) { throw 'JWT_SECRET is required. Copy .env.example to .env and set a private random value.' }


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

$services = @(
    @{ Name = "user-service"; Port = 8081; Dir = "$baseDir\user-service" },
    @{ Name = "course-service"; Port = 8082; Dir = "$baseDir\course-service" },
    @{ Name = "resource-service"; Port = 8083; Dir = "$baseDir\resource-service" },
    @{ Name = "engagement-service"; Port = 8084; Dir = "$baseDir\engagement-service" },
    @{ Name = "api-gateway"; Port = 8080; Dir = "$baseDir\api-gateway" }
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Student Learning Portal Microservices Suite     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor DarkGray
Write-Host "Maven Executable: $mvn" -ForegroundColor DarkGray

foreach ($svc in $services) {
    Write-Host "--> Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; Set-Location '$($svc.Dir)'; & '$mvn' spring-boot:run -o"
    Start-Sleep -Seconds 3
}

Write-Host "`nAll 5 microservices launched in independent processes!" -ForegroundColor Green
Write-Host "API Gateway:        http://localhost:8080" -ForegroundColor Cyan
Write-Host "User Service:       http://localhost:8081" -ForegroundColor Cyan
Write-Host "Course Service:     http://localhost:8082" -ForegroundColor Cyan
Write-Host "Resource Service:   http://localhost:8083" -ForegroundColor Cyan
Write-Host "Engagement Service: http://localhost:8084" -ForegroundColor Cyan
Write-Host "`nFrontend can now connect directly via http://localhost:5173" -ForegroundColor Green
