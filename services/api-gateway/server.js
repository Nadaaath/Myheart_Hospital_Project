const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const morgan = require("morgan")
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware")

dotenv.config()

const {
  AUTH_SERVICE_URL,
  PATIENT_SERVICE_URL,
  DOCTOR_SERVICE_URL,
  APPOINTMENT_SERVICE_URL,
  CONSULTATION_SERVICE_URL,
  BILLING_SERVICE_URL,
  LAB_SERVICE_URL,
  CATALOG_SERVICE_URL,
} = require("./config/services")

const app = express()

const {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
} = require("./metrics")

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.get("/", (req, res) => {
  res.json({
    message: "API Gateway running",
    routes: [
      "/api/auth",
      "/api/patients",
      "/api/doctors",
      "/api/appointments",
      "/api/consultation-records",
      "/api/billing",
      "/api/labs",
      "/api/catalog",
    ],
  })
})

const buildProxy = (target, basePath) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${basePath}${path}`,
    on: {
      proxyReq: (proxyReq, req, res) => {
  if (!proxyReq.headersSent && req.headers.authorization) {
    proxyReq.setHeader("Authorization", req.headers.authorization)
  }

  fixRequestBody(proxyReq, req, res)
},
      error: (err, req, res) => {
        console.error(`Proxy error on ${req.originalUrl}:`, err.message)
        res.status(500).json({
          message: "Gateway proxy error",
          error: err.message,
          target,
          originalUrl: req.originalUrl,
        })
      },
    },
  })

app.use("/api/auth", buildProxy(AUTH_SERVICE_URL, "/auth"))
app.use("/api/patients", buildProxy(PATIENT_SERVICE_URL, "/patients"))
app.use("/api/doctors", buildProxy(DOCTOR_SERVICE_URL, "/doctors"))
app.use("/api/appointments", buildProxy(APPOINTMENT_SERVICE_URL, "/appointments"))
app.use("/api/consultation-records", buildProxy(CONSULTATION_SERVICE_URL, "/consultation-records"))
app.use("/api/billing", buildProxy(BILLING_SERVICE_URL, "/billing"))
app.use(
  "/api/labs/uploads",
  createProxyMiddleware({
    target: LAB_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/uploads${path}`,
    on: {
      error: (err, req, res) => {
        console.error(`Proxy error on ${req.originalUrl}:`, err.message)
        res.status(500).json({
          message: "Gateway proxy error",
          error: err.message,
          target: LAB_SERVICE_URL,
          originalUrl: req.originalUrl,
        })
      },
    },
  })
)
app.use("/api/labs", buildProxy(LAB_SERVICE_URL, "/labs"))
app.use("/api/catalog", buildProxy(CATALOG_SERVICE_URL, "/services"))

app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer()

  res.on("finish", () => {
    const route = req.route?.path || req.path

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    })

    end({
      method: req.method,
      route,
      status_code: res.statusCode,
    })
  })

  next()
})

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
  console.log("AUTH_SERVICE_URL =", AUTH_SERVICE_URL)
  console.log("PATIENT_SERVICE_URL =", PATIENT_SERVICE_URL)
  console.log("DOCTOR_SERVICE_URL =", DOCTOR_SERVICE_URL)
  console.log("APPOINTMENT_SERVICE_URL =", APPOINTMENT_SERVICE_URL)
  console.log("CONSULTATION_SERVICE_URL =", CONSULTATION_SERVICE_URL)
  console.log("BILLING_SERVICE_URL =", BILLING_SERVICE_URL)
  console.log("LAB_SERVICE_URL =", LAB_SERVICE_URL)
  console.log("CATALOG_SERVICE_URL =", CATALOG_SERVICE_URL)
})