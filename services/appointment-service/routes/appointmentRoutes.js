const express = require("express")
const router = express.Router()

const {
  createAppointment,
  getMyAppointments,
  getAppointmentDetails,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  rescheduleAppointment
} = require("../controllers/appointmentController")

const { verifyToken } = require("../middleware/authMiddleware")

router.post("/", verifyToken, createAppointment)

router.get("/me", verifyToken, getMyAppointments)

router.get("/:id/details", verifyToken, getAppointmentDetails)

router.get("/doctor/:id", verifyToken, getDoctorAppointments)

router.patch("/:id/status", verifyToken, updateAppointmentStatus)

router.patch("/:id/reschedule", verifyToken, rescheduleAppointment)

router.delete("/:id", verifyToken, cancelAppointment)

module.exports = router