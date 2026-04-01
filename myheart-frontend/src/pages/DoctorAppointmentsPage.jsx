import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

function DoctorAppointmentsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [appointments, setAppointments] = useState([])
  const [doctorId, setDoctorId] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const profileRes = await api.get("/auth/profile", { headers })
        const refId = profileRes.data?.user?.reference_id
        setDoctorId(refId)

        if (!refId) {
          setAppointments([])
          setError("Doctor reference_id not found.")
          return
        }

        try {
          const doctorRes = await api.get(`/doctors/${refId}`, { headers })
          setDoctor(doctorRes.data)
        } catch {
          setDoctor(null)
        }

        const appointmentsRes = await api.get(`/appointments/doctor/${refId}`, {
  headers,
})

const rawAppointments = Array.isArray(appointmentsRes.data)
  ? appointmentsRes.data
  : []

let catalogServices = []
try {
  const catalogRes = await api.get("/catalog", { headers })
  catalogServices = Array.isArray(catalogRes.data) ? catalogRes.data : []
} catch {
  catalogServices = []
}

const serviceMap = new Map(
  catalogServices.map((service) => [Number(service.id), service])
)

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

const enrichedAppointments = rawAppointments.map((appointment) => {
  const patient = patientMap.get(Number(appointment.patient_id))
  const service = serviceMap.get(Number(appointment.service_id))

  const patientName = patient
    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
    : null

  return {
    ...appointment,
    patient_name: patientName || null,
    patient_age: patient?.birth_date
      ? calculateAge(patient.birth_date)
      : patient?.age || null,
    patient_gender: patient?.gender || null,
    service_name: service?.name || null,
  }
})

