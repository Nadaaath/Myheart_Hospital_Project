const express = require("express")
const cors = require("cors")
require("dotenv").config()

const consultationRoutes = require("./routes/consultationRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/consultation-records", consultationRoutes)

app.get("/", (req, res) => {
  res.send("Consultation Record Service Running")
})
app.get("/test", (req, res) => {
  res.send("Consultation service working")
})
const PORT = process.env.PORT || 5005

app.listen(PORT, () => {
  console.log(`Consultation Record service running on port ${PORT}`)
})
