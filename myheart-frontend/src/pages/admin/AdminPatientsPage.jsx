import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  red: "#C94E4E",
  blueTag: "#DCE8FF",
  blueText: "#365BBA",
}

const F = "'Plus Jakarta Sans', sans-serif"

function SummaryCard({ icon, label, value, sub }) {
  return (
    <div style={S.summaryCard}>
      <div style={S.summaryIcon}>{icon}</div>
      <div style={S.summaryLabel}>{label}</div>
      <div style={S.summaryValue}>{value}</div>
      <div style={S.summarySub}>{sub}</div>
    </div>
  )
}

function AdminPatientsPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    gender: "",
    blood_type: "",
    insurance_provider: "",
    social_security_number: "",
  })

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await api.get("/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients(Array.isArray(res.data) ? res.data : [])
      setError("")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await api.post("/patients", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccess("Patient created successfully.")
      setFormData({
        first_name: "",
        last_name: "",
        birth_date: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        gender: "",
        blood_type: "",
        insurance_provider: "",
        social_security_number: "",
      })

      fetchPatients()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create patient"
      )
    }
  }

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim()

    return patients.filter((patient) => {
      return (
        String(patient.id).includes(q) ||
        `${patient.first_name || ""} ${patient.last_name || ""}`
          .toLowerCase()
          .includes(q) ||
        (patient.email || "").toLowerCase().includes(q) ||
        (patient.phone || "").toLowerCase().includes(q) ||
        (patient.insurance_provider || "").toLowerCase().includes(q)
      )
    })
  }, [patients, search])

  const latestPatient = patients.length > 0 ? patients[0] : null
  const insuredCount = patients.filter(
    (p) => (p.insurance_provider || "").trim() !== ""
  ).length

  const hero = (
    <section style={S.hero}>
      <div style={S.heroGlow} />
      <div style={S.heroTop}>
        <div>
          <div style={S.heroEyebrow}>PATIENT ADMINISTRATION</div>
          <h1 style={S.heroTitle}>
            Patients <span style={S.heroName}>Management</span>
          </h1>
          <p style={S.heroSubtitle}>
            Create patient accounts, search existing profiles, and open the full
            patient record to review history, labs, and core information.
          </p>
        </div>

        <div style={S.heroStatBox}>
          <div style={S.heroMiniValue}>{patients.length}</div>
          <div style={S.heroMiniLabel}>TOTAL PATIENTS</div>
        </div>
      </div>
    </section>
  )

  return (
    <AdminLayout title="Patients Management" active="patients" hero={hero}>
      <section style={S.summaryGrid}>
        <SummaryCard
          icon="👤"
          label="TOTAL PATIENTS"
          value={patients.length}
          sub="registered profiles"
        />
        <SummaryCard
          icon="🆔"
          label="LATEST PATIENT ID"
          value={latestPatient ? `#${latestPatient.id}` : "-"}
          sub="most recently listed record"
        />
        <SummaryCard
          icon="🛡"
          label="INSURED"
          value={insuredCount}
          sub="with insurance provider"
        />
        <SummaryCard
          icon="🔎"
          label="SEARCH RESULTS"
          value={filteredPatients.length}
          sub="matching current filter"
        />
      </section>

      <section style={S.grid}>
        <div style={S.card}>
          <div style={S.cardTitleSmall}>CREATE PATIENT</div>

          <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
            <div style={S.twoCol}>
              <input
                name="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                required
                style={S.input}
              />
              <input
                name="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                required
                style={S.input}
              />
            </div>

            <div style={S.twoCol}>
              <input
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                style={S.input}
              />
              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                style={S.input}
              />
            </div>

            <input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              style={S.input}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={S.input}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={S.input}
            />

            <div style={S.twoCol}>
              <input
                name="gender"
                placeholder="Gender"
                value={formData.gender}
                onChange={handleChange}
                style={S.input}
              />
              <input
                name="blood_type"
                placeholder="Blood type"
                value={formData.blood_type}
                onChange={handleChange}
                style={S.input}
              />
            </div>

            <input
              name="insurance_provider"
              placeholder="Insurance provider"
              value={formData.insurance_provider}
              onChange={handleChange}
              style={S.input}
            />
            <input
              name="social_security_number"
              placeholder="Social security number"
              value={formData.social_security_number}
              onChange={handleChange}
              style={S.input}
            />

            <button type="submit" style={S.primaryBtn}>
              Create Patient
            </button>
          </form>

          {error && <p style={S.errorText}>{error}</p>}
          {success && <p style={S.successText}>{success}</p>}
        </div>

        <div style={S.card}>
          <div style={S.tableHeader}>
            <div style={S.cardTitleSmall}>PATIENTS DIRECTORY</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              style={S.searchInput}
            />
          </div>

          {loading ? (
            <div style={S.emptyState}>Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div style={S.emptyState}>No patients found.</div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>ID</th>
                    <th style={S.th}>Name</th>
                    <th style={S.th}>Birth Date</th>
                    <th style={S.th}>Phone</th>
                    <th style={S.th}>Email</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td style={S.td}>#{patient.id}</td>
                      <td style={S.td}>
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td style={S.td}>
                        {patient.birth_date
                          ? new Date(patient.birth_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={S.td}>{patient.phone || "-"}</td>
                      <td style={S.td}>{patient.email}</td>
                      <td style={S.td}>
                        <button
                          type="button"
                          style={S.actionBtn}
                          onClick={() =>
                            navigate(`/admin/patients/${patient.id}`)
                          }
                        >
                          Open Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  heroName: {
    color: "#AFA9EC",
  },
  heroSubtitle: {
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.5,
    maxWidth: "700px",
  },
  heroStatBox: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "18px 22px",
    minWidth: "180px",
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },
  summaryCard: {
    background: C.cardBg,
    borderRadius: "20px",
    padding: "20px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  summaryIcon: {
    fontSize: "18px",
    marginBottom: "14px",
  },
  summaryLabel: {
    color: C.textSoft,
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "800",
  },
  summaryValue: {
    color: C.textDark,
    fontSize: "2rem",
    fontWeight: "800",
    marginTop: "6px",
    lineHeight: 1.1,
  },
  summarySub: {
    marginTop: "6px",
    color: C.textSoft,
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "16px",
    alignItems: "start",
  },
  card: {
    background: C.cardBg,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  cardTitleSmall: {
    color: C.textSoft,
    fontSize: "13px",
    letterSpacing: "0.12em",
    fontWeight: "800",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    marginBottom: "12px",
    borderRadius: "14px",
    border: `1px solid ${C.lavenderBorder}`,
    background: C.lavenderSoft,
    fontFamily: F,
    fontSize: "14px",
    color: C.textDark,
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    border: "none",
    background: C.navy,
    color: C.white,
    borderRadius: "14px",
    padding: "13px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(12, 68, 124, 0.18)",
    marginTop: "6px",
  },
  errorText: {
    color: C.red,
    marginTop: "12px",
    fontWeight: "600",
  },
  successText: {
    color: C.green,
    marginTop: "12px",
    fontWeight: "600",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "11px 14px",
    borderRadius: "12px",
    border: `1px solid ${C.lavenderBorder}`,
    background: C.lavenderSoft,
    fontFamily: F,
    minWidth: "260px",
    outline: "none",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: `1px solid ${C.border}`,
    color: C.textSoft,
    fontSize: "12px",
    letterSpacing: "0.08em",
    fontWeight: "800",
  },
  td: {
    padding: "14px 12px",
    borderBottom: `1px solid ${C.border}`,
    color: C.textDark,
    fontSize: "14px",
    verticalAlign: "top",
  },
  actionBtn: {
    border: "1px solid #CFC8FA",
    background: "#EEEDFE",
    color: "#3C3489",
    borderRadius: "10px",
    padding: "8px 12px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
  },
  emptyState: {
    color: C.textSoft,
    fontSize: "15px",
    padding: "26px 0 4px",
  },
}

export default AdminPatientsPage