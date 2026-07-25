# Supabase baza parolini .env faylida yangilaydi.
# Ishga tushirish:
#   powershell -ExecutionPolicy Bypass -File "C:\Users\pc\Desktop\loyihalarim\paketshop\scripts\update-db-password.ps1"
$ErrorActionPreference = 'Stop'

$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) '.env'
if (-not (Test-Path $envPath)) {
    Write-Host "XATO: .env topilmadi: $envPath" -ForegroundColor Red
    Read-Host "Yopish uchun Enter"; exit 1
}

Write-Host ""
Write-Host "=== Baza parolini yangilash ===" -ForegroundColor Cyan
Write-Host "Yangi parolni Supabase'dan nusxalab, shu yerga qo'ying." -ForegroundColor Gray
Write-Host "Parol faqat shu kompyuterda qoladi." -ForegroundColor Gray
Write-Host ""

$newPassword = Read-Host "Yangi baza paroli"
if ([string]::IsNullOrWhiteSpace($newPassword)) {
    Write-Host "XATO: parol bo'sh." -ForegroundColor Red
    Read-Host "Yopish uchun Enter"; exit 1
}

# URL ichida maxsus belgilar buzilmasligi uchun kodlaymiz
$encoded = [uri]::EscapeDataString($newPassword.Trim())

$lines = [System.IO.File]::ReadAllLines($envPath)
$updated = $false
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^DATABASE_URL=') {
        # postgresql://user:PAROL@host... -> faqat PAROL qismi almashtiriladi
        $new = [regex]::Replace($lines[$i], '^(DATABASE_URL=postgresql://[^:]+:)([^@]*)(@.*)$', "`${1}$encoded`${3}")
        if ($new -ne $lines[$i]) { $lines[$i] = $new; $updated = $true }
    }
}

if (-not $updated) {
    Write-Host "XATO: DATABASE_URL qatori topilmadi yoki formati kutilganidek emas." -ForegroundColor Red
    Read-Host "Yopish uchun Enter"; exit 1
}

[System.IO.File]::WriteAllLines($envPath, $lines)
Write-Host ""
Write-Host "TAYYOR: .env dagi DATABASE_URL yangilandi." -ForegroundColor Green

# Ulanishni tekshiramiz
$url = ($lines | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL=', ''
$m = [regex]::Match($url, '@([^:/@]+):(\d+)')
if ($m.Success) {
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect($m.Groups[1].Value, [int]$m.Groups[2].Value)
        Write-Host "Server bilan aloqa: OK ($($m.Groups[1].Value))" -ForegroundColor Green
    } catch {
        Write-Host "OGOHLANTIRISH: serverga ulanib bo'lmadi." -ForegroundColor Yellow
    } finally { $tcp.Close() }
}

Write-Host ""
Write-Host "Endi Claude'ga 'yangiladim' deb yozing — u parol to'g'riligini tekshiradi." -ForegroundColor Yellow
Read-Host "Yopish uchun Enter"
