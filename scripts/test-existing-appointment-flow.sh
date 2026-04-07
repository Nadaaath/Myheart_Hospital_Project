#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
PATIENT_EMAIL="${PATIENT_EMAIL:-your_email_here}"
PATIENT_PASSWORD="${PATIENT_PASSWORD:-your_password_here}"

APPOINTMENT_ID="${APPOINTMENT_ID:-27}"
EXPECTED_INVOICE_ID="${EXPECTED_INVOICE_ID:-24}"
EXPECTED_AMOUNT="${EXPECTED_AMOUNT:-200}"
EXPECTED_STATUS="${EXPECTED_STATUS:-UNPAID}"

echo "== MyHeart existing appointment verification =="

echo "1) Logging in..."
LOGIN_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$PATIENT_EMAIL\",
    \"password\": \"$PATIENT_PASSWORD\"
  }")

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token',''))")

if [ -z "$TOKEN" ]; then
  echo "ERROR: token not found in login response"
  exit 1
fi

echo "2) Fetching appointment details..."
APPOINTMENT_DETAILS=$(curl -sS -X GET "$BASE_URL/api/appointments/$APPOINTMENT_ID/details" \
  -H "Authorization: Bearer $TOKEN")

echo "Appointment details response: $APPOINTMENT_DETAILS"

export APPOINTMENT_DETAILS
export APPOINTMENT_ID

python3 - <<'PY'
import os, json, sys

appointment_id = int(os.environ["APPOINTMENT_ID"])
raw = os.environ["APPOINTMENT_DETAILS"]

try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print("ERROR: appointment details response is not valid JSON")
    sys.exit(1)

if "appointment" not in data:
    print("ERROR: appointment details missing 'appointment'")
    sys.exit(1)

appt = data["appointment"]

if int(appt["id"]) != appointment_id:
    print(f"ERROR: appointment id {appt['id']} != expected {appointment_id}")
    sys.exit(1)

print("Appointment details check passed")
PY

echo "3) Fetching invoice by appointment..."
INVOICE_RESPONSE=$(curl -sS -X GET "$BASE_URL/api/billing/appointment/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Invoice response: $INVOICE_RESPONSE"

export INVOICE_RESPONSE
export EXPECTED_INVOICE_ID
export EXPECTED_AMOUNT
export EXPECTED_STATUS

python3 - <<'PY'
import os, json, sys

raw = os.environ["INVOICE_RESPONSE"]
expected_invoice_id = int(os.environ["EXPECTED_INVOICE_ID"])
expected_amount = float(os.environ["EXPECTED_AMOUNT"])
expected_status = os.environ["EXPECTED_STATUS"]

try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print("ERROR: invoice response is not valid JSON")
    sys.exit(1)

if not data:
    print("ERROR: invoice response is empty/null")
    sys.exit(1)

if int(data["id"]) != expected_invoice_id:
    print(f"ERROR: invoice id {data['id']} != expected {expected_invoice_id}")
    sys.exit(1)

if float(data["amount"]) != expected_amount:
    print(f"ERROR: invoice amount {data['amount']} != expected {expected_amount}")
    sys.exit(1)

if str(data["status"]).upper() != expected_status.upper():
    print(f"ERROR: invoice status {data['status']} != expected {expected_status}")
    sys.exit(1)

print("Invoice check passed")
print("SUCCESS: existing appointment -> invoice verification passed")
PY