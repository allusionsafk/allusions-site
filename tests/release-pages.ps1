#Requires -Version 7.0
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$origins = 'https://allusions.pages.dev', 'https://allusions-site.pages.dev'
$handler = [Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(30)
$client.MaxResponseContentBufferSize = 1MB
$pwsh = (Get-Process -Id $PID).Path

function Test-ProxyRoute([string]$Origin, [string]$Method, [string]$Path, [scriptblock]$Check) {
    $request = [Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Method), "$Origin$Path")
    $response = $null
    try {
        $completion = if ($Path -eq '/ai/') { 'ResponseContentRead' } else { 'ResponseHeadersRead' }
        try { $response = $client.SendAsync($request, $completion).GetAwaiter().GetResult() }
        catch {
            Write-Host "UNAVAILABLE $Method $Path — $($_.Exception.GetBaseException().Message)"
            return 2
        }
        if (& $Check $response) {
            Write-Host "PASS $Method $Path"
            return 0
        }
        Write-Host "FAIL $Method $Path — HTTP $([int]$response.StatusCode), expected route contract did not match"
        return 1
    } finally {
        if ($response) { $response.Dispose() }
        $request.Dispose()
    }
}

try {
    $results = foreach ($origin in $origins) {
        Write-Host "`nChecking $origin"
        & $pwsh -NoProfile -File (Join-Path $PSScriptRoot 'release-identity.ps1') -Origin $origin -HashDownloads | Out-Host
        $identityExit = $LASTEXITCODE
        if ($identityExit -notin 0, 1, 2) { $identityExit = 1 }
        $identityExit

        Test-ProxyRoute $origin GET '/ai?release-check=1' {
            param($response)
            [int]$response.StatusCode -eq 308 -and
                $response.Headers.Location.OriginalString -ceq "$origin/ai/?release-check=1"
        }
        Test-ProxyRoute $origin GET '/ai/' {
            param($response)
            if ([int]$response.StatusCode -ne 200 -or $response.Content.Headers.ContentType.MediaType -ne 'text/html') { return $false }
            $html = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            $html.Contains('href="/ai/download"') -and $html.Contains('href="/ai/assets/afk.css"')
        }
        Test-ProxyRoute $origin GET '/ai/assets/afk.css' {
            param($response)
            [int]$response.StatusCode -eq 200 -and $response.Content.Headers.ContentType.MediaType -eq 'text/css'
        }
        Test-ProxyRoute $origin HEAD '/ai/download?release-check=1' {
            param($response)
            [int]$response.StatusCode -eq 200 -and
                $response.Content.Headers.ContentType.MediaType -eq 'application/octet-stream' -and
                $response.Content.Headers.ContentDisposition.DispositionType -eq 'attachment' -and
                $response.Content.Headers.ContentDisposition.FileName -match '^"?AFKLocalAISetup-.+-x64\.exe"?$' -and
                $response.Content.Headers.ContentLength -gt 0
        }
    }
} finally {
    $client.Dispose()
}

if ($results -contains 1) { exit 1 }
if ($results -contains 2) { exit 2 }
exit 0
