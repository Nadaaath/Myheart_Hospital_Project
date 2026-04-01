const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

exports.createConsultationRecord = async (req, res) => {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({
      message: "Only doctors can create consultation records"
    })
  }

  try {
    const {
      appointment_id,
      patient_id,
      clinical_notes,
      diagnosis,
      prescriptions,
      notes
    } = req.body

    if (!appointment_id || !patient_id) {
      return res.status(400).json({
        message: "appointment_id and patient_id are required"
      })
    }

    const doctor_id = req.user.reference_id

    const existingRecord = await prisma.consultationRecord.findFirst({
      where: {
        appointment_id: Number(appointment_id)
      }
    })

    let record

    if (existingRecord) {
      record = await prisma.consultationRecord.update({
        where: {
          id: existingRecord.id
        },
        data: {
          doctor_id,
          patient_id: Number(patient_id),
          clinical_notes: clinical_notes || null,
          diagnosis: diagnosis || null,
          prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
          notes: notes || null
        }
      })
    } else {
      record = await prisma.consultationRecord.create({
        data: {
          appointment_id: Number(appointment_id),
          doctor_id,
          patient_id: Number(patient_id),
          clinical_notes: clinical_notes || null,
          diagnosis: diagnosis || null,
          prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
          notes: notes || null
        }
      })
    }

    res.status(200).json(record)
  } catch (error) {
    console.error("CONSULTATION SAVE ERROR:", error)
    res.status(500).json({
      error: error.message
    })
  }
}

exports.getAppointmentRecord = async (req, res) => {
  try {
    const appointment_id = parseInt(req.params.id)

    if (isNaN(appointment_id)) {
      return res.status(400).json({
        message: "Invalid appointment id"
      })
    }

    const record = await prisma.consultationRecord.findFirst({
      where: {
        appointment_id
      }
    })

    if (!record) {
      return res.status(404).json({
        message: "No consultation record found for this appointment"
      })
    }

    res.json(record)
  } catch (error) {
    console.error("GET APPOINTMENT RECORD ERROR:", error)
    res.status(500).json({
      error: error.message
    })
  }
}

exports.getPatientHistory = async (req, res) => {
  try {
    const patient_id = parseInt(req.params.id)

    if (isNaN(patient_id)) {
      return res.status(400).json({
        message: "Invalid patient id"
      })
    }

    const records = await prisma.consultationRecord.findMany({
      where: {
        patient_id
      },
      orderBy: {
        created_at: "desc"
      }
    })

    res.json(records)
  } catch (error) {
    console.error("GET PATIENT HISTORY ERROR:", error)
    res.status(500).json({
      error: error.message
    })
  }
}

exports.getMyPrescriptions = async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        message: "Only patients can access their prescriptions"
      })
    }

    const patient_id = Number(req.user.reference_id)

    const records = await prisma.consultationRecord.findMany({
      where: {
        patient_id,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        appointment_id: true,
        diagnosis: true,
        prescriptions: true,
        created_at: true
      }
    })

    const prescriptionsOnly = records.filter((record) => {
      return Array.isArray(record.prescriptions) && record.prescriptions.length > 0
    })

    res.json(prescriptionsOnly)
  } catch (error) {
    console.error("GET MY PRESCRIPTIONS ERROR:", error)
    res.status(500).json({
      error: error.message
    })
  }
}

exports.deleteConsultationRecord = async (req, res) => {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({
      message: "Only doctors can delete consultation records"
    })
  }

  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid consultation record id"
      })
    }

    const existingRecord = await prisma.consultationRecord.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return res.status(404).json({
        message: "Consultation record not found"
      })
    }

    await prisma.consultationRecord.delete({
      where: { id }
    })

    res.json({
      message: "Consultation record deleted successfully"
    })
  } catch (error) {
    console.error("DELETE CONSULTATION ERROR:", error)
    res.status(500).json({
      error: error.message
    })
  }
}