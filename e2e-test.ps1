param([string]$BaseUrl = "http://localhost:5000")

$pass = 0
$fail = 0

function Check {
    param($Name, $Expected, $Actual)
    if ($Actual -eq $Expected) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name -- expected $Expected, got $Actual" -ForegroundColor Red
        $script:fail++
    }
}

function Call {
    param($Method, $Path, $Body = $null)
    $uri = "$BaseUrl$Path"
    try {
        if ($Body) {
            $json = $Body | ConvertTo-Json
            $data = Invoke-RestMethod -Method $Method -Uri $uri -Body $json -ContentType "application/json" -ErrorAction Stop
        } else {
            $data = Invoke-RestMethod -Method $Method -Uri $uri -ContentType "application/json" -ErrorAction Stop
        }
        return @{ Status = 200; Data = $data }
    } catch {
        $status = [int]$_.Exception.Response.StatusCode
        $data = $null
        try { $data = $_.ErrorDetails.Message | ConvertFrom-Json } catch {}
        if ($status -eq 201) { return @{ Status = 201; Data = $data } }
        if ($status -eq 204) { return @{ Status = 204; Data = $null } }
        return @{ Status = $status; Data = $data }
    }
}

function CallRaw {
    param($Method, $Path, $Body = $null)
    $uri = "$BaseUrl$Path"
    try {
        $params = @{ Method = $Method; Uri = $uri; ContentType = "application/json"; ErrorAction = "Stop" }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
        $resp = Invoke-WebRequest @params -UseBasicParsing
        $data = $null
        try { $data = $resp.Content | ConvertFrom-Json } catch {}
        return @{ Status = [int]$resp.StatusCode; Data = $data }
    } catch {
        $status = [int]$_.Exception.Response.StatusCode
        $data = $null
        try {
            $content = $_.ErrorDetails.Message
            $data = $content | ConvertFrom-Json
        } catch {}
        return @{ Status = $status; Data = $data }
    }
}

Write-Host ""
Write-Host "Checking API at $BaseUrl..." -ForegroundColor Cyan
$ping = & curl.exe -s -o NUL -w "%{http_code}" "$BaseUrl/api/people" 2>&1
if ($ping -eq "200") {
    Write-Host "  API is running" -ForegroundColor Green
} else {
    Write-Host "  API not running at $BaseUrl (got: $ping)" -ForegroundColor Red
    exit 1
}

# People
Write-Host ""
Write-Host "People" -ForegroundColor Cyan

$r = CallRaw POST "/api/people" @{ name = "Alice"; age = 30 }
Check "POST adult returns 201" 201 $r.Status
$alice = $r.Data

$r = CallRaw POST "/api/people" @{ name = "Bob"; age = 16 }
Check "POST minor returns 201" 201 $r.Status
$bob = $r.Data

$r = CallRaw POST "/api/people" @{ name = "Carol"; age = 18 }
Check "POST exactly 18 returns 201" 201 $r.Status
$carol = $r.Data

$r = CallRaw POST "/api/people" @{ name = ""; age = 25 }
Check "POST empty name returns 422" 422 $r.Status

$r = CallRaw GET "/api/people"
Check "GET all people returns 200" 200 $r.Status
Check "GET all people has items" $true ($r.Data.items.Count -gt 0)

$r = CallRaw GET "/api/people/$($alice.id)"
Check "GET person by id returns 200" 200 $r.Status

$r = CallRaw GET "/api/people/999999"
Check "GET non-existent person returns 404" 404 $r.Status

$r = CallRaw PUT "/api/people/$($alice.id)" @{ name = "Alice Updated"; age = 31 }
Check "PUT person returns 204" 204 $r.Status

# Categories
Write-Host ""
Write-Host "Categories" -ForegroundColor Cyan

$r = CallRaw POST "/api/categories" @{ name = "Salary"; purpose = 1 }
Check "POST Income category returns 201" 201 $r.Status
$catIncome = $r.Data

$r = CallRaw POST "/api/categories" @{ name = "Groceries"; purpose = 0 }
Check "POST Expense category returns 201" 201 $r.Status
$catExpense = $r.Data

$r = CallRaw POST "/api/categories" @{ name = "General"; purpose = 2 }
Check "POST Both category returns 201" 201 $r.Status
$catBoth = $r.Data

$r = CallRaw POST "/api/categories" @{ name = ""; purpose = 0 }
Check "POST empty name returns 422" 422 $r.Status

$r = CallRaw GET "/api/categories"
Check "GET all categories returns 200" 200 $r.Status

