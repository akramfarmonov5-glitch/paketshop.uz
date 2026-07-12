# PaketShop .env sozlash yordamchisi
# Ishga tushirish: powershell -ExecutionPolicy Bypass -File "C:\Users\pc\Desktop\loyihalarim\paketshop\scripts\setup-env.ps1"
$ErrorActionPreference = 'Stop'

$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) '.env'
if (-not (Test-Path $envPath)) {
    Write-Host "XATO: .env fayl topilmadi: $envPath" -ForegroundColor Red
    Read-Host "Yopish uchun Enter bosing"
    exit 1
}

Write-Host ""
Write-Host "=== PaketShop .env sozlash yordamchisi ===" -ForegroundColor Cyan
Write-Host "Kalitlaringiz faqat shu kompyuterda qoladi, hech qayerga yuborilmaydi." -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------------
Write-Host "1-QADAM: service_role kalit" -ForegroundColor Yellow
Write-Host "Brauzerda oching:" -ForegroundColor Gray
Write-Host "  https://supabase.com/dashboard/project/cuhaqoahculndvzpriuq/settings/api-keys" -ForegroundColor Green
Write-Host "'Legacy API keys' bolimidagi service_role kalitni Reveal qilib nusxalang." -ForegroundColor Gray
$serviceKey = (Read-Host "service_role kalitni shu yerga qo'ying").Trim()

$isValidKey = $false
if ($serviceKey.StartsWith('sb_secret_')) {
    $isValidKey = $true
} elseif ($serviceKey.StartsWith('eyJ')) {
    $parts = $serviceKey -split '\.'
    if ($parts.Count -ge 2) {
        $payload = $parts[1].Replace('-', '+').Replace('_', '/')
        switch ($payload.Length % 4) { 2 { $payload += '==' } 3 { $payload += '=' } }
        try {
            $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
            if ($json -match '"role"\s*:\s*"service_role"') {
                $isValidKey = $true
            } elseif ($json -match '"role"\s*:\s*"anon"') {
                Write-Host "XATO: bu 'anon' kalit! Bizga 'service_role' kalit kerak (o'sha sahifada pastroqda)." -ForegroundColor Red
                Read-Host "Yopish uchun Enter bosing"
                exit 1
            }
        } catch { }
    }
}
if (-not $isValidKey) {
    Write-Host "XATO: bu service_role kalitga o'xshamaydi ('eyJ...' yoki 'sb_secret_...' bilan boshlanishi kerak)." -ForegroundColor Red
    Read-Host "Yopish uchun Enter bosing"
    exit 1
}
Write-Host "service_role kalit qabul qilindi." -ForegroundColor Green
Write-Host ""

# ------------------------------------------------------------------
Write-Host "2-QADAM: Ulanish manzili (Session pooler URI)" -ForegroundColor Yellow
Write-Host "Dashboard yuqorisidagi 'Connect' tugmasi -> Connection string -> 'Session pooler' URI'ni nusxalang." -ForegroundColor Gray
Write-Host "U taxminan shunday: postgresql://postgres.cuhaqoah...:[YOUR-PASSWORD]@aws-0-...pooler.supabase.com:5432/postgres" -ForegroundColor Gray
$dbUrl = (Read-Host "URI'ni shu yerga qo'ying").Trim()

if ($dbUrl -notmatch '^postgresql://') {
    Write-Host "XATO: URI 'postgresql://' bilan boshlanishi kerak." -ForegroundColor Red
    Read-Host "Yopish uchun Enter bosing"
    exit 1
}
if ($dbUrl -match 'localhost') {
    Write-Host "XATO: bu lokal manzil. Supabase'dagi Session pooler URI kerak." -ForegroundColor Red
    Read-Host "Yopish uchun Enter bosing"
    exit 1
}

if ($dbUrl -match '\[YOUR-PASSWORD\]') {
    Write-Host ""
    Write-Host "3-QADAM: Baza paroli" -ForegroundColor Yellow
    Write-Host "Parolni bilmasangiz, shu sahifada 'Reset database password' qiling:" -ForegroundColor Gray
    Write-Host "  https://supabase.com/dashboard/project/cuhaqoahculndvzpriuq/settings/database" -ForegroundColor Green
    $dbPassword = Read-Host "Baza parolini shu yerga qo'ying"
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        Write-Host "XATO: parol bo'sh bo'lishi mumkin emas." -ForegroundColor Red
        Read-Host "Yopish uchun Enter bosing"
        exit 1
    }
    $encoded = [uri]::EscapeDataString($dbPassword.Trim())
    $dbUrl = $dbUrl.Replace('[YOUR-PASSWORD]', $encoded)
}

# Ulanish testi
$m = [regex]::Match($dbUrl, '@([^:/@]+):(\d+)')
if ($m.Success) {
    $dbHost = $m.Groups[1].Value
    $dbPort = [int]$m.Groups[2].Value
    Write-Host ""
    Write-Host "Ulanish tekshirilmoqda: $dbHost`:$dbPort ..." -ForegroundColor Gray
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect($dbHost, $dbPort)
        Write-Host "Ulanish testi: OK" -ForegroundColor Green
    } catch {
        Write-Host "OGOHLANTIRISH: $dbHost`:$dbPort ga ulanib bo'lmadi. URI to'g'riligini tekshiring." -ForegroundColor Red
    } finally {
        $tcp.Close()
    }
}

# ------------------------------------------------------------------
# .env ni yangilash
$lines = Get-Content $envPath
$newLines = foreach ($line in $lines) {
    if ($line -match '^SUPABASE_SERVICE_ROLE_KEY=') { "SUPABASE_SERVICE_ROLE_KEY=$serviceKey" }
    elseif ($line -match '^DATABASE_URL=') { "DATABASE_URL=$dbUrl" }
    else { $line }
}
[System.IO.File]::WriteAllLines($envPath, [string[]]$newLines)

Write-Host ""
Write-Host "=== TAYYOR! .env yangilandi ===" -ForegroundColor Cyan
Write-Host "  SUPABASE_SERVICE_ROLE_KEY -> yozildi ($($serviceKey.Length) belgi)" -ForegroundColor Green
Write-Host "  DATABASE_URL -> yozildi (host: $($m.Groups[1].Value))" -ForegroundColor Green
Write-Host ""
Write-Host "Endi Claude'ga 'bo'ldi' deb yozing." -ForegroundColor Yellow
Read-Host "Yopish uchun Enter bosing"
