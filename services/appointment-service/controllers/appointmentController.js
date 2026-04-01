const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const axios = require("axios")
const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL

exports.createAppointment = async (req, res) => {

  try {

    const { doctor_id, appointment_date, service_id } = req.body

    const patient_id = req.user.reference_id

    const existing = await prisma.appointment.findFirst({
      where: {
        doctor_id,
        appointment_date: new Date(appointment_date)
      }
    })

    if (existing) {
      return res.status(400).json({
        message: "Doctor already has an appointment at this time"
      })
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctor_id,
        patient_id,
        service_id,
        appointment_date: new Date(appointment_date),
        status: "SCHEDULED"
      }
    })
    // get price from catalog service
    const catalogResponse = await axios.get(
      `http://catalog-service:5008/services/${service_id}`
    )

    const price = catalogResponse.data.price

    // create billing
    await axios.post("http://billing-service:5007/billing", {

      appointment_id: appointment.id,
      patient_id: patient_id,
      service_id: service_id,
      amount: price

    })

    res.json(appointment)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.getMyAppointments = async (req, res) => {

  try {

    const patient_id = req.user.reference_id

    const appointments = await prisma.appointment.findMany({
      where: {
        patient_id
      }
    })

    res.json(appointments)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.getDoctorAppointments = async (req, res) => {

  try {

    const doctor_id = parseInt(req.params.id)

    const appointments = await prisma.appointment.findMany({
      where: {
        doctor_id
      }
    })

    res.json(appointments)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    })

    res.json(updatedAppointment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.rescheduleAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { appointment_date } = req.body

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { appointment_date: new Date(appointment_date) }
    })

    res.json(updatedAppointment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
exports.cancelAppointment = async (req, res) => {

  try {

    const { id } = req.params

    const appointment = await prisma.appointment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        status: "CANCELLED"
      }
    })

    res.json(appointment)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}
exports.getAppointmentDetails = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    const doctor = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/doctors/${appointment.doctor_id}`
    )

    let consultationData = null

    try {
      const consultation = await axios.get(
        `${process.env.CONSULTATION_SERVICE_URL}/consultation-records/appointment/${id}`,
        {
          headers: { Authorization: req.headers.authorization }
        }
      )
      consultationData = consultation.data
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err
      }
    }

    res.json({
      appointment,
      doctor: doctor.data,
      consultation_record: consultationData
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}