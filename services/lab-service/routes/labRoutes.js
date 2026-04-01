const express = require("express")
const router = express.Router()

const {
  createLabTest,
  getAppointmentTests,
  getPatientTests,
  uploadResult
} = require("../controllers/labController")

const { verifyToken } = require("../middleware/authMiddleware")
const { authorizeRole } = require("../middleware/roleMiddleware")

router.post(
  "/tests",
  verifyToken,
  authorizeRole("DOCTOR"),
  createLabTest
)

router.get(
  "/appointment/:id",
  verifyToken,
  getAppointmentTests
)

router.get(
  "/patient/:id",
  verifyToken,
  getPatientTests
)

router.patch(
  "/tests/:id/result",
  verifyToken,
  authorizeRole("DOCTOR"),
  uploadResult
)

module.exports = router