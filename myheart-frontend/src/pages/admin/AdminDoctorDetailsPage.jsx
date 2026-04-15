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
    <div style={S.infoCard}>
      <div style={S.infoLabel}>{label}</div>
      <div style={S.infoValue}>{value || "N/A"}</div>
    </div>
  )
}

function MetricCard({ value, label }) {
  return (
    <div style={S.metricCard}>
      <div style={S.metricValue}>{value}</div>
      <div style={S.metricLabel}>{label}</div>
    </div>
  )
}

function SectionCard({ eyebrow, title, count, children }) {
  return (
    <section style={S.sectionCard}>
      <div style={S.sectionHeader}>
        <div>
          <div style={S.sectionEyebrow}>{eyebrow}</div>
          <div style={S.sectionTitle}>{title}</div>
        </div>
        <div style={S.countBadge}>{count}</div>
      </div>
      {children}
    </section>
  )
}

function EmptyMini({ text }) {
  return <div style={S.emptyMini}>{text}</div>
}

function AdminDoctorDetailsPage() {
  const { id } = useParams()
  const token = localStorage.getItem("token")

  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [labs, setLabs] = useState([])
  const [records, setRecords] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    const fetchDoctorRecord = async () => {
      try {
        setLoading(true)
        setError("")

        const [
          doctorRes,
          patientsRes,
          appointmentsRes,
          labsRes,
          recordsRes,
          servicesRes,
        ] = await Promise.allSettled([
          api.get(`/doctors/${id}`),
          api.get("/patients", { headers }),
          api.get(`/appointments/doctor/${id}`, { headers }),
          api.get("/labs/tests", { headers }),
          api.get("/consultation-records", { headers }),
          api.get("/catalog"),
        ])

        if (doctorRes.status === "fulfilled") {
          setDoctor(doctorRes.value.data)
        }

        setPatients(
          patientsRes.status === "fulfilled" && Array.isArray(patientsRes.value.data)
            ? patientsRes.value.data
            : []
        )

        setAppointments(
          appointmentsRes.status === "fulfilled" &&
            Array.isArray(appointmentsRes.value.data)
            ? appointmentsRes.value.data
            : []
        )

        setLabs(
          labsRes.status === "fulfilled" && Array.isArray(labsRes.value.data)
            ? labsRes.value.data
            : []
        )

        setRecords(
          recordsRes.status === "fulfilled" && Array.isArray(recordsRes.value.data)
            ? recordsRes.value.data
            : []
        )

        setServices(
          servicesRes.status === "fulfilled" && Array.isArray(servicesRes.value.data)
            ? servicesRes.value.data
            : []
        )
      } catch (err) {
        console.error("Doctor record fetch error:", err)
        setError("Failed to load doctor record.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorRecord()
  }, [id])

  const doctorLabs = useMemo(() => {
    return labs.filter(
      (lab) =>
        String(lab.doctor_id ?? lab.doctorId ?? lab.doctor?.id) === String(id)
    )
  }, [labs, id])

  const doctorRecords = useMemo(() => {
    return records.filter(
      (record) =>
        String(record.doctor_id ?? record.doctorId ?? record.doctor?.id) ===
        String(id)
    )
  }, [records, id])

  const doctorPatientIds = useMemo(() => {
    const fromAppointments = appointments.map((a) =>
      String(a.patient_id ?? a.patientId ?? a.patient?.id)
    )
    const fromRecords = doctorRecords.map((r) =>
      String(r.patient_id ?? r.patientId ?? r.patient?.id)
    )

    return [...new Set([...fromAppointments, ...fromRecords].filter(Boolean))]
  }, [appointments, doctorRecords])

  const doctorPatients = useMemo(() => {
    return patients.filter((p) => doctorPatientIds.includes(String(p.id)))
  }, [patients, doctorPatientIds])

  const readyLabs = useMemo(() => {
    return doctorLabs.filter((lab) =>
      ["READY", "COMPLETED", "VALIDATED"].includes(
        String(lab.status || "").toUpperCase()
      )
    )
  }, [doctorLabs])

  const pendingLabs = useMemo(() => {
    return doctorLabs.filter((lab) =>
      ["PENDING", "REQUESTED", "IN_PROGRESS"].includes(
        String(lab.status || "").toUpperCase()
      )
    )
  }, [doctorLabs])

  const getServiceName = (serviceId) => {
    const service = services.find((s) => String(s.id) === String(serviceId))
    return service?.name || `Service #${serviceId || "N/A"}`
  }

  const recentAppointments = appointments.slice(0, 5)
  const recentPatients = doctorPatients.slice(0, 5)
  const recentRecords = doctorRecords.slice(0, 5)
  const recentLabs = doctorLabs.slice(0, 5)

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
      case "REQUESTED":
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

  const hero = (
    <section style={S.hero}>
      <div style={S.heroGlow} />
      <div style={S.heroTop}>
        <div>
          <div style={S.heroEyebrow}>DOCTOR ACTIVITY RECORD</div>
          <h1 style={S.heroTitle}>
            {doctor
              ? `Dr. ${doctor.first_name || ""} ${doctor.last_name || ""}`.trim()
              : "Doctor Record"}
          </h1>
          <p style={S.heroSubtitle}>
            Review the doctor’s overall activity, assigned patients,
            consultation records, appointments, and lab requests.
          </p>

          <Link to="/admin/doctors" style={S.heroBtn}>
            ← Back to Doctors
          </Link>
        </div>

        <div style={S.heroStats}>
          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{appointments.length}</div>
            <div style={S.heroMiniLabel}>APPOINTMENTS</div>
          </div>
          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{doctorPatients.length}</div>
            <div style={S.heroMiniLabel}>PATIENTS</div>
          </div>
          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{pendingLabs.length}</div>
            <div style={S.heroMiniLabel}>PENDING LABS</div>
          </div>
        </div>
      </div>
    </section>
  )

  if (loading) {
    return (
      <AdminLayout title="Doctor Record" active="doctors" hero={hero}>
        <div style={S.card}>Loading doctor record...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Doctor Record" active="doctors" hero={hero}>
      {error ? <div style={S.errorBox}>{error}</div> : null}

      <section style={S.topGrid}>
        <div style={S.card}>
          <div style={S.blockTitle}>Doctor Information</div>
          <div style={S.infoGrid}>
            <InfoCard
              label="Full Name"
              value={
                doctor
                  ? `Dr. ${doctor.first_name || ""} ${doctor.last_name || ""}`.trim()
                  : "N/A"
              }
            />
            <InfoCard label="Doctor ID" value={doctor ? `#${doctor.id}` : "N/A"} />
            <InfoCard label="Department" value={doctor?.department} />
            <InfoCard label="Email" value={doctor?.email} />
            <InfoCard label="Phone" value={doctor?.phone} />
            <InfoCard label="Unique Patients" value={doctorPatients.length} />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.blockTitle}>Snapshot</div>
          <div style={S.metricGrid}>
            <MetricCard value={appointments.length} label="Appointments" />
            <MetricCard value={doctorRecords.length} label="Records" />
            <MetricCard value={pendingLabs.length} label="Pending labs" />
            <MetricCard value={readyLabs.length} label="Ready labs" />
          </div>
        </div>
      </section>

      <section style={S.mainGrid}>
        <SectionCard eyebrow="PATIENTS" title="Assigned Patients" count={doctorPatients.length}>
          {recentPatients.length === 0 ? (
            <EmptyMini text="No patients have been linked to this doctor yet." />
          ) : (
            <div style={S.list}>
              {recentPatients.map((patient) => (
                <div key={patient.id} style={S.item}>
                  <div style={S.itemTitle}>
                    {patient.first_name} {patient.last_name}
                  </div>
                  <div style={S.itemMeta}>
                    Patient #{patient.id} · {patient.phone || "No phone"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="APPOINTMENTS" title="Visits Timeline" count={appointments.length}>
          {recentAppointments.length === 0 ? (
            <EmptyMini text="No appointments have been recorded for this doctor yet." />
          ) : (
            <div style={S.list}>
              {recentAppointments.map((appointment, index) => (
                <div key={appointment.id || index} style={S.item}>
                  <div style={S.itemTitle}>
                    Appointment #{appointment.id || "N/A"} :{" "}
                    {getServiceName(appointment.service_id ?? appointment.serviceId)}
                  </div>
                  <div style={S.itemMeta}>
                    Patient #{appointment.patient_id ?? appointment.patientId ?? "N/A"} · Service #
                    {appointment.service_id ?? appointment.serviceId ?? "N/A"}
                  </div>
                  <div style={S.itemText}>
                    {appointment.appointment_date
                      ? new Date(appointment.appointment_date).toLocaleString()
                      : "Date not available"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="CONSULTATIONS" title="Medical Records Written" count={doctorRecords.length}>
          {recentRecords.length === 0 ? (
            <EmptyMini text="This doctor has not created consultation records yet." />
          ) : (
            <div style={S.list}>
              {recentRecords.map((record, index) => (
                <div key={record.id || index} style={S.item}>
                  <div style={S.itemTitle}>
                    {record.diagnosis || "Consultation record"}
                  </div>
                  <div style={S.itemMeta}>
                    Patient #{record.patient_id ?? record.patientId ?? "N/A"} · Appointment #
                    {record.appointment_id ?? record.appointmentId ?? "N/A"}
                  </div>
                  {record.notes ? (
                    <div style={S.itemText}>{record.notes}</div>
                  ) : null}
                  {record.prescriptions && Array.isArray(record.prescriptions) && record.prescriptions.length > 0 ? (
                    <div style={S.itemAccent}>
                      Prescription: {record.prescriptions.join(", ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="LAB REQUESTS" title="Requested Tests" count={doctorLabs.length}>
          {recentLabs.length === 0 ? (
            <EmptyMini text="No lab requests have been submitted by this doctor yet." />
          ) : (
            <div style={S.list}>
              {recentLabs.map((lab, index) => (
                <div key={lab._id || lab.id || index} style={S.item}>
                  <div style={S.itemRow}>
                    <div>
                      <div style={S.itemTitle}>
                        {lab.lab_test_name || lab.lab_test_code || "Unnamed lab"}
                      </div>
                      <div style={S.itemMeta}>
                        Patient #{lab.patient_id ?? lab.patientId ?? "N/A"} · Appointment #
                        {lab.appointment_id ?? lab.appointmentId ?? "N/A"}
                      </div>
                    </div>

                    <span style={{ ...S.statusPill, ...getStatusStyle(lab.status) }}>
                      {lab.status || "N/A"}
                    </span>
                  </div>

                  {lab.result ? (
                    <div style={S.itemText}>{lab.result}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
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
    padding: "24px 24px",
    marginBottom: "12px",
    boxShadow: "0 22px 44px rgba(12, 68, 124, 0.18)",
  },
  heroGlow: {
    position: "absolute",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background: "rgba(127, 119, 221, 0.10)",
    right: "8%",
    top: "-80px",
    filter: "blur(10px)",
  },
  heroTop: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "800",
    marginBottom: "8px",
  },
  heroTitle: {
    margin: 0,
    color: C.white,
    fontSize: "2rem",
    lineHeight: 1.1,
    fontWeight: "800",
  },
  heroSubtitle: {
    margin: "10px 0 14px",
    color: "rgba(255,255,255,0.86)",
    fontSize: "15px",
    lineHeight: 1.5,
    maxWidth: "720px",
  },
  heroBtn: {
    display: "inline-block",
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
    borderRadius: "18px",
    padding: "16px 18px",
    minWidth: "110px",
    textAlign: "center",
  },
  heroMiniValue: {
    color: C.white,
    fontWeight: "800",
    fontSize: "1.8rem",
    lineHeight: 1,
  },
  heroMiniLabel: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.65)",
    fontSize: "11px",
    letterSpacing: "0.10em",
    fontWeight: "700",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.9fr",
    gap: "12px",
    marginBottom: "12px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  card: {
    background: C.cardBg,
    borderRadius: "20px",
    padding: "16px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  blockTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "1.05rem",
    marginBottom: "12px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  infoCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "14px",
    padding: "14px",
  },
  infoLabel: {
    color: C.textSoft,
    fontSize: "11px",
    letterSpacing: "0.08em",
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  infoValue: {
    color: C.textDark,
    fontWeight: "700",
    fontSize: "14px",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  metricCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "14px",
    padding: "14px",
  },
  metricValue: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "1.7rem",
    lineHeight: 1,
  },
  metricLabel: {
    marginTop: "8px",
    color: C.textSoft,
    fontSize: "13px",
  },
  sectionCard: {
    background: C.cardBg,
    borderRadius: "20px",
    padding: "14px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "12px",
  },
  sectionEyebrow: {
    color: C.textSoft,
    fontSize: "11px",
    letterSpacing: "0.12em",
    fontWeight: "800",
    marginBottom: "4px",
  },
  sectionTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "1rem",
  },
  countBadge: {
    minWidth: "24px",
    height: "24px",
    borderRadius: "999px",
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    color: C.textMid,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    padding: "0 8px",
  },
  list: {
    display: "grid",
    gap: "10px",
  },
  item: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "14px",
    padding: "12px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  itemTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "14px",
  },
  itemMeta: {
    color: C.textSoft,
    fontSize: "12px",
    marginTop: "4px",
  },
  itemText: {
    color: C.textMid,
    fontSize: "13px",
    marginTop: "8px",
    lineHeight: 1.55,
  },
  itemAccent: {
    marginTop: "8px",
    color: C.blueText,
    fontWeight: "700",
    fontSize: "13px",
  },
  statusPill: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "11px",
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  emptyMini: {
    background: C.lavenderSoft,
    border: `1px dashed ${C.lavenderBorder}`,
    borderRadius: "14px",
    padding: "14px",
    color: C.textMid,
    fontSize: "13px",
  },
  errorBox: {
    marginBottom: "12px",
    background: "#FFF1F1",
    border: "1px solid #F7D0D0",
    color: C.redText,
    borderRadius: "14px",
    padding: "12px 14px",
    fontWeight: "600",
  },
}

export default AdminDoctorDetailsPage
