const express = require("express")
const cors = require("cors")
require("dotenv").config()

const catalogRoutes = require("./routes/catalogRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/services", catalogRoutes)

app.get("/", (req, res) => {
  res.send("Catalog Service Running")
})

const PORT = process.env.PORT || 5008

app.listen(PORT, () => {
  console.log(`Catalog service running on port ${PORT}`)
})