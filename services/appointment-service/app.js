const express = require("express")
const cors = require("cors")
require("dotenv").config()

const appointmentRoutes = require("./routes/appointmentRoutes")
const {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
} = require("./metrics")

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer()

  res.on("finish", () => {
    const route = req.route?.path || req.path

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
      service: "appointment-service",
    })

    end({
      method: req.method,
      route,
      status_code: res.statusCode,
      service: "appointment-service",
    })
  })

  next()
})

app.use("/appointments", appointmentRoutes)

app.get("/", (req, res) => {
  res.send("Appointment Service Running")
})

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

const PORT = process.env.PORT || 5004

app.listen(PORT, () => {
  console.log(`Appointment service running on port ${PORT}`)
})