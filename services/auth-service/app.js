const express = require("express")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
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
      service: "auth-service",
    })

    end({
      method: req.method,
      route,
      status_code: res.statusCode,
      service: "auth-service",
    })
  })

  next()
})

app.use("/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Auth Service Running")
})

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

const PORT = process.env.PORT || 5001

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`)
  })
}

module.exports = app
