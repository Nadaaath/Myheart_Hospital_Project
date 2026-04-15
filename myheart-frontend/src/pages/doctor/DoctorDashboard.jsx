import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"

function DoctorDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [profile, setProfile] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctorDashboard = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const profileRes = await api.get("/auth/profile", { headers })
        const user = profileRes.data?.user || null
        setProfile(user)

        const doctorId = user?.reference_id

        if (!doctorId) {
          setAppointments([])
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
      } catch (error) {
        console.error("Doctor dashboard fetch error:", error)
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorDashboard()
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/")
  }

  const now = new Date()

  const getEffectiveStatus = (appointment) => {
    const rawStatus = (appointment.status || "").toUpperCase()
    const appointmentTime = new Date(appointment.appointment_date)

    if (rawStatus === "SCHEDULED" && appointmentTime < new Date()) {
      return "MISSED"
    }

    return rawStatus
  }

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() -
        new Date(b.appointment_date).getTime()
    )
  }, [appointments])

  const todayAppointments = useMemo(() => {
    return sortedAppointments.filter((appointment) => {
      const date = new Date(appointment.appointment_date)
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      )
    })
  }, [sortedAppointments, now])

  const upcomingAppointments = useMemo(() => {
    return sortedAppointments.filter((appointment) => {
      const appointmentTime = new Date(appointment.appointment_date)
      const status = (getEffectiveStatus(appointment) || "").toUpperCase()

      return appointmentTime >= now && status === "SCHEDULED"
    })
  }, [sortedAppointments, now])

  const completedCount = appointments.filter((appointment) => {
    const status = (getEffectiveStatus(appointment) || "").toUpperCase()
    return status === "COMPLETED"
  }).length

  const pendingCount = appointments.filter((appointment) => {
    const status = (getEffectiveStatus(appointment) || "").toUpperCase()
    const appointmentTime = new Date(appointment.appointment_date)

    return status === "SCHEDULED" && appointmentTime >= now
  }).length

  const waitingCount = todayAppointments.filter((appointment) => {
    const status = (getEffectiveStatus(appointment) || "").toUpperCase()
    const appointmentTime = new Date(appointment.appointment_date)

    return status === "SCHEDULED" && appointmentTime >= now
  }).length

  const remainingTodayCount = todayAppointments.filter((appointment) => {
    const status = (getEffectiveStatus(appointment) || "").toUpperCase()
    const appointmentTime = new Date(appointment.appointment_date)

    return status === "SCHEDULED" && appointmentTime >= now
  }).length

  const uniquePatientsCount = useMemo(() => {
    return new Set(
      appointments.map((appointment) => appointment.patient_id).filter(Boolean)
    ).size
  }, [appointments])

  const nextAppointment = upcomingAppointments[0] || null

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
      hour12: false,
    })
  }

  const formatScheduleDateLabel = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
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
  const isSameDay = (dateA, dateB) => {
  const a = new Date(dateA)
  const b = new Date(dateB)

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const startOfMonth = new Date(
  calendarMonth.getFullYear(),
  calendarMonth.getMonth(),
  1
)

const endOfMonth = new Date(
  calendarMonth.getFullYear(),
  calendarMonth.getMonth() + 1,
  0
)

const firstDayIndex = (startOfMonth.getDay() + 6) % 7
const daysInMonth = endOfMonth.getDate()

const calendarDays = [
  ...Array.from({ length: firstDayIndex }, (_, i) => ({
    key: `empty-${i}`,
    empty: true,
  })),
  ...Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      i + 1
    )

    const hasAppointment = appointments.some((appointment) =>
      isSameDay(appointment.appointment_date, date)
    )

    const isToday = isSameDay(date, new Date())
    const isSelected = isSameDay(date, selectedDate)

    return {
      key: date.toISOString(),
      date,
      dayNumber: i + 1,
      empty: false,
      hasAppointment,
      isToday,
      isSelected,
    }
  }),
]

const handlePrevMonth = () => {
  setCalendarMonth(
    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
  )
}

