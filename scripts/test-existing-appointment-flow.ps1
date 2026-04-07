$ErrorActionPreference = "Stop"

$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:5000" }
$AUTH_URL = if ($env:AUTH_URL) { $env:AUTH_URL } else { "http://localhost:5001" }

$PATIENT_EMAIL = if ($env:PATIENT_EMAIL) { $env:PATIENT_EMAIL } else { "your_email_here" }
$PATIENT_PASSWORD = if ($env:PATIENT_PASSWORD) { $env:PATIENT_PASSWORD } else { "your_password_here" }

$APPOINTMENT_ID = if ($env:APPOINTMENT_ID) { [int]$env:APPOINTMENT_ID } else { 27 }
$EXPECTED_INVOICE_ID = if ($env:EXPECTED_INVOICE_ID) { [int]$env:EXPECTED_INVOICE_ID } else { 24 }
$EXPECTED_AMOUNT = if ($env:EXPECTED_AMOUNT) { [decimal]$env:EXPECTED_AMOUNT } else { 200 }
$EXPECTED_STATUS = if ($env:EXPECTED_STATUS) { $env:EXPECTED_STATUS } else { "UNPAID" }

Write-Host "== MyHeart existing appointment verification =="

Write-Host "1) Logging in directly through auth-service..."
$loginBody = @{
    email    = $PATIENT_EMAIL
    password = $PATIENT_PASSWORD
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec 20
$token = $loginResponse.token

if (-not $token) {
    throw "Token not found in login response"
}

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "2) Fetching appointment details through gateway..."
$appointmentDetails = Invoke-RestMethod -Uri "$BASE_URL/api/appointments/$APPOINTMENT_ID/details" -Method Get -Headers $headers -TimeoutSec 20

if (-not $appointmentDetails.appointment) {
    throw "Appointment details missing 'appointment'"
}

if ([int]$appointmentDetails.appointment.id -ne $APPOINTMENT_ID) {
    throw "Appointment id $($appointmentDetails.appointment.id) != expected $APPOINTMENT_ID"
}

Write-Host "Appointment details check passed"

Write-Host "3) Fetching invoice by appointment through gateway..."
$invoice = Invoke-RestMethod -Uri "$BASE_URL/api/billing/appointment/$APPOINTMENT_ID" -Method Get -Headers $headers -TimeoutSec 20

if (-not $invoice) {
    throw "Invoice response is empty/null"
}

if ([int]$invoice.id -ne $EXPECTED_INVOICE_ID) {
    throw "Invoice id $($invoice.id) != expected $EXPECTED_INVOICE_ID"
}

if ([decimal]$invoice.amount -ne $EXPECTED_AMOUNT) {
    throw "Invoice amount $($invoice.amount) != expected $EXPECTED_AMOUNT"
}

if ($invoice.status.ToUpper() -ne $EXPECTED_STATUS.ToUpper()) {
    throw "Invoice status $($invoice.status) != expected $EXPECTED_STATUS"
}

Write-Host "Invoice check passed"
Write-Host "SUCCESS: existing appointment -> invoice verification passed"