$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { $failures.Add($Message) }
}

$requiredFiles = @(
    'index.html',
    '404.html',
    '_headers',
    'robots.txt',
    'README.md',
    'PRODUCT.md',
    'DESIGN.md',
    '.impeccable/design.json',
    'assets/site.css',
    'assets/favicon.svg',
    'assets/fonts/bricolage-grotesque-latin-var.woff2',
    'assets/fonts/OFL-Bricolage-Grotesque.txt',
    'assets/fonts/ibm-plex-mono-400-latin.woff2',
    'assets/fonts/ibm-plex-mono-500-latin.woff2',
    'assets/fonts/ibm-plex-mono-600-latin.woff2',
    'assets/fonts/OFL-IBM-Plex-Mono.txt'
)

foreach ($relativePath in $requiredFiles) {
    Assert-True (Test-Path -LiteralPath (Join-Path $siteRoot $relativePath)) "Missing required file: $relativePath"
}

$indexPath = Join-Path $siteRoot 'index.html'
$cssPath = Join-Path $siteRoot 'assets/site.css'
$headersPath = Join-Path $siteRoot '_headers'

if (Test-Path -LiteralPath $indexPath) {
    $html = Get-Content -LiteralPath $indexPath -Raw
    Assert-True ([regex]::Matches($html, '<h1(?:\s|>)', 'IgnoreCase').Count -eq 1) 'index.html must contain exactly one H1'
    Assert-True ($html -match '<html\s+lang="en"') 'Document language must be declared'
    Assert-True ($html -match '<title>Allusions · Independent Software</title>') 'Document title is incorrect'
    Assert-True ($html -match 'class="skip-link"\s+href="#main"') 'Skip link must target main content'
    Assert-True ($html -match '<nav[^>]+aria-label=') 'Navigation must have an accessible name'
    Assert-True ($html -match '<main\s+id="main"') 'Main landmark must be present and targetable'
    Assert-True ($html -match '<footer') 'Footer landmark must be present'
    Assert-True ($html -match '>Projects<') 'Projects navigation label is missing'
    Assert-True ($html -match '>Standard<') 'Standard navigation label is missing'
    Assert-True ($html -match '>GitHub<') 'GitHub navigation label is missing'
    Assert-True ($html -match 'Software that takes responsibility for the machinery\.') 'Approved hero copy is missing'
    Assert-True ($html -match 'AFK AI' -and $html -match 'DemiMedia' -and $html -match 'ValClips') 'Project register is incomplete'
    Assert-True ($html -match '>Beta<' -and ([regex]::Matches($html, '>In development<').Count -eq 2)) 'Project statuses are incorrect'
    Assert-True ($html -match 'https://localai-windows-starter-site\.allusionsafk\.workers\.dev/') 'AFK destination is incorrect'
    Assert-True ($html -match 'https://github\.com/allusionsafk/adaptive-media') 'DemiMedia destination is incorrect'
    Assert-True ($html -notmatch 'Adaptive Media|Demi Player|Allusions — Independent software studio') 'Stale public identity text remains in index.html'
    Assert-True ($html -notmatch '(?i)friend beta') 'Retired Friend Beta terminology must not appear'
    Assert-True ($html -notmatch '<script(?:\s|>)') 'JavaScript is not permitted in the production candidate'
    Assert-True ($html -notmatch '\sstyle=') 'Inline styles are forbidden by CSP'
    Assert-True ($html -notmatch '(?i)(?:src|href)="https?://[^\"]+\.(?:js|css|woff2?|ttf|otf)') 'Remote executable or font assets are forbidden'
    Assert-True ($html -match '<link\s+rel="icon"\s+href="assets/favicon\.svg"') 'Self-hosted favicon link is missing'
}

$bricolageLicensePath = Join-Path $siteRoot 'assets/fonts/OFL-Bricolage-Grotesque.txt'
if (Test-Path -LiteralPath $bricolageLicensePath) {
    $bricolageLicense = Get-Content -LiteralPath $bricolageLicensePath -Raw
    Assert-True ($bricolageLicense -match 'Copyright 2022 The Bricolage Grotesque Project Authors \(https://github\.com/ateliertriay/bricolage\)') 'Bricolage Grotesque upstream copyright notice is missing'
    Assert-True ($bricolageLicense -match 'SIL OPEN FONT LICENSE Version 1\.1 - 26 February 2007') 'Bricolage Grotesque OFL 1.1 text is missing'
}

$plexLicensePath = Join-Path $siteRoot 'assets/fonts/OFL-IBM-Plex-Mono.txt'
if (Test-Path -LiteralPath $plexLicensePath) {
    $plexLicense = Get-Content -LiteralPath $plexLicensePath -Raw
    Assert-True ($plexLicense -match 'Copyright © 2017 IBM Corp\. with Reserved Font Name "Plex"') 'IBM Plex Mono upstream copyright notice is missing'
    Assert-True ($plexLicense -match 'SIL OPEN FONT LICENSE Version 1\.1 - 26 February 2007') 'IBM Plex Mono OFL 1.1 text is missing'
}

if (Test-Path -LiteralPath $cssPath) {
    $css = Get-Content -LiteralPath $cssPath -Raw
    Assert-True ($css -match '@font-face') 'Self-hosted font declarations are missing'
    Assert-True ($css -match ':focus-visible') 'Visible keyboard focus styles are missing'
    Assert-True ($css -match 'prefers-reduced-motion:\s*reduce') 'Reduced-motion handling is missing'
    Assert-True ($css -match 'min-height:\s*44px') 'Interactive targets must provide a practical 44px minimum height'
    Assert-True ($css -notmatch '(?i)url\(["'']?https?://') 'CSS must not load remote assets'
    Assert-True ($css -match '(?s)\.skip-link:hover\s*\{[^}]*color:\s*var\(--ground\)') 'Skip-link hover must preserve contrast on its dark surface'
}

if (Test-Path -LiteralPath $headersPath) {
    $headers = Get-Content -LiteralPath $headersPath -Raw
    Assert-True ($headers -match "default-src 'none'") 'CSP must default-deny all resource types'
    Assert-True ($headers -match "style-src 'self'") 'CSP must allow only self-hosted styles'
    Assert-True ($headers -match "font-src 'self'") 'CSP must allow only self-hosted fonts'
    Assert-True ($headers -match "frame-ancestors 'none'") 'CSP must prevent framing'
    Assert-True ($headers -notmatch "unsafe-inline|unsafe-eval") 'CSP must not use unsafe-inline or unsafe-eval'
    Assert-True ($headers -match 'X-Content-Type-Options:\s*nosniff') 'nosniff header is missing'
    Assert-True ($headers -match 'Referrer-Policy:\s*no-referrer') 'Referrer policy is missing'
}

$textFiles = Get-ChildItem -LiteralPath $siteRoot -Recurse -File |
    Where-Object {
        $_.FullName -notlike "$PSScriptRoot*" -and
        ($_.Extension -in @('.html', '.css', '.md', '.txt') -or $_.Name -eq '_headers')
    }
foreach ($file in $textFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    Assert-True ($content -notmatch '(?i)(?:C:\\Users\\|/Users/|\.codex|\.claude)') "Private development path leaked in $($file.Name)"
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ -ErrorAction Continue }
    throw "Site contract failed with $($failures.Count) issue(s)."
}

Write-Output "Site contract passed: $($requiredFiles.Count) required files and all content/security assertions verified."
