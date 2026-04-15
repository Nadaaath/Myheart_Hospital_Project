import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../../api/axios"
import AdminLayout from "../../components/layouts/AdminLayout"

const C = {
  navy: "#0C447C",
  navyDark: "#08345f",
  navyDeep: "#04233f",
  white: "#FFFFFF",
  cardBg: "#FFFFFF",
  textDark: "#1F1C3A",
  textMid: "#6E6893",
  textSoft: "#9A94BC",
  border: "#E4DFF4",
  lavenderSoft: "#F6F3FF",
  lavenderBorder: "#DDD7FB",
  green: "#39B980",
  greenBg: "#DDF8EB",
  yellowBg: "#FFF3CC",
  yellowText: "#B7791F",
  redBg: "#FFE1E1",
  redText: "#C94E4E",
  blueBg: "#DCE8FF",
  blueText: "#365BBA",
}

const F = "'Plus Jakarta Sans', sans-serif"

function InfoCard({ label, value }) {
  return (
    <div style={S.infoBlock}>
      <div style={S.infoLabel}>{label}</div>
      <div style={S.infoValue}>{value || "N/A"}</div>
    </div>
  )
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={S.sectionHeader}>
      <div style={S.sectionEyebrow}>{eyebrow}</div>
      <div style={S.sectionTitle}>{title}</div>
    </div>
  )
}

