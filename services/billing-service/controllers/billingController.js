const { PrismaClient } = require("@prisma/client")
const axios = require("axios")

const prisma = new PrismaClient()

exports.createInvoice = async (req, res) => {
  try {
    const { appointment_id, patient_id, service_id } = req.body

    // ask catalog for the resolved final price
    const priceResponse = await axios.get(
      `http://catalog-service:5008/services/${service_id}/price`
    )

    const finalPrice = priceResponse.data.price

    const invoice = await prisma.invoice.create({
      data: {
        appointment_id,
        patient_id,
        service_id,
        amount: finalPrice
      }
    })

    res.json(invoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getAppointmentInvoice = async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        appointment_id: parseInt(req.params.id)
      }
    })

    res.json(invoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.payInvoice = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const existing = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ message: "Invoice not found" })
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: "PAID" }
    })

    res.json(invoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}