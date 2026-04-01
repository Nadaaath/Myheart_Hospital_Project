const express = require("express")
const cors = require("cors")
require("dotenv").config()

const appointmentRoutes = require("./routes/appointmentRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/appointments", appointmentRoutes)

app.get("/", (req, res) => {
  res.send("Appointment Service Running")
})

const PORT = process.env.PORT || 5004

app.listen(PORT, () => {
  console.log(`Appointment service running on port ${PORT}`)
})