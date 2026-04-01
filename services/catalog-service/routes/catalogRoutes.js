const express = require("express")
const router = express.Router()

const { verifyToken } = require("../middleware/authMiddleware")
const { authorizeRole } = require("../middleware/roleMiddleware")

const {
  getServices,
  getServiceById,
  getServicePrice,
  createService,
  getCategories,
  getLabTests,
  healthCheck,
  searchServices
} = require("../controllers/catalogController")

router.get("/", getServices)
router.get("/search", searchServices)
router.get("/categories", getCategories)
router.get("/lab-tests", getLabTests)
router.get("/health/check", healthCheck)

router.get("/:id/price", getServicePrice)
router.get("/:id", getServiceById)

router.post("/", verifyToken, authorizeRole("ADMIN"), createService)

module.exports = router