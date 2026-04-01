const express = require("express")
const cors = require("cors")
require("dotenv").config()

const patientRoutes = require("./routes/patientRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/patients", patientRoutes)

app.get("/", (req, res) => {
  res.send("Patient Service Running")
})

const PORT = process.env.PORT || 5002

app.listen(PORT, () => console.log(`patient-service running on http://localhost:${PORT}`));