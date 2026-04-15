const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")

const {
  createLabTest,
  getAppointmentTests,
  getPatientTests,
  uploadResult,
  getAllLabTests
} = require("../controllers/labController")

const { verifyToken } = require("../middleware/authMiddleware")
const { authorizeRole } = require("../middleware/roleMiddleware")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"))
    }
    cb(null, true)
  }
})

router.post(
  "/tests",
  verifyToken,
  authorizeRole("DOCTOR"),
  createLabTest
)

router.get(
  "/tests",
  verifyToken,
  authorizeRole("ADMIN"),
  getAllLabTests
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
  authorizeRole("ADMIN"),
  upload.single("report"),
  uploadResult
)

module.exports = router