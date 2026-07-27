$ErrorActionPreference = 'Stop'

$required = @(
  'DECISIONS.md',
  'EXPERIMENT.md',
  'METRICS.md',
  'PRIVACY.md',
  'SECURITY.md',
  'STACK.md',
  'public/app.css',
  'public/app.js'
)

foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required release file: $path"
  }
}

$surfacePaths = @('src/ui', 'public/app.js', 'public/app.css')
$surfaceText = foreach ($path in $surfacePaths) {
  if (Test-Path -LiteralPath $path -PathType Container) {
    Get-ChildItem -LiteralPath $path -File -Recurse | Get-Content -Raw
  } else {
    Get-Content -Raw -LiteralPath $path
  }
}
$joinedSurface = $surfaceText -join "`n"
if ($joinedSurface -match 'style=') {
  throw 'Inline style attributes are not permitted.'
}
if ($joinedSurface -match '21日|MVP|実験中|収益性|検証プロジェクト') {
  throw 'Experiment or portfolio meta copy leaked into the product surface.'
}

$client = Get-Content -Raw -LiteralPath 'public/app.js'
if ($client -notmatch 'https://booth\.pm/ja/search/') {
  throw 'The official BOOTH search route is missing.'
}
if ($client -match 'api\.booth|fetch\(["'']https://booth') {
  throw 'Client code must not fetch or index BOOTH product data.'
}

Write-Output 'Release contract passed: local-only route builder.'
