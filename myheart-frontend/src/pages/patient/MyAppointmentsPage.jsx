import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"
import PatientSidebar from "../../components/sidebars/PatientSidebar"

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
  yellowBg: "#FFF3CC",
  yellowText: "#B7791F",
  redBg: "#FFE1E1",
  redText: "#C94E4E",
}

const F = "'Plus Jakarta Sans', sans-serif"

function MyAppointmentsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError("")

        const [appointmentsRes, catalogRes, profileRes] = await Promise.allSettled([
          api.get("/appointments/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          api.get("/catalog", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          api.get("/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (appointmentsRes.status === "fulfilled") {
          setAppointments(
            Array.isArray(appointmentsRes.value.data) ? appointmentsRes.value.data : []
          )
        } else {
          setAppointments([])
          throw appointmentsRes.reason
        }

        if (catalogRes.status === "fulfilled") {
          setServices(Array.isArray(catalogRes.value.data) ? catalogRes.value.data : [])
        } else {
          setServices([])
        }

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data?.user || null)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [token])

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const enrichedAppointments = useMemo(() => {
    return appointments
      .map((appointment) => {
        const relatedService = services.find(
          (service) => String(service.id) === String(appointment.service_id)
        )

        return {
          ...appointment,
          service: relatedService || null,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.appointment_date).getTime() -
          new Date(a.appointment_date).getTime()
      )
  }, [appointments, services])

  const upcomingAppointments = enrichedAppointments.filter(
    (appointment) =>
      new Date(appointment.appointment_date) > new Date() &&
      (appointment.status || "").toUpperCase() !== "CANCELLED"
  )

  const completedAppointments = enrichedAppointments.filter(
    (appointment) => {
      const s = (appointment.status || "").toUpperCase()
      return s === "COMPLETED" || s === "PAID"
    }
  )

  const pendingAppointments = enrichedAppointments.filter(
    (appointment) => (appointment.status || "").toUpperCase() === "PENDING"
  )

  const cancelledAppointments = enrichedAppointments.filter(
    (appointment) => (appointment.status || "").toUpperCase() === "CANCELLED"
  )

  const getStatusStyle = (status) => {
    const s = (status || "").toUpperCase()

    switch (s) {
      case "SCHEDULED":
        return {
          background: C.blueBg,
          color: C.blueText,
        }
      case "PAID":
      case "COMPLETED":
        return {
          background: C.greenBg,
          color: C.green,
        }
      case "PENDING":
        return {
          background: C.yellowBg,
          color: C.yellowText,
        }
      case "CANCELLED":
        return {
          background: C.redBg,
          color: C.redText,
        }
      default:
        return {
          background: "#EDEAF8",
          color: C.textMid,
        }
    }
  }

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (value) => {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonthDay = (value) => {
    const d = new Date(value)
    return {
      day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    }
  }

  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>Loading appointments...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .ma-shell {
            grid-template-columns: 1fr !important;
          }

          .ma-top-grid,
          .ma-content-grid {
            grid-template-columns: 1fr !important;
          }

          .ma-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .ma-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 760px) {
          .ma-page {
            padding: 14px !important;
          }

          .ma-stats-grid {
            grid-template-columns: 1fr !important;
          }

          .ma-list-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .ma-list-right {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
      `}</style>

      <div style={S.page} className="ma-page">
        <div style={S.shell} className="ma-shell">
          <PatientSidebar active="appointments" profile={profile} />

          <main style={S.content}>
            <div style={S.topDate}>{todayLabel}</div>

            <section style={S.hero}>
              <div style={S.heroGlow} />
              <div style={S.heroContent} className="ma-header-row">
                <div>
                  <div style={S.heroEyebrow}>PATIENT APPOINTMENTS</div>
                  <h1 style={S.heroTitle}>My Appointments</h1>
                  <p style={S.heroSubtitle}>
                    Track your scheduled visits, check their status, and open details
                    whenever you need them.
                  </p>

                  <button
                    onClick={() => navigate("/book-appointment")}
                    style={S.heroBtn}
                  >
                    + Book New Appointment
                  </button>
                </div>

                <div style={S.heroStatWrap}>
                  <div style={S.heroStatValue}>{enrichedAppointments.length}</div>
                  <div style={S.heroStatLabel}>TOTAL VISITS</div>
                </div>
              </div>
            </section>

            {error ? <div style={S.errorBox}>{error}</div> : null}

            <section style={S.statsGrid} className="ma-stats-grid">
              <div style={S.statCard}>
                <div style={S.statIcon}>🗓</div>
                <div style={S.statLabel}>UPCOMING</div>
                <div style={S.statValue}>{upcomingAppointments.length}</div>
                <div style={S.statSub}>scheduled visits</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statIcon}>✔</div>
                <div style={S.statLabel}>COMPLETED</div>
                <div style={S.statValue}>{completedAppointments.length}</div>
                <div style={S.statSub}>finished visits</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statIcon}>⏳</div>
                <div style={S.statLabel}>PENDING</div>
                <div style={S.statValue}>{pendingAppointments.length}</div>
                <div style={S.statSub}>waiting confirmation</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statIcon}>✕</div>
                <div style={S.statLabel}>CANCELLED</div>
                <div style={S.statValue}>{cancelledAppointments.length}</div>
                <div style={S.statSub}>closed visits</div>
              </div>
            </section>

            <section style={S.contentGrid} className="ma-content-grid">
              <div style={S.mainCard}>
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionEyebrow}>APPOINTMENT LIST</div>
                    <div style={S.sectionTitle}>All Appointments</div>
                  </div>

                  <button
                    onClick={() => navigate("/dashboard")}
                    style={S.secondaryBtn}
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                {!error && enrichedAppointments.length === 0 ? (
                  <div style={S.emptyState}>
                    <div style={S.emptyTitle}>No appointments found</div>
                    <div style={S.emptyText}>
                      You have not booked any appointments yet.
                    </div>
                    <button
                      onClick={() => navigate("/book-appointment")}
                      style={S.primaryBtn}
                    >
                      Book Appointment
                    </button>
                  </div>
                ) : (
                  <div style={S.listWrap}>
                    {enrichedAppointments.map((appointment) => {
                      const appointmentDate = formatMonthDay(
                        appointment.appointment_date
                      )

                      return (
                        <div
                          key={appointment.id}
                          style={S.appointmentCard}
                          className="ma-list-row"
                        >
                          <div style={S.listLeft}>
                            <div style={S.dateBadge}>
                              <div style={S.dateDay}>{appointmentDate.day}</div>
                              <div style={S.dateMonth}>{appointmentDate.month}</div>
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={S.appointmentTitle}>
                                {appointment.service?.name ||
                                  `Appointment #${appointment.id}`}
                              </div>

                              <div style={S.appointmentMeta}>
                                {appointment.service?.department ||
                                  "Unknown department"}
                              </div>

                              <div style={S.appointmentInfoRow}>
                                <span style={S.infoPill}>
                                  {formatDate(appointment.appointment_date)}
                                </span>
                                <span style={S.infoPill}>
                                  {formatTime(appointment.appointment_date)}
                                </span>
                                <span style={S.infoPill}>
                                  ID #{appointment.id}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={S.listRight} className="ma-list-right">
                            <span
                              style={{
                                ...S.statusPill,
                                ...getStatusStyle(appointment.status),
                              }}
                            >
                              {appointment.status}
                            </span>

                            <button
                              onClick={() =>
                                navigate(`/appointments/${appointment.id}`)
                              }
                              style={S.viewBtn}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={S.sideColumn}>
                <div style={S.sideCard}>
                  <div style={S.sectionEyebrow}>NEXT VISIT</div>
                  <div style={S.sectionTitleSmall}>Upcoming Appointment</div>

                  {upcomingAppointments.length === 0 ? (
                    <div style={S.sideEmpty}>No upcoming appointment.</div>
                  ) : (
                    <>
                      <div style={S.nextVisitCard}>
                        <div style={S.nextVisitTitle}>
                          {upcomingAppointments[0].service?.name || "Scheduled Visit"}
                        </div>
                        <div style={S.nextVisitMeta}>
                          {upcomingAppointments[0].service?.department ||
                            "Unknown department"}
                        </div>
                        <div style={S.nextVisitTime}>
                          {formatDate(upcomingAppointments[0].appointment_date)} ·{" "}
                          {formatTime(upcomingAppointments[0].appointment_date)}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/appointments/${upcomingAppointments[0].id}`)
                        }
                        style={S.primaryBtn}
                      >
                        Open Appointment
                      </button>
                    </>
                  )}
                </div>

                <div style={S.sideCard}>
                  <div style={S.sectionEyebrow}>QUICK ACTIONS</div>
                  <div style={S.sectionTitleSmall}>Manage</div>

                  <div style={S.quickGrid}>
                    <button
                      onClick={() => navigate("/book-appointment")}
                      style={S.quickCard}
                    >
                      <div style={S.quickIcon}>＋</div>
                      <div style={S.quickTitle}>Book</div>
                      <div style={S.quickSub}>Create a new visit</div>
                    </button>

                    <button
                      onClick={() => navigate("/dashboard")}
                      style={S.quickCard}
                    >
                      <div style={S.quickIcon}>⊞</div>
                      <div style={S.quickTitle}>Dashboard</div>
                      <div style={S.quickSub}>Return to home</div>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
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
  shell: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "18px",
    alignItems: "start",
  },
  content: {
    paddingTop: "4px",
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
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 56%, ${C.navyDeep} 100%)`,
    borderRadius: "28px",
    padding: "28px 30px",
    marginBottom: "20px",
    boxShadow: "0 22px 44px rgba(12, 68, 124, 0.18)",
  },
  heroGlow: {
    position: "absolute",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "rgba(127, 119, 221, 0.12)",
    right: "18%",
    top: "-130px",
    filter: "blur(10px)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
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
    margin: "10px 0 16px",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.5,
    maxWidth: "650px",
  },
  heroBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: C.white,
    color: C.navyDeep,
    borderRadius: "12px",
    padding: "10px 14px",
    fontFamily: F,
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  heroStatWrap: {
    minWidth: "170px",
    textAlign: "center",
  },
  heroStatValue: {
    color: C.white,
    fontWeight: "800",
    fontSize: "2.3rem",
    lineHeight: 1,
  },
  heroStatLabel: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.62)",
    fontSize: "12px",
    letterSpacing: "0.10em",
    fontWeight: "700",
  },
  errorBox: {
    marginBottom: "16px",
    background: "#FFF1F1",
    border: "1px solid #F7D0D0",
    color: C.redText,
    borderRadius: "16px",
    padding: "14px 16px",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  statCard: {
    background: C.white,
    borderRadius: "20px",
    padding: "20px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  statIcon: {
    fontSize: "18px",
    marginBottom: "14px",
  },
  statLabel: {
    color: C.textSoft,
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "800",
  },
  statValue: {
    color: C.text,
    fontSize: "2.1rem",
    fontWeight: "800",
    marginTop: "6px",
    lineHeight: 1.1,
  },
  statSub: {
    marginTop: "6px",
    color: C.textSoft,
    fontSize: "14px",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.65fr 0.95fr",
    gap: "16px",
    alignItems: "start",
  },
  mainCard: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  sideColumn: {
    display: "grid",
    gap: "16px",
  },
  sideCard: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },
  sectionEyebrow: {
    color: C.textSoft,
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "800",
    marginBottom: "6px",
  },
  sectionTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1.3rem",
  },
  sectionTitleSmall: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1.1rem",
  },
  listWrap: {
    display: "grid",
    gap: "12px",
  },
  appointmentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "18px",
    padding: "16px",
  },
  listLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
  },
  listRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  dateBadge: {
    width: "70px",
    minWidth: "70px",
    height: "70px",
    borderRadius: "16px",
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
    color: C.white,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: {
    fontSize: "1.55rem",
    fontWeight: "800",
    lineHeight: 1,
  },
  dateMonth: {
    fontSize: "12px",
    fontWeight: "700",
    marginTop: "5px",
    letterSpacing: "0.08em",
  },
  appointmentTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1.05rem",
  },
  appointmentMeta: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "4px",
  },
  appointmentInfoRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  infoPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: C.white,
    border: `1px solid ${C.border}`,
    color: C.textMid,
    fontSize: "12px",
    fontWeight: "700",
  },
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
  },
  viewBtn: {
    border: "none",
    background: C.navy,
    color: C.white,
    padding: "11px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontFamily: F,
  },
  primaryBtn: {
    border: "none",
    background: C.navy,
    color: C.white,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(12, 68, 124, 0.18)",
  },
  secondaryBtn: {
    border: `1px solid ${C.borderStrong}`,
    background: C.white,
    color: C.textMid,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
  },
  emptyState: {
    background: C.lavenderSoft,
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: "18px",
    padding: "28px 20px",
    textAlign: "center",
  },
  emptyTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1.05rem",
  },
  emptyText: {
    color: C.textSoft,
    fontSize: "14px",
    marginTop: "8px",
    marginBottom: "18px",
  },
  nextVisitCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
    marginTop: "14px",
    marginBottom: "14px",
  },
  nextVisitTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1rem",
  },
  nextVisitMeta: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "5px",
  },
  nextVisitTime: {
    color: C.textSoft,
    fontSize: "14px",
    marginTop: "10px",
  },
  sideEmpty: {
    color: C.textSoft,
    fontSize: "15px",
    marginTop: "14px",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "14px",
  },
  quickCard: {
    border: `1px solid ${C.borderStrong}`,
    background: C.lavenderSoft,
    borderRadius: "16px",
    padding: "16px",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: F,
  },
  quickIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: C.white,
    color: C.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    marginBottom: "12px",
    border: `1px solid ${C.border}`,
  },
  quickTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "15px",
  },
  quickSub: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "4px",
    lineHeight: 1.45,
  },
  loadingPage: {
    minHeight: "100vh",
    background: C.page,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: F,
    padding: "24px",
  },
  loadingCard: {
    background: C.white,
    border: `1px solid ${C.border}`,
    padding: "20px 26px",
    borderRadius: "18px",
    color: C.textMid,
    fontWeight: "700",
  },
}

export default MyAppointmentsPage