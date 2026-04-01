import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import PatientSidebar from "../components/PatientSidebar"
if (!document.querySelector('link[href*="Plus+Jakarta+Sans"]')) {
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
  document.head.appendChild(link)
}

const C = {
  navy: "#0C447C",
  navyDark: "#08345F",
  navyDeep: "#04233F",
  lavender: "#7F77DD",
  lavenderSoft: "#F6F3FF",
  lavenderCard: "#F3F0FF",
  sidebar: "#ECE8F8",
  page: "#F4F2FB",
  white: "#FFFFFF",
  border: "#E4DFF4",
  borderStrong: "#D7D0F5",
  text: "#1F1C3A",
  textMid: "#6E6893",
  textSoft: "#9A94BC",
  green: "#39B980",
  greenBg: "#DDF8EB",
  blueBg: "#DCE8FF",
  blueText: "#365BBA",
  danger: "#D95C5C",
}

const F = "'Plus Jakarta Sans', sans-serif"


function BookAppointmentPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [departments, setDepartments] = useState([])
  const [procedures, setProcedures] = useState([])
  const [doctors, setDoctors] = useState([])
  const [successMessage, setSuccessMessage] = useState("")

  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedProcedure, setSelectedProcedure] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [loadingProcedures, setLoadingProcedures] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
  try {
    setLoadingDepartments(true)
    setError("")

    const res = await api.get("/catalog?is_bookable=true")
    const services = Array.isArray(res.data) ? res.data : []

    const uniqueDepartments = [
      ...new Set(
        services
          .map((service) => service.department)
          .filter(Boolean)
      ),
    ]

    setDepartments(uniqueDepartments)
  } catch (err) {
    console.error(err)
    setDepartments([])
    setError("Failed to load departments.")
  } finally {
    setLoadingDepartments(false)
  }
}

  const fetchProcedures = async (department) => {
  try {
    setLoadingProcedures(true)
    setError("")

    const res = await api.get("/catalog?is_bookable=true")
    const services = Array.isArray(res.data) ? res.data : []

    const filtered = services.filter(
      (service) =>
        String(service.department).toLowerCase() ===
        String(department).toLowerCase()
    )

    setProcedures(filtered)
  } catch (err) {
    console.error(err)
    setProcedures([])
    setError("Failed to load procedures.")
  } finally {
    setLoadingProcedures(false)
  }
}

  const fetchDoctors = async (department) => {
  try {
    setLoadingDoctors(true)
    setError("")

    const res = await api.get(
      `/doctors?department=${encodeURIComponent(department)}`
    )

    const allDoctors = Array.isArray(res.data) ? res.data : []

    const filteredDoctors = allDoctors.filter(
      (doctor) =>
        String(doctor.department || "").toLowerCase() ===
        String(department).toLowerCase()
    )

    setDoctors(filteredDoctors)
  } catch (err) {
    console.error(err)
    setDoctors([])
    setError("Failed to load doctors.")
  } finally {
    setLoadingDoctors(false)
  }
}

  const handleDepartmentChange = async (dep) => {
    setSelectedDepartment(dep)
    setSelectedProcedure("")
    setSelectedDoctor("")
    setSelectedDate("")
    setSelectedTime("")
    setReason("")
    setNotes("")
    setError("")

    if (!dep) {
      setProcedures([])
      setDoctors([])
      return
    }

    await Promise.all([fetchProcedures(dep), fetchDoctors(dep)])
  }

  const selectedProcedureObj = useMemo(() => {
    return procedures.find((p) => String(p.id) === String(selectedProcedure)) || null
  }, [procedures, selectedProcedure])

  const selectedDoctorObj = useMemo(() => {
    return doctors.find((d) => String(d.id) === String(selectedDoctor)) || null
  }, [doctors, selectedDoctor])

  const isReady =
    selectedDepartment &&
    selectedProcedure &&
    selectedDoctor &&
    selectedDate &&
    selectedTime

  const handleBooking = async () => {
    if (!isReady) return

    try {
      setBooking(true)
      setError("")

      await api.post(
        "/appointments",
        {
          doctor_id: Number(selectedDoctor),
          service_id: Number(selectedProcedure),
          appointment_date: `${selectedDate}T${selectedTime}:00`,
          notes: [reason ? `Reason: ${reason}` : "", notes ? `Notes: ${notes}` : ""]
            .filter(Boolean)
            .join("\n"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSuccessMessage("Appointment booked successfully.")

setTimeout(() => {
  navigate("/appointments")
}, 1200)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.error || "Error booking appointment.")
    }
     finally {
      setBooking(false)
    }
  }

  const resetForm = () => {
    setSelectedDepartment("")
    setSelectedProcedure("")
    setSelectedDoctor("")
    setSelectedDate("")
    setSelectedTime("")
    setReason("")
    setNotes("")
    setProcedures([])
    setDoctors([])
    setError("")
  }

  const minDate = new Date().toISOString().split("T")[0]
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1100px) {
          .ba-layout {
            grid-template-columns: 1fr !important;
          }

          .ba-summary {
            position: relative !important;
            top: 0 !important;
          }
        }

        @media (max-width: 760px) {
          .ba-page {
            padding: 14px !important;
          }

          .ba-department-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .ba-schedule-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 560px) {
          .ba-department-grid {
            grid-template-columns: 1fr !important;
          }

          .ba-time-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      <div style={S.page} className="ba-page">
        
        <div style={S.topDate}>{todayLabel}</div>


        <section style={S.hero}>
          <div style={S.heroGlow} />
          <div style={S.heroContent}>
  <div>
    <div style={S.heroEyebrow}>GUIDED BOOKING</div>
    <h1 style={S.heroTitle}>Book Appointment</h1>
    <p style={S.heroSubtitle}>
      Select department, service, doctor, schedule, and visit details in one flow.
    </p>
  </div>

  <div style={S.heroRight}>
    <button style={S.heroBackBtn} onClick={() => navigate("/dashboard")}>
      ← Back to Dashboard
    </button>

    <div style={S.heroStats}>
      <div style={S.heroStatBox}>
        <div style={S.heroStatValue}>{departments.length}</div>
        <div style={S.heroStatLabel}>DEPARTMENTS</div>
      </div>
      <div style={S.heroStatDivider} />
      <div style={S.heroStatBox}>
        <div style={S.heroStatValue}>
          {[
            selectedDepartment,
            selectedProcedure,
            selectedDoctor,
            selectedDate && selectedTime,
          ].filter(Boolean).length}/4
        </div>
        <div style={S.heroStatLabel}>PROGRESS</div>
      </div>
    </div>
  </div>
</div>
        </section>

        {error ? <div style={S.errorBox}>{error}</div> : null}
        {successMessage ? <div style={S.successBox}>{successMessage}</div> : null}

        <div style={S.layout} className="ba-layout">
          <div style={S.main}>
            <div style={S.card}>
  <div style={S.cardTitle}>1. Department</div>
  <div style={S.cardSubtitle}>
    Choose the department first.
  </div>

  <select
    style={S.input}
    value={selectedDepartment}
    onChange={(e) => handleDepartmentChange(e.target.value)}
    disabled={loadingDepartments}
  >
    <option value="">
      {loadingDepartments ? "Loading departments..." : "Choose department"}
    </option>
    {departments.map((dep) => (
      <option key={dep} value={dep}>
        {dep}
      </option>
    ))}
  </select>
</div>

            <div style={S.card}>
              <div style={S.cardTitle}>2. Service</div>
              <div style={S.cardSubtitle}>
                After selecting a department, choose one available service.
              </div>

              <select
                style={S.input}
                value={selectedProcedure}
                onChange={(e) => {
                  setSelectedProcedure(e.target.value)
                  setSelectedDoctor("")
                  setSelectedDate("")
                  setSelectedTime("")
                }}
                disabled={!selectedDepartment || loadingProcedures}
              >
                <option value="">
                  {!selectedDepartment
                    ? "Choose department first"
                    : loadingProcedures
                    ? "Loading services..."
                    : "Choose service"}
                </option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>3. Doctor</div>
              <div style={S.cardSubtitle}>
                Choose a doctor from the selected department.
              </div>

              <select
                style={S.input}
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value)
                  setSelectedDate("")
                  setSelectedTime("")
                }}
                disabled={!selectedProcedure || loadingDoctors}
              >
                <option value="">
                  {!selectedProcedure
                    ? "Choose service first"
                    : loadingDoctors
                    ? "Loading doctors..."
                    : "Choose doctor"}
                </option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>4. Schedule</div>
              <div style={S.cardSubtitle}>
                Pick the appointment date and time.
              </div>

              <div style={S.scheduleGrid} className="ba-schedule-grid">
                <div>
                  <label style={S.label}>Date</label>
                  <input
                    type="date"
                    min={minDate}
                    style={S.input}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTime("")
                    }}
                    disabled={!selectedDoctor}
                  />
                </div>

                <div>
  <label style={S.label}>Time</label>
  <input
    type="time"
    style={S.input}
    value={selectedTime}
    onChange={(e) => setSelectedTime(e.target.value)}
    disabled={!selectedDate}
  />
