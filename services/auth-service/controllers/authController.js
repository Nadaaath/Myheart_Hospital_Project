const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const prisma = new PrismaClient()

const ALLOWED_ROLES = ["ADMIN", "DOCTOR", "PATIENT"]

exports.createInternalUser = async (req, res) => {
  try {
    let { email, password, role, reference_id } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password and role are required" })
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    if (role === "ADMIN") {
      reference_id = null
    }

    if ((role === "DOCTOR" || role === "PATIENT") && (reference_id === undefined || reference_id === null)) {
      return res.status(400).json({
        error: "reference_id is required for DOCTOR and PATIENT"
      })
    }

    const existingEmail = await prisma.userAccount.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" })
    }

    if (reference_id !== null && reference_id !== undefined) {
      const existingReference = await prisma.userAccount.findFirst({
        where: {
          role,
          reference_id
        }
      })

      if (existingReference) {
        return res.status(409).json({
          error: "An account already exists for this role and reference_id"
        })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.userAccount.create({
      data: {
        email,
        password: hashedPassword,
        role,
        reference_id
      }
    })

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      reference_id: user.reference_id
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" })
    }

    const user = await prisma.userAccount.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        reference_id: user.reference_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({
      token,
      role: user.role,
      reference_id: user.reference_id
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

