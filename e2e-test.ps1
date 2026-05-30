# FinHome — End-to-End Test Script
# Usage: .\e2e-test.ps1 [-BaseUrl "http://localhost:5000"]
param(
    [string]$BaseUrl = "http://localhost:5000"
)

$pass = 0
$fail = 0

function Assert {
    param($Name, $Expected, $Actual, $Body = $null)
    if ($Actual -eq $Expected) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name — expected $Expected, got $Actual" -ForegroundColor Red
        if ($Body) { Write-Host "         $Body" -ForegroundColor DarkRed }
        $script:fail++
    }
}

function Invoke {
    param($Method, $Path, $Body = $null)
    $uri = "$BaseUrl$Path"
    try {
        $params = @{ Method = $Method; Uri = $uri; ContentType = "application/json" }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
        $response = Invoke-WebRequest @params -ErrorAction Stop
        return @{ Status = [int]$response.StatusCode; Data = ($response.Content | ConvertFrom-Json) }
    } catch {
        $status = [int]$_.Exception.Response.StatusCode
        $content = $null
        try { $content = $_.ErrorDetails.Message } catch {}
        return @{ Status = $status; Data = $content }
    }
}

# ─── Check API is up ────────────────────────────────────────────────────────
Write-Host "`nChecking API at $BaseUrl..." -ForegroundColor Cyan
try {
    Invoke-WebRequest "$BaseUrl/swagger" -ErrorAction Stop | Out-Null
    Write-Host "  API is running`n" -ForegroundColor Green
} catch {
    Write-Host "  API is not running. Start with: dotnet run --project backend/FinHome.Api" -ForegroundColor Red
    exit 1
}

# ─── People ─────────────────────────────────────────────────────────────────
Write-Host "People" -ForegroundColor Cyan

$r = Invoke POST "/api/people" @{ name = "Alice"; age = 30 }
Assert "POST /api/people (adult) returns 201"       201 $r.Status
$alice = $r.Data

$r = Invoke POST "/api/people" @{ name = "Bob"; age = 16 }
Assert "POST /api/people (minor) returns 201"       201 $r.Status
$bob = $r.Data

$r = Invoke POST "/api/people" @{ name = "Carol"; age = 18 }
Assert "POST /api/people (exactly 18) returns 201"  201 $r.Status
$carol = $r.Data

$r = Invoke POST "/api/people" @{ name = ""; age = 25 }
Assert "POST /api/people (empty name) returns 422"  422 $r.Status

$r = Invoke GET "/api/people"
Assert "GET /api/people returns 200"                200 $r.Status
Assert "GET /api/people has items"                  $true ($r.Data.items.Count -gt 0)

$r = Invoke GET "/api/people/$($alice.id)"
Assert "GET /api/people/{id} returns 200"           200 $r.Status

$r = Invoke GET "/api/people/999999"
Assert "GET /api/people/{id} not found returns 404" 404 $r.Status

$r = Invoke PUT "/api/people/$($alice.id)" @{ name = "Alice Updated"; age = 31 }
Assert "PUT /api/people/{id} returns 204"           204 $r.Status

# ─── Categories ─────────────────────────────────────────────────────────────
Write-Host "`nCategories" -ForegroundColor Cyan

$r = Invoke POST "/api/categories" @{ name = "Salary";    purpose = 1 }  # Income
Assert "POST /api/categories (Income) returns 201"  201 $r.Status
$catIncome = $r.Data

$r = Invoke POST "/api/categories" @{ name = "Groceries"; purpose = 0 }  # Expense
Assert "POST /api/categories (Expense) returns 201" 201 $r.Status
$catExpense = $r.Data

$r = Invoke POST "/api/categories" @{ name = "General";   purpose = 2 }  # Both
Assert "POST /api/categories (Both) returns 201"    201 $r.Status
$catBoth = $r.Data

$r = Invoke POST "/api/categories" @{ name = ""; purpose = 0 }
Assert "POST /api/categories (empty name) returns 422" 422 $r.Status

$r = Invoke GET "/api/categories"
Assert "GET /api/categories returns 200"            200 $r.Status

# ─── Transactions ────────────────────────────────────────────────────────────
Write-Host "`nTransactions" -ForegroundColor Cyan

$today = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")

# Valid cases
$r = Invoke POST "/api/transactions" @{ description = "Paycheck"; amount = 3000; date = $today; type = 1; personId = $alice.id; categoryId = $catIncome.id }
Assert "POST adult + Income type + Income category → 201"    201 $r.Status
$tx1 = $r.Data

