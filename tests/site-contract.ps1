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
    'assets/fonts/OFL-IBM-Plex-Mono.txt',
    'assets/captures/PROVENANCE.md'
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
    Assert-True ($html -match '<title>ALLUSIONS · Independent software</title>') 'Document title is incorrect'
    Assert-True ($html -match '<link\s+rel="canonical"\s+href="https://allusions-site\.pages\.dev/">') 'Production canonical URL is missing or incorrect'
    Assert-True ($html -match '<meta\s+property="og:title"\s+content="ALLUSIONS · Independent software">') 'Open Graph title is missing or incorrect'
    Assert-True ($html -match '<meta\s+property="og:description"\s+content="ALLUSIONS is independent software by Jidan: AFK AI for local AI on Windows, DemiMedia for film playback, and ValClips for gameplay stories\.">') 'Open Graph description is missing or incorrect'
    Assert-True ($html -match '<meta\s+property="og:url"\s+content="https://allusions-site\.pages\.dev/">') 'Open Graph URL is missing or incorrect'
    Assert-True ($html -match '<meta\s+name="twitter:card"\s+content="summary">') 'Twitter card metadata is missing or incorrect'
    Assert-True ($html -notmatch '(?:og:image|twitter:image)') 'A social image must not be invented'
    Assert-True ($html -match 'class="skip-link"\s+href="#main"') 'Skip link must target main content'
    Assert-True ($html -match '<nav[^>]+aria-label=') 'Navigation must have an accessible name'
    Assert-True ($html -match '<main\s+id="main"') 'Main landmark must be present and targetable'
    Assert-True ($html -match '<footer') 'Footer landmark must be present'
    Assert-True ($html -match '>Products<') 'Products navigation label is missing'
    Assert-True ($html -match '>Standard<') 'Standard navigation label is missing'
    Assert-True ($html -match '>GitHub<') 'GitHub navigation label is missing'
    Assert-True ($html -match 'Independent software by Jidan' -and $html -match '@allusionsafk') 'Imprint and handle are missing'
    Assert-True ($html -match '<h1[^>]*>ALLUSIONS</h1>') 'The wordmark must be the page heading'
    Assert-True ($html -match 'AFK AI' -and $html -match 'DemiMedia' -and $html -match 'ValClips') 'Project register is incomplete'
    Assert-True ($html -match 'Beta · <span class="machine">0\.2\.0-rc1</span> prerelease' -and $html -match 'In development · no release yet' -and $html -match 'Private development · no public download') 'Product statuses are incorrect'
    Assert-True ($html -match 'https://localai-windows-starter-site\.allusionsafk\.workers\.dev/') 'AFK destination is incorrect'
    Assert-True ($html -match 'href="/demimedia/"') 'DemiMedia destination must be its product page'
    Assert-True ($html -match 'href="/valclips/"') 'ValClips destination must be its product page'
    Assert-True ($html -notmatch 'github\.com/allusionsafk/valclips') 'The private ValClips repository must not be linked'
    Assert-True ($html -notmatch 'Adaptive Media|Demi Player|Allusions — Independent software studio') 'Stale public identity text remains in index.html'
    Assert-True ($html -notmatch '(?i)friend beta') 'Retired Friend Beta terminology must not appear'
    Assert-True ($html -notmatch '<script(?:\s|>)') 'JavaScript is not permitted in the production candidate'
    Assert-True ($html -notmatch '\sstyle=') 'Inline styles are forbidden by CSP'
    Assert-True ($html -notmatch '(?i)(?:src|href)="https?://[^\"]+\.(?:js|css|woff2?|ttf|otf)') 'Remote executable or font assets are forbidden'
    Assert-True ($html -match '<link\s+rel="icon"\s+href="assets/favicon\.svg"') 'Self-hosted favicon link is missing'
    # Real captures only: every product image exists, has text and dimensions, and says which build it shows.
    $provenancePath = Join-Path $siteRoot 'assets/captures/PROVENANCE.md'
    $provenance = if (Test-Path -LiteralPath $provenancePath) { Get-Content -LiteralPath $provenancePath -Raw } else { '' }
    $figures = [regex]::Matches($html, '(?s)<figure[^>]*>.*?</figure>')
    Assert-True ($figures.Count -eq 3) 'Each product must show exactly one real capture'
    foreach ($figure in $figures) {
        $img = [regex]::Match($figure.Value, '<img[^>]+>').Value
        foreach ($file in [regex]::Matches($figure.Value, 'assets/captures/[a-z-]+\.webp')) {
            Assert-True (Test-Path -LiteralPath (Join-Path $siteRoot $file.Value)) "Missing capture file $($file.Value)"
        }
        Assert-True ($img -match 'alt="[^"]{40,}"') "Capture needs descriptive alt text: $img"
        Assert-True ($img -match 'width="\d+"' -and $img -match 'height="\d+"') "Capture needs intrinsic dimensions: $img"
        Assert-True ($figure.Value -match '<figcaption>[^<]*(?:<span class="machine">[0-9a-f]{7}</span>)') 'Every capture caption must name the build it shows'
        foreach ($src in [regex]::Matches($img, 'assets/captures/([a-z-]+)-(?:800|1600)\.webp')) {
            Assert-True (Test-Path -LiteralPath (Join-Path $siteRoot "assets/captures/$($src.Groups[1].Value)-1600.webp")) "Missing capture $($src.Value)"
            Assert-True ($provenance -match [regex]::Escape("$($src.Groups[1].Value)-*.webp")) "Capture $($src.Groups[1].Value) has no provenance entry"
        }
    }
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
    Assert-True ($css -match 'prefers-reduced-motion:\s*(?:reduce|no-preference)') 'Reduced-motion handling is missing'
    Assert-True ($css -match 'min-height:\s*44px') 'Interactive targets must provide a practical 44px minimum height'
    Assert-True ($css -notmatch '(?i)url\(["'']?https?://') 'CSS must not load remote assets'
    Assert-True ($css -match '(?s)\.skip-link\s*\{[^}]*background:\s*var\(--ink\);[^}]*color:\s*var\(--paper\)') 'Skip link must keep paper-on-ink contrast'
    Assert-True ($css -notmatch '(?i)oklch\([^)]*\s0\.0*[1-9]') 'The studio frame must stay achromatic'
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

