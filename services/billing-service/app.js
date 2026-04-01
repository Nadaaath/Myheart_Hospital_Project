const express = require("express")
const cors = require("cors")
require("dotenv").config()

const billingRoutes = require("./routes/billingRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/billing", billingRoutes)

app.get("/", (req, res) => {
  res.send("Billing Service Running")
})

const PORT = process.env.PORT || 5007

app.listen(PORT, () => {
  console.log(`Billing Service running on port ${PORT}`)
})