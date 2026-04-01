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

function LabResultsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [profile, setProfile] = useState(null)
  const [labResults, setLabResults] = useState([])
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [selectedLab, setSelectedLab] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        const profileRes = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const user = profileRes.data?.user || null
        setProfile(user)

        const patientId = user?.reference_id || user?.id

        const [labsRes, appointmentsRes, catalogRes] = await Promise.allSettled([
          api.get(`/labs/patient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/appointments/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/catalog", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const labsData =
          labsRes.status === "fulfilled" && Array.isArray(labsRes.value.data)
            ? labsRes.value.data
            : []
console.log("LAB RESULTS RAW:", labsData)
console.log("FIRST LAB:", labsData[0])
        setLabResults(labsData)
        setAppointments(
          appointmentsRes.status === "fulfilled" &&
            Array.isArray(appointmentsRes.value.data)
            ? appointmentsRes.value.data
            : []
        )
        setServices(
          catalogRes.status === "fulfilled" && Array.isArray(catalogRes.value.data)
            ? catalogRes.value.data
            : []
        )

        if (labsData.length > 0) {
          setSelectedLab(labsData[0])
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load lab results")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const getStatusStyle = (status) => {
    const s = String(status || "").toUpperCase()

    switch (s) {
      case "COMPLETED":
      case "READY":
      case "VALIDATED":
        return {
          background: C.greenBg,
          color: C.green,
        }
      case "PENDING":
      case "IN_PROGRESS":
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
          background: C.blueBg,
          color: C.blueText,
        }
    }
  }

  
  const enrichedLabs = useMemo(() => {
    return labResults
      .map((lab) => {
        const appointment = appointments.find(
          (a) => String(a.id) === String(lab.appointment_id)
        )

        const service = services.find(
          (s) => String(s.id) === String(appointment?.service_id)
        )

        return {
          ...lab,
          appointment,
          service,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
  }, [labResults, appointments, services])

  const enrichedSelected = useMemo(() => {
    if (!selectedLab) return null

    const appointment = appointments.find(
      (a) => String(a.id) === String(selectedLab.appointment_id)
    )

    const service = services.find(
      (s) => String(s.id) === String(appointment?.service_id)
    )

    return {
      ...selectedLab,
      appointment,
      service,
    }
  }, [selectedLab, appointments, services])

  const readyCount = enrichedLabs.filter((l) =>
    ["COMPLETED", "READY", "VALIDATED"].includes(
      String(l.status || "").toUpperCase()
    )
  ).length

  const pendingCount = enrichedLabs.filter((l) =>
    ["PENDING", "IN_PROGRESS"].includes(String(l.status || "").toUpperCase())
  ).length

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

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>Loading lab results...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .lr-shell {
            grid-template-columns: 1fr !important;
          }

          .lr-main-grid,
          .lr-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .lr-page {
            padding: 14px !important;
          }

          .lr-record-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .lr-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={S.page} className="lr-page">
        <div style={S.shell} className="lr-shell">
          <PatientSidebar active="labs" profile={profile} />

          <main style={S.content}>
            <div style={S.topDate}>{todayLabel}</div>

            <section style={S.hero}>
              <div style={S.heroGlow} />
              <div style={S.heroContent}>
                <div>
                  <div style={S.heroEyebrow}>PATIENT LAB RESULTS</div>
                  <h1 style={S.heroTitle}>Lab Results</h1>
                  <p style={S.heroSubtitle}>
                    Review all lab tests linked to your appointments and open
                    each result in detail.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/appointments")}
                  style={S.heroBtn}
                >
                  View Appointments
                </button>
              </div>
            </section>

            {error ? <div style={S.errorBox}>{error}</div> : null}

            <section style={S.statsGrid} className="lr-stats-grid">
              <div style={S.statCard}>
                <div style={S.statLabel}>TOTAL TESTS</div>
                <div style={S.statValue}>{enrichedLabs.length}</div>
                <div style={S.statSub}>all lab entries</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statLabel}>READY</div>
                <div style={S.statValue}>{readyCount}</div>
                <div style={S.statSub}>results available</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statLabel}>PENDING</div>
                <div style={S.statValue}>{pendingCount}</div>
                <div style={S.statSub}>still processing</div>
              </div>
            </section>

            <section style={S.mainGrid} className="lr-main-grid">
              <div style={S.listCard}>
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionEyebrow}>LAB HISTORY</div>
                    <div style={S.sectionTitle}>All Tests</div>
                  </div>
                </div>

                {enrichedLabs.length === 0 ? (
                  <div style={S.emptyState}>No lab results found yet.</div>
                ) : (
                  <div style={S.listWrap}>
                    {enrichedLabs.map((lab) => {
                      const active =
                        String(enrichedSelected?._id) === String(lab.id)

                      return (
                        <button
                          key={lab._id || `${lab.appointment_id}-${lab.createdAt}`}
                          onClick={() => setSelectedLab(lab)}
                          style={{
                            ...S.recordRow,
                            ...(active ? S.recordRowActive : {}),
                          }}
                          className="lr-record-row"
                        >
                          <div style={S.recordLeft}>
                            <div style={S.recordTitle}>
                              {lab.lab_test_name || lab.lab_test_code || "Unnamed lab test"}
                            </div>
                            <div style={S.recordMeta}>
                              Appointment #{lab.appointment_id || "N/A"} · {formatDate(lab.createdAt)}
                            </div>
                            <div style={S.recordSub}>
                              {lab.service?.name || "Unknown service"} ·{" "}
                              {lab.service?.department || "Unknown department"}
                            </div>
                          </div>

                          <div style={S.recordRight}>
                            <span
                              style={{
                                ...S.statusPill,
                                ...getStatusStyle(lab.status),
                              }}
                            >
                              {lab.status || "N/A"}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={S.detailCard}>
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionEyebrow}>DETAILS</div>
                    <div style={S.sectionTitle}>Selected Result</div>
                  </div>
                </div>

                {!enrichedSelected ? (
                  <div style={S.emptyState}>Select a test to see details.</div>
                ) : (
                  <div style={S.detailWrap}>
                    <div style={S.detailGrid} className="lr-detail-grid">
                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Test Type</div>
                        <div style={S.infoValue}>
                          {
  enrichedSelected.lab_test_name ||
  enrichedSelected.lab_test_code ||
  "N/A"
}
                        </div>
                      </div>
                      <div style={S.infoBlock}>
  <div style={S.infoLabel}>Category</div>
  <div style={S.infoValue}>
    {enrichedSelected.lab_test_category || "N/A"}
  </div>
</div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Status</div>
                        <div style={S.infoValue}>
                          {enrichedSelected.status || "N/A"}
                        </div>
                      </div>


                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Date</div>
                        <div style={S.infoValue}>
                          {formatDateTime(
                            enrichedSelected.appointment?.appointment_date ||
                              enrichedSelected.created_at
                          )}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Service</div>
                        <div style={S.infoValue}>
                          {enrichedSelected.service?.name || "N/A"}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Department</div>
                        <div style={S.infoValue}>
                          {enrichedSelected.service?.department || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div style={S.noteCard}>
                      <div style={S.noteTitle}>Result</div>
                      <div style={S.noteText}>
                        {enrichedSelected.result || "Not uploaded yet."}
                      </div>
                    </div>
                  </div>
                )}
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.15fr",
    gap: "16px",
    alignItems: "start",
  },
  listCard: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  detailCard: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  sectionHeader: {
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
  listWrap: {
    display: "grid",
    gap: "12px",
  },
  recordRow: {
    border: `1px solid ${C.border}`,
    background: C.lavenderSoft,
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: F,
  },
  recordRowActive: {
    border: `1px solid ${C.navy}`,
    boxShadow: "0 10px 20px rgba(12, 68, 124, 0.10)",
    background: "#EEF4FF",
  },
  recordLeft: {
    flex: 1,
  },
  recordTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1rem",
  },
  recordMeta: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "5px",
  },
  recordSub: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "6px",
  },
  recordRight: {
    flexShrink: 0,
  },
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
  },
  detailWrap: {
    display: "grid",
    gap: "14px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  infoBlock: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
  },
  infoLabel: {
    color: C.textSoft,
    fontSize: "12px",
    letterSpacing: "0.08em",
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  infoValue: {
    color: C.text,
    fontWeight: "800",
    fontSize: "0.98rem",
    lineHeight: 1.45,
  },
  noteCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
  },
  noteTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "15px",
    marginBottom: "10px",
  },
  noteText: {
    color: C.textMid,
    fontSize: "14px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  emptyState: {
    background: C.lavenderSoft,
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: "18px",
    padding: "24px 18px",
    color: C.textMid,
    fontSize: "14px",
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

export default LabResultsPage