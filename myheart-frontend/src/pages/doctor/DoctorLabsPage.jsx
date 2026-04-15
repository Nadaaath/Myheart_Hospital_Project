import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"

function DoctorLabsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [labs, setLabs] = useState([])
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchDoctorLabs = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const profileRes = await api.get("/auth/profile", { headers })
        const refId = profileRes.data?.user?.reference_id

        if (!refId) {
          setLabs([])
          setLoading(false)
          return
        }

        try {
          const doctorRes = await api.get(`/doctors/${refId}`, { headers })
          setDoctor(doctorRes.data)
        } catch {
          setDoctor(null)
        }

        let labRows = []

        try {
          const appointmentsRes = await api.get(`/appointments/doctor/${refId}`, {
            headers,
          })

          const appointments = Array.isArray(appointmentsRes.data)
            ? appointmentsRes.data
            : []

          let catalogServices = []
          let catalogLabTests = []

          try {
            const catalogRes = await api.get("/catalog", { headers })
            catalogServices = Array.isArray(catalogRes.data) ? catalogRes.data : []
          } catch {
            catalogServices = []
          }

          try {
            const labCatalogRes = await api.get("/catalog/lab-tests", { headers })
            catalogLabTests = Array.isArray(labCatalogRes.data)
              ? labCatalogRes.data
              : []
          } catch {
            catalogLabTests = []
          }

          const serviceMap = new Map(
            catalogServices.map((service) => [Number(service.id), service])
          )

          const labTestMap = new Map(
            catalogLabTests.map((test) => [test.code, test])
          )

          const uniquePatientIds = [
            ...new Set(
              appointments
                .map((appointment) => appointment.patient_id)
                .filter(Boolean)
                .map(Number)
            ),
          ]

          const patientResults = await Promise.all(
            uniquePatientIds.map(async (patientId) => {
              try {
                const patientRes = await api.get(`/patients/${patientId}`, {
                  headers,
                })
                return [patientId, patientRes.data]
              } catch {
                return [patientId, null]
              }
            })
          )

          const patientMap = new Map(patientResults)

          const labResults = await Promise.all(
            appointments.map(async (appointment) => {
              try {
                const res = await api.get(`/labs/appointment/${appointment.id}`, {
                  headers,
                })

                const items = Array.isArray(res.data) ? res.data : []
                const patient = patientMap.get(Number(appointment.patient_id))
                const service = serviceMap.get(Number(appointment.service_id))

                const patientName = patient
                  ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
                  : null

                return items.map((lab) => {
                  const mappedTest = labTestMap.get(lab.lab_test_code)

                  return {
                    ...lab,
                    appointment_id: appointment.id,
                    appointment_date: appointment.appointment_date,
                    patient_id: appointment.patient_id,
                    patient_name: patientName || `Patient #${appointment.patient_id}`,
                    patient_age: patient?.birth_date
                      ? calculateAge(patient.birth_date)
                      : patient?.age || null,
                    patient_gender: patient?.gender || null,
                    service_name:
                      service?.name ||
                      appointment.service_name ||
                      `Service #${appointment.service_id}`,
                    lab_test_name:
                      lab.lab_test_name ||
                      lab.test_name ||
                      lab.name ||
                      mappedTest?.name ||
                      "Unnamed test",
                  }
                })
              } catch {
                return []
              }
            })
          )

          labRows = labResults.flat()
        } catch (err) {
          console.error("Error fetching labs from appointments:", err)
        }

        setLabs(labRows)
      } catch (err) {
        console.error("Doctor labs fetch error:", err)
        setError("Failed to load lab requests.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorLabs()
  }, [token])

  const doctorName =
    doctor?.first_name && doctor?.last_name
      ? `Dr. ${doctor.first_name} ${doctor.last_name}`
      : "Doctor"

  const doctorSpecialty = doctor?.department || "Specialist"

  const initials =
    doctor?.first_name && doctor?.last_name
      ? `${doctor.first_name[0]}${doctor.last_name[0]}`
      : "DR"

  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      const normalizedStatus = (lab.status || "").toUpperCase()
      const matchesStatus =
        statusFilter === "ALL" || normalizedStatus === statusFilter

      const q = search.toLowerCase().trim()

      const matchesSearch =
        !q ||
        String(lab.appointment_id || "").includes(q) ||
        String(lab.patient_id || "").includes(q) ||
        (lab.patient_name || "").toLowerCase().includes(q) ||
        (lab.lab_test_name || "").toLowerCase().includes(q) ||
        (lab.service_name || "").toLowerCase().includes(q) ||
        (lab.status || "").toLowerCase().includes(q) ||
        (lab.result || "").toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [labs, search, statusFilter])

  const readyCount = labs.filter(
    (lab) => (lab.status || "").toUpperCase() === "READY"
  ).length

  const pendingCount = labs.filter(
    (lab) =>
      (lab.status || "").toUpperCase() === "PENDING" ||
      (lab.status || "").toUpperCase() === "REQUESTED"
  ).length

  const completedCount = labs.filter(
    (lab) => (lab.result || "").trim() !== ""
  ).length
  const buildLabFileUrl = (fileUrl) => {
  if (!fileUrl) return null

  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl
  }

  return `http://localhost:5000/api/labs${fileUrl}`
}

  const formatLongDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const getStatusStyle = (status) => {
    const normalized = (status || "").toUpperCase()

    if (normalized === "READY") {
      return {
        ...statusBadgeStyle,
        background: "#dcfce7",
        color: "#166534",
      }
    }

    if (normalized === "PENDING" || normalized === "REQUESTED") {
      return {
        ...statusBadgeStyle,
        background: "#fef3c7",
        color: "#92400e",
      }
    }

    if (normalized === "CANCELLED") {
      return {
        ...statusBadgeStyle,
        background: "#fee2e2",
        color: "#b91c1c",
      }
    }

    return {
      ...statusBadgeStyle,
      background: "#dbeafe",
      color: "#1d4ed8",
    }
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
                <button
                  style={sidebarItemStyle}
                  onClick={() => navigate("/dashboard")}
                >
                  ▣ Dashboard
                </button>

                <button
                  style={sidebarItemStyle}
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
                <button style={sidebarActiveItemStyle}>🧪 Lab Results</button>
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
              <div style={sidebarDoctorAvatarStyle}>{initials}</div>
              <div>
                <p style={sidebarDoctorNameStyle}>{doctorName}</p>
                <p style={sidebarDoctorDeptStyle}>{doctorSpecialty}</p>
              </div>
            </div>
          </aside>

          <main style={mainStyle}>
            <div style={topBarStyle}>
              <div style={{ color: "#6b7280", fontSize: "1rem" }}>
                {formatLongDate(new Date())}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button style={topIconButtonStyle}>🔔</button>
                <button style={topIconButtonStyle}>⋯</button>
              </div>
            </div>

            <section style={heroStyle}>
              <div>
                <h1 style={heroTitleStyle}>Doctor Lab Results</h1>
                <p style={heroSubtitleStyle}>
                  Track all requested labs for your patients and see which ones are ready.
                </p>
              </div>

              <div style={heroStatsStyle}>
                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{labs.length}</div>
                  <div style={heroStatLabelStyle}>TOTAL</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{readyCount}</div>
                  <div style={heroStatLabelStyle}>READY</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{pendingCount}</div>
                  <div style={heroStatLabelStyle}>PENDING</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{completedCount}</div>
                  <div style={heroStatLabelStyle}>WITH RESULT</div>
                </div>
              </div>
            </section>

            <section style={filterCardStyle}>
              <div style={filterHeaderStyle}>
                <span style={panelTitleStyle}>FILTERS</span>
                <div style={panelLineStyle} />
              </div>

              <div style={filterGridStyle}>
                <input
                  type="text"
                  placeholder="Search by patient, test, result, appointment ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="READY">Ready</option>
                  <option value="PENDING">Pending</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <p style={filterFooterStyle}>{filteredLabs.length} lab item(s) shown</p>
            </section>

            <section style={listCardStyle}>
              <div style={listHeaderStyle}>
                <span style={panelTitleStyle}>ALL LAB REQUESTS</span>
                <div style={panelLineStyle} />
              </div>

              {loading ? (
                <p>Loading lab requests...</p>
              ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
              ) : filteredLabs.length === 0 ? (
                <div style={emptyStateStyle}>No lab requests found.</div>
              ) : (
                <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
                  {filteredLabs.map((lab, index) => {
                    const patientLabel =
                      lab.patient_name || `Patient #${lab.patient_id ?? "N/A"}`
                    const testLabel = lab.lab_test_name || "Unnamed test"

                    const cardInitials = patientLabel
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()

                    const accentColor =
                      index % 4 === 0
                        ? "#22c55e"
                        : index % 4 === 1
                        ? "#38bdf8"
                        : index % 4 === 2
                        ? "#eab308"
                        : "#a855f7"

                    return (
                      <div
                        key={`${lab.id || lab._id || index}-${lab.appointment_id}`}
                        style={{
                          ...labRowStyle,
                          borderLeft: `4px solid ${accentColor}`,
                        }}
                      >
                        <div style={labLeftStyle}>
                          <div style={avatarCircleStyle}>{cardInitials || "PT"}</div>

                          <div>
                            <h3 style={labTitleStyle}>{patientLabel}</h3>
                            <p style={labMetaStyle}>{testLabel}</p>
                            <p style={labSubMetaStyle}>
                              {lab.patient_age || "N/A"} yrs ·{" "}
                              {lab.patient_gender || "N/A"}
                            </p>
                            <p style={labSubMetaStyle}>
                              Appointment #{lab.appointment_id ?? "N/A"} ·{" "}
                              {lab.service_name || "Service N/A"}
                            </p>
                            <p style={labSubMetaStyle}>
                              {lab.appointment_date
                                ? formatDateTime(lab.appointment_date)
                                : "N/A"}
                            </p>
                            {lab.result && (
                              <p style={labResultStyle}>Result: {lab.result}</p>
                            )}
                            {lab.file_url && (
  <a
    href={buildLabFileUrl(lab.file_url)}
    target="_blank"
    rel="noreferrer"
    style={labFileButtonStyle}
  >
    Download PDF
  </a>
)}
                          </div>
                        </div>

                        <div style={labRightStyle}>
                          <span style={getStatusStyle(lab.status)}>
                            {lab.status || "UNKNOWN"}
                          </span>

                          <button
                            onClick={() =>
                              navigate(`/doctor/appointments/${lab.appointment_id}`)
                            }
                            style={openButtonStyle}
                          >
                            Open Appointment →
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function calculateAge(birthDate) {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--
  }

  return age
}
const pageStyle = {
  minHeight: "100vh",
  width: "100%",
  background: "#F3F2FB",
  fontFamily: "Inter, Arial, sans-serif",
}

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "250px 1fr",
  minHeight: "100vh",
}

const sidebarStyle = {
  background: "linear-gradient(180deg, #0f1e3c, #0C447C)",
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
  padding: "0 18px 18px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
}

const logoStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
}

const brandTitleStyle = {
  margin: 0,
  fontSize: "1.8rem",
  fontWeight: "700",
  color: "white",
}

const brandSubtitleStyle = {
  margin: "4px 0 0",
  color: "rgba(255,255,255,0.8)",
  fontSize: "0.95rem",
}

const sidebarSectionTitleStyle = {
  padding: "18px 18px 8px",
  fontSize: "0.9rem",
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.62)",
  fontWeight: "700",
}

const sidebarMenuStyle = {
  display: "grid",
  gap: "8px",
  padding: "0 10px",
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
  margin: "0 16px 16px",
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.12)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
}

const sidebarDoctorAvatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.2)",
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
  padding: "18px 24px 28px",
}

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
}

const topIconButtonStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  border: "1px solid #E7E5F4",
  background: "#FFFFFF",
  cursor: "pointer",
  fontSize: "18px",
  color: "#0F3D63",
}

const heroStyle = {
  background: "linear-gradient(135deg, #0F3D63, #0C447C)",
  borderRadius: "28px",
  padding: "28px 30px",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "20px",
  boxShadow: "0 16px 34px rgba(15, 61, 99, 0.22)",
}

const heroTitleStyle = {
  margin: 0,
  fontSize: "2.2rem",
  fontWeight: "700",
}

const heroSubtitleStyle = {
  margin: "8px 0 0",
  color: "rgba(255,255,255,0.86)",
  fontSize: "1.05rem",
}

const heroStatsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
}

const heroStatBoxStyle = {
  minWidth: "80px",
  textAlign: "center",
}

const heroStatValueStyle = {
  fontSize: "2.4rem",
  fontWeight: "700",
  lineHeight: 1,
}

const heroStatLabelStyle = {
  marginTop: "8px",
  fontSize: "0.9rem",
  color: "rgba(255,255,255,0.82)",
  letterSpacing: "0.08em",
}

const heroDividerStyle = {
  width: "1px",
  height: "52px",
  background: "rgba(255,255,255,0.24)",
}

