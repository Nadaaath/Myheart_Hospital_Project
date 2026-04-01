const express = require("express")
const cors = require("cors")
require("dotenv").config()

const doctorRoutes = require("./routes/doctorRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/doctors", doctorRoutes)

app.get("/", (req, res) => {
  res.send("Doctor Service Running")
})

const PORT = process.env.PORT || 5003

app.listen(PORT, () => {
  console.log(`Doctor service running on  http://localhost:${PORT}`)
})