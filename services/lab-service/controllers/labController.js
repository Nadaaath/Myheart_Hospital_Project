const axios = require("axios")
const LabTest = require("../models/LabTest")

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || "http://catalog-service:5008"

exports.createLabTest = async (req, res) => {
  try {
    const { appointment_id, patient_id, lab_test_code } = req.body
    const doctor_id = req.user.reference_id

    if (!appointment_id || !patient_id || !lab_test_code) {
      return res.status(400).json({
        message: "appointment_id, patient_id and lab_test_code are required"
      })
    }

    // Ask catalog-service for lab test definition
    const catalogResponse = await axios.get(
      `${CATALOG_SERVICE_URL}/services/lab-tests`,
      {
        params: { q: lab_test_code }
      }
    )

    const catalogTests = Array.isArray(catalogResponse.data)
      ? catalogResponse.data
      : []

    const selectedTest = catalogTests.find(
      (test) => test.code === lab_test_code
    )

    if (!selectedTest) {
      return res.status(404).json({
        message: "Lab test not found in catalog"
      })
    }

    const test = await LabTest.create({
      appointment_id,
      patient_id,
      doctor_id,
      lab_test_code: selectedTest.code,
      lab_test_name: selectedTest.name,
      lab_test_category: selectedTest.category || null,
      price_snapshot:
        selectedTest.conventional_price ??
        selectedTest.price ??
        null,
      status: "PENDING"
    })

    res.json(test)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getAppointmentTests = async (req, res) => {
  try {
    const tests = await LabTest.find({
      appointment_id: parseInt(req.params.id)
    }).sort({ createdAt: -1 })

    res.json(tests)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getPatientTests = async (req, res) => {
  try {
    const tests = await LabTest.find({
      patient_id: parseInt(req.params.id)
    }).sort({ createdAt: -1 })

    res.json(tests)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.uploadResult = async (req, res) => {
  try {
    const { result, file_url } = req.body

    const test = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        result,
        file_url,
        status: "COMPLETED"
      },
      { new: true }
    )

    if (!test) {
      return res.status(404).json({ message: "Lab test not found" })
    }

    res.json(test)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}