const filterCardStyle = {
  background: "#FFFFFF",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
  marginBottom: "18px",
}

const filterHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px",
}

const panelTitleStyle = {
  margin: 0,
  color: "#6C63FF",
  fontWeight: "700",
  letterSpacing: "0.08em",
  fontSize: "0.95rem",
  whiteSpace: "nowrap",
}

const panelLineStyle = {
  height: "1px",
  background: "#E7E5F4",
  flex: 1,
}

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "16px",
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  background: "#F8F7FF",
  boxSizing: "border-box",
  color: "#1F2A44",
}

const filterFooterStyle = {
  margin: "14px 0 0",
  color: "#6b7280",
}

const listCardStyle = {
  background: "#FFFFFF",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
}

const listHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px",
}

const emptyStateStyle = {
  color: "#6b7280",
  padding: "10px 0",
}

const labRowStyle = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  border: "1px solid #ECEAF7",
  boxShadow: "0 8px 20px rgba(108, 99, 255, 0.05)",
}

const labLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
}

const avatarCircleStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "14px",
  background: "#F1F0FF",
  color: "#6C63FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
}
const labFileButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "10px",
  padding: "10px 14px",
  borderRadius: "12px",
  background: "#EEEDFE",
  color: "#3C3489",
  fontWeight: "700",
  textDecoration: "none",
  border: "1px solid #CFC8FA",
}

const labTitleStyle = {
  margin: 0,
  color: "#1F2A44",
  fontSize: "1.15rem",
}

const labMetaStyle = {
  margin: "6px 0 0",
  color: "#6F728B",
}

const labSubMetaStyle = {
  margin: "6px 0 0",
  color: "#94A3B8",
  fontSize: "0.95rem",
  lineHeight: 1.5,
}

const labResultStyle = {
  margin: "8px 0 0",
  color: "#166534",
  fontWeight: "600",
}

const labRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
}

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  fontSize: "0.9rem",
  fontWeight: "700",
}

const openButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #8E8BFF, #6C63FF)",
  color: "white",
  padding: "12px 16px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 20px rgba(108, 99, 255, 0.22)",
}

export default DoctorLabsPage