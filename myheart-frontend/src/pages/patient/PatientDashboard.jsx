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
  navyDark: "#08345f",
  navyDeep: "#04233f",
  lavenderCard: "#EEEDFE",
  lavenderAccent: "#7F77DD",
  lavenderLight: "#9B94E3",
  lavenderSoft: "#F6F3FF",
  lavenderBorder: "#DDD7FB",
  lavenderGlow: "rgba(127, 119, 221, 0.18)",
  white: "#FFFFFF",
  pageBg: "#F4F2FB",
  cardBg: "#FFFFFF",
  textDark: "#1F1C3A",
  textMid: "#6E6893",
  textSoft: "#9A94BC",
  green: "#39B980",
  greenBg: "#DDF8EB",
  blueTag: "#DCE8FF",
  blueText: "#365BBA",
  redBg: "#FFE1E1",
  redText: "#C94E4E",
  border: "#E4DFF4",
}

const F = "'Plus Jakarta Sans', sans-serif"

function PatientDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setProfile(profileRes.data?.user || null)

        const appointmentsRes = await api.get("/appointments/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [])
      } catch (err) {
        console.error("Patient dashboard fetch error:", err)
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  const now = new Date()

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() -
        new Date(b.appointment_date).getTime()
    )
  }, [appointments])

  const totalAppointments = appointments.length

  const upcomingAppointments = sortedAppointments.filter(
    (appointment) =>
      new Date(appointment.appointment_date) > now &&
      (appointment.status || "").toUpperCase() !== "CANCELLED"
  )

  const completedAppointments = appointments.filter(
    (appointment) => (appointment.status || "").toUpperCase() === "COMPLETED"
  )

  const cancelledAppointments = appointments.filter(
    (appointment) => (appointment.status || "").toUpperCase() === "CANCELLED"
  )

  const nextAppointment = upcomingAppointments[0] || null
  const recentAppointments = [...sortedAppointments].slice(0, 5)

  const firstName =
    profile?.first_name ||
    profile?.name?.split(" ")?.[0] ||
    "Patient"

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formatDateTime = (dateValue) => {
    const d = new Date(dateValue)
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateValue) => {
    return new Date(dateValue).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonthDay = (dateValue) => {
    const d = new Date(dateValue)
    return {
      day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    }
  }

  const getRelativeDays = (dateValue) => {
    const target = new Date(dateValue)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return "today"
    if (diffDays === 1) return "in 1 day"
    return `in ${diffDays} days`
  }

  const getStatusLabel = (status) => {
    const s = (status || "").toUpperCase()

    if (s === "SCHEDULED") return "UPCOMING"
    if (s === "COMPLETED") return "DONE"
    if (s === "CANCELLED") return "CANCELLED"

    return s || "UNKNOWN"
  }

  const getStatusStyle = (status) => {
    const s = (status || "").toUpperCase()

    if (s === "SCHEDULED") {
      return {
        ...S.statusPill,
        background: C.blueTag,
        color: C.blueText,
      }
    }

    if (s === "COMPLETED") {
      return {
        ...S.statusPill,
        background: C.greenBg,
        color: C.green,
      }
    }

    if (s === "CANCELLED") {
      return {
        ...S.statusPill,
        background: C.redBg,
        color: C.redText,
      }
    }

    return {
      ...S.statusPill,
      background: C.lavenderSoft,
      color: C.textMid,
    }
  }

  const prescriptionsCount = completedAppointments.length > 0 ? 1 : 0
  const labResultsCount = 0
  const pendingApprovals = 0
  const monthlyConsultations = completedAppointments.length
  const attendance =
    totalAppointments > 0
      ? Math.round((completedAppointments.length / totalAppointments) * 100)
      : 0

  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .pd-shell {
            grid-template-columns: 1fr !important;
          }

          .pd-main-grid,
          .pd-bottom-grid {
            grid-template-columns: 1fr !important;
          }

          .pd-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 760px) {
          .pd-page {
            padding: 14px !important;
          }

          .pd-content {
            padding: 0 !important;
          }

          .pd-summary-grid {
            grid-template-columns: 1fr !important;
          }

          .pd-hero {
            padding: 22px !important;
          }

          .pd-hero-top {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .pd-stat-strip {
            width: 100% !important;
            justify-content: space-between !important;
            gap: 12px !important;
            flex-wrap: wrap !important;
          }

          .pd-next-row,
          .pd-list-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .pd-quick-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={S.page} className="pd-page">
        <div style={S.shell} className="pd-shell">
          <PatientSidebar
            active="dashboard"
            profile={profile}
          />

          <main style={S.content} className="pd-content">
            <div style={S.topDate}>{todayLabel}</div>

            <section style={S.hero} className="pd-hero">
              <div style={S.heroGlow} />
              <div style={S.heroTop} className="pd-hero-top">
                <div>
                  <div style={S.heroEyebrow}>YOUR HEALTH OVERVIEW</div>
                  <h1 style={S.heroTitle}>
                    Good morning, <span style={S.heroName}>{firstName}</span> ✦
                  </h1>
                  <p style={S.heroSubtitle}>
                    You have {upcomingAppointments.length} upcoming appointment
                    {upcomingAppointments.length !== 1 ? "s" : ""} — keep up the
                    great work!
                  </p>

                  <button
                    onClick={() => navigate("/book-appointment")}
                    style={S.heroBtn}
                  >
                    + Book New Appointment
                  </button>
                </div>

                <div style={S.statStrip} className="pd-stat-strip">
                  <div style={S.heroMiniStat}>
                    <div style={S.heroMiniValue}>{upcomingAppointments.length}</div>
                    <div style={S.heroMiniLabel}>UPCOMING</div>
                  </div>

                  <div style={S.heroDivider} />

                  <div style={S.heroMiniStat}>
                    <div style={S.heroMiniValue}>{completedAppointments.length}</div>
                    <div style={S.heroMiniLabel}>DONE</div>
                  </div>

                  <div style={S.heroDivider} />

                  <div style={S.heroMiniStat}>
                    <div style={S.heroMiniValue}>{cancelledAppointments.length}</div>
                    <div style={S.heroMiniLabel}>PENDING</div>
                  </div>

                  <div style={S.heroDivider} />

                  <div style={S.heroMiniStat}>
                    <div style={S.heroMiniValue}>{pendingApprovals}</div>
                    <div style={S.heroMiniLabel}>WAITING</div>
                  </div>
                </div>
              </div>
            </section>

            <section style={S.summaryGrid} className="pd-summary-grid">
              <div style={S.infoCard}>
                <div style={S.infoIcon}>🗓</div>
                <div style={S.infoLabel}>TOTAL</div>
                <div style={S.infoValue}>{totalAppointments}</div>
                <div style={S.infoSub}>appointments</div>
              </div>

              <div style={S.infoCard}>
                <div style={S.infoIcon}>⏰</div>
                <div style={S.infoLabel}>NEXT VISIT</div>
                <div style={S.infoValueSmall}>
                  {nextAppointment
                    ? `${formatMonthDay(nextAppointment.appointment_date).month} ${formatMonthDay(nextAppointment.appointment_date).day}`
                    : "--"}
                </div>
                <div style={S.infoSub}>
                  {nextAppointment
                    ? getRelativeDays(nextAppointment.appointment_date)
                    : "no appointment"}
                </div>
              </div>

              <div style={S.infoCard}>
                <div style={S.infoIcon}>💊</div>
                <div style={S.infoLabel}>PRESCRIPTIONS</div>
                <div style={S.infoValue}>{prescriptionsCount}</div>
                <div style={S.infoSub}>active treatment</div>
              </div>

              <div style={S.infoCard}>
                <div style={S.infoIcon}>🧪</div>
                <div style={S.infoLabel}>LAB RESULTS</div>
                <div style={S.infoValue}>{labResultsCount}</div>
                <div style={S.infoSub}>awaiting action</div>
              </div>
            </section>

            <section style={S.mainGrid} className="pd-main-grid">
              <div style={S.card}>
                <div style={S.cardTitleSmall}>NEXT APPOINTMENT</div>

                {!nextAppointment ? (
                  <div style={S.emptyState}>No upcoming appointment scheduled yet.</div>
                ) : (
                  <>
                    <div style={S.nextApptBox} className="pd-next-row">
                      <div style={S.dateBadge}>
                        <div style={S.dateBadgeDay}>
                          {formatMonthDay(nextAppointment.appointment_date).day}
                        </div>
                        <div style={S.dateBadgeMonth}>
                          {formatMonthDay(nextAppointment.appointment_date).month}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={S.nextApptTitle}>Upcoming consultation</div>
                        <div style={S.nextApptMeta}>
                          {`Appointment #${nextAppointment.id} · ${formatTime(nextAppointment.appointment_date)}`}
                        </div>
                        <div style={S.nextApptMetaSoft}>MyHeart Hospital</div>

                        <div style={S.pillsRow}>
                          <span style={S.tagBlue}>IN-PERSON</span>
                          <span style={S.tagGreen}>CONFIRMED</span>
                          <span style={S.tagSoft}>30 MIN</span>
                        </div>
                      </div>
                    </div>

                    <div style={S.actionRow}>
                      <button
                        onClick={() => navigate(`/appointments/${nextAppointment.id}`)}
                        style={S.primaryBtn}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate("/appointments")}
                        style={S.secondaryBtn}
                      >
                        See All →
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div style={S.rightColumn}>
                <div style={S.sideCard}>
                  <div style={S.sideHeader}>
                    <div style={S.cardTitleSmall}>PENDING APPROVALS</div>
                    <span style={S.countBubble}>{pendingApprovals}</span>
                  </div>
                  <div style={S.sideEmpty}>No pending approvals.</div>
                </div>

                <div style={S.sideCard}>
                  <div style={S.cardTitleSmall}>THIS MONTH</div>
                  <div style={S.monthGrid}>
                    <div style={S.monthMiniCard}>
                      <div style={S.monthValue}>{monthlyConsultations}</div>
                      <div style={S.monthLabel}>CONSULTATIONS</div>
                    </div>
                    <div style={S.monthMiniCard}>
                      <div style={{ ...S.monthValue, color: C.green }}>
                        {attendance}%
                      </div>
                      <div style={S.monthLabel}>ATTENDANCE</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section style={S.bottomGrid} className="pd-bottom-grid">
              <div style={S.card}>
                <div style={S.cardHeaderRow}>
                  <div style={S.cardTitleSmall}>TODAY'S SCHEDULE</div>
                  <button
                    onClick={() => navigate("/appointments")}
                    style={S.linkBtn}
                  >
                    View all →
                  </button>
                </div>

                {recentAppointments.length === 0 ? (
                  <div style={S.emptyState}>No appointments yet.</div>
                ) : (
                  <div style={S.listWrap}>
                    {recentAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        style={S.scheduleRow}
                        className="pd-list-row"
                      >
                        <div style={S.scheduleLeft}>
                          <div style={S.timeBadge}>
                            <div style={S.timeBadgeMain}>
                              {formatTime(appointment.appointment_date)}
                            </div>
                            <div style={S.timeBadgeSub}>
                              {new Date(appointment.appointment_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </div>
                          </div>

                          <div style={S.avatarMini}>MH</div>

                          <div>
                            <div style={S.scheduleTitle}>
                              Appointment #{appointment.id}
                            </div>
                            <div style={S.scheduleMeta}>MyHeart Hospital</div>
                          </div>
                        </div>

                        <div style={S.scheduleRight}>
                          <span style={getStatusStyle(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </span>

                          <button
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                            style={S.arrowBtn}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={S.card}>
                <div style={S.cardHeaderRow}>
                  <div style={S.cardTitleSmall}>MY APPOINTMENTS</div>
                  <button
                    onClick={() => navigate("/appointments")}
                    style={S.linkBtn}
                  >
                    View all →
                  </button>
                </div>

                <div style={S.quickGrid} className="pd-quick-actions">
                  <button
                    onClick={() => navigate("/book-appointment")}
                    style={S.quickCard}
                  >
                    <div style={S.quickIcon}>＋</div>
                    <div style={S.quickTitle}>Book Appointment</div>
                    <div style={S.quickSub}>Choose a service and schedule</div>
                  </button>

                  <button
                    onClick={() => navigate("/appointments")}
                    style={S.quickCard}
                  >
                    <div style={S.quickIcon}>🗂</div>
                    <div style={S.quickTitle}>Appointments</div>
                    <div style={S.quickSub}>Open and manage your visits</div>
                  </button>

                  <button style={S.quickCard}>
                    <div style={S.quickIcon}>💊</div>
                    <div style={S.quickTitle}>Prescriptions</div>
                    <div style={S.quickSub}>Track ongoing treatments</div>
                  </button>

                  <button style={S.quickCard}>
                    <div style={S.quickIcon}>📊</div>
                    <div style={S.quickTitle}>Reports</div>
                    <div style={S.quickSub}>Check your medical summaries</div>
                  </button>
                </div>

                <div style={S.miniList}>
                  {recentAppointments.slice(0, 2).map((appointment) => (
                    <div key={appointment.id} style={S.miniListRow}>
                      <div>
                        <div style={S.miniListTitle}>
                          Appointment #{appointment.id}
                        </div>
                        <div style={S.miniListSub}>
                          {formatDateTime(appointment.appointment_date)}
                        </div>
                      </div>

                      <span style={getStatusStyle(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                  ))}
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
    background: C.pageBg,
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
    padding: "4px 0 0",
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
    background: "rgba(127, 119, 221, 0.10)",
    right: "22%",
    top: "-120px",
    filter: "blur(10px)",
    pointerEvents: "none",
  },
  heroTop: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
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
    fontSize: "2.15rem",
    lineHeight: 1.1,
    fontWeight: "800",
  },
  heroName: {
    color: "#AFA9EC",
  },
  heroSubtitle: {
    margin: "10px 0 16px",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.5,
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
  statStrip: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: "320px",
    justifyContent: "flex-end",
    alignSelf: "center",
  },
  heroMiniStat: {
    textAlign: "center",
    minWidth: "64px",
  },
  heroMiniValue: {
    color: C.white,
    fontWeight: "800",
    fontSize: "2rem",
    lineHeight: 1,
  },
  heroMiniLabel: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.6)",
    fontSize: "12px",
    letterSpacing: "0.10em",
    fontWeight: "700",
  },
  heroDivider: {
    width: "1px",
    height: "44px",
    background: "rgba(255,255,255,0.16)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  infoCard: {
    background: C.cardBg,
    borderRadius: "20px",
    padding: "20px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  infoIcon: {
    fontSize: "18px",
    marginBottom: "14px",
  },
  infoLabel: {
    color: C.textSoft,
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "800",
  },
  infoValue: {
    color: C.textDark,
    fontSize: "2.15rem",
    fontWeight: "800",
    marginTop: "6px",
    lineHeight: 1.1,
  },
  infoValueSmall: {
    color: C.textDark,
    fontSize: "1.8rem",
    fontWeight: "800",
    marginTop: "6px",
    lineHeight: 1.1,
  },
  infoSub: {
    marginTop: "6px",
    color: C.textSoft,
    fontSize: "14px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.85fr 0.95fr",
    gap: "16px",
    marginBottom: "16px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: "16px",
  },
  card: {
    background: C.cardBg,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  sideCard: {
    background: C.cardBg,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  rightColumn: {
    display: "grid",
    gap: "16px",
  },
  cardTitleSmall: {
    color: C.textSoft,
    fontSize: "13px",
    letterSpacing: "0.12em",
    fontWeight: "800",
  },
  nextApptBox: {
    marginTop: "16px",
    background: C.lavenderSoft,
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: `1px solid ${C.lavenderBorder}`,
  },
  dateBadge: {
    width: "68px",
    minWidth: "68px",
    height: "68px",
    borderRadius: "16px",
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
    color: C.white,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadgeDay: {
    fontSize: "1.6rem",
    fontWeight: "800",
    lineHeight: 1,
  },
  dateBadgeMonth: {
    fontSize: "12px",
    fontWeight: "700",
    marginTop: "5px",
    letterSpacing: "0.08em",
  },
  nextApptTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "1.35rem",
    marginBottom: "6px",
  },
  nextApptMeta: {
    color: C.textMid,
    fontSize: "15px",
    marginBottom: "4px",
  },
  nextApptMetaSoft: {
    color: C.textSoft,
    fontSize: "14px",
  },
  pillsRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "14px",
  },
  tagBlue: {
    padding: "6px 12px",
    borderRadius: "999px",
    background: C.blueTag,
    color: C.blueText,
    fontSize: "12px",
    fontWeight: "800",
  },
  tagGreen: {
    padding: "6px 12px",
    borderRadius: "999px",
    background: C.greenBg,
    color: C.green,
    fontSize: "12px",
    fontWeight: "800",
  },
  tagSoft: {
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#ECE8F8",
    color: C.textMid,
    fontSize: "12px",
    fontWeight: "800",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    flexWrap: "wrap",
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
    border: `1px solid ${C.lavenderBorder}`,
    background: C.white,
    color: C.textMid,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
  },
  sideHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  countBubble: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "999px",
    background: C.lavenderSoft,
    color: C.textSoft,
    fontSize: "12px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
  },
  sideEmpty: {
    color: C.textSoft,
    fontSize: "15px",
    textAlign: "center",
    padding: "34px 10px 10px",
  },
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "18px",
  },
  monthMiniCard: {
    background: C.lavenderSoft,
    borderRadius: "14px",
    padding: "18px 12px",
    textAlign: "center",
    border: `1px solid ${C.lavenderBorder}`,
  },
  monthValue: {
    color: C.textDark,
    fontSize: "2rem",
    fontWeight: "800",
    lineHeight: 1,
  },
  monthLabel: {
    color: C.textSoft,
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginTop: "8px",
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
  },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: C.navy,
    fontWeight: "700",
    fontFamily: F,
    cursor: "pointer",
    fontSize: "14px",
  },
  listWrap: {
    display: "grid",
    gap: "10px",
    marginTop: "12px",
  },
  scheduleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 0",
    borderBottom: `1px solid ${C.border}`,
  },
  scheduleLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  scheduleRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  timeBadge: {
    width: "72px",
    minWidth: "72px",
    borderRadius: "12px",
    background: C.lavenderSoft,
    padding: "10px 8px",
    textAlign: "center",
    border: `1px solid ${C.lavenderBorder}`,
  },
  timeBadgeMain: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "16px",
    lineHeight: 1.1,
  },
  timeBadgeSub: {
    color: C.textSoft,
    fontSize: "11px",
    fontWeight: "700",
    marginTop: "4px",
    letterSpacing: "0.06em",
  },
  avatarMini: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: C.navy,
    color: C.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "13px",
  },
  scheduleTitle: {
    color: C.textDark,
    fontWeight: "700",
    fontSize: "16px",
  },
  scheduleMeta: {
    color: C.textSoft,
    fontSize: "14px",
    marginTop: "3px",
  },
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.04em",
    display: "inline-flex",
    alignItems: "center",
  },
  arrowBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "none",
    background: C.lavenderSoft,
    color: C.textMid,
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "12px",
  },
  quickCard: {
    border: `1px solid ${C.lavenderBorder}`,
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
    border: `1px solid ${C.lavenderBorder}`,
  },
  quickTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "15px",
  },
  quickSub: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "5px",
    lineHeight: 1.45,
  },
  miniList: {
    display: "grid",
    gap: "10px",
    marginTop: "16px",
  },
  miniListRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: `1px solid ${C.border}`,
  },
  miniListTitle: {
    color: C.textDark,
    fontWeight: "700",
    fontSize: "14px",
  },
  miniListSub: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "4px",
  },
  emptyState: {
    color: C.textSoft,
    fontSize: "15px",
    padding: "26px 0 4px",
  },
  loadingPage: {
    minHeight: "100vh",
    background: C.pageBg,
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

export default PatientDashboard