</div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>5. Visit details</div>
              <div style={S.cardSubtitle}>
                Add the reason and any useful notes.
              </div>

              <label style={S.label}>Reason</label>
              <input
                type="text"
                style={S.input}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: routine consultation, abdominal pain..."
              />

              <label style={{ ...S.label, marginTop: 14 }}>Notes</label>
              <textarea
                style={S.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe symptoms or other details..."
              />
            </div>
          </div>

          <aside style={S.summary} className="ba-summary">
            <div style={S.summaryTitle}>Booking Summary</div>

            <div style={S.summaryRow}>
              <span style={S.summaryLabel}>Department</span>
              <span style={S.summaryValue}>{selectedDepartment || "—"}</span>
            </div>

            <div style={S.summaryRow}>
              <span style={S.summaryLabel}>Service</span>
              <span style={S.summaryValue}>{selectedProcedureObj?.name || "—"}</span>
            </div>

            <div style={S.summaryRow}>
              <span style={S.summaryLabel}>Doctor</span>
              <span style={S.summaryValue}>
                {selectedDoctorObj
                  ? `Dr. ${selectedDoctorObj.first_name} ${selectedDoctorObj.last_name}`
                  : "—"}
              </span>
            </div>

            <div style={S.summaryRow}>
              <span style={S.summaryLabel}>Date</span>
              <span style={S.summaryValue}>{selectedDate || "—"}</span>
            </div>

            <div style={S.summaryRow}>
              <span style={S.summaryLabel}>Time</span>
              <span style={S.summaryValue}>{selectedTime || "—"}</span>
            </div>

            <div style={S.summaryNoteBox}>
              <div style={S.summaryNoteTitle}>Visit note</div>
              <div style={S.summaryNoteText}>
                {reason || notes || "No details added yet."}
              </div>
            </div>

            <button
              style={{
                ...S.primaryBtn,
                opacity: !isReady || booking ? 0.65 : 1,
                cursor: !isReady || booking ? "not-allowed" : "pointer",
              }}
              onClick={handleBooking}
              disabled={!isReady || booking}
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </button>

            <button style={S.secondaryBtn} onClick={resetForm}>
              Clear Selection
            </button>
          </aside>
        </div>
      </div>
    </>
  )
}

