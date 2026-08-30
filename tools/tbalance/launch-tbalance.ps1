param(
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$Port = 8788
$HostAddress = "127.0.0.1"
$TBalancePath = "/tools/tbalance/index.html"
$TBalanceUrl = "http://${HostAddress}:${Port}${TBalancePath}"
$ServerScript = Join-Path $PSScriptRoot "serve-tbalance-local.cjs"
$FailureMessage = -join (84,66,97,108,97,110,99,101,12398,12525,12540,12459,12523,12469,12540,12496,12540,12434,36215,21205,12391,12365,12414,12379,12435,12391,12375,12383 | ForEach-Object { [char]$_ })

function Show-Failure {
  param([string]$Detail)

  $message = $FailureMessage
  if ($Detail) {
    $message = "$message`n`n$Detail"
  }

  Write-Host $message
  try {
    Add-Type -AssemblyName PresentationFramework -ErrorAction Stop
    [System.Windows.MessageBox]::Show($message, "TBalance", "OK", "Error") | Out-Null
  } catch {
    Read-Host "Press Enter to close"
  }
}

function Test-TBalanceServer {
  try {
    $response = Invoke-WebRequest -Uri $TBalanceUrl -UseBasicParsing -TimeoutSec 2
    return ($response.StatusCode -eq 200 -and $response.Content -match "TBalance Editor UI")
  } catch {
    return $false
  }
}

function Get-PortOwner {
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    return $null
  }

  $owner = $connections | Select-Object -First 1
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($owner.OwningProcess)" -ErrorAction SilentlyContinue
  [pscustomobject]@{
    LocalAddress = $owner.LocalAddress
    ProcessId = $owner.OwningProcess
    CommandLine = $process.CommandLine
  }
}

if (Test-TBalanceServer) {
  if (-not $NoBrowser) {
    Start-Process $TBalanceUrl
  }
  exit 0
}

$owner = Get-PortOwner
if ($owner) {
  Show-Failure "127.0.0.1:$Port is already used by another process.`nPID: $($owner.ProcessId)`n$($owner.CommandLine)"
  exit 1
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  Show-Failure "Node.js was not found. Install Node.js or add it to PATH."
  exit 1
}

if (-not (Test-Path $ServerScript)) {
  Show-Failure "Server script was not found: $ServerScript"
  exit 1
}

try {
  $nodeArgs = '"{0}" "{1}" {2} {3}' -f $ServerScript, $RepoRoot, $HostAddress, $Port
  Start-Process -FilePath $nodeCommand.Source -ArgumentList $nodeArgs -WorkingDirectory $RepoRoot -WindowStyle Hidden | Out-Null
} catch {
  Show-Failure $_.Exception.Message
  exit 1
}

$started = $false
for ($i = 0; $i -lt 24; $i++) {
  Start-Sleep -Milliseconds 250
  if (Test-TBalanceServer) {
    $started = $true
    break
  }
}

if (-not $started) {
  Show-Failure "Could not connect to $TBalanceUrl after starting the server."
  exit 1
}

if (-not $NoBrowser) {
  Start-Process $TBalanceUrl
}
