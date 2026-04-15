const { PrismaClient } = require("@prisma/client")
const axios = require("axios")
const prisma = new PrismaClient()

exports.createPatient = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      birth_date,
      phone,
      address,
      email,
      password,
      gender,
      blood_type,
      insurance_provider,
      social_security_number
    } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" })
    }

    const patient = await prisma.patient.create({
      data: {
        first_name,
        last_name,
        birth_date: new Date(birth_date),
        phone,
        address,
        email,
        gender,
        blood_type,
        insurance_provider,
        social_security_number
      }
    })

    await axios.post("http://auth-service:5001/auth/internal/create-user", {
      email,
      password,
      role: "PATIENT",
      reference_id: patient.id
    })

    res.json(patient)
  } catch (error) {
    console.error("PATIENT CREATION ERROR:")
    console.error(error.response?.data || error.message)

    res.status(500).json({
      error: error.response?.data || error.message
    })
  }
}
exports.getPatient = async (req, res) => {

  try {

    const { id } = req.params

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    })

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" })
    }

    res.json(patient)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}


exports.updatePatient = async (req, res) => {

  try {

    const { id } = req.params

    const { first_name, last_name, birth_date, phone, address } = req.body

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        first_name,
        last_name,
        birth_date: new Date(birth_date),
        phone,
        address
      }
    })

    res.json(patient)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { id: "desc" }
    })
    res.json(patients)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}