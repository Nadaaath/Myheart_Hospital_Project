const express = require("express")
const router = express.Router()

const {
  createConsultationRecord,
  getAppointmentRecord,
  getPatientHistory,
  deleteConsultationRecord,
  getMyPrescriptions,
  getAllConsultationRecords
} = require("../controllers/consultationController")

const { verifyToken } = require("../middleware/authMiddleware")
const { authorizeRole } = require("../middleware/roleMiddleware")

router.post(
  "/",
  verifyToken,
  authorizeRole("DOCTOR"),
  createConsultationRecord
)

router.get(
  "/",
  verifyToken,
  authorizeRole("ADMIN"),
  getAllConsultationRecords
)

router.get("/appointment/:id", verifyToken, getAppointmentRecord)

router.get("/my-prescriptions", verifyToken, getMyPrescriptions)

router.get(
  "/patient/:id",
  verifyToken,
  getPatientHistory
)

module.exports = router