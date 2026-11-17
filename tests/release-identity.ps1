<#
.SYNOPSIS
  Live check that what the ALLUSIONS pages advertise is what a visitor actually downloads.

.DESCRIPTION
  For each released product it compares, across repository boundaries:
    advertised version, file name, size and SHA-256 (from the pages a visitor reads)
    the GitHub release record (tag, asset size, asset digest)
    the download endpoint a visitor clicks (redirect target or served headers)
  and, with -HashDownloads, the SHA-256 of the bytes actually served.

  Every check ends PASS, FAIL or UNAVAILABLE. UNAVAILABLE means the evidence could not be
  obtained (network, rate limit, endpoint down); it is never counted as PASS or as FAIL.
  Exit code: 0 all PASS; 1 any FAIL; 2 no FAIL but some UNAVAILABLE.

  Needs network access. It reads public pages and the public GitHub API only; it sends no
  credentials (set GITHUB_TOKEN only to lift the anonymous API rate limit).

.EXAMPLE
  pwsh -File tests/release-identity.ps1
  pwsh -File tests/release-identity.ps1 -HashDownloads
  pwsh -File tests/release-identity.ps1 -SiteRoot .     # read the Quire/studio pages from this checkout instead of production
#>
param(
    [string]$Origin = 'https://allusions.pages.dev',
    [string]$SiteRoot,
    [switch]$HashDownloads
)