function AdminPatientDetailsPage() {
  const { id } = useParams()
  const token = localStorage.getItem("token")

  const [patient, setPatient] = useState(null)
  const [labs, setLabs] = useState([])
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    const fetchPatientRecord = async () => {
      try {
        setLoading(true)
        setError("")

        const [patientRes, labsRes, appointmentsRes, recordsRes] =
          await Promise.allSettled([
            api.get(`/patients/${id}`, { headers }),
            api.get(`/labs/patient/${id}`, { headers }),
            api.get(`/appointments/patient/${id}`, { headers }),
            api.get(`/consultation-records/patient/${id}`, { headers }),
          ])

        if (patientRes.status === "fulfilled") {
          setPatient(patientRes.value.data)
        }

        setLabs(
          labsRes.status === "fulfilled" && Array.isArray(labsRes.value.data)
            ? labsRes.value.data
            : []
        )

        setAppointments(
          appointmentsRes.status === "fulfilled" &&
            Array.isArray(appointmentsRes.value.data)
            ? appointmentsRes.value.data
            : []
        )

        setRecords(
          recordsRes.status === "fulfilled" && Array.isArray(recordsRes.value.data)
            ? recordsRes.value.data
            : []
        )
      } catch (err) {
        console.error(err)
        setError("Failed to load patient record.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientRecord()
  }, [id])

  const completedLabs = useMemo(
    () =>
      labs.filter((lab) =>
        ["READY", "COMPLETED", "VALIDATED"].includes(
          String(lab.status || "").toUpperCase()
        )
      ),
    [labs]
  )

  const buildLabFileUrl = (fileUrl) => {
    if (!fileUrl) return null
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl
    }
    return `http://localhost:5000/api/labs${fileUrl}`
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A"
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

  const getStatusStyle = (status) => {
    const s = String(status || "").toUpperCase()

    switch (s) {
      case "READY":
      case "COMPLETED":
      case "VALIDATED":
        return {
          background: C.greenBg,
          color: C.green,
        }
      case "PENDING":
      case "IN_PROGRESS":
      case "REQUESTED":
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

  const hero = (
    <section style={S.hero}>
      <div style={S.heroGlow} />
      <div style={S.heroTop}>
        <div>
          <div style={S.heroEyebrow}>PATIENT RECORD</div>
          <h1 style={S.heroTitle}>
            {patient
              ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
              : "Patient Profile"}
          </h1>
          <p style={S.heroSubtitle}>
            Review personal details, medical history, appointments, and lab
            results from one complete patient record.
          </p>

          <div style={S.heroActionRow}>
            <Link to="/admin/patients" style={S.heroBtnPrimary}>
              ← Back to Patients
            </Link>
          </div>
        </div>

        <div style={S.heroStats}>
          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{appointments.length}</div>
            <div style={S.heroMiniLabel}>APPOINTMENTS</div>
          </div>

          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{completedLabs.length}</div>
            <div style={S.heroMiniLabel}>READY LABS</div>
          </div>
        </div>
      </div>
    </section>
  )

  if (loading) {
    return (
      <AdminLayout title="Patient Record" active="patients" hero={hero}>
        <div style={S.card}>Loading patient record...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Patient Record" active="patients" hero={hero}>
      {error ? <div style={S.errorBox}>{error}</div> : null}

      <section style={S.topGrid}>
        <div style={S.card}>
          <SectionTitle eyebrow="PROFILE" title="Patient Information" />

          <div style={S.infoGrid}>
            <InfoCard
              label="Full Name"
              value={
                patient
                  ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
                  : "N/A"
              }
            />
            <InfoCard label="Patient ID" value={patient ? `#${patient.id}` : "N/A"} />
            <InfoCard label="Age" value={patient ? calculateAge(patient.birth_date) : "N/A"} />
            <InfoCard label="Gender" value={patient?.gender} />
            <InfoCard label="Blood Type" value={patient?.blood_type} />
            <InfoCard label="Phone" value={patient?.phone} />
            <InfoCard label="Email" value={patient?.email} />
            <InfoCard label="Address" value={patient?.address} />
          </div>
        </div>

        <div style={S.card}>
          <SectionTitle eyebrow="ADMINISTRATIVE" title="Insurance & Identity" />

          <div style={S.infoGrid}>
            <InfoCard
              label="Insurance Provider"
              value={patient?.insurance_provider}
            />
            <InfoCard
              label="Social Security Number"
              value={patient?.social_security_number}
            />
            <InfoCard
              label="Birth Date"
              value={
                patient?.birth_date
                  ? new Date(patient.birth_date).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>
        </div>
      </section>

      <section style={S.mainGrid}>
        <div style={S.card}>
          <SectionTitle eyebrow="MEDICAL HISTORY" title="Consultation Records" />

          {records.length === 0 ? (
            <div style={S.emptyState}>No consultation records found.</div>
          ) : (
            <div style={S.stack}>
              {records.map((record, index) => (
                <div key={record.id || index} style={S.timelineItem}>
                  <div style={S.timelineTitle}>
                    {record.diagnosis || "Consultation record"}
                  </div>
                  <div style={S.timelineMeta}>
                    Appointment #{record.appointment_id || "N/A"} · Doctor #
                    {record.doctor_id || "N/A"}
                  </div>
                  {record.notes ? (
                    <div style={S.timelineText}>{record.notes}</div>
                  ) : null}
                  {record.prescription ? (
                    <div style={S.timelinePrescription}>
                      Prescription: {record.prescription}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={S.card}>
          <SectionTitle eyebrow="APPOINTMENTS" title="Visits Timeline" />

          {appointments.length === 0 ? (
            <div style={S.emptyState}>No appointments found.</div>
          ) : (
            <div style={S.stack}>
              {appointments.map((appointment, index) => (
                <div key={appointment.id || index} style={S.timelineItem}>
                  <div style={S.timelineTitle}>
                    Appointment #{appointment.id || "N/A"}
                  </div>
                  <div style={S.timelineMeta}>
                    {appointment.appointment_date
                      ? new Date(appointment.appointment_date).toLocaleString()
                      : "Date not available"}
                  </div>
                  <div style={S.timelineText}>
                    Doctor #{appointment.doctor_id || "N/A"} · Service #
                    {appointment.service_id || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={S.card}>
        <SectionTitle eyebrow="LAB RESULTS" title="Tests & Reports" />

        {labs.length === 0 ? (
          <div style={S.emptyState}>No lab results found.</div>
        ) : (
          <div style={S.labGrid}>
            {labs.map((lab, index) => (
              <div key={lab._id || lab.id || index} style={S.labCard}>
                <div style={S.labHeader}>
                  <div>
                    <div style={S.labTitle}>
                      {lab.lab_test_name || lab.lab_test_code || "Unnamed test"}
                    </div>
                    <div style={S.labMeta}>
                      Appointment #{lab.appointment_id || "N/A"} ·{" "}
                      {lab.lab_test_category || "No category"}
                    </div>
                  </div>

                  <span
                    style={{
                      ...S.statusPill,
                      ...getStatusStyle(lab.status),
                    }}
                  >
                    {lab.status || "N/A"}
                  </span>
                </div>

                <div style={S.labBody}>
                  <div style={S.labLabel}>Summary</div>
                  <div style={S.labText}>
                    {lab.result || "No result summary uploaded yet."}
                  </div>

                  {lab.file_url && (
                    <a
                      href={buildLabFileUrl(lab.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      style={S.downloadBtn}
                    >
                      Download PDF Report
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

const S = {
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
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(127, 119, 221, 0.10)",
    right: "10%",
    top: "-100px",
    filter: "blur(10px)",
  },
  heroTop: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
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
    fontSize: "2.15rem",
    lineHeight: 1.1,
    fontWeight: "800",
  },
  heroSubtitle: {
    margin: "10px 0 16px",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.5,
    maxWidth: "760px",
  },
  heroActionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  heroBtnPrimary: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: C.white,
    color: C.navyDeep,
    borderRadius: "12px",
    padding: "10px 14px",
    fontFamily: F,
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "none",
  },
  heroStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  heroStatBox: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "18px 22px",
    minWidth: "150px",
    textAlign: "center",
  },
  heroMiniValue: {
    color: C.white,
    fontWeight: "800",
    fontSize: "2rem",
    lineHeight: 1,
  },
  heroMiniLabel: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.65)",
    fontSize: "12px",
    letterSpacing: "0.10em",
    fontWeight: "700",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    background: C.cardBg,
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
    color: C.textDark,
    fontWeight: "800",
    fontSize: "1.25rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  infoBlock: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
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
    color: C.textDark,
    fontWeight: "700",
    fontSize: "14px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  stack: {
    display: "grid",
    gap: "12px",
  },
  timelineItem: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "16px",
    padding: "16px",
  },
  timelineTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "15px",
  },
  timelineMeta: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "6px",
  },
  timelineText: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "10px",
    lineHeight: 1.6,
  },
  timelinePrescription: {
    marginTop: "10px",
    color: C.blueText,
    fontWeight: "700",
    fontSize: "14px",
  },
  labGrid: {
    display: "grid",
    gap: "14px",
  },
  labCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "18px",
    padding: "16px",
  },
  labHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  labTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "15px",
  },
  labMeta: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "6px",
  },
  labBody: {
    marginTop: "14px",
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "14px",
  },
  labLabel: {
    color: C.textSoft,
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  labText: {
    color: C.textMid,
    fontSize: "14px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "14px",
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#EEEDFE",
    color: "#3C3489",
    fontWeight: "700",
    textDecoration: "none",
    border: "1px solid #CFC8FA",
  },
  emptyState: {
    background: C.lavenderSoft,
    border: `1px dashed ${C.lavenderBorder}`,
    borderRadius: "18px",
    padding: "24px 18px",
    color: C.textMid,
    fontSize: "14px",
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
}

export default AdminPatientDetailsPage