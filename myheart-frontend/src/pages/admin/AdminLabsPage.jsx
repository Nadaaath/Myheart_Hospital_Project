import { useEffect, useMemo, useState } from "react"
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
  red: "#C94E4E",
  redBg: "#FFE1E1",
  blueTag: "#DCE8FF",
  blueText: "#365BBA",
  amber: "#D97706",
  amberBg: "#FEF3C7",
}

const F = "'Plus Jakarta Sans', sans-serif"

function AdminLabsPage() {
  const token = localStorage.getItem("token")

  const [labTests, setLabTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [formState, setFormState] = useState({})
  const [submittingId, setSubmittingId] = useState(null)

  const fetchLabTests = async () => {
    try {
      setLoading(true)
      const res = await api.get("/labs/tests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLabTests(Array.isArray(res.data) ? res.data : [])
      setError("")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load lab tests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLabTests()
  }, [])

  const handleFieldChange = (labId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [labId]: {
        ...prev[labId],
        [field]: value,
      },
    }))
  }

  const handleFileChange = (labId, file) => {
    setFormState((prev) => ({
      ...prev,
      [labId]: {
        ...prev[labId],
        report: file,
      },
    }))
  }

  const handleSubmitResult = async (labId) => {
    const current = formState[labId] || {}
    const result = current.result?.trim() || ""
    const report = current.report || null

    if (!result) {
      setError("Please enter the lab result before submitting.")
      return
    }

    try {
      setSubmittingId(labId)
      setError("")
      setSuccess("")

      const formData = new FormData()
      formData.append("result", result)

      if (report) {
        formData.append("report", report)
      }

      await api.patch(`/labs/tests/${labId}/result`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess("Lab result submitted successfully.")

      setFormState((prev) => {
        const copy = { ...prev }
        delete copy[labId]
        return copy
      })

      await fetchLabTests()
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit lab result"
      )
    } finally {
      setSubmittingId(null)
    }
  }

  const filteredLabTests = useMemo(() => {
    return labTests.filter((lab) => {
      const q = search.toLowerCase().trim()

      const matchesSearch =
        !q ||
        String(lab.appointment_id || "").includes(q) ||
        String(lab.patient_id || "").includes(q) ||
        (lab.lab_test_code || "").toLowerCase().includes(q) ||
        (lab.lab_test_name || "").toLowerCase().includes(q) ||
        (lab.lab_test_category || "").toLowerCase().includes(q)

      const normalizedStatus = (lab.status || "").toUpperCase()
      const matchesStatus =
        statusFilter === "ALL" || normalizedStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [labTests, search, statusFilter])

  const pendingLabs = filteredLabTests.filter(
    (lab) => (lab.status || "").toUpperCase() === "PENDING"
  )

  const completedLabs = filteredLabTests.filter(
    (lab) => (lab.status || "").toUpperCase() === "COMPLETED"
  )

  const pendingCount = labTests.filter(
    (lab) => (lab.status || "").toUpperCase() === "PENDING"
  ).length

  const completedCount = labTests.filter(
    (lab) => (lab.status || "").toUpperCase() === "COMPLETED"
  ).length

  const totalCount = labTests.length

  const buildLabFileUrl = (fileUrl) => {
    if (!fileUrl) return null

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl
    }

    return `http://localhost:5000/api/labs${fileUrl}`
  }

  const hero = (
    <section style={S.hero}>
      <div style={S.heroGlow} />
      <div style={S.heroTop}>
        <div>
          <div style={S.heroEyebrow}>LAB RESULTS ADMINISTRATION</div>
          <h1 style={S.heroTitle}>
            Lab <span style={S.heroName}>Management</span>
          </h1>
          <p style={S.heroSubtitle}>
            Review pending requests, publish results with PDF reports, and keep
            doctors and patients updated through a clean lab workflow.
          </p>
          <div style={S.heroHint}>
            {pendingCount > 0
              ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} need action now`
              : "All current requests are up to date"}
          </div>
        </div>

        <div style={S.heroStats}>
          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{pendingCount}</div>
            <div style={S.heroMiniLabel}>PENDING</div>
          </div>
          <div style={S.heroStatBox}>
            <div style={S.heroMiniValue}>{completedCount}</div>
            <div style={S.heroMiniLabel}>COMPLETED</div>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <AdminLayout title="Labs Management" active="labs" hero={hero}>
      <section style={S.summaryGrid}>
        <div style={S.summaryCard}>
          <div style={S.summaryIcon}>🧪</div>
          <div style={S.summaryLabel}>TOTAL REQUESTS</div>
          <div style={S.summaryValue}>{totalCount}</div>
          <div style={S.summarySub}>all recorded lab requests</div>
        </div>

        <div style={S.summaryCard}>
          <div style={S.summaryIcon}>⏳</div>
          <div style={S.summaryLabel}>PENDING REVIEW</div>
          <div style={S.summaryValue}>{pendingCount}</div>
          <div style={S.summarySub}>results waiting to be published</div>
        </div>

        <div style={S.summaryCard}>
          <div style={S.summaryIcon}>✅</div>
          <div style={S.summaryLabel}>COMPLETED</div>
          <div style={S.summaryValue}>{completedCount}</div>
          <div style={S.summarySub}>available to doctor and patient</div>
        </div>
      </section>

      <section style={S.filtersCard}>
        <div style={S.tableHeader}>
          <div style={S.cardTitleSmall}>FILTERS</div>

          <div style={S.filtersRow}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient ID, appointment ID, code..."
              style={S.searchInput}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={S.filterSelect}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {error && <div style={S.errorBox}>{error}</div>}
        {success && <div style={S.successBox}>{success}</div>}
      </section>

      <section style={S.mainGrid}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardTitleSmall}>PENDING REQUESTS</div>
            <span style={S.countBubble}>{pendingLabs.length}</span>
          </div>

          {loading ? (
            <div style={S.emptyState}>Loading pending requests...</div>
          ) : pendingLabs.length === 0 ? (
            <div style={S.emptyStateBox}>
              <div style={S.emptyStateIcon}>🧪</div>
              <div style={S.emptyStateTitle}>No pending lab requests</div>
              <div style={S.emptyStateText}>
                New doctor requests will appear here when they need a result to
                be published.
              </div>
            </div>
          ) : (
            <div style={S.labList}>
              {pendingLabs.map((lab) => {
                const labId = lab._id || lab.id
                const currentInputs = formState[labId] || {}

                return (
                  <div key={labId} style={S.pendingLabCard}>
                    <div style={S.labTop}>
                      <div>
                        <div style={S.labTitle}>
                          {lab.lab_test_code} — {lab.lab_test_name}
                        </div>
                        <div style={S.labMeta}>
                          Appointment #{lab.appointment_id} · Patient #{lab.patient_id}
                        </div>
                        <div style={S.metaTags}>
                          <span style={S.metaTagSoft}>
                            {lab.lab_test_category || "N/A"}
                          </span>
                          <span style={S.metaTagBlue}>
                            {lab.price_snapshot ?? "N/A"} DH
                          </span>
                          <span style={S.metaTagAmber}>Awaiting result</span>
                        </div>
                      </div>

                      <span style={S.statusPending}>PENDING</span>
                    </div>

                    <div style={S.formSection}>
                      <label style={S.fieldLabel}>Clinical / Lab Summary</label>
                      <textarea
                        rows={4}
                        placeholder="Write the lab result summary here..."
                        value={currentInputs.result || ""}
                        onChange={(e) =>
                          handleFieldChange(labId, "result", e.target.value)
                        }
                        style={S.textarea}
                      />
                    </div>

                    <div style={S.formSection}>
                      <label style={S.fieldLabel}>Attach PDF Report</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleFileChange(labId, e.target.files?.[0] || null)
                        }
                        style={S.input}
                      />
                      {currentInputs.report && (
                        <div style={S.selectedFileText}>
                          Selected: {currentInputs.report.name}
                        </div>
                      )}
                    </div>

                    <div style={S.actionRow}>
                      <button
                        type="button"
                        onClick={() => handleSubmitResult(labId)}
                        disabled={submittingId === labId}
                        style={S.primaryBtn}
                      >
                        {submittingId === labId
                          ? "Submitting..."
                          : "Submit Result"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardTitleSmall}>COMPLETED RESULTS</div>
            <span style={S.countBubble}>{completedLabs.length}</span>
          </div>

          {loading ? (
            <div style={S.emptyState}>Loading completed results...</div>
          ) : completedLabs.length === 0 ? (
            <div style={S.emptyStateBox}>
              <div style={S.emptyStateIcon}>📄</div>
              <div style={S.emptyStateTitle}>No completed lab results yet</div>
              <div style={S.emptyStateText}>
                Once a result is published, it will appear here for quick review.
              </div>
            </div>
          ) : (
            <div style={S.completedList}>
              {completedLabs.map((lab) => {
                const fileHref = buildLabFileUrl(lab.file_url)

                return (
                  <div key={lab._id || lab.id} style={S.completedCard}>
                    <div style={S.labTop}>
                      <div>
                        <div style={S.labTitle}>
                          {lab.lab_test_code} — {lab.lab_test_name}
                        </div>
                        <div style={S.labMeta}>
                          Patient #{lab.patient_id} · Appointment #{lab.appointment_id}
                        </div>
                      </div>

                      <span style={S.statusCompleted}>COMPLETED</span>
                    </div>

                    <div style={S.resultBox}>
                      <div style={S.resultLabel}>Summary</div>
                      <div style={S.resultText}>
                        {lab.result || "No result text provided"}
                      </div>

                      {fileHref && (
                        <a
                          href={fileHref}
                          target="_blank"
                          rel="noreferrer"
                          style={S.fileLink}
                        >
                          Open PDF report ↗
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
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
    maxWidth: "760px",
  },
  heroHint: {
    marginTop: "12px",
    color: "rgba(255,255,255,0.66)",
    fontSize: "14px",
    fontWeight: "600",
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
    minWidth: "140px",
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
  filtersCard: {
    background: C.cardBg,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
    marginBottom: "16px",
  },
  card: {
    background: C.cardBg,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.95fr",
    gap: "16px",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  cardTitleSmall: {
    color: C.textSoft,
    fontSize: "13px",
    letterSpacing: "0.12em",
    fontWeight: "800",
  },
  countBubble: {
    minWidth: "24px",
    height: "24px",
    borderRadius: "999px",
    background: C.lavenderSoft,
    color: C.textMid,
    fontSize: "12px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    border: `1px solid ${C.lavenderBorder}`,
  },
  filtersRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "11px 14px",
    borderRadius: "12px",
    border: `1px solid ${C.lavenderBorder}`,
    background: C.lavenderSoft,
    fontFamily: F,
    minWidth: "280px",
    outline: "none",
  },
  filterSelect: {
    padding: "11px 14px",
    borderRadius: "12px",
    border: `1px solid ${C.lavenderBorder}`,
    background: C.lavenderSoft,
    fontFamily: F,
    outline: "none",
  },
  labList: {
    display: "grid",
    gap: "14px",
  },
  completedList: {
    display: "grid",
    gap: "12px",
  },
  pendingLabCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "18px",
    padding: "16px",
  },
  completedCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "18px",
    padding: "16px",
  },
  labTop: {
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
    lineHeight: 1.5,
  },
  metaTags: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  metaTagSoft: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#EEEAFE",
    color: C.textMid,
    fontSize: "12px",
    fontWeight: "800",
  },
  metaTagBlue: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: C.blueTag,
    color: C.blueText,
    fontSize: "12px",
    fontWeight: "800",
  },
  metaTagAmber: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: C.amberBg,
    color: C.amber,
    fontSize: "12px",
    fontWeight: "800",
  },
  statusPending: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "999px",
    background: C.redBg,
    color: C.red,
    fontSize: "12px",
    fontWeight: "800",
  },
  statusCompleted: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "999px",
    background: C.greenBg,
    color: C.green,
    fontSize: "12px",
    fontWeight: "800",
  },
  formSection: {
    display: "grid",
    gap: "8px",
    marginTop: "14px",
  },
  fieldLabel: {
    color: C.textMid,
    fontSize: "13px",
    fontWeight: "700",
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "0.98rem",
    outline: "none",
    color: C.textDark,
    background: C.white,
    boxSizing: "border-box",
    fontFamily: F,
  },
  input: {
    width: "100%",
    border: `1px solid ${C.lavenderBorder}`,
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "0.98rem",
    outline: "none",
    color: C.textDark,
    background: C.white,
    boxSizing: "border-box",
    fontFamily: F,
  },
  selectedFileText: {
    color: C.textSoft,
    fontSize: "13px",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "14px",
  },
  primaryBtn: {
    border: "none",
    background: C.navy,
    color: C.white,
    borderRadius: "14px",
    padding: "13px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(12, 68, 124, 0.18)",
  },
  resultBox: {
    marginTop: "14px",
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "14px",
  },
  resultLabel: {
    color: C.textSoft,
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  resultText: {
    color: C.textDark,
    fontSize: "14px",
    lineHeight: 1.6,
  },
  fileLink: {
    display: "inline-block",
    marginTop: "10px",
    color: C.blueText,
    fontWeight: "700",
    textDecoration: "none",
  },
  errorBox: {
    background: "#FEE2E2",
    color: "#991B1B",
    borderRadius: "14px",
    padding: "12px 14px",
    marginTop: "14px",
    border: "1px solid #FECACA",
  },
  successBox: {
    background: "#DCFCE7",
    color: "#166534",
    borderRadius: "14px",
    padding: "12px 14px",
    marginTop: "14px",
    border: "1px solid #BBF7D0",
  },
  emptyState: {
    color: C.textSoft,
    fontSize: "15px",
    padding: "12px 0 4px",
  },
  emptyStateBox: {
    border: `1px dashed ${C.lavenderBorder}`,
    borderRadius: "18px",
    padding: "24px 18px",
    background: C.lavenderSoft,
    textAlign: "center",
  },
  emptyStateIcon: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  emptyStateTitle: {
    color: C.textDark,
    fontWeight: "800",
    fontSize: "15px",
    marginBottom: "6px",
  },
  emptyStateText: {
    color: C.textSoft,
    fontSize: "14px",
    lineHeight: 1.5,
  },
}

export default AdminLabsPage