$r = Invoke POST "/api/transactions" @{ description = "Groceries"; amount = 150; date = $today; type = 0; personId = $alice.id; categoryId = $catExpense.id }
Assert "POST adult + Expense type + Expense category → 201"  201 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Misc"; amount = 50; date = $today; type = 0; personId = $bob.id; categoryId = $catExpense.id }
Assert "POST minor + Expense type → 201"                     201 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Both-cat income"; amount = 200; date = $today; type = 1; personId = $alice.id; categoryId = $catBoth.id }
Assert "POST Both category + Income type → 201"              201 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Both-cat expense"; amount = 80; date = $today; type = 0; personId = $alice.id; categoryId = $catBoth.id }
Assert "POST Both category + Expense type → 201"             201 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Carol income"; amount = 1000; date = $today; type = 1; personId = $carol.id; categoryId = $catIncome.id }
Assert "POST exactly 18 + Income type → 201"                 201 $r.Status

# Business rule violations
$r = Invoke POST "/api/transactions" @{ description = "Minor salary"; amount = 1000; date = $today; type = 1; personId = $bob.id; categoryId = $catIncome.id }
Assert "POST minor + Income type → 422 (regra de negócio)"   422 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Wrong cat 1"; amount = 100; date = $today; type = 0; personId = $alice.id; categoryId = $catIncome.id }
Assert "POST Expense type + Income-only category → 422"      422 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Wrong cat 2"; amount = 100; date = $today; type = 1; personId = $alice.id; categoryId = $catExpense.id }
Assert "POST Income type + Expense-only category → 422"      422 $r.Status

# Validation
$r = Invoke POST "/api/transactions" @{ description = ""; amount = 100; date = $today; type = 0; personId = $alice.id; categoryId = $catExpense.id }
Assert "POST empty description → 422"                        422 $r.Status

$r = Invoke POST "/api/transactions" @{ description = "Zero value"; amount = 0; date = $today; type = 0; personId = $alice.id; categoryId = $catExpense.id }
Assert "POST amount = 0 → 422"                               422 $r.Status

$r = Invoke GET "/api/transactions"
Assert "GET /api/transactions returns 200"                   200 $r.Status
Assert "GET /api/transactions has items"                     $true ($r.Data.items.Count -gt 0)

$r = Invoke GET "/api/transactions/$($tx1.id)"
Assert "GET /api/transactions/{id} returns 200"              200 $r.Status

$r = Invoke PUT "/api/transactions/$($tx1.id)" @{ description = "Paycheck Updated"; amount = 3100; date = $today; type = 1; personId = $alice.id; categoryId = $catIncome.id }
Assert "PUT /api/transactions/{id} returns 204"              204 $r.Status

$r = Invoke DELETE "/api/transactions/$($tx1.id)"
Assert "DELETE /api/transactions/{id} returns 204"           204 $r.Status

$r = Invoke GET "/api/transactions/$($tx1.id)"
Assert "GET deleted transaction returns 404"                 404 $r.Status

# ─── Reports ─────────────────────────────────────────────────────────────────
Write-Host "`nReports" -ForegroundColor Cyan

$r = Invoke GET "/api/reports/by-person"
Assert "GET /api/reports/by-person returns 200"             200 $r.Status
Assert "Report has details array"                           $true ($null -ne $r.Data.details)
Assert "Grand totals are consistent" $true ($r.Data.grandBalance -eq ($r.Data.grandTotalIncome - $r.Data.grandTotalExpense))

$r = Invoke GET "/api/reports/by-category"
Assert "GET /api/reports/by-category returns 200"           200 $r.Status

# ─── Cascade delete ──────────────────────────────────────────────────────────
Write-Host "`nCascade delete" -ForegroundColor Cyan

# Create a person with a transaction then delete the person
$r = Invoke POST "/api/people" @{ name = "ToDelete"; age = 25 }
$del = $r.Data
Invoke POST "/api/transactions" @{ description = "Will cascade"; amount = 10; date = $today; type = 0; personId = $del.id; categoryId = $catExpense.id } | Out-Null

$r = Invoke DELETE "/api/people/$($del.id)"
Assert "DELETE person cascades → 204"                       204 $r.Status

$r = Invoke DELETE "/api/people/999999"
Assert "DELETE non-existent person → 404"                   404 $r.Status

# ─── Summary ─────────────────────────────────────────────────────────────────
Write-Host "`n─────────────────────────────────────" -ForegroundColor DarkGray
$total = $pass + $fail
Write-Host "Results: $pass/$total passed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
if ($fail -gt 0) {
    Write-Host "$fail test(s) FAILED" -ForegroundColor Red
    exit 1
}
