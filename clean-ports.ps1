# Script para limpiar solo los puertos usados por Vite
# Uso: .\clean-ports.ps1

Write-Host "Limpiando puertos de Vite..." -ForegroundColor Cyan

function ClearPort {
    param([int]$Port)

    $lines = netstat -ano | findstr ":$Port"
    if (-not $lines) {
        Write-Host "Puerto $Port libre" -ForegroundColor Green
        return
    }

    Write-Host "Puerto $Port en uso, deteniendo proceso..." -ForegroundColor Yellow
    $pids = New-Object System.Collections.Generic.HashSet[string]

    foreach ($line in $lines) {
        $procId = ($line -split "\s+")[-1]
        if ($procId -match "^\d+$" -and $procId -ne "0") {
            [void]$pids.Add($procId)
        }
    }

    foreach ($procId in $pids) {
        try {
            Stop-Process -Id ([int]$procId) -Force -ErrorAction Stop
            Write-Host "PID $procId detenido" -ForegroundColor Yellow
        }
        catch {
            Write-Host "No se pudo detener PID $procId" -ForegroundColor DarkYellow
        }
    }

    Write-Host "Puerto $Port liberado" -ForegroundColor Green
}

ClearPort -Port 4173
ClearPort -Port 4174
ClearPort -Port 5173

Write-Host "Limpieza completada. Ya puedes ejecutar npm run dev" -ForegroundColor Cyan
