const express = require("express")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Auth Service Running")
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => console.log(`auth-service running on http://localhost:${PORT}`));
