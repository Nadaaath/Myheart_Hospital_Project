const express = require("express")
const router = express.Router()

const {
  createInvoice,
  getAppointmentInvoice,
  payInvoice
} = require("../controllers/billingController")

const { verifyToken } = require("../middleware/authMiddleware")

router.post("/", createInvoice)

router.get("/appointment/:id", verifyToken, getAppointmentInvoice)

router.patch("/pay/:id", verifyToken, payInvoice)

module.exports = router