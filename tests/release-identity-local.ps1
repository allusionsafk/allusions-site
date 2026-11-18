# Run with pwsh -NoProfile -File tests/release-identity-local.ps1.
$ErrorActionPreference = 'Stop'
$checker = Join-Path $PSScriptRoot 'release-identity.ps1'
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('allusions-release-' + [guid]::NewGuid())
$requests = [System.Collections.Generic.List[string]]::new()

function Invoke-WebRequest {
    param([string]$Uri)
    $requests.Add($Uri)
    return [pscustomobject]@{ Content = 'live replacement' }
}
function Invoke-RestMethod {
    param([string]$Uri)
    $requests.Add($Uri)
    return $null
}

function Assert-LocalFailure([string]$Expected) {
    $requests.Clear()
    $result = & $checker -SiteRoot $fixture -Origin 'https://example.invalid'
    if ($LASTEXITCODE -ne 1 -or ($result -join "`n") -notlike "*$Expected*") {
        throw "Expected local failure: $Expected. Got: $result"
    }
    if ($requests.Count -ne 0) { throw 'Invalid local input caused a network request.' }
}

try {
    New-Item -ItemType Directory -Path (Join-Path $fixture 'quire') | Out-Null
    Assert-LocalFailure 'Required local page is missing'
    Set-Content -LiteralPath (Join-Path $fixture 'index.html') -Value '<html>Local studio</html>'
    Assert-LocalFailure 'Required local page is missing'
    Set-Content -LiteralPath (Join-Path $fixture 'quire/index.html') -Value ' '
    Assert-LocalFailure 'Required local page is empty'
    Set-Content -LiteralPath (Join-Path $fixture 'quire/index.html') -Value '<html>Local Quire</html>'
    $requests.Clear()
    & $checker -SiteRoot $fixture -Origin 'https://example.invalid' | Out-Null
    if ($requests -notcontains 'https://example.invalid/ai/' -or
        $requests -contains 'https://example.invalid/' -or
        $requests -contains 'https://example.invalid/quire/') {
        throw 'Local pages and the live AFK proxy were not kept separate.'
    }
    Write-Output 'Release identity local mode: four regression cases passed.'
} finally {
    if (Test-Path -LiteralPath $fixture) {
        Get-ChildItem -LiteralPath (Join-Path $fixture 'quire') -File | Remove-Item
        Remove-Item -LiteralPath (Join-Path $fixture 'quire')
        if (Test-Path -LiteralPath (Join-Path $fixture 'index.html')) {
            Remove-Item -LiteralPath (Join-Path $fixture 'index.html')
        }
        Remove-Item -LiteralPath $fixture
    }
}
