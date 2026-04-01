const express = require("express")
const router = express.Router()

const { login, createInternalUser } = require("../controllers/authController")
const { verifyToken } = require("../middleware/authMiddleware")

router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" })
})

router.post("/internal/create-user", createInternalUser)
router.post("/login", login)

router.get("/profile", verifyToken, (req, res) => {

  res.json({
    message: "Protected route",
    user: req.user
  })

})

module.exports = router