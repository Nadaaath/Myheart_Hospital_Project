const express = require("express")
const router = express.Router()

const {
  createDoctor,
  getDoctors,
  getDoctor,
  getDoctorsByDepartment
} = require("../controllers/doctorController")

const { verifyToken } = require("../middleware/authMiddleware")
const { authorizeRole } = require("../middleware/roleMiddleware")

router.post(
  "/",
  verifyToken,
  authorizeRole("ADMIN"),
  createDoctor
)

router.get("/", getDoctors)

router.get("/department/:department", getDoctorsByDepartment)

router.get("/:id", getDoctor)

module.exports = router