import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
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
  blueTag: "#DCE8FF",
  blueText: "#365BBA",
  amber: "#D97706",
  amberBg: "#FEF3C7",
  red: "#C94E4E",
  redBg: "#FFE1E1",
}

const F = "'Plus Jakarta Sans', sans-serif"

function StatCard({ icon, label, value, sub }) {
  return (
    <div style={S.infoCard}>
      <div style={S.infoIcon}>{icon}</div>
      <div style={S.infoLabel}>{label}</div>
      <div style={S.infoValue}>{value}</div>
      <div style={S.infoSub}>{sub}</div>
    </div>
  )
}

function QuickLink({ to, label, sub, icon }) {
  return (
    <Link to={to} style={S.quickCard}>
      <div style={S.quickIcon}>{icon}</div>
      <div style={S.quickTitle}>{label}</div>
      <div style={S.quickSub}>{sub}</div>
    </Link>
  )
}

function ActivityItem({ title, meta, tag, tagStyle }) {
  return (
    <div style={S.activityItem}>
      <div>
        <div style={S.activityTitle}>{title}</div>
        <div style={S.activityMeta}>{meta}</div>
      </div>
      <span style={{ ...S.activityTag, ...tagStyle }}>{tag}</span>
    </div>
  )
}

function AdminDashboardPage() {
  const token = localStorage.getItem("token")

  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [patientsRes, doctorsRes, labsRes] = await Promise.allSettled([
          api.get("/patients", { headers }),
          api.get("/doctors", { headers }),
          api.get("/labs/tests", { headers }),
        ])

        const patientsData =
          patientsRes.status === "fulfilled" && Array.isArray(patientsRes.value.data)
            ? patientsRes.value.data
            : []

        const doctorsData =
          doctorsRes.status === "fulfilled" && Array.isArray(doctorsRes.value.data)
            ? doctorsRes.value.data
            : []

        const labsData =
          labsRes.status === "fulfilled" && Array.isArray(labsRes.value.data)
            ? labsRes.value.data
            : []

        setPatients(patientsData)
        setDoctors(doctorsData)
        setLabs(labsData)
      } catch (err) {
        console.error("Admin dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  const pendingLabs = useMemo(
    () =>
      labs.filter((lab) =>
        ["PENDING", "REQUESTED", "IN_PROGRESS"].includes(
          String(lab.status || "").toUpperCase()
        )
      ),
    [labs]
  )

  const completedLabs = useMemo(
    () =>
      labs.filter((lab) =>
        ["READY", "COMPLETED", "VALIDATED"].includes(
          String(lab.status || "").toUpperCase()
        )
      ),
    [labs]
  )

  const recentPatients = useMemo(() => patients.slice(0, 3), [patients])
  const recentDoctors = useMemo(() => doctors.slice(0, 3), [doctors])

  const latestActivities = useMemo(() => {
    const patientItems = recentPatients.map((p) => ({
      title: `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Patient #${p.id}`,
      meta: `Patient ID #${p.id}`,
      tag: "PATIENT",
      tagStyle: {
        background: C.blueTag,
        color: C.blueText,
      },
    }))

    const doctorItems = recentDoctors.map((d) => ({
      title: `Dr. ${d.first_name || ""} ${d.last_name || ""}`.trim(),
      meta: d.department || "Department not specified",
      tag: "DOCTOR",
      tagStyle: {
        background: C.lavenderSoft,
        color: C.textMid,
      },
    }))

    const labItems = pendingLabs.slice(0, 3).map((l) => ({
      title: l.lab_test_name || l.lab_test_code || "Pending lab request",
      meta: `Patient #${l.patient_id} · Appointment #${l.appointment_id}`,
      tag: "LAB",
      tagStyle: {
        background: C.amberBg,
        color: C.amber,
      },
    }))

    return [...labItems, ...patientItems, ...doctorItems].slice(0, 5)
  }, [recentPatients, recentDoctors, pendingLabs])

  const hero = (
    <section style={S.hero}>
      <div style={S.heroGlow} />
      <div style={S.heroTop}>
        <div>
          <div style={S.heroEyebrow}>ADMIN CONTROL CENTER</div>
          <h1 style={S.heroTitle}>
            Welcome back, <span style={S.heroName}>Admin</span> ✦
          </h1>
          <p style={S.heroSubtitle}>
            Monitor hospital activity, handle pending lab requests, and manage
            patient and doctor records from one central workspace.
          </p>

          <div style={S.heroActionRow}>
            <Link to="/admin/patients" style={S.heroBtnPrimary}>
              + Add Patient
            </Link>
            <Link to="/admin/doctors" style={S.heroBtnSecondary}>
              + Add Doctor
            </Link>
            <Link to="/admin/labs" style={S.heroBtnSecondary}>
              Open Labs
            </Link>
          </div>
        </div>

        <div style={S.statStrip}>
          <div style={S.heroMiniStat}>
            <div style={S.heroMiniValue}>{pendingLabs.length}</div>
            <div style={S.heroMiniLabel}>PENDING LABS</div>
          </div>

          <div style={S.heroDivider} />

          <div style={S.heroMiniStat}>
            <div style={S.heroMiniValue}>{patients.length + doctors.length}</div>
            <div style={S.heroMiniLabel}>USERS</div>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <AdminLayout title="Admin Dashboard" active="dashboard" hero={hero}>
      <section style={S.summaryGrid}>
        <StatCard
          icon="👤"
          label="TOTAL PATIENTS"
          value={loading ? "..." : patients.length}
          sub="registered patient profiles"
        />
        <StatCard
          icon="🩺"
          label="TOTAL DOCTORS"
          value={loading ? "..." : doctors.length}
          sub="active medical staff"
        />
        <StatCard
          icon="🧪"
          label="PENDING LABS"
          value={loading ? "..." : pendingLabs.length}
          sub="requests needing attention"
        />
        <StatCard
          icon="✅"
          label="READY RESULTS"
          value={loading ? "..." : completedLabs.length}
          sub="results available to users"
        />
      </section>

      <section style={S.grid}>
        <div style={S.card}>
          <div style={S.cardHeaderRow}>
            <div style={S.cardTitleSmall}>QUICK ACTIONS</div>
          </div>

          <div style={S.quickGrid}>
            <QuickLink
              to="/admin/patients"
              label="Manage Patients"
              sub="Create and review patient profiles"
              icon="👤"
            />
            <QuickLink
              to="/admin/doctors"
              label="Manage Doctors"
              sub="Add doctors and review staff"
              icon="🩺"
            />
            <QuickLink
              to="/admin/labs"
              label="Review Labs"
              sub="Publish pending results and PDFs"
              icon="🧪"
            />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitleSmall}>NEEDS ATTENTION</div>

          <div style={S.alertWrap}>
            <div style={S.alertCardAmber}>
              <div style={S.alertValue}>{pendingLabs.length}</div>
              <div style={S.alertLabel}>Pending lab requests</div>
            </div>

            <div style={S.alertCardBlue}>
              <div style={S.alertValue}>{patients.length}</div>
              <div style={S.alertLabel}>Patient records available</div>
            </div>
          </div>
        </div>
      </section>

      <section style={S.bottomGrid}>
        <div style={S.card}>
          <div style={S.cardTitleSmall}>RECENT ACTIVITY</div>

          <div style={S.activityList}>
            {latestActivities.length === 0 ? (
              <div style={S.emptyBox}>No recent activity available yet.</div>
            ) : (
              latestActivities.map((item, index) => (
                <ActivityItem
                  key={`${item.tag}-${index}`}
                  title={item.title}
                  meta={item.meta}
                  tag={item.tag}
                  tagStyle={item.tagStyle}
                />
              ))
            )}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitleSmall}>ADMIN NOTES</div>
          <div style={S.noteBox}>
            <div style={S.notePillBlue}>SYSTEM READY</div>
            <div style={S.noteTitle}>Administration workspace is active</div>
            <div style={S.noteText}>
              The platform is running with patient management, doctor management,
              and lab workflow enabled. The next strong upgrade is an admin
              appointments page and a billing overview.
            </div>
          </div>
        </div>
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
  heroName: {
    color: "#AFA9EC",
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
  heroBtnSecondary: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: C.white,
    borderRadius: "12px",
    padding: "10px 14px",
    fontFamily: F,
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "none",
  },
  statStrip: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: "220px",
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
    fontSize: "1.8rem",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    fontSize: "2rem",
    fontWeight: "800",
    marginTop: "6px",
    lineHeight: 1.1,
  },
  infoSub: {
    marginTop: "6px",
    color: C.textSoft,
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "16px",
  },
  card: {
    background: C.cardBg,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
  },
  cardTitleSmall: {
    color: C.textSoft,
    fontSize: "13px",
    letterSpacing: "0.12em",
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
    textDecoration: "none",
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
  alertWrap: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  alertCardAmber: {
    background: C.amberBg,
    color: C.amber,
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #F7D89C",
  },
  alertCardBlue: {
    background: C.blueTag,
    color: C.blueText,
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #C6DCF9",
  },
  alertValue: {
    fontSize: "1.8rem",
    fontWeight: "800",
    lineHeight: 1,
  },
  alertLabel: {
    marginTop: "8px",
    fontSize: "14px",
    fontWeight: "700",
  },
  activityList: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "16px",
    border: `1px solid ${C.lavenderBorder}`,
    background: C.lavenderSoft,
  },
  activityTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "14px",
  },
  activityMeta: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "4px",
  },
  activityTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  noteBox: {
    marginTop: "16px",
    background: C.lavenderSoft,
    borderRadius: "18px",
    padding: "18px",
    border: `1px solid ${C.lavenderBorder}`,
  },
  notePillBlue: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: "999px",
    background: C.blueTag,
    color: C.blueText,
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "14px",
  },
  noteTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "1.1rem",
    marginBottom: "8px",
  },
  noteText: {
    color: C.textMid,
    fontSize: "14px",
    lineHeight: 1.6,
  },
  emptyBox: {
    border: `1px dashed ${C.lavenderBorder}`,
    borderRadius: "16px",
    padding: "20px",
    background: C.lavenderSoft,
    color: C.textMid,
    fontSize: "14px",
  },
}

export default AdminDashboardPage