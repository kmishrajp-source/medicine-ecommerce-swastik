param (
    [string]$TargetURL = "https://medicine-ecommerce-swastik.vercel.app/en",
    [string]$DatabaseURL = ""
)

Write-Output "---------------------------------------------------"
Write-Output "🚀 SWASTIK MEDICARE REGRESSION TESTING SYSTEM"
Write-Output "---------------------------------------------------"

# 1. Check Dependencies
if (!(Get-Command npx -ErrorAction SilentlyContinue)) {
    echo "❌ NPX not found. Please install Node.js."
    exit 1
}

# 2. Set Environment Variables
$env:TEST_URL = $TargetURL
if ($DatabaseURL -ne "") {
    $env:PRISMA_DATABASE_URL = $DatabaseURL
}

Write-Output "📍 Target URL: $TargetURL"
Write-Output "🔄 Syncing Prisma Client..."
npx.cmd prisma generate

Write-Output "📦 Running Playwright Modules..."

# 3. Execute Tests
npx.cmd playwright test --project=chromium --reporter=html

if ($LASTEXITCODE -eq 0) {
    Write-Output "✅ REGRESSION PASSED"
} else {
    Write-Output "❌ REGRESSION FAILED - Check 'playwright-report/index.html' for details"
}

# 4. Open Report (Optional)
# npx.cmd playwright show-report
