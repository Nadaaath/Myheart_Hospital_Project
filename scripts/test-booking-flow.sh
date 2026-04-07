#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
PATIENT_EMAIL="${PATIENT_EMAIL:-testpatient@example.com}"
PATIENT_PASSWORD="${PATIENT_PASSWORD:-Test1234}"
DOCTOR_ID="${DOCTOR_ID:-1}"
SERVICE_ID="${SERVICE_ID:-1}"
APPOINTMENT_DATE="${APPOINTMENT_DATE:-2026-04-20T10:00:00.000Z}"

echo "== MyHeart booking -> invoice workflow test =="

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

echo "2) Creating appointment..."
APPOINTMENT_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"doctor_id\": $DOCTOR_ID,
    \"service_id\": $SERVICE_ID,
    \"appointment_date\": \"$APPOINTMENT_DATE\"
  }")

echo "Appointment response: $APPOINTMENT_RESPONSE"

APPOINTMENT_ID=$(echo "$APPOINTMENT_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id',''))")

if [ -z "$APPOINTMENT_ID" ]; then
  echo "ERROR: appointment id not found in appointment response"
  exit 1
fi

echo "3) Checking invoice by appointment id..."
INVOICE_RESPONSE=$(curl -sS -X GET "$BASE_URL/api/billing/appointment/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Invoice response: $INVOICE_RESPONSE"

export APPOINTMENT_ID
export INVOICE_RESPONSE

python3 - <<'PY'
import os, json, sys

appointment_id = int(os.environ["APPOINTMENT_ID"])
invoice_raw = os.environ["INVOICE_RESPONSE"]

try:
    data = json.loads(invoice_raw)
except json.JSONDecodeError:
    print("ERROR: invoice response is not valid JSON")
    sys.exit(1)

if not data:
    print("ERROR: invoice response is empty/null")
    sys.exit(1)

if "appointment_id" not in data:
    print("ERROR: invoice response missing appointment_id")
    sys.exit(1)

if int(data["appointment_id"]) != appointment_id:
    print(f"ERROR: invoice appointment_id {data['appointment_id']} != expected {appointment_id}")
    sys.exit(1)

if "amount" not in data:
    print("ERROR: invoice response missing amount")
    sys.exit(1)

print("SUCCESS: booking -> invoice workflow passed")
PY