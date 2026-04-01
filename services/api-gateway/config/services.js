module.exports = {
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  PATIENT_SERVICE_URL: process.env.PATIENT_SERVICE_URL || "http://localhost:5002",
  DOCTOR_SERVICE_URL: process.env.DOCTOR_SERVICE_URL || "http://localhost:5003",
  APPOINTMENT_SERVICE_URL: process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5004",
  CONSULTATION_SERVICE_URL: process.env.CONSULTATION_SERVICE_URL || "http://localhost:5005",
  LAB_SERVICE_URL: process.env.LAB_SERVICE_URL || "http://localhost:5006",
  BILLING_SERVICE_URL: process.env.BILLING_SERVICE_URL || "http://localhost:5007",
  CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL || "http://localhost:5008",
}