const handleNextMonth = () => {
  setCalendarMonth(
    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
  )
}
const selectedDayAppointments = sortedAppointments.filter((appointment) =>
  isSameDay(appointment.appointment_date, selectedDate)
)

  const getStatusChipStyle = (status) => {
    const normalized = (status || "").toUpperCase()

    if (normalized === "COMPLETED") {
      return {
        ...queueStatusStyle,
        background: "#dcfce7",
        color: "#166534",
      }
    }

    if (normalized === "SCHEDULED") {
      return {
        ...queueStatusStyle,
        background: "#dbeafe",
        color: "#1d4ed8",
      }
    }

    if (normalized === "MISSED") {
      return {
        ...queueStatusStyle,
        background: "#fef2f2",
        color: "#ee911f",
      }
    }

    if (normalized === "CANCELLED") {
      return {
        ...queueStatusStyle,
        background: "#fee2e2",
        color: "#b91c1c",
      }
    }

    return {
      ...queueStatusStyle,
      background: "#fef3c7",
      color: "#92400e",
    }
  }

  const nextPatientLabel = nextAppointment?.patient_name
    ? nextAppointment.patient_name
    : `Patient #${nextAppointment?.patient_id ?? "N/A"}`

  const nextServiceLabel = nextAppointment?.service_name
    ? nextAppointment.service_name
    : `Service #${nextAppointment?.service_id ?? "N/A"}`

  const visibleSchedule =
    todayAppointments.length > 0
      ? todayAppointments
      : sortedAppointments.slice(0, 8)

  const pendingApprovals = upcomingAppointments.slice(0, 2)

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ width: "100%" }}>
          <p>Loading doctor dashboard...</p>
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
                <button style={sidebarActiveItemStyle}>▣ Dashboard</button>

                <button
                  style={sidebarItemStyle}
                  onClick={() => navigate("/doctor/appointments")}
                >
                  🗓 Appointments
                  {upcomingAppointments.length > 0 && (
                    <span style={sidebarBadgeStyle}>
                      {upcomingAppointments.length}
                    </span>
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
                <button style={sidebarItemStyle} onClick={handleLogout}>
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
                <h1 style={heroTitleStyle}>Good morning, {doctorName} ✨</h1>
                <p style={heroSubtitleStyle}>
                  You have {remainingTodayCount} appointments remaining today —{" "}
                  {completedCount} already completed
                </p>
              </div>

              <div style={heroStatsStyle}>
                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{todayAppointments.length}</div>
                  <div style={heroStatLabelStyle}>TODAY</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{completedCount}</div>
                  <div style={heroStatLabelStyle}>DONE</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{pendingCount}</div>
                  <div style={heroStatLabelStyle}>PENDING</div>
                </div>

                <div style={heroDividerStyle} />

                <div style={heroStatBoxStyle}>
                  <div style={heroStatValueStyle}>{waitingCount}</div>
                  <div style={heroStatLabelStyle}>WAITING</div>
                </div>
              </div>
            </section>

            <section style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statIconStyle}>👥</div>
                <p style={statLabelStyle}>TOTAL PATIENTS</p>
                <h3 style={statValueStyle}>{uniquePatientsCount}</h3>
                <p style={statSubtextStyle}>active in your flow</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>🗓</div>
                <p style={statLabelStyle}>THIS WEEK</p>
                <h3 style={statValueStyle}>{appointments.length}</h3>
                <p style={statSubtextStyle}>appointments</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>💊</div>
                <p style={statLabelStyle}>PRESCRIPTIONS</p>
                <h3 style={statValueStyle}>{completedCount}</h3>
                <p style={statSubtextStyle}>saved visits</p>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>🧪</div>
                <p style={statLabelStyle}>LAB REQUESTS</p>
                <h3 style={statValueStyle}>{pendingApprovals.length}</h3>
                <p style={statSubtextStyle}>awaiting action</p>
              </div>
            </section>

            <div style={dashboardGridStyle}>
              <div style={leftColumnStyle}>
                <section style={panelCardStyle}>
                  <div style={panelHeaderStyle}>
                    <span style={panelTitleStyle}>NEXT APPOINTMENT</span>
                    <div style={panelLineStyle} />
                  </div>

                  {!nextAppointment ? (
                    <div style={emptyStateStyle}>No upcoming appointment.</div>
                  ) : (
                    <div style={nextAppointmentCardStyle}>
                      <div style={nextDateCardStyle}>
                        <div style={nextDateDayStyle}>
                          {formatDay(nextAppointment.appointment_date)}
                        </div>
                        <div style={nextDateMonthStyle}>
                          {formatShortMonth(
                            nextAppointment.appointment_date
                          ).toUpperCase()}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: "10px" }}>
                          <span style={waitingBadgeStyle}>In waiting room</span>
                        </div>

                        <h3 style={nextPatientNameStyle}>{nextPatientLabel}</h3>
                        <p style={nextMetaStyle}>
                          {nextServiceLabel} ·{" "}
                          {formatTime(nextAppointment.appointment_date)} · Wing B,
                          Room 204
                        </p>
                        <p style={nextSubMetaStyle}>
                          Age {nextAppointment?.patient_age || "N/A"} ·{" "}
                          {nextAppointment?.patient_gender || "Patient"}
                        </p>

                        <div style={nextTagRowStyle}>
                          <span style={softBlueBadgeStyle}>In-person</span>
                          <span style={softIndigoBadgeStyle}>60 min</span>
                          <span style={softGoldBadgeStyle}>
                            {nextAppointment.status || "Scheduled"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/doctor/appointments/${nextAppointment.id}`)
                        }
                        style={openPrimaryButtonStyle}
                      >
                        Open →
                      </button>
                    </div>
                  )}
                </section>

                <section style={panelCardStyle}>
                  <div style={panelHeaderStyle}>
                    <span style={panelTitleStyle}>TODAY'S SCHEDULE</span>
                    <button
                      onClick={() => navigate("/doctor/appointments")}
                      style={viewAllButtonStyle}
                    >
                      View all →
                    </button>
                  </div>

                  {visibleSchedule.length === 0 ? (
                    <div style={emptyStateStyle}>No schedule available.</div>
                  ) : (
                    <div style={{ display: "grid", gap: "14px" }}>
                      {visibleSchedule.map((appointment) => {
                        const patientLabel = appointment.patient_name
                          ? appointment.patient_name
                          : `Patient #${appointment.patient_id ?? "N/A"}`

                        const serviceLabel = appointment.service_name
                          ? appointment.service_name
                          : `Service #${appointment.service_id ?? "N/A"}`

                        const cardInitials = patientLabel
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()

                        return (
                          <div key={appointment.id} style={scheduleRowStyle}>
                            <div style={scheduleTimeCardStyle}>
                              <div style={scheduleTimeMainStyle}>
                                {appointment.appointment_date
                                  ? formatTime(appointment.appointment_date)
                                  : "N/A"}
                              </div>
                              <div style={scheduleTimeSubStyle}>
                                {appointment.appointment_date
                                  ? formatScheduleDateLabel(
                                      appointment.appointment_date
                                    )
                                  : ""}
                              </div>
                            </div>

                            <div style={scheduleAvatarStyle}>
                              {cardInitials || "PT"}
                            </div>

                            <div style={{ flex: 1 }}>
                              <h4 style={schedulePatientStyle}>{patientLabel}</h4>
                              <p style={scheduleServiceStyle}>
                                {serviceLabel} · Room 204
                              </p>
                            </div>

                            <span
                              style={getStatusChipStyle(
                                getEffectiveStatus(appointment)
                              )}
                            >
                              {getEffectiveStatus(appointment)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>

              <div style={rightColumnStyle}>
                <section style={sideCardStyle}>
  <div style={panelHeaderStyle}>
    <span style={panelTitleStyle}>CALENDAR</span>
    <div style={panelLineStyle} />
  </div>

  <div style={{ marginTop: "12px" }}>
    <div style={calendarHeaderStyle}>
      <button style={calendarArrowStyle} onClick={handlePrevMonth}>
        ‹
      </button>

      <span style={calendarMonthStyle}>
        {calendarMonth.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })}
      </span>

      <button style={calendarArrowStyle} onClick={handleNextMonth}>
        ›
      </button>
    </div>

    <div style={calendarWeekStyle}>
      {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => (
        <span key={day}>{day}</span>
      ))}
    </div>

    <div style={calendarGridStyle}>
      {calendarDays.map((item) => {
        if (item.empty) {
          return <div key={item.key} style={calendarEmptyDayStyle} />
        }

        return (
          <button
            key={item.key}
            style={{
              ...calendarDayButtonStyle,
              ...(item.isToday ? calendarTodayStyle : {}),
              ...(item.isSelected ? calendarSelectedStyle : {}),
            }}
            onClick={() => setSelectedDate(item.date)}
          >
            <span>{item.dayNumber}</span>
            {item.hasAppointment && <span style={calendarDotStyle} />}
          </button>
        )
      })}
    </div>

    <div style={selectedDateSectionStyle}>
      <p style={selectedDateTitleStyle}>
        {selectedDate.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "2-digit",
          month: "short",
        })}
      </p>

      {selectedDayAppointments.length === 0 ? (
        <p style={selectedDateEmptyStyle}>No appointments on this day.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {selectedDayAppointments.map((appointment) => {
            const patientLabel = appointment.patient_name
              ? appointment.patient_name
              : `Patient #${appointment.patient_id ?? "N/A"}`

            return (
              <button
                key={appointment.id}
                style={selectedDateAppointmentStyle}
                onClick={() =>
                  navigate(`/doctor/appointments/${appointment.id}`)
                }
              >
                <div>
                  <p style={selectedDateAppointmentMetaStyle}>
                    {formatTime(appointment.appointment_date)}
                  </p>
                </div>

                <span
                  style={getStatusChipStyle(getEffectiveStatus(appointment))}
                >
                  {getEffectiveStatus(appointment)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  </div>
</section>

                <section style={sideCardStyle}>
                  <div style={panelHeaderStyle}>
                    <span style={panelTitleStyle}>PENDING APPROVALS</span>
                    <span style={approvalCountStyle}>
                      {pendingApprovals.length}
                    </span>
                  </div>

                  {pendingApprovals.length === 0 ? (
                    <div style={emptyStateStyle}>No pending approvals.</div>
                  ) : (
                    <div style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
                      {pendingApprovals.map((item) => {
                        const patientLabel = item.patient_name
                          ? item.patient_name
                          : `Patient #${item.patient_id ?? "N/A"}`

                        const itemInitials = patientLabel
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()

                        return (
                          <div key={item.id} style={approvalCardStyle}>
                            <div style={approvalIdentityStyle}>
                              <div style={approvalAvatarStyle}>
                                {itemInitials || "PT"}
                              </div>
                              <div>
                                <p style={approvalNameStyle}>{patientLabel}</p>
                                <p style={approvalMetaStyle}>
                                  {item.appointment_date
                                    ? new Date(
                                        item.appointment_date
                                      ).toLocaleString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>

                            <div style={approvalActionsStyle}>
                              <button style={approveButtonStyle}>✓</button>
                              <button style={rejectButtonStyle}>×</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                <section style={sideCardStyle}>
                  <div style={panelHeaderStyle}>
                    <span style={panelTitleStyle}>THIS MONTH</span>
                    <div style={panelLineStyle} />
                  </div>

                  <div style={monthStatsGridStyle}>
                    <div style={monthStatCardStyle}>
                      <div style={monthStatValueStyle}>{appointments.length}</div>
                      <div style={monthStatLabelStyle}>CONSULTATIONS</div>
                    </div>

                    <div style={monthStatCardStyle}>
                      <div style={monthStatValueStyle}>94%</div>
                      <div style={monthStatLabelStyle}>ATTENDANCE</div>
                    </div>

                    <div style={monthStatCardStyle}>
                      <div style={monthStatValueStyle}>{completedCount}</div>
                      <div style={monthStatLabelStyle}>PRESCRIPTIONS</div>
                    </div>

                    <div style={monthStatCardStyle}>
                      <div style={monthStatValueStyle}>
                        {pendingApprovals.length}
                      </div>
                      <div style={monthStatLabelStyle}>LAB REQUESTS</div>
                    </div>
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
  background: "linear-gradient(135deg, #0f1e3c, #0C447C)",
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
  marginBottom: "20px",
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

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.55fr 0.75fr",
  gap: "18px",
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

const panelCardStyle = {
  background: "#FFFFFF",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
}

const sideCardStyle = {
  background: "#FFFFFF",
  borderRadius: "22px",
  padding: "18px 20px",
  boxShadow: "0 12px 30px rgba(108, 99, 255, 0.08)",
}
  
const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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

const nextAppointmentCardStyle = {
  background: "#F8F7FF",
  borderRadius: "22px",
  padding: "22px",
  display: "flex",
  gap: "16px",
  alignItems: "center",
  border: "1px solid #ECEAF7",
}

const nextDateCardStyle = {
  width: "66px",
  height: "76px",
  borderRadius: "18px",
  background: "linear-gradient(180deg, #8E8BFF, #6C63FF)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 24px rgba(108, 99, 255, 0.24)",
}

const nextDateDayStyle = {
  fontSize: "1.9rem",
  fontWeight: "700",
  lineHeight: 1,
}

const nextDateMonthStyle = {
  marginTop: "6px",
  fontSize: "0.9rem",
  letterSpacing: "0.08em",
}

const waitingBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "#FDF1D6",
  color: "#A16207",
  fontWeight: "700",
  fontSize: "0.88rem",
}

const nextPatientNameStyle = {
  margin: 0,
  fontSize: "1.9rem",
  color: "#1F2A44",
}

const nextMetaStyle = {
  margin: "8px 0 0",
  color: "#6F728B",
  fontSize: "1.08rem",
}

const nextSubMetaStyle = {
  margin: "6px 0 0",
  color: "#94A3B8",
  fontSize: "1rem",
}

const nextTagRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
}

const softBlueBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "#F1F0FF",
  color: "#6C63FF",
  fontWeight: "700",
  fontSize: "0.92rem",
}

const softIndigoBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "#EDEBFF",
  color: "#5B56D6",
  fontWeight: "700",
  fontSize: "0.92rem",
}

const softGoldBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "#FDF1D6",
  color: "#A16207",
  fontWeight: "700",
  fontSize: "0.92rem",
}

const openPrimaryButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #8E8BFF, #6C63FF)",
  color: "white",
  padding: "14px 22px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "1rem",
  boxShadow: "0 10px 20px rgba(108, 99, 255, 0.2)",
}

const viewAllButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#6C63FF",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "1rem",
}

const scheduleRowStyle = {
  display: "grid",
  gridTemplateColumns: "84px 42px 1fr auto",
  gap: "14px",
  alignItems: "center",
  padding: "12px 0",
}

const scheduleTimeCardStyle = {
  background: "#F8F7FF",
  border: "1px solid #E7E5F4",
  borderRadius: "14px",
  padding: "10px 8px",
  textAlign: "center",
}

const scheduleTimeMainStyle = {
  color: "#1F2A44",
  fontWeight: "700",
  fontSize: "1.05rem",
  lineHeight: 1.1,
}

const scheduleTimeSubStyle = {
  marginTop: "4px",
  color: "#94A3B8",
  fontSize: "0.78rem",
  fontWeight: "600",
  letterSpacing: "0.04em",
}

const scheduleAvatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "#F1F0FF",
  color: "#6C63FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
}

const schedulePatientStyle = {
  margin: 0,
  color: "#1F2A44",
  fontSize: "1.05rem",
}

const scheduleServiceStyle = {
  margin: "4px 0 0",
  color: "#6F728B",
}

const queueStatusStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "0.9rem",
  background: "#EEEAFD",
  color: "#5B56D6",
}

const calendarHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "14px",
}

const calendarArrowStyle = {
  border: "none",
  background: "transparent",
  color: "#8A8FB2",
  fontSize: "1.3rem",
  cursor: "pointer",
}

const calendarMonthStyle = {
  color: "#1F2A44",
  fontWeight: "700",
  fontSize: "1.05rem",
}

const calendarWeekStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "8px",
  color: "#9AA3B2",
  fontSize: "0.82rem",
  textAlign: "center",
  marginBottom: "12px",
}

const calendarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "8px",
}

const calendarDayStyle = {
  height: "34px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6F728B",
  fontWeight: "600",
}

const calendarActiveDayStyle = {
  ...calendarDayStyle,
  background: "#6C63FF",
  color: "white",
}

const approvalCountStyle = {
  minWidth: "24px",
  height: "24px",
  borderRadius: "999px",
  background: "#F3E8FF",
  color: "#7C3AED",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "0.82rem",
}

const approvalCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  paddingBottom: "12px",
  borderBottom: "1px solid #F0EEFB",
}

const approvalIdentityStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
}

const approvalAvatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "#EDEBFF",
  color: "#5B56D6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
}

const approvalNameStyle = {
  margin: 0,
  color: "#1F2A44",
  fontWeight: "700",
}

const approvalMetaStyle = {
  margin: "4px 0 0",
  color: "#6F728B",
  fontSize: "0.92rem",
}

const approvalActionsStyle = {
  display: "flex",
  gap: "8px",
}

const approveButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "1px solid #BBF7D0",
  background: "#DCFCE7",
  color: "#166534",
  cursor: "pointer",
  fontWeight: "700",
}

const rejectButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "1px solid #FECACA",
  background: "#FEF2F2",
  color: "#B91C1C",
  cursor: "pointer",
  fontWeight: "700",
}

const monthStatsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "14px",
}

const monthStatCardStyle = {
  background: "#F8F7FF",
  border: "1px solid #E7E5F4",
  borderRadius: "18px",
  padding: "18px 14px",
  textAlign: "center",
}

const monthStatValueStyle = {
  fontSize: "2.1rem",
  color: "#1F2A44",
  fontWeight: "700",
}

const monthStatLabelStyle = {
  marginTop: "8px",
  color: "#94A3B8",
  fontWeight: "700",
  fontSize: "0.9rem",
}

const calendarEmptyDayStyle = {
  height: "40px",
}

