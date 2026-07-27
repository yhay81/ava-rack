param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = 'Stop'
$key = '4a949d1a7bb34f61ad64306ed0f40582'
$hostName = ([Uri]$BaseUrl).Host
$body = @{
  host = $hostName
  key = $key
  keyLocation = "$BaseUrl/$key.txt"
  urlList = @(
    "$BaseUrl/",
    "$BaseUrl/about",
    "$BaseUrl/privacy"
  )
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri 'https://api.indexnow.org/indexnow' `
  -Method Post `
  -ContentType 'application/json; charset=utf-8' `
  -Body $body
