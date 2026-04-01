const { PrismaClient } = require("@prisma/client")
const axios = require("axios")

const prisma = new PrismaClient()

exports.createDoctor = async (req, res) => {
  try {
    const { first_name, last_name, department, phone, email, password } = req.body

    const normalizedDepartment = department?.trim().toUpperCase()

    if (!ALLOWED_DEPARTMENTS.includes(normalizedDepartment)) {
      return res.status(400).json({
        message: "Invalid department"
      })
    }

    const doctor = await prisma.doctor.create({
      data: {
        first_name,
        last_name,
        department: normalizedDepartment,
        phone,
        email
      }
    })

    await axios.post("http://auth-service:5001/auth/internal/create-user", {
      email,
      password,
      role: "DOCTOR",
      reference_id: doctor.id
    })

    res.json(doctor)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
exports.getDoctors = async (req, res) => {

  try {

    const doctors = await prisma.doctor.findMany()

    res.json(doctors)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.getDoctor = async (req, res) => {

  try {

    const { id } = req.params

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) }
    })

    res.json(doctor)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const department = req.params.department?.trim().toUpperCase()

    const doctors = await prisma.doctor.findMany({
      where: {
        department
      }
    })

    res.json(doctors)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const ALLOWED_DEPARTMENTS = [
  "GENERAL",
  "SPECIALISTE",
  "CARDIOLOGIE",
  "NEUROLOGIE",
  "RADIOLOGIE",
  "SOINS",
  "CHIRURGIE",
  "LABORATOIRE",
  "GYNECOLOGIE",
  "KINESITHERAPIE",
  "DERMATOLOGIE",
  "ORL",
  "OPHTALMOLOGIE",
  "RHEUMATOLOGIE",
  "PNEUMOLOGIE",
  "URGENCE",
  "GASTROENTEROLOGIE",
  "UROLOGIE",
  "ONCOLOGIE",
  "DENTISTERIE",
  "PSYCHIATRIE",
  "PEDIATRIE",
  "TRAUMATOLOGIE",
  "ORTHOPEDIE",
  "NEPHROLOGIE"
]