const calendarDayButtonStyle = {
  height: "40px",
  borderRadius: "12px",
  border: "none",
  background: "transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#6F728B",
  fontWeight: "600",
  position: "relative",
}

const calendarTodayStyle = {
  background: "#F1F0FF",
  color: "#6C63FF",
}

const calendarSelectedStyle = {
  background: "#6C63FF",
  color: "white",
}

const calendarDotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "999px",
  background: "currentColor",
  marginTop: "4px",
  opacity: 0.9,
}

const selectedDateSectionStyle = {
  marginTop: "18px",
  paddingTop: "14px",
  borderTop: "1px solid #F0EEFB",
}

const selectedDateTitleStyle = {
  margin: "0 0 10px",
  color: "#1F2A44",
  fontWeight: "700",
}

const selectedDateEmptyStyle = {
  margin: 0,
  color: "#6F728B",
  fontSize: "0.95rem",
}

const selectedDateAppointmentStyle = {
  width: "100%",
  border: "1px solid #E7E5F4",
  background: "#F8F7FF",
  borderRadius: "14px",
  padding: "12px 14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  textAlign: "left",
}

const selectedDateAppointmentNameStyle = {
  margin: 0,
  color: "#1F2A44",
  fontWeight: "700",
}

const selectedDateAppointmentMetaStyle = {
  margin: "4px 0 0",
  color: "#6F728B",
  fontSize: "0.9rem",
}

export default DoctorDashboard