setAppointments(enrichedAppointments)

      } catch (err) {
        console.error("Doctor appointments fetch error:", err)
        setError("Failed to load doctor appointments.")
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorAppointments()
  }, [token])

  const now = new Date()

  const getEffectiveStatus = (appointment) => {
    const rawStatus = (appointment.status || "").toUpperCase()
    const appointmentTime = new Date(appointment.appointment_date)

    if (rawStatus === "SCHEDULED" && appointmentTime < new Date()) {
      return "MISSED"
    }

    return rawStatus
  }

  const isSameDay = (dateA, dateB) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    )
  }

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() -
        new Date(b.appointment_date).getTime()
    )
  }, [appointments])

  const filteredAppointments = useMemo(() => {
    return sortedAppointments.filter((appointment) => {
      const effectiveStatus = getEffectiveStatus(appointment)
      const appointmentTime = new Date(appointment.appointment_date)

      const matchesStatus =
        statusFilter === "ALL" || effectiveStatus === statusFilter

      let matchesDate = true
      if (dateFilter === "TODAY") {
        matchesDate = isSameDay(appointmentTime, now)
      } else if (dateFilter === "UPCOMING") {
        matchesDate =
          appointmentTime >= now && effectiveStatus === "SCHEDULED"
      } else if (dateFilter === "PAST") {
        matchesDate =
          appointmentTime < now || effectiveStatus !== "SCHEDULED"
      }

      const q = search.toLowerCase().trim()

      const patientLabel = appointment.patient_name || ""
      const serviceLabel = appointment.service_name || ""

      const matchesSearch =
        !q ||
        String(appointment.id).includes(q) ||
        String(appointment.patient_id || "").includes(q) ||
        String(appointment.service_id || "").includes(q) ||
        effectiveStatus.toLowerCase().includes(q) ||
        patientLabel.toLowerCase().includes(q) ||
        serviceLabel.toLowerCase().includes(q)

      return matchesStatus && matchesDate && matchesSearch
    })
  }, [sortedAppointments, search, statusFilter, dateFilter])

  const todayAppointments = useMemo(() => {
    return filteredAppointments.filter((appointment) => {
      const date = new Date(appointment.appointment_date)
      return isSameDay(date, now)
    })
  }, [filteredAppointments])

  const upcomingAppointments = useMemo(() => {
    return filteredAppointments.filter((appointment) => {
      const date = new Date(appointment.appointment_date)
      return date >= now && getEffectiveStatus(appointment) === "SCHEDULED"
    })
  }, [filteredAppointments])

  const pastAppointments = useMemo(() => {
    return filteredAppointments.filter((appointment) => {
      const date = new Date(appointment.appointment_date)
      const effectiveStatus = getEffectiveStatus(appointment)
      return date < now || effectiveStatus !== "SCHEDULED"
    })
  }, [filteredAppointments])

  const totalCount = appointments.length
  const upcomingCount = appointments.filter(
    (appointment) => getEffectiveStatus(appointment) === "SCHEDULED"
  ).length
  const completedCount = appointments.filter(
    (appointment) => getEffectiveStatus(appointment) === "COMPLETED"
  ).length
  const cancelledCount = appointments.filter(
    (appointment) => getEffectiveStatus(appointment) === "CANCELLED"
  ).length
  const missedCount = appointments.filter(
    (appointment) => getEffectiveStatus(appointment) === "MISSED"
  ).length

  const doctorName =
    doctor?.first_name && doctor?.last_name
      ? `Dr. ${doctor.first_name} ${doctor.last_name}`
      : "Doctor"

  const doctorSpecialty = doctor?.department || "Specialist"

  const initials =
    doctor?.first_name && doctor?.last_name
      ? `${doctor.first_name[0]}${doctor.last_name[0]}`
      : "DR"

  const formatLongDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatShortMonth = (dateValue) => {
    return new Date(dateValue).toLocaleDateString("en-GB", {
      month: "short",
    })
  }

  const formatDay = (dateValue) => {
    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
    })
  }

  const getStatusStyle = (status) => {
    const normalized = (status || "").toUpperCase()

    if (normalized === "SCHEDULED") {
      return {
        ...statusBadgeStyle,
        background: "#dbeafe",
        color: "#1d4ed8",
      }
    }

    if (normalized === "COMPLETED") {
      return { ...statusBadgeStyle, background: "#dcfce7", color: "#1e6096" }
    
    }

    if (normalized === "MISSED") {
      return {
        ...statusBadgeStyle,
        background: "#fff7ed",
        color: "#c2410c",
      }
    }

    if (normalized === "CANCELLED") {
      return {
        ...statusBadgeStyle,
        background: "#fee2e2",
        color: "#b91c1c",
      }
    }

    return statusBadgeStyle
  }
  //   const getAppointmentBadgeStyle = () => {
  //   const normalized = (appointmentStatus || "").toUpperCase()

  //   if (normalized === "COMPLETED") {
  //     return { ...badgeStyle, background: "#dcfce7", color: "#1e6096" }
  //   }

  //   if (normalized === "CANCELLED") {
  //     return { ...badgeStyle, background: "#fee2e2", color: "#b91c1c" }
  //   }

  //   if (normalized === "APPROVED") {
  //     return { ...badgeStyle, background: "#dbeafe", color: "#1d4ed8" }
  //   }

  //   return { ...badgeStyle, background: "#b4e1f3", color: "#080547" }
  // }

  const renderAppointmentCard = (appointment, index) => {
    const patientLabel = appointment.patient_name
      ? appointment.patient_name
      : `Patient #${appointment.patient_id ?? "N/A"}`

    const serviceLabel = appointment.service_name
      ? appointment.service_name
      : `Service #${appointment.service_id ?? "N/A"}`

    const effectiveStatus = getEffectiveStatus(appointment)

    const initials = patientLabel
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
        key={appointment.id}
        style={{
          ...appointmentRowStyle,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <div style={appointmentLeftStyle}>
          <div style={dateBoxStyle}>
            <div style={dateBoxDayStyle}>
              {appointment.appointment_date
                ? formatDay(appointment.appointment_date)
                : "--"}
            </div>
            <div style={dateBoxMonthStyle}>
              {appointment.appointment_date
                ? formatShortMonth(appointment.appointment_date).toUpperCase()
                : "--"}
            </div>
          </div>

          <div style={avatarCircleStyle}>{initials || "PT"}</div>

          <div>
            <h3 style={appointmentTitleStyle}>{patientLabel}</h3>
            <p style={appointmentMetaStyle}>{serviceLabel}</p>
            <p style={appointmentSubMetaStyle}>
              {appointment.appointment_date
                ? `${new Date(appointment.appointment_date).toLocaleDateString()} · ${formatTime(appointment.appointment_date)}`
                : "N/A"}
              {" · "}
              Appointment #{appointment.id}
            </p>
          </div>
        </div>

        <div style={appointmentRightStyle}>
          <span style={getStatusStyle(effectiveStatus)}>
            {effectiveStatus}
          </span>

          <button
            onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
            style={openButtonStyle}
          >
            Open →
          </button>
        </div>
      </div>
    )
  }

  const renderSection = (title, data) => (
    <section style={listCardStyle}>
      <div style={listHeaderStyle}>
        <span style={panelTitleStyle}>{title}</span>
        <div style={panelLineStyle} />
      </div>

      {data.length === 0 ? (
        <div style={emptyStateStyle}>No appointments found.</div>
      ) : (
        <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
          {data.map((appointment, index) => renderAppointmentCard(appointment, index))}
        </div>
      )}
    </section>
  )

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

                <button style={sidebarActiveItemStyle}>
                  🗓 Appointments
                  {upcomingCount > 0 && (
                    <span style={sidebarBadgeStyle}>{upcomingCount}</span>
                  )}
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
                <h1 style={heroTitleStyle}>Doctor Appointments</h1>
                <p style={heroSubtitleStyle}>
                  Review, filter, and manage all your patient visits.
                </p>
              </div>

              <div style={heroStatsStyle}>
                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{totalCount}</div>
                  <div style={heroStatLabelStyle}>TOTAL</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{upcomingCount}</div>
                  <div style={heroStatLabelStyle}>UPCOMING</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{completedCount}</div>
                  <div style={heroStatLabelStyle}>DONE</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{missedCount}</div>
                  <div style={heroStatLabelStyle}>MISSED</div>
                </div>
              </div>
            </section>

            <section style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statIconStyle}>🗓</div>
                <p style={statLabelStyle}>TOTAL</p>
                <h3 style={statValueStyle}>{totalCount}</h3>
                <p style={statSubtextStyle}>appointments</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>⏰</div>
                <p style={statLabelStyle}>UPCOMING</p>
                <h3 style={statValueStyle}>{upcomingCount}</h3>
                <p style={statSubtextStyle}>future visits</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>✅</div>
                <p style={statLabelStyle}>COMPLETED</p>
                <h3 style={statValueStyle}>{completedCount}</h3>
                <p style={statSubtextStyle}>finished visits</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>⚠️</div>
                <p style={statLabelStyle}>MISSED</p>
                <h3 style={statValueStyle}>{missedCount}</h3>
                <p style={statSubtextStyle}>past unattended</p>
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
                  placeholder="Search by appointment ID, patient, service, or status..."
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
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="MISSED">Missed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="PAST">Past / Closed</option>
                </select>
              </div>

              <p style={filterFooterStyle}>
                Doctor ID: {doctorId ?? "N/A"} · {filteredAppointments.length} appointment(s) shown
              </p>
            </section>

            {loading ? (
              <section style={listCardStyle}>
                <p>Loading appointments...</p>
              </section>
            ) : error ? (
              <section style={listCardStyle}>
                <p style={{ color: "red" }}>{error}</p>
              </section>
            ) : (
              <div style={sectionsWrapperStyle}>
                {renderSection("TODAY'S APPOINTMENTS", todayAppointments)}
                {renderSection("UPCOMING APPOINTMENTS", upcomingAppointments)}
                {renderSection("PAST / CLOSED APPOINTMENTS", pastAppointments)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f7f8fc",
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

const sidebarBadgeStyle = {
  minWidth: "22px",
  height: "22px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.8rem",
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
  minWidth: "70px",
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

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
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
  color: "#9AA3B2",
  fontWeight: "700",
  letterSpacing: "0.05em",
}

const statValueStyle = {
  margin: "10px 0 0",
  fontSize: "2.6rem",
  color: "#0F3D63",
}

const statSubtextStyle = {
  margin: "6px 0 0",
  color: "#94A3B8",
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
  color: "#26215C",
  fontWeight: "700",
  letterSpacing: "0.08em",
  fontSize: "1.05rem",
  whiteSpace: "nowrap",
}

const panelLineStyle = {
  height: "1px",
  background: "#E5E7F0",
  flex: 1,
}

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr",
  gap: "16px",
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #E5E7EB",
  fontSize: "14px",
  outline: "none",
  background: "#F8F7FF",
  boxSizing: "border-box",
  color: "#1E293B",
}

const filterFooterStyle = {
  margin: "14px 0 0",
  color: "#6B7280",
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

const sectionsWrapperStyle = {
  display: "grid",
  gap: "18px",
}

const emptyStateStyle = {
  color: "#6B7280",
  padding: "10px 0",
}

const appointmentRowStyle = {
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

const appointmentLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
}

const dateBoxStyle = {
  width: "64px",
  height: "74px",
  borderRadius: "18px",
  background: "#EEEDFE",
  border: "1.5px solid #AFA9EC",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 14px rgba(127, 119, 221, 0.12)",
}

const dateBoxDayStyle = {
  fontSize: "1.6rem",
  fontWeight: "800",
  lineHeight: 1,
  color: "#3C3489",
}

const dateBoxMonthStyle = {
  marginTop: "5px",
  fontSize: "0.82rem",
  letterSpacing: "0.08em",
  color: "#7F77DD",
  fontWeight: "700",
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

const appointmentTitleStyle = {
  margin: 0,
  color: "#1E293B",
  fontSize: "1.15rem",
}

const appointmentMetaStyle = {
  margin: "6px 0 0",
  color: "#475569",
}

const appointmentSubMetaStyle = {
  margin: "6px 0 0",
  color: "#94A3B8",
  fontSize: "0.95rem",
}

const appointmentRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
}

const statusBadgeStyle = (status) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: "700",
  }

  switch (status?.toLowerCase()) {
    case "completed":
      return { ...baseStyle, background: "#10B981", color: "white" }
    case "scheduled":
      return { ...baseStyle, background: "#6C63FF", color: "white" }
    case "missed":
      return { ...baseStyle, background: "#F59E0B", color: "white" }
    case "cancelled":
      return { ...baseStyle, background: "#EF4444", color: "white" }
    default:
      return { ...baseStyle, background: "#94A3B8", color: "white" }
  }
}

const openButtonStyle = {
  padding: "8px 18px",
  borderRadius: "10px",
  border: "1.5px solid #AFA9EC",
  background: "#EEEDFE",
  color: "#3C3489",
  fontSize: "0.82rem",
  fontWeight: "700",
  letterSpacing: "0.04em",
  cursor: "pointer",
  transition: "background 0.2s, border-color 0.2s",
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

export default DoctorAppointmentsPage