# Transactions
Write-Host ""
Write-Host "Transactions" -ForegroundColor Cyan

$today = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$r = CallRaw POST "/api/transactions" @{ description = "Paycheck"; amount = 3000; date = $today; type = 1; personId = $alice.id; categoryId = $catIncome.id }
Check "Adult + Income + Income category = 201" 201 $r.Status
$tx1 = $r.Data

$r = CallRaw POST "/api/transactions" @{ description = "Groceries bill"; amount = 150; date = $today; type = 0; personId = $alice.id; categoryId = $catExpense.id }
Check "Adult + Expense + Expense category = 201" 201 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Lunch"; amount = 20; date = $today; type = 0; personId = $bob.id; categoryId = $catExpense.id }
Check "Minor + Expense = 201" 201 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Carol paycheck"; amount = 1000; date = $today; type = 1; personId = $carol.id; categoryId = $catIncome.id }
Check "Exactly 18 + Income = 201" 201 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Both cat income"; amount = 200; date = $today; type = 1; personId = $alice.id; categoryId = $catBoth.id }
Check "Both category + Income = 201" 201 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Both cat expense"; amount = 80; date = $today; type = 0; personId = $alice.id; categoryId = $catBoth.id }
Check "Both category + Expense = 201" 201 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Minor salary"; amount = 1000; date = $today; type = 1; personId = $bob.id; categoryId = $catIncome.id }
Check "Minor + Income type = 422 (business rule)" 422 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Wrong 1"; amount = 100; date = $today; type = 0; personId = $alice.id; categoryId = $catIncome.id }
Check "Expense type + Income-only category = 422" 422 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Wrong 2"; amount = 100; date = $today; type = 1; personId = $alice.id; categoryId = $catExpense.id }
Check "Income type + Expense-only category = 422" 422 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = ""; amount = 100; date = $today; type = 0; personId = $alice.id; categoryId = $catExpense.id }
Check "Empty description = 422" 422 $r.Status

$r = CallRaw POST "/api/transactions" @{ description = "Zero"; amount = 0; date = $today; type = 0; personId = $alice.id; categoryId = $catExpense.id }
Check "Amount = 0 = 422" 422 $r.Status

$r = CallRaw GET "/api/transactions"
Check "GET all transactions returns 200" 200 $r.Status
Check "GET all transactions has items" $true ($r.Data.items.Count -gt 0)

$r = CallRaw GET "/api/transactions/$($tx1.id)"
Check "GET transaction by id returns 200" 200 $r.Status

$r = CallRaw PUT "/api/transactions/$($tx1.id)" @{ description = "Paycheck Updated"; amount = 3100; date = $today; type = 1; personId = $alice.id; categoryId = $catIncome.id }
Check "PUT transaction returns 204" 204 $r.Status

$r = CallRaw DELETE "/api/transactions/$($tx1.id)"
Check "DELETE transaction returns 204" 204 $r.Status

$r = CallRaw GET "/api/transactions/$($tx1.id)"
Check "GET deleted transaction returns 404" 404 $r.Status

# Reports
Write-Host ""
Write-Host "Reports" -ForegroundColor Cyan

$r = CallRaw GET "/api/reports/by-person"
Check "GET report by person returns 200" 200 $r.Status
Check "Report grand balance is correct" $true ($r.Data.grandBalance -eq ($r.Data.grandTotalIncome - $r.Data.grandTotalExpense))

$r = CallRaw GET "/api/reports/by-category"
Check "GET report by category returns 200" 200 $r.Status

# Cascade delete
Write-Host ""
Write-Host "Cascade delete" -ForegroundColor Cyan

$r = CallRaw POST "/api/people" @{ name = "WillDelete"; age = 25 }
$del = $r.Data
CallRaw POST "/api/transactions" @{ description = "Cascade test"; amount = 10; date = $today; type = 0; personId = $del.id; categoryId = $catExpense.id } | Out-Null

$r = CallRaw DELETE "/api/people/$($del.id)"
Check "DELETE person with transactions returns 204" 204 $r.Status

$r = CallRaw DELETE "/api/people/999999"
Check "DELETE non-existent person returns 404" 404 $r.Status

# Summary
Write-Host ""
Write-Host "-------------------------------------" -ForegroundColor DarkGray
$total = $pass + $fail
if ($fail -eq 0) {
    Write-Host "Results: $pass/$total passed" -ForegroundColor Green
} else {
    Write-Host "Results: $pass/$total passed, $fail failed" -ForegroundColor Yellow
    exit 1
}

