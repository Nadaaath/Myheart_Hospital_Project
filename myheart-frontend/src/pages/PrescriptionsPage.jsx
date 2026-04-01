import { useEffect, useState } from "react"
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

function PrescriptionsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [profile, setProfile] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true)
        setError("")

        const [prescriptionsRes, profileRes] = await Promise.allSettled([
          api.get("/consultation-records/my-prescriptions", {
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

        if (prescriptionsRes.status === "fulfilled") {
          setPrescriptions(
            Array.isArray(prescriptionsRes.value.data)
              ? prescriptionsRes.value.data
              : []
          )
        } else {
          setPrescriptions([])
          throw prescriptionsRes.reason
        }

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data?.user || null)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load prescriptions")
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [token])

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const totalMedicines = prescriptions.reduce((total, item) => {
    return total + (Array.isArray(item.prescriptions) ? item.prescriptions.length : 0)
  }, 0)

  const formatDate = (value) => {
    if (!value) return "N/A"
    return new Date(value).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (value) => {
    if (!value) return "N/A"
    return new Date(value).toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>Loading prescriptions...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .pr-shell {
            grid-template-columns: 1fr !important;
          }

          .pr-content-grid,
          .pr-top-grid,
          .pr-stats-grid {
            grid-template-columns: 1fr !important;
          }

          .pr-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 760px) {
          .pr-page {
            padding: 14px !important;
          }

          .pr-meds-grid {
            grid-template-columns: 1fr !important;
          }

          .pr-card-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div style={S.page} className="pr-page">
        <div style={S.shell} className="pr-shell">
          <PatientSidebar active="prescriptions" profile={profile} />

          <main style={S.content}>
            <div style={S.topDate}>{todayLabel}</div>

            <section style={S.hero}>
              <div style={S.heroGlow} />
              <div style={S.heroContent} className="pr-header-row">
                <div>
                  <div style={S.heroEyebrow}>PATIENT PRESCRIPTIONS</div>
                  <h1 style={S.heroTitle}>My Prescriptions</h1>
                  <p style={S.heroSubtitle}>
                    Review your prescribed medications and the diagnosis linked to
                    each consultation.
                  </p>

                  <button
                    onClick={() => navigate("/appointments")}
                    style={S.heroBtn}
                  >
                    View Appointments
                  </button>
                </div>

                <div style={S.heroStatWrap}>
                  <div style={S.heroStatValue}>{prescriptions.length}</div>
                  <div style={S.heroStatLabel}>CONSULTATIONS</div>
                </div>
              </div>
            </section>

            {error ? <div style={S.errorBox}>{error}</div> : null}

            <section style={S.statsGrid} className="pr-stats-grid">
              <div style={S.statCard}>
                <div style={S.statIcon}>💊</div>
                <div style={S.statLabel}>TOTAL MEDICINES</div>
                <div style={S.statValue}>{totalMedicines}</div>
                <div style={S.statSub}>across all prescriptions</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statIcon}>🧾</div>
                <div style={S.statLabel}>RECORDS</div>
                <div style={S.statValue}>{prescriptions.length}</div>
                <div style={S.statSub}>consultations with treatment</div>
              </div>
            </section>

            <section style={S.contentGrid} className="pr-content-grid">
              <div style={S.mainCard}>
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionEyebrow}>PRESCRIPTION HISTORY</div>
                    <div style={S.sectionTitle}>All Prescriptions</div>
                  </div>

                  <button
                    onClick={() => navigate("/dashboard")}
                    style={S.secondaryBtn}
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                {!error && prescriptions.length === 0 ? (
                  <div style={S.emptyState}>
                    <div style={S.emptyTitle}>No prescriptions found</div>
                    <div style={S.emptyText}>
                      Your doctor has not added any prescriptions yet.
                    </div>
                  </div>
                ) : (
                  <div style={S.listWrap}>
                    {prescriptions.map((record) => (
                      <div
                        key={record.id}
                        style={S.prescriptionCard}
                        className="pr-card-row"
                      >
                        <div style={S.cardMain}>
                          <div style={S.cardTop}>
                            <div>
                              <div style={S.cardTitle}>
                                Diagnosis: {record.diagnosis || "N/A"}
                              </div>
                              <div style={S.cardMeta}>
                                Appointment #{record.appointment_id} ·{" "}
                                {formatDate(record.created_at)}
                              </div>
                            </div>

                            <span style={S.datePill}>
                              {formatDateTime(record.created_at)}
                            </span>
                          </div>

                          <div style={S.medsWrap}>
                            <div style={S.medsTitle}>Prescribed medicines</div>

                            <div style={S.medsGrid} className="pr-meds-grid">
                              {Array.isArray(record.prescriptions) &&
                              record.prescriptions.length > 0 ? (
                                record.prescriptions.map((med, index) => (
                                  <div key={index} style={S.medCard}>
                                    <div style={S.medIcon}>💊</div>
                                    <div style={S.medText}>{med}</div>
                                  </div>
                                ))
                              ) : (
                                <div style={S.noMeds}>No medicines listed.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={S.sideColumn}>
                <div style={S.sideCard}>
                  <div style={S.sectionEyebrow}>QUICK SUMMARY</div>
                  <div style={S.sectionTitleSmall}>Overview</div>

                  <div style={S.summaryBox}>
                    <div style={S.summaryRow}>
                      <span style={S.summaryLabel}>Prescription records</span>
                      <span style={S.summaryValue}>{prescriptions.length}</span>
                    </div>

                    <div style={S.summaryRow}>
                      <span style={S.summaryLabel}>Total medicines</span>
                      <span style={S.summaryValue}>{totalMedicines}</span>
                    </div>
                  </div>
                </div>

                <div style={S.sideCard}>
                  <div style={S.sectionEyebrow}>QUICK ACTIONS</div>
                  <div style={S.sectionTitleSmall}>Navigate</div>

                  <div style={S.quickGrid}>
                    <button
                      onClick={() => navigate("/appointments")}
                      style={S.quickCard}
                    >
                      <div style={S.quickIcon}>🗂</div>
                      <div style={S.quickTitle}>Appointments</div>
                      <div style={S.quickSub}>Open your visits</div>
                    </button>

                    <button
                      onClick={() => navigate("/dashboard")}
                      style={S.quickCard}
                    >
                      <div style={S.quickIcon}>⊞</div>
                      <div style={S.quickTitle}>Dashboard</div>
                      <div style={S.quickSub}>Return home</div>
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
    gap: "14px",
  },
  prescriptionCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "20px",
    padding: "18px",
  },
  cardMain: {
    display: "grid",
    gap: "16px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    flexWrap: "wrap",
  },
  cardTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1.05rem",
    lineHeight: 1.4,
  },
  cardMeta: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "5px",
  },
  datePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: C.white,
    border: `1px solid ${C.border}`,
    color: C.textMid,
    fontSize: "12px",
    fontWeight: "700",
  },
  medsWrap: {
    display: "grid",
    gap: "12px",
  },
  medsTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "15px",
  },
  medsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  medCard: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  medIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: C.greenBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  medText: {
    color: C.text,
    fontWeight: "700",
    fontSize: "14px",
    lineHeight: 1.45,
  },
  noMeds: {
    color: C.textSoft,
    fontSize: "14px",
  },
  summaryBox: {
    marginTop: "14px",
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  summaryLabel: {
    color: C.textMid,
    fontSize: "14px",
    fontWeight: "700",
  },
  summaryValue: {
    color: C.text,
    fontSize: "16px",
    fontWeight: "800",
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

export default PrescriptionsPage