$ErrorActionPreference = 'Stop'
$results = [System.Collections.Generic.List[object]]::new()
function Add-Result([string]$Product, [string]$Check, [string]$Status, [string]$Detail) {
    $results.Add([pscustomobject]@{ Product = $Product; Check = $Check; Status = $Status; Detail = $Detail })
}
function Compare-Fact([string]$Product, [string]$Check, $Advertised, $Actual) {
    if ($null -eq $Actual -or "$Actual" -eq '') { Add-Result $Product $Check 'UNAVAILABLE' "advertised '$Advertised'; no evidence obtained"; return }
    if ($null -eq $Advertised -or "$Advertised" -eq '') { Add-Result $Product $Check 'FAIL' "page does not state it; actual '$Actual'"; return }
    $ok = "$Advertised".Trim().ToLowerInvariant() -eq "$Actual".Trim().ToLowerInvariant()
    Add-Result $Product $Check ($(if ($ok) { 'PASS' } else { 'FAIL' })) "advertised '$Advertised'; actual '$Actual'"
}
function Get-Page([string]$Path) {
    if ($SiteRoot) {
        $local = Join-Path $SiteRoot (($Path.Trim('/')), 'index.html' -join '/').TrimStart('/')
        if (Test-Path -LiteralPath $local) { return Get-Content -LiteralPath $local -Raw }
    }
    try { return (Invoke-WebRequest -Uri "$Origin$Path" -TimeoutSec 30).Content } catch { return $null }
}
function Get-Release([string]$Repo, [string]$Tag) {
    $uri = if ($Tag) { "https://api.github.com/repos/$Repo/releases/tags/$Tag" } else { "https://api.github.com/repos/$Repo/releases/latest" }
    $headers = @{ 'User-Agent' = 'allusions-release-identity'; 'Accept' = 'application/vnd.github+json' }
    if ($env:GITHUB_TOKEN) { $headers['Authorization'] = "Bearer $env:GITHUB_TOKEN" }
    try { return Invoke-RestMethod -Uri $uri -Headers $headers -TimeoutSec 30 } catch { return $null }
}
function Get-Head([string]$Uri) {
    # One hop, no redirect following: we want to see where a visitor is sent.
    # PowerShell 7 returns the 3xx response but also raises a non-terminating "maximum redirection"
    # error; silence that one, and treat a missing response (network failure) as no evidence.
    try {
        $r = Invoke-WebRequest -Uri $Uri -Method Head -MaximumRedirection 0 -SkipHttpErrorCheck -TimeoutSec 60 -ErrorAction SilentlyContinue
        if (-not $r) { return $null }
        return [pscustomobject]@{ Status = [int]$r.StatusCode; Headers = $r.Headers }
    } catch { return $null }
}
function First([object]$Value) { if ($Value -is [array]) { return $Value[0] } return $Value }
function Get-Sha256Of([string]$Uri) {
    $tmp = New-TemporaryFile
    try {
        Invoke-WebRequest -Uri $Uri -OutFile $tmp -TimeoutSec 900 | Out-Null
        return [pscustomobject]@{ Sha = (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLowerInvariant(); Bytes = (Get-Item -LiteralPath $tmp).Length }
    } catch { return $null } finally { Remove-Item -LiteralPath $tmp -ErrorAction SilentlyContinue }
}
function Match1([string]$Text, [string]$Pattern) { if (-not $Text) { return $null }; $m = [regex]::Match($Text, $Pattern); if ($m.Success) { $m.Groups[1].Value } else { $null } }

$studio = Get-Page '/'
if (-not $studio) { Add-Result 'Studio' 'studio page reachable' 'UNAVAILABLE' "$Origin/ could not be read" }

# ---------------------------------------------------------------- Quire
$quirePage = Get-Page '/quire/'
if (-not $quirePage) {
    Add-Result 'Quire' 'product page reachable' 'UNAVAILABLE' "$Origin/quire/ could not be read"
} else {
    $adv = @{
        Version = Match1 $quirePage '<dt>Version</dt><dd><span class="machine">(\d+\.\d+\.\d+)</span>'
        Bytes   = (Match1 $quirePage 'Quire\.exe</span>, ([\d,]+) bytes') -replace ',', ''
        Sha     = Match1 $quirePage 'class="machine hash">([0-9a-f]{64})<'
        Href    = Match1 $quirePage 'class="button" href="([^"]+Quire\.exe)"'
    }
    Compare-Fact 'Quire' 'headline version = download facts' (Match1 $quirePage 'Released · <span class="machine">(\d+\.\d+\.\d+)</span>') $adv.Version
    if ($studio) { Compare-Fact 'Quire' 'studio register version' (Match1 $studio '(?s)id="qr-title".*?Released · <span class="machine">(\d+\.\d+\.\d+)</span>') $adv.Version }

    $rel = Get-Release 'allusionsafk/quire-download'
    if (-not $rel) {
        Add-Result 'Quire' 'public release record' 'UNAVAILABLE' 'GitHub API did not answer (network or rate limit)'
    } else {
        $asset = $rel.assets | Where-Object name -eq 'Quire.exe' | Select-Object -First 1
        Compare-Fact 'Quire' 'version = latest public release' $adv.Version ($rel.tag_name -replace '^v', '')
        Compare-Fact 'Quire' 'size = release asset' $adv.Bytes $asset.size
        Compare-Fact 'Quire' 'SHA-256 = release asset digest' $adv.Sha ($asset.digest -replace '^sha256:', '')
        Add-Result 'Quire' 'latest release is not a prerelease' ($(if ($rel.prerelease) { 'FAIL' } else { 'PASS' })) "tag $($rel.tag_name)"
    }

    if ($adv.Href) {
        $head = Get-Head $adv.Href
        if (-not $head) { Add-Result 'Quire' 'download link resolves' 'UNAVAILABLE' "$($adv.Href) did not answer" }
        else {
            $location = First $head.Headers['Location']
            Compare-Fact 'Quire' 'download link resolves to advertised tag' "v$($adv.Version)" (Match1 "$location" '/releases/download/(v[^/]+)/')
        }
        if ($HashDownloads) {
            $got = Get-Sha256Of $adv.Href
            Compare-Fact 'Quire' 'served bytes SHA-256' $adv.Sha $got.Sha
            Compare-Fact 'Quire' 'served bytes size' $adv.Bytes $got.Bytes
        }
    } else { Add-Result 'Quire' 'download link present' 'FAIL' 'no Quire.exe download button on the page' }
}

# ---------------------------------------------------------------- AFK AI
# The AFK page lives in afk-ai-site and is served under /ai/ by the studio's proxy; always read it live.
$afkPage = try { (Invoke-WebRequest -Uri "$Origin/ai/" -TimeoutSec 30).Content } catch { $null }
if (-not $afkPage) {
    Add-Result 'AFK AI' 'product page reachable' 'UNAVAILABLE' "$Origin/ai/ could not be read"
} else {
    $afkVersion = Match1 $afkPage 'class="file">Beta <span class="machine">([0-9][^<]*)</span>'
    $afkFile = Match1 $afkPage 'class="file">Beta <span class="machine">[^<]*</span>[^<]*<span class="machine">([^<]+\.exe)</span>'
    if ($studio) { Compare-Fact 'AFK AI' 'studio register version' (Match1 $studio '(?s)id="afk-title".*?Beta · <span class="machine">([^<]+)</span>') $afkVersion }

    $rel = if ($afkVersion) { Get-Release 'allusionsafk/afk-ai' "v$afkVersion" } else { $null }
    $asset = $null
    if (-not $afkVersion) { Add-Result 'AFK AI' 'advertised version' 'FAIL' 'no version found on the page' }
    elseif (-not $rel) { Add-Result 'AFK AI' 'release record for advertised version' 'UNAVAILABLE' "no answer for tag v$afkVersion (missing tag, network or rate limit)" }
    else {
        $asset = $rel.assets | Where-Object name -eq $afkFile | Select-Object -First 1
        Add-Result 'AFK AI' 'advertised file is a release asset' ($(if ($asset) { 'PASS' } else { 'FAIL' })) "$afkFile in v$afkVersion"
        Add-Result 'AFK AI' 'page calls it a Beta and the release is a prerelease' ($(if ($rel.prerelease) { 'PASS' } else { 'FAIL' })) "prerelease=$($rel.prerelease)"
    }

    $head = Get-Head "$Origin/ai/download"
    if (-not $head) { Add-Result 'AFK AI' 'download endpoint answers' 'UNAVAILABLE' "$Origin/ai/download did not answer" }
    elseif ($head.Status -ne 200) { Add-Result 'AFK AI' 'download endpoint answers' 'FAIL' "HTTP $($head.Status)" }
    else {
        $disposition = First $head.Headers['Content-Disposition']
        Compare-Fact 'AFK AI' 'served file name' $afkFile (Match1 "$disposition" 'filename="([^"]+)"')
        if ($asset) { Compare-Fact 'AFK AI' 'served size = release asset' $asset.size (First $head.Headers['Content-Length']) }
        if ($HashDownloads -and $asset) {
            $got = Get-Sha256Of "$Origin/ai/download"
            Compare-Fact 'AFK AI' 'served bytes SHA-256 = release digest' ($asset.digest -replace '^sha256:', '') $got.Sha
        }
    }
}

$results | Format-Table -AutoSize -Wrap | Out-String -Width 200 | Write-Output
$fail = @($results | Where-Object Status -eq 'FAIL').Count
$unavailable = @($results | Where-Object Status -eq 'UNAVAILABLE').Count
$pass = @($results | Where-Object Status -eq 'PASS').Count
Write-Output "Release identity: $pass pass, $fail fail, $unavailable unavailable."
if ($fail) { exit 1 }
if ($unavailable) { exit 2 }
exit 0
