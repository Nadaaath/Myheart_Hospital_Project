const express = require("express")
const router = express.Router()

const {
    login,
    createInternalUser
} = require("../controllers/authController")

const { verifyToken } = require("../middleware/authMiddleware")

router.get("/test", (req, res) => {
    res.json({ message: "Auth route working" })
})

router.post(
    "/internal/create-user",
    verifyToken,
    (req, res, next) => {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Administrator access required"
            })
        }

        if (!["PATIENT", "DOCTOR"].includes(req.body?.role)) {
            return res.status(400).json({
                message: "Invalid account role"
            })
        }

        next()
    },
    createInternalUser
)

router.post("/login", login)

router.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Protected route",
        user: req.user
    })
})

module.exports = router