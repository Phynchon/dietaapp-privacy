# Script para limpiar puertos y procesos de Node.js
# Uso: .\clean-ports.ps1

Write-Host "🧹 Limpiando procesos y puertos..." -ForegroundColor Cyan

# Limpiar procesos de Node.js
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Encontrados $($nodeProcesses.Count) procesos de Node.js" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "  Deteniendo proceso Node.js (PID: $($_.Id))" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Procesos de Node.js detenidos" -ForegroundColor Green
} else {
    Write-Host "✓ No hay procesos de Node.js activos" -ForegroundColor Green
}

# Verificar puerto 5173 (Vite dev)
$vitePort = netstat -ano | findstr ":5173"
if ($vitePort) {
    Write-Host "Puerto 5173 en uso, limpiando..." -ForegroundColor Yellow
    $vitePort | ForEach-Object {
        $pid = ($_ -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Proceso detenido (PID: $pid)" -ForegroundColor Yellow
        }
    }
    Write-Host "✓ Puerto 5173 liberado" -ForegroundColor Green
} else {
    Write-Host "✓ Puerto 5173 está libre" -ForegroundColor Green
}

# Verificar puerto 4173 (Vite preview)
$previewPort = netstat -ano | findstr ":4173"
if ($previewPort) {
    Write-Host "Puerto 4173 en uso, limpiando..." -ForegroundColor Yellow
    $previewPort | ForEach-Object {
        $pid = ($_ -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Proceso detenido (PID: $pid)" -ForegroundColor Yellow
        }
    }
    Write-Host "✓ Puerto 4173 liberado" -ForegroundColor Green
} else {
    Write-Host "✓ Puerto 4173 está libre" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Limpieza completada. Ahora puedes ejecutar 'npm run dev'" -ForegroundColor Cyan
