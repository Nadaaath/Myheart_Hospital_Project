const mongoose = require("mongoose")

const labTestSchema = new mongoose.Schema(
  {
    appointment_id: {
      type: Number,
      required: true
    },
    patient_id: {
      type: Number,
      required: true
    },
    doctor_id: {
      type: Number,
      required: true
    },

    // Reference to catalog-service
    lab_test_code: {
      type: String,
      required: true
    },
    lab_test_name: {
      type: String,
      required: true
    },
    lab_test_category: {
      type: String,
      default: null
    },
    price_snapshot: {
      type: Number,
      default: null
    },

    // Execution/result
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING"
    },
    result: {
      type: String,
      default: null
    },
    file_url: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("LabTest", labTestSchema)