const S = {
  page: {
    minHeight: "100vh",
    background: C.page,
    padding: "18px",
    fontFamily: F,
  },
  topDate: {
    fontSize: "15px",
    color: C.textSoft,
    marginBottom: "12px",
    paddingLeft: "4px",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 55%, ${C.navyDeep} 100%)`,
    borderRadius: "28px",
    padding: "28px 30px",
    marginBottom: "20px",
    boxShadow: "0 22px 44px rgba(12, 68, 124, 0.18)",
  },
  heroGlow: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(127, 119, 221, 0.12)",
    right: "18%",
    top: "-120px",
    filter: "blur(10px)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "800",
    marginBottom: "10px",
  },
  heroTitle: {
    margin: 0,
    color: C.white,
    fontSize: "2.2rem",
    lineHeight: 1.08,
    fontWeight: "800",
  },
  heroSubtitle: {
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.5,
    maxWidth: "620px",
  },
  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  heroStatBox: {
    textAlign: "center",
  },
  heroStatValue: {
    color: C.white,
    fontWeight: "800",
    fontSize: "1.9rem",
    lineHeight: 1,
  },
  heroStatLabel: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.62)",
    fontSize: "12px",
    letterSpacing: "0.10em",
    fontWeight: "700",
  },
  heroStatDivider: {
    width: "1px",
    height: "44px",
    background: "rgba(255,255,255,0.16)",
  },
  heroRight: {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
},

heroBackBtn: {
  border: "1px solid rgba(255,255,255,0.20)",
  background: C.white,
  color: C.navyDeep,
  borderRadius: "12px",
  padding: "10px 14px",
  fontFamily: F,
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
},
  errorBox: {
    marginBottom: "16px",
    background: "#FFF1F1",
    border: "1px solid #F7D0D0",
    color: C.danger,
    borderRadius: "16px",
    padding: "14px 16px",
    fontWeight: "600",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.6fr 0.9fr",
    gap: "18px",
    alignItems: "start",
  },
  main: {
    display: "grid",
    gap: "16px",
  },
  card: {
    background: C.white,
    borderRadius: "22px",
    border: `1px solid ${C.border}`,
    padding: "22px",
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  cardTitle: {
    color: C.text,
    fontSize: "1.1rem",
    fontWeight: "800",
    marginBottom: "6px",
  },
  cardSubtitle: {
    color: C.textSoft,
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
  departmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  departmentBtn: {
    border: `1px solid ${C.borderStrong}`,
    background: C.white,
    color: C.text,
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    fontFamily: F,
    textAlign: "left",
    fontWeight: "700",
  },
  departmentBtnActive: {
    background: C.navy,
    color: C.white,
    border: `1px solid ${C.navy}`,
    boxShadow: "0 12px 22px rgba(12, 68, 124, 0.18)",
  },
  departmentIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: C.lavenderSoft,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: C.navy,
    fontWeight: "800",
    flexShrink: 0,
  },
  departmentText: {
    fontSize: "15px",
  },
  input: {
    width: "100%",
    height: "52px",
    borderRadius: "14px",
    border: `1px solid ${C.borderStrong}`,
    background: C.white,
    color: C.text,
    padding: "0 16px",
    outline: "none",
    fontFamily: F,
    fontSize: "15px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "16px",
    border: `1px solid ${C.borderStrong}`,
    background: C.white,
    color: C.text,
    padding: "14px 16px",
    outline: "none",
    fontFamily: F,
    fontSize: "15px",
    resize: "vertical",
  },
  scheduleGrid: {
    display: "grid",
    gridTemplateColumns: "0.85fr 1.15fr",
    gap: "16px",
  },
  label: {
    display: "block",
    color: C.text,
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "10px",
  },
backBtn: {
  border: `1px solid ${C.navy}`,
  background: C.white,
  color: C.text,
  borderRadius: "12px",
  padding: "10px 14px",
  fontFamily: F,
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
},
  timeBtn: {
    height: "44px",
    borderRadius: "12px",
    border: `1px solid ${C.borderStrong}`,
    background: C.white,
    color: C.text,
    fontWeight: "700",
    fontFamily: F,
  },
  timeBtnActive: {
    background: C.navy,
    color: C.white,
    border: `1px solid ${C.navy}`,
    boxShadow: "0 12px 20px rgba(12, 68, 124, 0.16)",
  },
  summary: {
    background: C.white,
    borderRadius: "22px",
    border: `1px solid ${C.border}`,
    padding: "22px",
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
    position: "sticky",
    top: "18px",
  },
  summaryTitle: {
    color: C.text,
    fontSize: "1.3rem",
    fontWeight: "800",
    marginBottom: "18px",
  },
  summaryRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "14px",
  },
  summaryLabel: {
    color: C.textSoft,
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: C.text,
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: 1.45,
  },
  summaryNoteBox: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "14px 16px",
    margin: "8px 0 16px",
  },
  summaryNoteTitle: {
    color: C.text,
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "6px",
  },
  summaryNoteText: {
    color: C.textMid,
    fontSize: "14px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  primaryBtn: {
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "14px",
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
    color: C.white,
    fontWeight: "800",
    fontFamily: F,
    fontSize: "15px",
  },
  secondaryBtn: {
    width: "100%",
    height: "48px",
    marginTop: "10px",
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "14px",
    background: C.white,
    color: C.textMid,
    fontWeight: "700",
    fontFamily: F,
    fontSize: "15px",
    cursor: "pointer",
  },
  emptyState: {
    padding: "18px",
    borderRadius: "14px",
    background: C.lavenderSoft,
    color: C.textMid,
    border: `1px dashed ${C.borderStrong}`,
    fontSize: "14px",
  },
  successBox: {
  marginBottom: "16px",
  background: "#EAF9F1",
  border: "1px solid #BFE8CF",
  color: "#1F8A57",
  borderRadius: "16px",
  padding: "14px 16px",
  fontWeight: "600",
},
}

export default BookAppointmentPage
