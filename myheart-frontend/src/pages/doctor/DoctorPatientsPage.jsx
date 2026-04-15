import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"

function DoctorPatientsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [profile, setProfile] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDoctorPatients = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const profileRes = await api.get("/auth/profile", { headers })
        const user = profileRes.data?.user || null
        setProfile(user)

        const doctorId = user?.reference_id
        if (!doctorId) {
          setPatients([])
          setLoading(false)
          return
        }

        try {
          const doctorRes = await api.get(`/doctors/${doctorId}`, { headers })
          setDoctor(doctorRes.data)
        } catch {
          setDoctor(null)
        }

        const appointmentsRes = await api.get(`/appointments/doctor/${doctorId}`, {
          headers,
        })

        const rawAppointments = Array.isArray(appointmentsRes.data)
          ? appointmentsRes.data
          : []

        const uniquePatientIds = [
          ...new Set(
            rawAppointments
              .map((appointment) => appointment.patient_id)
              .filter(Boolean)
              .map(Number)
          ),
        ]

        const patientResults = await Promise.all(
          uniquePatientIds.map(async (patientId) => {
            try {
              const patientRes = await api.get(`/patients/${patientId}`, { headers })
              return [patientId, patientRes.data]
            } catch {
              return [patientId, null]
            }
          })
        )

        const patientMap = new Map(patientResults)

        const enrichedPatients = uniquePatientIds
          .map((patientId) => {
            const patient = patientMap.get(patientId)
            if (!patient) return null

            const patientAppointments = rawAppointments
              .filter((appointment) => Number(appointment.patient_id) === Number(patientId))
              .sort(
                (a, b) =>
                  new Date(b.appointment_date).getTime() -
                  new Date(a.appointment_date).getTime()
              )

            const latestAppointment = patientAppointments[0] || null

            const nextAppointment =
              [...patientAppointments]
                .filter(
                  (appointment) =>
                    new Date(appointment.appointment_date).getTime() >= Date.now() &&
                    (appointment.status || "").toUpperCase() === "SCHEDULED"
                )
                .sort(
                  (a, b) =>
                    new Date(a.appointment_date).getTime() -
                    new Date(b.appointment_date).getTime()
                )[0] || null

            const fullName =
              `${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
              `Patient #${patient.id}`

            return {
              ...patient,
              full_name: fullName,
              age: patient.birth_date
                ? calculateAge(patient.birth_date)
                : patient.age || "N/A",
              appointments_count: patientAppointments.length,
              latest_appointment: latestAppointment,
              next_appointment: nextAppointment,
            }
          })
          .filter(Boolean)

        setPatients(enrichedPatients)
      } catch (error) {
        console.error("Doctor patients fetch error:", error)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorPatients()
  }, [token])

  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) return patients

    return patients.filter((patient) => {
      const haystack = [
        patient.full_name,
        patient.email,
        patient.phone,
        patient.gender,
        patient.blood_type,
        patient.insurance_provider,
        patient.social_security_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [patients, searchTerm])

  const totalPatients = patients.length
  const totalUpcoming = patients.filter((p) => p.next_appointment).length
  const totalInsured = patients.filter((p) => p.insurance_provider).length

  const doctorName =
    doctor?.first_name && doctor?.last_name
      ? `Dr. ${doctor.first_name} ${doctor.last_name}`
      : "Doctor"

  const doctorDepartment = doctor?.department || "Specialist"

  const initials =
    doctor?.first_name && doctor?.last_name
      ? `${doctor.first_name[0]}${doctor.last_name[0]}`
      : "DR"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/")
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ width: "100%" }}>
          <p>Loading patients...</p>
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

                <button style={sidebarActiveItemStyle}>
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
                
                <button style={sidebarItemStyle} onClick={handleLogout}>
                  ↩ Log out
                </button>
              </div>
            </div>

            <div style={sidebarDoctorCardStyle}>
              <div style={sidebarDoctorAvatarStyle}>{initials}</div>
              <div>
                <p style={sidebarDoctorNameStyle}>{doctorName}</p>
                <p style={sidebarDoctorDeptStyle}>{doctorDepartment}</p>
              </div>
            </div>
          </aside>

          <main style={mainStyle}>
            <div style={pageDateStyle}>
              {new Date().toLocaleDateString([], {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>

            <section style={heroCardStyle}>
              <div style={heroGlowStyle} />
              <div style={heroContentStyle}>
                <div style={heroTextBlockStyle}>
                  <p style={heroEyebrowStyle}>Patient Directory</p>
                  <h1 style={pageTitleStyle}>My Patients</h1>
                  <p style={pageSubtitleStyle}>
                    View and manage patients linked to your appointments, review
                    their visit history, and open the latest consultation quickly.
                  </p>
                </div>

                <div style={heroRightSideStyle}>
                  <div style={heroStatCardStyle}>
                    <p style={heroStatNumberStyle}>{filteredPatients.length}</p>
                    <p style={heroStatLabelStyle}>Visible now</p>
                  </div>

                  <div style={searchWrapperStyle}>
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, insurance..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={searchInputStyle}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statIconStyle}>👥</div>
                <p style={statLabelStyle}>TOTAL PATIENTS</p>
                <h3 style={statValueStyle}>{totalPatients}</h3>
                <p style={statSubtextStyle}>unique patients</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>🗓</div>
                <p style={statLabelStyle}>UPCOMING</p>
                <h3 style={statValueStyle}>{totalUpcoming}</h3>
                <p style={statSubtextStyle}>with future appointments</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>🛡</div>
                <p style={statLabelStyle}>INSURED</p>
                <h3 style={statValueStyle}>{totalInsured}</h3>
                <p style={statSubtextStyle}>with insurance data</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>📋</div>
                <p style={statLabelStyle}>VISIBLE NOW</p>
                <h3 style={statValueStyle}>{filteredPatients.length}</h3>
                <p style={statSubtextStyle}>matching search</p>
              </div>
            </section>

            <section style={panelCardStyle}>
              <div style={panelHeaderStyle}>
                <span style={panelTitleStyle}>PATIENT DIRECTORY</span>
                <div style={panelLineStyle} />
              </div>

              {filteredPatients.length === 0 ? (
                <div style={emptyStateStyle}>No patients found.</div>
              ) : (
                <div style={patientsGridStyle}>
                  {filteredPatients.map((patient) => {
                    const latestAppointment = patient.latest_appointment
                    const nextAppointment = patient.next_appointment

                    const initials = patient.full_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <div key={patient.id} style={patientCardStyle}>
                        <div style={patientHeaderStyle}>
                          <div style={patientAvatarStyle}>{initials || "PT"}</div>

                          <div style={{ flex: 1 }}>
                            <h3 style={patientNameStyle}>{patient.full_name}</h3>
                            <p style={patientMetaStyle}>
                              MH-{patient.id} · Age {patient.age} ·{" "}
                              {patient.gender || "N/A"} ·{" "}
                              {patient.blood_type || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div style={patientInfoGridStyle}>
                          <div>
                            <p style={infoLabelStyle}>PHONE</p>
                            <p style={infoValueStyle}>{patient.phone || "N/A"}</p>
                          </div>

                          <div>
                            <p style={infoLabelStyle}>EMAIL</p>
                            <p style={infoValueStyle}>{patient.email || "N/A"}</p>
                          </div>

                          <div>
                            <p style={infoLabelStyle}>INSURANCE</p>
                            <p style={infoValueStyle}>
                              {patient.insurance_provider || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p style={infoLabelStyle}>SOCIAL SECURITY</p>
                            <p style={infoValueStyle}>
                              {patient.social_security_number || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div style={dividerStyle} />

                        <div style={appointmentsInfoStyle}>
                          <div>
                            <p style={infoLabelStyle}>TOTAL APPOINTMENTS</p>
                            <p style={infoValueStyle}>{patient.appointments_count}</p>
                          </div>

                          <div>
                            <p style={infoLabelStyle}>LAST APPOINTMENT</p>
                            <p style={infoValueStyle}>
                              {latestAppointment?.appointment_date
                                ? formatDateTime(latestAppointment.appointment_date)
                                : "N/A"}
                            </p>
                          </div>

                          <div>
                            <p style={infoLabelStyle}>NEXT APPOINTMENT</p>
                            <p style={infoValueStyle}>
                              {nextAppointment?.appointment_date
                                ? formatDateTime(nextAppointment.appointment_date)
                                : "No upcoming"}
                            </p>
                          </div>
                        </div>

                        <div style={cardActionsStyle}>
                          <button
                            style={secondaryButtonStyle}
                            onClick={() => navigate("/doctor/appointments")}
                          >
                            View Appointments
                          </button>

                          <button
                            style={primaryButtonStyle}
                            onClick={() => {
                              if (latestAppointment?.id) {
                                navigate(`/doctor/appointments/${latestAppointment.id}`)
                              }
                            }}
                            disabled={!latestAppointment?.id}
                          >
                            Open Latest Visit
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

function formatDateTime(date) {
  return new Date(date).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
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
  padding: "20px 28px 28px",
}

const pageDateStyle = {
  margin: "0 0 12px",
  color: "#9AA3C7",
  fontSize: "0.98rem",
  fontWeight: "500",
}

const heroCardStyle = {
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, #FFFFFF 0%, #F7F4FF 100%)",
  border: "1px solid #E8E3F8",
  borderRadius: "28px",
  padding: "26px 28px",
  marginBottom: "22px",
  boxShadow: "0 16px 32px rgba(108, 99, 255, 0.08)",
}

const heroGlowStyle = {
  position: "absolute",
  top: "-40px",
  right: "80px",
  width: "220px",
  height: "220px",
  borderRadius: "50%",
  background: "rgba(124, 108, 242, 0.14)",
  filter: "blur(42px)",
  pointerEvents: "none",
}

const heroContentStyle = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "22px",
  flexWrap: "wrap",
}

const heroTextBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxWidth: "760px",
}

const heroEyebrowStyle = {
  margin: 0,
  fontSize: "0.78rem",
  fontWeight: "800",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#7C6CF2",
}

const pageTitleStyle = {
  margin: 0,
  fontSize: "2.45rem",
  color: "#1F2A44",
  fontWeight: "800",
  lineHeight: 1.08,
}

const pageSubtitleStyle = {
  margin: 0,
  color: "#8A8FB2",
  fontSize: "1rem",
  lineHeight: 1.7,
  maxWidth: "640px",
}

const heroRightSideStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginLeft: "auto",
}

const heroStatCardStyle = {
  minWidth: "120px",
  padding: "16px 18px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #0F3D75 0%, #6C63FF 100%)",
  color: "#FFFFFF",
  textAlign: "center",
  boxShadow: "0 14px 28px rgba(108, 99, 255, 0.24)",
}

const heroStatNumberStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: "800",
  lineHeight: 1,
}

const heroStatLabelStyle = {
  margin: "6px 0 0",
  fontSize: "0.76rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.92,
  fontWeight: "700",
}

const searchWrapperStyle = {
  minWidth: "320px",
  flex: 1,
  maxWidth: "460px",
}

const searchInputStyle = {
  width: "100%",
  padding: "15px 18px",
  borderRadius: "18px",
  border: "1px solid #E7E5F4",
  background: "rgba(255,255,255,0.92)",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  color: "#2F3655",
  boxShadow: "0 8px 20px rgba(31, 42, 68, 0.04)",
}

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "22px",
}

const statCardStyle = {
  background: "#FFFFFF",
  borderRadius: "22px",
  padding: "18px 18px 16px",
  boxShadow: "0 10px 24px rgba(108, 99, 255, 0.08)",
}

const statIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "#F1F0FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  marginBottom: "12px",
  color: "#6C63FF",
}

const statLabelStyle = {
  margin: 0,
  color: "#8A8FB2",
  fontWeight: "700",
  letterSpacing: "0.05em",
}

const statValueStyle = {
  margin: "10px 0 0",
  fontSize: "2.3rem",
  color: "#1F2A44",
}

const statSubtextStyle = {
  margin: "6px 0 0",
  color: "#94A3B8",
}

const panelCardStyle = {
  background: "#FFFFFF",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
}

const panelHeaderStyle = {
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

const emptyStateStyle = {
  color: "#6B7280",
  padding: "10px 0",
}

const patientsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "18px",
}

const patientCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #ECEAF7",
  borderRadius: "22px",
  padding: "18px",
  boxShadow: "0 8px 20px rgba(108, 99, 255, 0.05)",
}

const patientHeaderStyle = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
}

const patientAvatarStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "16px",
  background: "linear-gradient(180deg, #6C63FF, #3A1C96)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "1.1rem",
  boxShadow: "0 10px 20px rgba(108, 99, 255, 0.2)",
}

const patientNameStyle = {
  margin: 0,
  color: "#1F2A44",
  fontSize: "1.25rem",
}

const patientMetaStyle = {
  margin: "6px 0 0",
  color: "#8A8FB2",
  lineHeight: 1.5,
}

const patientInfoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px 24px",
  marginTop: "18px",
}

const infoLabelStyle = {
  margin: 0,
  fontSize: "0.8rem",
  letterSpacing: "0.08em",
  color: "#8A8FB2",
  fontWeight: "700",
}

const infoValueStyle = {
  margin: "8px 0 0",
  color: "#2F3655",
  fontWeight: "600",
  lineHeight: 1.5,
  wordBreak: "break-word",
}

const dividerStyle = {
  height: "1px",
  background: "#E7E5F4",
  margin: "18px 0",
}

const appointmentsInfoStyle = {
  display: "grid",
  gap: "14px",
}

const cardActionsStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "18px",
}

const primaryButtonStyle = {
  border: "none",
  background: "#3A1C96",
  color: "white",
  borderRadius: "16px",
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.95rem",
  flex: 1,
  boxShadow: "0 10px 20px rgba(108, 99, 255, 0.2)",
}

const secondaryButtonStyle = {
  border: "1px solid #E7E5F4",
  background: "#FFFFFF",
  color: "#2F3655",
  borderRadius: "16px",
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.95rem",
  flex: 1,
}

export default DoctorPatientsPage