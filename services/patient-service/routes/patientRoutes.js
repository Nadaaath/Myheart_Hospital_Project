const express = require("express")
const router = express.Router()

const { createPatient, getPatient, updatePatient } = require("../controllers/patientController")
const { verifyToken } = require("../middleware/authMiddleware")
const { authorizeRole } = require("../middleware/roleMiddleware")

router.get("/test", (req, res) => {
  res.json({ message: "Patient routes working" })
})

// Only ADMIN can create patients
router.post(
  "/",
  verifyToken,
  authorizeRole("ADMIN"),
  createPatient
)

router.get("/:id", verifyToken, getPatient)

router.put("/:id", verifyToken, updatePatient)

module.exports = router