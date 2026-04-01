const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const labRoutes = require("./routes/labRoutes")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err))

app.use("/labs", labRoutes)

app.get("/", (req, res) => {
  res.send("Lab Service Running")
})

const PORT = process.env.PORT || 5006

app.listen(PORT, () => {
  console.log(`Lab Service running on port ${PORT}`)
})