# Product pages hosted in this repository: each is a real, separate page with its own stylesheet,
# real captures listed in its own PROVENANCE.md, and the same CSP and no-script rules.
foreach ($product in @(@{ Dir = 'demimedia'; Title = 'DemiMedia' }, @{ Dir = 'valclips'; Title = 'ValClips' })) {
    $page = Join-Path $siteRoot "$($product.Dir)/index.html"
    Assert-True (Test-Path -LiteralPath $page) "$($product.Title) page is missing"
    if (-not (Test-Path -LiteralPath $page)) { continue }
    $p = Get-Content -LiteralPath $page -Raw
    $prov = Join-Path $siteRoot "$($product.Dir)/captures/PROVENANCE.md"
    $provText = if (Test-Path -LiteralPath $prov) { Get-Content -LiteralPath $prov -Raw } else { '' }
    Assert-True ([regex]::Matches($p, '<h1(?:\s|>)').Count -eq 1) "$($product.Title) page must have one H1"
    Assert-True ($p -match "default-src 'none'") "$($product.Title) page must carry the default-deny CSP"
    Assert-True ($p -notmatch '<script(?:\s|>)|\sstyle=') "$($product.Title) page must not use scripts or inline styles"
    Assert-True ($p -match ('href="/{0}/{0}\.css"' -f $product.Dir)) "$($product.Title) page must use its own stylesheet"
    Assert-True ($p -match 'href="/"') "$($product.Title) page must link back to the studio"
    Assert-True ($p -match 'status as of \d{1,2} \w+ \d{4}') "$($product.Title) page must date its status"
    foreach ($figure in [regex]::Matches($p, '(?s)<figure[^>]*>.*?</figure>')) {
        $img = [regex]::Match($figure.Value, '<img[^>]+>').Value
        Assert-True ($img -match 'alt="[^"]{40,}"' -and $img -match 'width="\d+"' -and $img -match 'height="\d+"') "$($product.Title) capture needs alt text and dimensions: $img"
        Assert-True ($figure.Value -match '<figcaption>') "$($product.Title) capture needs a caption"
        foreach ($file in [regex]::Matches($figure.Value, "/$($product.Dir)/captures/([a-z-]+?)-(?:\d{3,4}|phone)\.webp")) {
            Assert-True (Test-Path -LiteralPath (Join-Path $siteRoot $file.Value.TrimStart('/'))) "Missing capture file $($file.Value)"
            Assert-True ($provText -match [regex]::Escape("$($file.Groups[1].Value)-*.webp")) "$($file.Groups[1].Value) has no provenance entry"
        }
    }
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
