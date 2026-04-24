const express = require("express")
const cors = require("cors")
require("dotenv").config()

const billingRoutes = require("./routes/billingRoutes")
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
      status_code: String(res.statusCode),
      service: "billing-service",
    })

    end({
      method: req.method,
      route,
      status_code: String(res.statusCode),
      service: "billing-service",
    })
  })

  next()
})

app.use("/billing", billingRoutes)

app.get("/", (req, res) => {
  res.send("Billing Service Running")
})

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

const PORT = process.env.PORT || 5007

app.listen(PORT, () => {
  console.log(`Billing Service running on port ${PORT}`)
})