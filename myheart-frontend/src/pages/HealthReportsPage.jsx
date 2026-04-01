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
  redText: "#C94E4E",
}

const F = "'Plus Jakarta Sans', sans-serif"

function HealthReportsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)

  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
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

        const [historyRes, appointmentsRes, catalogRes, doctorsRes] =
          await Promise.allSettled([
            api.get(`/consultation-records/patient/${patientId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/appointments/me", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/catalog", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/doctors", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ])

        const historyData =
          historyRes.status === "fulfilled" && Array.isArray(historyRes.value.data)
            ? historyRes.value.data
            : []

        setHistory(historyData)
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
        setDoctors(
          doctorsRes.status === "fulfilled" && Array.isArray(doctorsRes.value.data)
            ? doctorsRes.value.data
            : []
        )

        if (historyData.length > 0) {
          setSelectedRecord(historyData[0])
          await fetchAppointmentRecord(historyData[0].appointment_id)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load health reports")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const fetchAppointmentRecord = async (appointmentId) => {
    try {
      setDetailLoading(true)
      const res = await api.get(`/consultation-records/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSelectedRecord(res.data || null)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const enrichedHistory = useMemo(() => {
    return history
      .map((record) => {
        const appointment = appointments.find(
          (a) => String(a.id) === String(record.appointment_id)
        )
        const service = services.find(
          (s) => String(s.id) === String(appointment?.service_id)
        )
        const doctor = doctors.find(
          (d) => String(d.id) === String(record.doctor_id || appointment?.doctor_id)
        )

        return {
          ...record,
          appointment,
          service,
          doctor,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
  }, [history, appointments, services, doctors])

  const enrichedSelected = useMemo(() => {
    if (!selectedRecord) return null

    const appointment = appointments.find(
      (a) => String(a.id) === String(selectedRecord.appointment_id)
    )
    const service = services.find(
      (s) => String(s.id) === String(appointment?.service_id)
    )
    const doctor = doctors.find(
      (d) => String(d.id) === String(selectedRecord.doctor_id || appointment?.doctor_id)
    )

    return {
      ...selectedRecord,
      appointment,
      service,
      doctor,
    }
  }, [selectedRecord, appointments, services, doctors])

  const totalPrescriptions = enrichedHistory.reduce((sum, r) => {
    return sum + (Array.isArray(r.prescriptions) ? r.prescriptions.length : 0)
  }, 0)

  const diagnosesCount = enrichedHistory.filter((r) => r.diagnosis).length

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
        <div style={S.loadingCard}>Loading health reports...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .hr-shell {
            grid-template-columns: 1fr !important;
          }

          .hr-main-grid,
          .hr-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .hr-page {
            padding: 14px !important;
          }

          .hr-record-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .hr-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={S.page} className="hr-page">
        <div style={S.shell} className="hr-shell">
          <PatientSidebar active="reports" profile={profile} />

          <main style={S.content}>
            <div style={S.topDate}>{todayLabel}</div>

            <section style={S.hero}>
              <div style={S.heroGlow} />
              <div style={S.heroContent}>
                <div>
                  <div style={S.heroEyebrow}>PATIENT HEALTH RECORD</div>
                  <h1 style={S.heroTitle}>Health Reports</h1>
                  <p style={S.heroSubtitle}>
                    View your consultation history, diagnoses, prescriptions, and
                    doctor notes in one place.
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

            <section style={S.statsGrid} className="hr-stats-grid">
              <div style={S.statCard}>
                <div style={S.statLabel}>RECORDS</div>
                <div style={S.statValue}>{enrichedHistory.length}</div>
                <div style={S.statSub}>consultation entries</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statLabel}>DIAGNOSES</div>
                <div style={S.statValue}>{diagnosesCount}</div>
                <div style={S.statSub}>records with diagnosis</div>
              </div>

              <div style={S.statCard}>
                <div style={S.statLabel}>PRESCRIPTIONS</div>
                <div style={S.statValue}>{totalPrescriptions}</div>
                <div style={S.statSub}>medicines prescribed</div>
              </div>
            </section>

            <section style={S.mainGrid} className="hr-main-grid">
              <div style={S.listCard}>
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionEyebrow}>MEDICAL HISTORY</div>
                    <div style={S.sectionTitle}>Consultation Records</div>
                  </div>
                </div>

                {enrichedHistory.length === 0 ? (
                  <div style={S.emptyState}>No health records found yet.</div>
                ) : (
                  <div style={S.listWrap}>
                    {enrichedHistory.map((record) => {
                      const active =
                        String(enrichedSelected?.id) === String(record.id)

                      return (
                        <button
                          key={record.id}
                          onClick={() => fetchAppointmentRecord(record.appointment_id)}
                          style={{
                            ...S.recordRow,
                            ...(active ? S.recordRowActive : {}),
                          }}
                          className="hr-record-row"
                        >
                          <div style={S.recordLeft}>
                            <div style={S.recordTitle}>
                              {record.diagnosis || "No diagnosis"}
                            </div>
                            <div style={S.recordMeta}>
                              Appointment #{record.appointment_id} ·{" "}
                              {formatDate(record.created_at)}
                            </div>
                            <div style={S.recordSub}>
                              {record.service?.name || "Unknown service"} ·{" "}
                              {record.service?.department || "Unknown department"}
                            </div>
                          </div>

                          <div style={S.recordRight}>
                            <span style={S.countPill}>
                              {Array.isArray(record.prescriptions)
                                ? record.prescriptions.length
                                : 0}{" "}
                              meds
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
                    <div style={S.sectionTitle}>Selected Report</div>
                  </div>
                </div>

                {detailLoading ? (
                  <div style={S.emptyState}>Loading record details...</div>
                ) : !enrichedSelected ? (
                  <div style={S.emptyState}>Select a record to see details.</div>
                ) : (
                  <div style={S.detailWrap}>
                    <div style={S.detailGrid} className="hr-detail-grid">
                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Diagnosis</div>
                        <div style={S.infoValue}>
                          {enrichedSelected.diagnosis || "N/A"}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Doctor</div>
                        <div style={S.infoValue}>
                          {enrichedSelected.doctor
                            ? `Dr. ${enrichedSelected.doctor.first_name} ${enrichedSelected.doctor.last_name}`
                            : "N/A"}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Service</div>
                        <div style={S.infoValue}>
                          {enrichedSelected.service?.name || "N/A"}
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
                    </div>

                    <div style={S.noteCard}>
                      <div style={S.noteTitle}>Clinical Notes</div>
                      <div style={S.noteText}>
                        {enrichedSelected.clinical_notes || "No clinical notes."}
                      </div>
                    </div>

                    <div style={S.noteCard}>
                      <div style={S.noteTitle}>Doctor Notes</div>
                      <div style={S.noteText}>
                        {enrichedSelected.notes || "No doctor notes."}
                      </div>
                    </div>

                    <div style={S.noteCard}>
                      <div style={S.noteTitle}>Prescriptions</div>
                      {Array.isArray(enrichedSelected.prescriptions) &&
                      enrichedSelected.prescriptions.length > 0 ? (
                        <div style={S.prescriptionList}>
                          {enrichedSelected.prescriptions.map((item, index) => (
                            <div key={index} style={S.prescriptionItem}>
                              <span style={S.prescriptionIcon}>💊</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={S.noteText}>No prescriptions.</div>
                      )}
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
  countPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: C.white,
    border: `1px solid ${C.border}`,
    color: C.blueText,
    fontSize: "12px",
    fontWeight: "800",
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
  prescriptionList: {
    display: "grid",
    gap: "10px",
  },
  prescriptionItem: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: C.text,
    fontWeight: "700",
    fontSize: "14px",
  },
  prescriptionIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "10px",
    background: C.greenBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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

export default HealthReportsPage