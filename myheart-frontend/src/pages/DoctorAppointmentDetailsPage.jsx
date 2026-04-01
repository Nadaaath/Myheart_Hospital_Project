import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../api/axios"

function DoctorAppointmentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [appointment, setAppointment] = useState(null)
  const [billing, setBilling] = useState(null)
  const [consultation, setConsultation] = useState(null)
  const [patient, setPatient] = useState(null)
  const [profile, setProfile] = useState(null)

  const [labRequests, setLabRequests] = useState([])
  const [catalogLabTests, setCatalogLabTests] = useState([])
  const [selectedLabCode, setSelectedLabCode] = useState("")
  const [labLoading, setLabLoading] = useState(false)
  const [labSubmitLoading, setLabSubmitLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [formData, setFormData] = useState({
    diagnosis: "",
    notes: "",
  })

  const [prescriptionInput, setPrescriptionInput] = useState("")
  const [prescriptionList, setPrescriptionList] = useState([])

  const [nextSteps, setNextSteps] = useState([
    { label: "Follow-up consultation", checked: true },
    { label: "Lab blood test", checked: false },
    { label: "Adjust treatment", checked: false },
    { label: "Lifestyle recommendation", checked: true },
  ])

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  )

  const fetchBilling = async () => {
    try {
      const billingRes = await api.get(`/billing/appointment/${id}`, { headers })
      setBilling(billingRes.data)
    } catch {
      setBilling(null)
    }
  }

  const fetchConsultation = async () => {
    try {
      const consultationRes = await api.get(
        `/consultation-records/appointment/${id}`,
        { headers }
      )

      const consultationData = consultationRes.data || null
      setConsultation(consultationData)

      if (consultationData) {
        setFormData({
          diagnosis: consultationData.diagnosis || "",
          notes: consultationData.clinical_notes || consultationData.notes || "",
        })

        setPrescriptionList(
          Array.isArray(consultationData.prescriptions)
            ? consultationData.prescriptions
            : []
        )
      } else {
        setFormData({
          diagnosis: "",
          notes: "",
        })
        setPrescriptionList([])
      }
    } catch {
      setConsultation(null)
      setFormData({
        diagnosis: "",
        notes: "",
      })
      setPrescriptionList([])
    }
  }

  const fetchAppointmentLabs = async () => {
    try {
      setLabLoading(true)
      const res = await api.get(`/labs/appointment/${id}`, { headers })
      setLabRequests(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error("Error fetching appointment labs:", err)
      setLabRequests([])
    } finally {
      setLabLoading(false)
    }
  }

  const fetchCatalogLabTests = async () => {
    try {
      const catalogRes = await api.get("/catalog/lab-tests", { headers })
      const tests = Array.isArray(catalogRes.data) ? catalogRes.data : []
      setCatalogLabTests(tests)

      if (tests.length > 0) {
        setSelectedLabCode((prev) => prev || tests[0].code)
      }
    } catch {
      setCatalogLabTests([])
    }
  }

  const fetchDetails = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")

      const profileRes = await api.get("/auth/profile", { headers })
      const user = profileRes.data?.user || null
      setProfile(user)

      const appointmentRes = await api.get(`/appointments/${id}/details`, {
        headers,
      })

      const appointmentData = appointmentRes.data
      setAppointment(appointmentData)

      const normalizedPatientId =
        appointmentData?.appointment?.patient_id ||
        appointmentData?.patient_id ||
        appointmentData?.patient?.id ||
        null

      if (normalizedPatientId) {
        try {
          const patientRes = await api.get(`/patients/${normalizedPatientId}`, {
            headers,
          })
          setPatient(patientRes.data)
        } catch {
          setPatient(null)
        }
      } else {
        setPatient(null)
      }

      await Promise.all([
        fetchBilling(),
        fetchConsultation(),
        fetchCatalogLabTests(),
        fetchAppointmentLabs(),
      ])
    } catch (err) {
      console.error("Doctor appointment details fetch error:", err)
      setError("Failed to load appointment details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [id, headers])

  const appointmentCore = appointment?.appointment || appointment || {}
  const serviceData = appointment?.service || {}
  const doctorData = appointment?.doctor || {}

  const appointmentDate =
    appointmentCore.appointment_date || appointment?.appointment_date || null

  const appointmentStatus =
    appointmentCore.status || appointment?.status || null

  const serviceName =
    serviceData.name ||
    appointment?.service_name ||
    appointmentCore.service_name ||
    "Medical consultation"

  const patientId =
    appointmentCore.patient_id ||
    appointment?.patient_id ||
    patient?.id ||
    null

  const doctorId =
    appointmentCore.doctor_id ||
    appointment?.doctor_id ||
    doctorData.id ||
    profile?.reference_id ||
    null

  const doctorName =
    doctorData.first_name && doctorData.last_name
      ? `Dr. ${doctorData.first_name} ${doctorData.last_name}`
      : "Doctor"

  const doctorDepartment =
    doctorData.department || profile?.department || "Specialist"

  const patientFullName = patient
    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
    : `Patient #${patientId ?? "N/A"}`

  const patientInitials = patientFullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const ageValue = useMemo(() => {
    if (patient?.age) return patient.age
    if (patient?.birth_date) {
      const birth = new Date(patient.birth_date)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }
    return "N/A"
  }, [patient])

  const formatShortMonth = (dateValue) => {
    if (!dateValue) return "N/A"
    return new Date(dateValue).toLocaleDateString("en-GB", {
      month: "short",
    })
  }

  const formatDay = (dateValue) => {
    if (!dateValue) return "N/A"
    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
    })
  }

  const formatTime = (dateValue) => {
    if (!dateValue) return "N/A"
    return new Date(dateValue).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAppointmentBadgeStyle = () => {
    const normalized = (appointmentStatus || "").toUpperCase()

    if (normalized === "COMPLETED") {
      return { ...badgeStyle, background: "#dcfce7", color: "#1e6096" }
    }

    if (normalized === "CANCELLED") {
      return { ...badgeStyle, background: "#fee2e2", color: "#b91c1c" }
    }

    if (normalized === "APPROVED") {
      return { ...badgeStyle, background: "#dbeafe", color: "#1d4ed8" }
    }

    return { ...badgeStyle, background: "#b4e1f3", color: "#080547" }
  }

  const getBillingBadgeStyle = () => {
    const normalized = (billing?.status || "").toUpperCase()

    if (normalized === "PAID") {
      return { ...badgeStyle, background: "#dcfce7", color: "#166534" }
    }

    return { ...badgeStyle, background: "#fee2e2", color: "#b91c1c" }
  }

  const getLabBadgeStyle = (status) => {
    const normalized = (status || "").toUpperCase()

    if (normalized === "COMPLETED" || normalized === "READY") {
      return { ...badgeStyle, background: "#dcfce7", color: "#166534" }
    }

    return { ...badgeStyle, background: "#c9ebed", color: "#0b0b34" }
  }

  const handleBack = () => {
    navigate("/doctor/appointments")
  }

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAddPrescription = () => {
    const value = prescriptionInput.trim()
    if (!value) return

    setPrescriptionList((prev) => [...prev, value])
    setPrescriptionInput("")
  }

  const handleRemovePrescription = (index) => {
    setPrescriptionList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleToggleStep = (index) => {
    setNextSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, checked: !step.checked } : step
      )
    )
  }

  const handleRescheduleAppointment = async () => {
    try {
      const newDate = window.prompt(
        "Enter new appointment date and time in this format:\n2026-03-25T10:30:00"
      )

      if (!newDate) return

      setActionLoading(true)
      setError("")
      setSuccessMessage("")

      await api.patch(
        `/appointments/${id}/reschedule`,
        { appointment_date: newDate },
        { headers }
      )

      const appointmentRes = await api.get(`/appointments/${id}/details`, {
        headers,
      })
      setAppointment(appointmentRes.data)

      setSuccessMessage("Appointment rescheduled successfully.")
    } catch (err) {
      console.error("Reschedule error:", err)
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to reschedule appointment."
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveAppointment = async () => {
    try {
      setActionLoading(true)
      setError("")
      setSuccessMessage("")

      await api.patch(
        `/appointments/${id}/status`,
        { status: "APPROVED" },
        { headers }
      )

      const appointmentRes = await api.get(`/appointments/${id}/details`, {
        headers,
      })
      setAppointment(appointmentRes.data)

      setSuccessMessage("Appointment approved successfully.")
    } catch (err) {
      console.error("Approve appointment error:", err)
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to approve appointment."
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteVisit = async () => {
    try {
      setSubmitLoading(true)
      setError("")
      setSuccessMessage("")

      const payload = {
        appointment_id: Number(id),
        patient_id: Number(patientId),
        clinical_notes: formData.notes,
        diagnosis: formData.diagnosis,
        prescriptions: prescriptionList,
        notes: formData.notes,
      }

      await api.post("/consultation-records", payload, { headers })

      await api.patch(
        `/appointments/${id}/status`,
        { status: "COMPLETED" },
        { headers }
      )

      const [appointmentRes] = await Promise.all([
        api.get(`/appointments/${id}/details`, { headers }),
        fetchConsultation(),
      ])

      setAppointment(appointmentRes.data)
      await fetchConsultation()

      setSuccessMessage("Consultation saved and visit completed.")
    } catch (err) {
      console.error("Complete visit error:", err)
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to complete visit."
      )
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleRequestLabTest = async () => {
    if (!selectedLabCode || !patientId) return

    try {
      setLabSubmitLoading(true)
      setError("")
      setSuccessMessage("")

      await api.post(
        "/labs/tests",
        {
          appointment_id: Number(id),
          patient_id: Number(patientId),
          lab_test_code: selectedLabCode,
        },
        { headers }
      )

      await fetchAppointmentLabs()
      setSuccessMessage("Lab test requested successfully.")
    } catch (err) {
      console.error("Lab request submit error:", err)
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to request lab test."
      )
    } finally {
      setLabSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ width: "100%" }}>
          <p>Loading appointment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: "100%" }}>
        <div style={layoutStyle}>
          <aside style={sidebarStyle}>
            <div>
              <div style={brandRowStyle}>
                <div style={logoStyle}>♥</div>
                <div>
                  <h2 style={brandTitleStyle}>MyHeart</h2>
                  <p style={brandSubtitleStyle}>Doctor Portal</p>
                </div>
              </div>

              <div style={sidebarSectionTitleStyle}>MAIN</div>

              <div style={sidebarMenuStyle}>
                <button style={sidebarItemStyle} onClick={() => navigate("/dashboard")}>
                  ▣ Dashboard
                </button>

                <button
                  style={sidebarActiveItemStyle}
                  onClick={() => navigate("/doctor/appointments")}
                >
                  🗓 Appointments
                </button>

                <button
                  style={sidebarItemStyle}
                  onClick={() => navigate("/doctor/patients")}
                >
                  👥 My Patients
                </button>
              </div>

              <div style={sidebarSectionTitleStyle}>TOOLS</div>

              <div style={sidebarMenuStyle}>
                <button
                  style={sidebarItemStyle}
                  onClick={() => navigate("/doctor/labs")}
                >
                  🧪 Lab Results
                </button>
              </div>

              <div style={sidebarSectionTitleStyle}>ACCOUNT</div>

              <div style={sidebarMenuStyle}>
                <button
                  style={sidebarItemStyle}
                  onClick={() => {
                    localStorage.removeItem("token")
                    localStorage.removeItem("role")
                    navigate("/")
                  }}
                >
                  ↩ Log out
                </button>
              </div>
            </div>

            <div style={sidebarDoctorCardStyle}>
              <div style={sidebarDoctorAvatarStyle}>
                {doctorName
                  .replace("Dr. ", "")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p style={sidebarDoctorNameStyle}>{doctorName}</p>
                <p style={sidebarDoctorDeptStyle}>{doctorDepartment}</p>
              </div>
            </div>
          </aside>

          <main style={mainStyle}>
            <button onClick={handleBack} style={backLinkStyle}>
              ← Back to Appointments
            </button>

            {error && <div style={errorCardStyle}>{error}</div>}
            {successMessage && <div style={successCardStyle}>{successMessage}</div>}

            <section style={heroCardStyle}>
              <div style={heroLeftStyle}>
                <div style={dateCardStyle}>
                  <div style={dateDayStyle}>{formatDay(appointmentDate)}</div>
                  <div style={dateMonthStyle}>
                    {formatShortMonth(appointmentDate).toUpperCase()}
                  </div>
                </div>

                <div>
                  <h1 style={heroTitleStyle}>
                    {serviceName} — {patientFullName}
                  </h1>
                  <p style={heroMetaStyle}>
                    Appointment #{id} · {formatTime(appointmentDate)} · MyHeart Hospital
                  </p>

                  <div style={heroBadgesRowStyle}>
                    <span style={softBlueBadgeStyle}>In-person</span>
                    <span style={softGoldBadgeStyle}>Active visit</span>
                    <span style={softIndigoBadgeStyle}>60 min</span>
                  </div>
                </div>
              </div>

              <div>
                <span style={getAppointmentBadgeStyle()}>
                  {appointmentStatus || "Awaiting consultation"}
                </span>
              </div>
            </section>

            <div style={contentGridStyle}>
              <div style={leftColumnStyle}>
                <section style={sectionCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>PATIENT SUMMARY</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={patientHeaderStyle}>
                    <div style={patientAvatarStyle}>{patientInitials || "PT"}</div>

                    <div>
                      <h3 style={patientNameStyle}>{patientFullName}</h3>
                      <p style={patientMetaStyle}>
                        MH-{patientId ?? "N/A"} · Age {ageValue} ·{" "}
                        {patient?.gender || "N/A"} · {patient?.blood_type || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div style={summaryGridStyle}>
                    <div>
                      <p style={summaryLabelStyle}>PHONE</p>
                      <p style={summaryValueStyle}>{patient?.phone || "N/A"}</p>
                    </div>

                    <div>
                      <p style={summaryLabelStyle}>EMAIL</p>
                      <p style={summaryValueStyle}>{patient?.email || "N/A"}</p>
                    </div>

                    <div>
                      <p style={summaryLabelStyle}>ADDRESS</p>
                      <p style={summaryValueStyle}>{patient?.address || "N/A"}</p>
                    </div>

                    <div>
                      <p style={summaryLabelStyle}>DOCTOR</p>
                      <p style={summaryValueStyle}>{doctorName}</p>
                    </div>

                    <div>
                      <p style={summaryLabelStyle}>INSURANCE</p>
                      <p style={summaryValueStyle}>
                        {patient?.insurance_provider || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p style={summaryLabelStyle}>SOCIAL SECURITY</p>
                      <p style={summaryValueStyle}>
                        {patient?.social_security_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </section>

                <section style={sectionCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>CLINICAL NOTES — TODAY'S SESSION</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={5}
                    style={largeTextareaStyle}
                    placeholder="Write clinical notes for this consultation..."
                  />

                  <p style={editedTextStyle}>
                    Last edited: just now · {doctorName}
                  </p>
                </section>

                <section style={sectionCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>DIAGNOSIS</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleFormChange}
                    rows={4}
                    style={largeTextareaStyle}
                    placeholder="Write diagnosis..."
                  />
                </section>

                <section style={sectionCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>PRESCRIPTIONS</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                    {prescriptionList.length === 0 ? (
                      <div style={emptyInlineCardStyle}>
                        No prescriptions added yet.
                      </div>
                    ) : (
                      prescriptionList.map((item, index) => (
                        <div key={index} style={prescriptionItemStyle}>
                          <div>
                            <p style={prescriptionNameStyle}>{item}</p>
                          </div>

                          <button
                            onClick={() => handleRemovePrescription(index)}
                            style={removePrescriptionButtonStyle}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}

                    <div style={prescriptionInputRowStyle}>
                      <input
                        type="text"
                        value={prescriptionInput}
                        onChange={(e) => setPrescriptionInput(e.target.value)}
                        placeholder="e.g. Bisoprolol 2.5mg · 1/day · 30 days"
                        style={prescriptionInputStyle}
                      />

                      <button
                        onClick={handleAddPrescription}
                        style={addButtonStyle}
                        type="button"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </section>

                <section style={sectionCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>LAB REQUESTS</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
                    <div style={labRequestRowStyle}>
                      <select
                        value={selectedLabCode}
                        onChange={(e) => setSelectedLabCode(e.target.value)}
                        style={labSelectStyle}
                      >
                        {catalogLabTests.length === 0 ? (
                          <option value="">No lab tests found</option>
                        ) : (
                          catalogLabTests.map((test) => (
                            <option key={test.code} value={test.code}>
                              {test.code} - {test.name}
                            </option>
                          ))
                        )}
                      </select>

                      <button
                        onClick={handleRequestLabTest}
                        style={primaryActionButtonStyle}
                        disabled={
                          labSubmitLoading ||
                          !selectedLabCode ||
                          catalogLabTests.length === 0
                        }
                      >
                        {labSubmitLoading ? "Requesting..." : "Request Lab Test"}
                      </button>
                    </div>

                    {labLoading ? (
                      <p style={{ color: "#6f8ea0" }}>Loading lab requests...</p>
                    ) : labRequests.length === 0 ? (
                      <div style={emptyInlineCardStyle}>
                        No lab tests requested for this appointment yet.
                      </div>
                    ) : (
                      labRequests.map((lab) => (
                        <div key={lab._id || lab.id} style={labRequestItemStyle}>
                          <div>
                            <p style={labNameStyle}>
                              {lab.lab_test_code} - {lab.lab_test_name}
                            </p>
                            <p style={labMetaStyleInline}>
                              {lab.lab_test_category || "N/A"} ·{" "}
                              {lab.price_snapshot ?? "N/A"} DH
                            </p>
                            {lab.result && (
                              <p style={labResultTextStyle}>Result: {lab.result}</p>
                            )}
                          </div>

                          <span style={getLabBadgeStyle(lab.status)}>
                            {lab.status || "PENDING"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section style={sectionCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>VISIT HISTORY</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
                    <div style={historyItemStyle}>
                      <p style={historyDateStyle}>Current visit</p>
                      <div>
                        <p style={historyTitleStyle}>{serviceName}</p>
                        <p style={historyMetaStyle}>
                          {appointmentDate
                            ? new Date(appointmentDate).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {consultation && (
                      <div style={historyItemStyle}>
                        <p style={historyDateStyle}>Consultation</p>
                        <div>
                          <p style={historyTitleStyle}>Diagnosis saved</p>
                          <p style={historyMetaStyle}>
                            {consultation.diagnosis || "Consultation recorded"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div style={rightColumnStyle}>
                <section style={sideCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>ACTIONS</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                    <button
                      onClick={handleCompleteVisit}
                      disabled={submitLoading}
                      style={primaryActionButtonStyle}
                    >
                      💾 {submitLoading ? "Saving..." : "Save & Complete Visit"}
                    </button>

                    <button
                      style={greenActionButtonStyle}
                      onClick={handleApproveAppointment}
                      disabled={actionLoading}
                    >
                      ✓ {actionLoading ? "Processing..." : "Approve Appointment"}
                    </button>

                    <button
                      style={secondaryActionButtonStyle}
                      onClick={handleRescheduleAppointment}
                      disabled={actionLoading}
                    >
                      ⟳ Reschedule
                    </button>

                    <button
                      style={secondaryActionButtonStyle}
                      onClick={() => window.print()}
                    >
                      📄 Print Summary
                    </button>
                  </div>
                </section>

                <section style={sideCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>SESSION DETAILS</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <InfoLine
                      label="Date"
                      value={
                        appointmentDate
                          ? new Date(appointmentDate).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <InfoLine label="Time" value={formatTime(appointmentDate)} />
                    <InfoLine label="Duration" value="60 minutes" />
                    <InfoLine label="Room" value="Room 204" />
                    <InfoLine label="Type" value="In-person" />
                    <InfoLine
                      label="Status"
                      value={
                        <span style={getAppointmentBadgeStyle()}>
                          {appointmentStatus || "Awaiting"}
                        </span>
                      }
                    />
                  </div>
                </section>

                <section style={sideCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>NEXT STEPS</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
                    {nextSteps.map((step, index) => (
                      <label key={index} style={checkboxRowStyle}>
                        <input
                          type="checkbox"
                          checked={step.checked}
                          onChange={() => handleToggleStep(index)}
                        />
                        <span>{step.label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section style={sideCardStyle}>
                  <div style={sectionTitleRowStyle}>
                    <span style={sectionTitleStyle}>BILLING</span>
                    <div style={sectionLineStyle} />
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <p style={billingTextStyle}>
                      Payment:{" "}
                      <span style={getBillingBadgeStyle()}>
                        {billing?.status || "UNPAID"}
                      </span>
                    </p>
                    {billing?.amount != null && (
                      <p style={billingTextStyle}>Amount: {billing.amount}</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function InfoLine({ label, value }) {
  return (
    <div style={infoLineStyle}>
      <span style={infoLineLabelStyle}>{label}</span>
      <span style={infoLineValueStyle}>{value}</span>
    </div>
  )
}
const pageStyle = {
  minHeight: "100vh",
  width: "100%",
  background: "#f7f8fc",
  fontFamily: "Inter, Arial, sans-serif",
}

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "250px 1fr",
  minHeight: "100vh",
}

const sidebarStyle = {
  background: "linear-gradient(180deg, #0F3D63, #0C447C)",
  color: "white",
  padding: "18px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 10px 30px rgba(15, 61, 99, 0.22)",
}

const brandRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "0 22px 18px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
}

const logoStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
}

const brandTitleStyle = {
  margin: 0,
  fontSize: "1.9rem",
  fontWeight: "700",
  color: "white",
}

const brandSubtitleStyle = {
  margin: "4px 0 0",
  color: "rgba(255,255,255,0.8)",
  fontSize: "0.95rem",
}

const sidebarSectionTitleStyle = {
  padding: "18px 22px 8px",
  fontSize: "0.9rem",
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.62)",
  fontWeight: "700",
}

const sidebarMenuStyle = {
  display: "grid",
  gap: "8px",
  padding: "0 14px",
}

const sidebarItemStyle = {
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.95)",
  padding: "14px 14px",
  borderRadius: "14px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "1rem",
  textAlign: "left",
}

const sidebarActiveItemStyle = {
  ...sidebarItemStyle,
  background: "rgba(255,255,255,0.16)",
  fontWeight: "700",
}

const sidebarDoctorCardStyle = {
  margin: "0 18px 18px",
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.12)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
}

const sidebarDoctorAvatarStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.18)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
}

const sidebarDoctorNameStyle = {
  margin: 0,
  fontWeight: "700",
  color: "white",
}

const sidebarDoctorDeptStyle = {
  margin: "4px 0 0",
  color: "rgba(255,255,255,0.8)",
}

const mainStyle = {
  padding: "22px 28px 28px",
}

const backLinkStyle = {
  border: "none",
  background: "transparent",
  color: "#6D6AAE",
  cursor: "pointer",
  fontSize: "1.1rem",
  marginBottom: "16px",
}

const heroCardStyle = {
  background: "#FFFFFF",
  borderRadius: "28px",
  padding: "24px 26px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
  marginBottom: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
}

const heroLeftStyle = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
  flexWrap: "wrap",
}

const dateCardStyle = {
  width: "84px",
  height: "84px",
  borderRadius: "20px",
  background: "linear-gradient(180deg, #8E8BFF, #26215C)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 12px 26px rgba(108, 99, 255, 0.24)",
}

const dateDayStyle = {
  fontSize: "2rem",
  fontWeight: "700",
  lineHeight: 1,
}

const dateMonthStyle = {
  marginTop: "6px",
  letterSpacing: "0.08em",
  fontSize: "0.95rem",
}

const heroTitleStyle = {
  margin: 0,
  fontSize: "2rem",
  color: "#1F2A44",
  fontWeight: "700",
}

const heroMetaStyle = {
  margin: "8px 0 0",
  color: "#8A8FB2",
  fontSize: "1rem",
}

const heroBadgesRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
}

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "0.95rem",
}

const softBlueBadgeStyle = {
  ...badgeStyle,
  background: "#EDEBFF",
  color: "#6C63FF",
}

const softGoldBadgeStyle = {
  ...badgeStyle,
  background: "#FDF1D6",
  color: "#A16207",
}

const softIndigoBadgeStyle = {
  ...badgeStyle,
  background: "#F1F0FF",
  color: "#5B56D6",
}

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.4fr 0.8fr",
  gap: "20px",
}

const leftColumnStyle = {
  display: "grid",
  gap: "18px",
}

const rightColumnStyle = {
  display: "grid",
  gap: "18px",
  alignContent: "start",
}

const sectionCardStyle = {
  background: "#FFFFFF",
  borderRadius: "26px",
  padding: "22px 22px 20px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
}

const sideCardStyle = {
  background: "#FFFFFF",
  borderRadius: "22px",
  padding: "22px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
}

const sectionTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
}

const sectionTitleStyle = {
  color: "#6C63FF",
  fontWeight: "700",
  letterSpacing: "0.08em",
  fontSize: "0.95rem",
  whiteSpace: "nowrap",
}

const sectionLineStyle = {
  height: "1px",
  background: "#E7E5F4",
  flex: 1,
}

const patientHeaderStyle = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  paddingBottom: "16px",
  borderBottom: "1px solid #E7E5F4",
}

const patientAvatarStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "16px",
  background: "linear-gradient(180deg, #8E8BFF, #6C63FF)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "1.1rem",
}

const patientNameStyle = {
  margin: 0,
  color: "#1F2A44",
  fontSize: "1.5rem",
}

const patientMetaStyle = {
  margin: "6px 0 0",
  color: "#8A8FB2",
}

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px 28px",
  marginTop: "18px",
}

const summaryLabelStyle = {
  margin: 0,
  fontSize: "0.8rem",
  letterSpacing: "0.08em",
  color: "#8A8FB2",
  fontWeight: "700",
}

const summaryValueStyle = {
  margin: "8px 0 0",
  color: "#2F3655",
  fontWeight: "600",
  lineHeight: 1.5,
  wordBreak: "break-word",
}

const largeTextareaStyle = {
  width: "100%",
  resize: "vertical",
  border: "1px solid #E7E5F4",
  borderRadius: "18px",
  padding: "16px 18px",
  fontSize: "1rem",
  outline: "none",
  color: "#2F3655",
  background: "#F8F7FF",
  boxSizing: "border-box",
}

const editedTextStyle = {
  margin: "10px 2px 0",
  color: "#8A8FB2",
  fontSize: "0.92rem",
}

const emptyInlineCardStyle = {
  border: "1px dashed #D9D5F6",
  borderRadius: "16px",
  padding: "14px 16px",
  color: "#7D84A2",
  background: "#F8F7FF",
}

const prescriptionItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  background: "#F8F7FF",
  border: "1px solid #E7E5F4",
  borderRadius: "16px",
  padding: "14px 16px",
}

const prescriptionNameStyle = {
  margin: 0,
  color: "#2F3655",
  fontWeight: "600",
}

const removePrescriptionButtonStyle = {
  border: "none",
  background: "#FEE2E2",
  color: "#B91C1C",
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "700",
}

const prescriptionInputRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "12px",
}

const prescriptionInputStyle = {
  width: "100%",
  border: "1px solid #E7E5F4",
  borderRadius: "16px",
  padding: "14px 16px",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  background: "#FFFFFF",
  color: "#2F3655",
}

const addButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #8E8BFF, #6C63FF)",
  color: "white",
  padding: "0 18px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 20px rgba(108, 99, 255, 0.2)",
}

const labRequestRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "12px",
}

const labSelectStyle = {
  width: "100%",
  border: "1px solid #E7E5F4",
  borderRadius: "16px",
  padding: "14px 16px",
  fontSize: "1rem",
  background: "#FFFFFF",
  outline: "none",
  color: "#2F3655",
}

const labRequestItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  background: "#F8F7FF",
  border: "1px solid #E7E5F4",
  borderRadius: "16px",
  padding: "14px 16px",
}

const labNameStyle = {
  margin: 0,
  color: "#2F3655",
  fontWeight: "700",
}

const labMetaStyleInline = {
  margin: "6px 0 0",
  color: "#7D84A2",
  fontSize: "0.95rem",
}

const labResultTextStyle = {
  margin: "8px 0 0",
  color: "#2F3655",
  fontSize: "0.95rem",
}

const historyItemStyle = {
  display: "grid",
  gridTemplateColumns: "110px 1fr",
  gap: "16px",
  alignItems: "start",
  padding: "14px 0",
  borderBottom: "1px solid #F0EEFB",
}

const historyDateStyle = {
  margin: 0,
  color: "#0a0d4d",
  fontWeight: "700",
  fontSize: "0.95rem",
  fontFamily: "Inter, Arial, sans-serif",
}

const historyTitleStyle = {
  margin: 0,
  color: "#2F3655",
  fontWeight: "700",
}

const historyMetaStyle = {
  margin: "6px 0 0",
  color: "#7D84A2",
  lineHeight: 1.5,
}

const primaryActionButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #8E8BFF, #6C63FF)",
  color: "white",
  borderRadius: "16px",
  padding: "14px 18px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "1rem",
  boxShadow: "0 10px 24px rgba(108, 99, 255, 0.22)",
}

const greenActionButtonStyle = {
  border: "none",
  background: "linear-gradient(180deg, #0C447C, #1E2878)",
  color: "white",
  borderRadius: "16px",
  padding: "14px 18px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "1rem",
}

const secondaryActionButtonStyle = {
  border: "1px solid #E7E5F4",
  background: "#FFFFFF",
  color: "#2F3655",
  borderRadius: "16px",
  padding: "14px 18px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "1rem",
}

const infoLineStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  padding: "10px 0",
  borderBottom: "1px solid #F0EEFB",
}

const infoLineLabelStyle = {
  color: "#7D84A2",
  fontWeight: "600",
}

const infoLineValueStyle = {
  color: "#2F3655",
  fontWeight: "700",
  textAlign: "right",
}

const checkboxRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#2F3655",
}

const billingTextStyle = {
  margin: "0 0 10px",
  color: "#2F3655",
  fontWeight: "600",
}

const errorCardStyle = {
  background: "#FEE2E2",
  color: "#991B1B",
  borderRadius: "16px",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #FECACA",
}

const successCardStyle = {
  background: "#DCFCE7",
  color: "#166534",
  borderRadius: "16px",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #BBF7D0",
}

export default DoctorAppointmentDetailsPage