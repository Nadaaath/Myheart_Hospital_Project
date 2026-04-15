import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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

function AppointmentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [consultation, setConsultation] = useState(null)
  const [labTests, setLabTests] = useState([])
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [profile, setProfile] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true)
        setError("")
        const token = localStorage.getItem("token")

        const [
          appointmentRes,
          billingRes,
          consultationRes,
          labRes,
          catalogRes,
          doctorsRes,
          profileRes,
        ] = await Promise.allSettled([
          api.get(`/appointments/${id}/details`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/billing/appointment/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/consultation-records/appointment/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/labs/appointment/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/catalog", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/doctors", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (appointmentRes.status !== "fulfilled") {
          throw appointmentRes.reason
        }

        setAppointment(appointmentRes.value.data?.appointment || null)

        if (billingRes.status === "fulfilled") {
          setInvoice(billingRes.value.data || null)
        } else {
          setInvoice(null)
        }

        if (consultationRes.status === "fulfilled") {
          setConsultation(consultationRes.value.data || null)
        } else {
          setConsultation(null)
        }

        if (labRes.status === "fulfilled") {
          setLabTests(Array.isArray(labRes.value.data) ? labRes.value.data : [])
        } else {
          setLabTests([])
        }

        if (catalogRes.status === "fulfilled") {
          setServices(Array.isArray(catalogRes.value.data) ? catalogRes.value.data : [])
        } else {
          setServices([])
        }

        if (doctorsRes.status === "fulfilled") {
          setDoctors(Array.isArray(doctorsRes.value.data) ? doctorsRes.value.data : [])
        } else {
          setDoctors([])
        }

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data?.user || null)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load appointment details")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [id])

  const selectedService = useMemo(() => {
    return services.find(
      (service) => String(service.id) === String(appointment?.service_id)
    )
  }, [services, appointment])

  const selectedDoctor = useMemo(() => {
    return doctors.find(
      (doctor) => String(doctor.id) === String(appointment?.doctor_id)
    )
  }, [doctors, appointment])

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

  const canCancel =
    appointment &&
    !["CANCELLED", "COMPLETED"].includes(
      String(appointment.status || "").toUpperCase()
    )

  const handleCancelAppointment = async () => {
  try {
    setCancelLoading(true)
    setError("")
    setSuccessMessage("")

    const token = localStorage.getItem("token")

    await api.delete(`/appointments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setAppointment((prev) =>
      prev ? { ...prev, status: "CANCELLED" } : prev
    )
    setSuccessMessage("Appointment cancelled successfully.")
    setShowCancelConfirm(false)
  } catch (err) {
    console.error(err)
    setError("Failed to cancel appointment")
  } finally {
    setCancelLoading(false)
  }
}

  const handleRescheduleAppointment = () => {
    navigate("/book-appointment")
  }

  const formatDate = (value) => {
    if (!value) return "N/A"
    return new Date(value).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
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

  const formatTime = (value) => {
    if (!value) return "N/A"
    return new Date(value).toLocaleTimeString([], {
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
        <div style={S.loadingCard}>Loading appointment details...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .ad-shell {
            grid-template-columns: 1fr !important;
          }

          .ad-main-grid,
          .ad-top-grid,
          .ad-bottom-grid {
            grid-template-columns: 1fr !important;
          }

          .ad-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .ad-actions {
            width: 100% !important;
            flex-wrap: wrap !important;
          }
        }

        @media (max-width: 760px) {
          .ad-page {
            padding: 14px !important;
          }

          .ad-info-grid {
            grid-template-columns: 1fr !important;
          }

          .ad-mini-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={S.page} className="ad-page">
        <div style={S.shell} className="ad-shell">
          <PatientSidebar active="appointments" profile={profile} />

          <main style={S.content}>
            <div style={S.topDate}>{todayLabel}</div>

            <section style={S.hero}>
              <div style={S.heroGlow} />
              <div style={S.heroContent} className="ad-header-row">
                <div>
                  <div style={S.heroEyebrow}>APPOINTMENT DETAILS</div>
                  <h1 style={S.heroTitle}>Appointment #{id}</h1>
                  <p style={S.heroSubtitle}>
                    Review your appointment, billing, consultation, and lab
                    information in one place.
                  </p>
                </div>

                <div style={S.headerActions} className="ad-actions">
                  <button
                    onClick={() => navigate("/appointments")}
                    style={S.secondaryBtn}
                  >
                    ← Back
                  </button>

                  {canCancel ? (
                    <>
                      <button
                        onClick={handleRescheduleAppointment}
                        style={S.lightPrimaryBtn}
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        style={{
                          ...S.dangerBtn,
                          opacity: cancelLoading ? 0.7 : 1,
                          cursor: cancelLoading ? "not-allowed" : "pointer",
                        }}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? "Cancelling..." : "Cancel Appointment"}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </section>

            {error ? <div style={S.errorBox}>{error}</div> : null}
            {successMessage ? <div style={S.successBox}>{successMessage}</div> : null}

            {appointment ? (
              <>
                <section style={S.topGrid} className="ad-top-grid">
                  <div style={S.mainCard}>
                    <div style={S.cardHeader}>
                      <div>
                        <div style={S.sectionEyebrow}>OVERVIEW</div>
                        <div style={S.sectionTitle}>Appointment Summary</div>
                      </div>

                      <span
                        style={{
                          ...S.statusPill,
                          ...getStatusStyle(appointment.status),
                        }}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    <div style={S.infoGrid} className="ad-info-grid">
                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Service</div>
                        <div style={S.infoValue}>
                          {selectedService
                            ? selectedService.name
                            : `Service #${appointment.service_id}`}
                        </div>
                        <div style={S.infoSub}>
                          {selectedService?.department || "Unknown department"}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Doctor</div>
                        <div style={S.infoValue}>
                          {selectedDoctor
                            ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                            : `Doctor #${appointment.doctor_id}`}
                        </div>
                        <div style={S.infoSub}>
                          {selectedDoctor?.department || "N/A"}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Date</div>
                        <div style={S.infoValue}>
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div style={S.infoSub}>
                          {formatTime(appointment.appointment_date)}
                        </div>
                      </div>

                      <div style={S.infoBlock}>
                        <div style={S.infoLabel}>Patient ID</div>
                        <div style={S.infoValue}>{appointment.patient_id}</div>
                        <div style={S.infoSub}>MyHeart patient record</div>
                      </div>
                    </div>

                    <div style={S.summaryStrip}>
                      <div style={S.summaryMini}>
                        <div style={S.summaryMiniLabel}>Appointment ID</div>
                        <div style={S.summaryMiniValue}>{appointment.id}</div>
                      </div>

                      <div style={S.summaryMini}>
                        <div style={S.summaryMiniLabel}>Department</div>
                        <div style={S.summaryMiniValue}>
                          {selectedService?.department || "N/A"}
                        </div>
                      </div>

                      <div style={S.summaryMini}>
                        <div style={S.summaryMiniLabel}>Doctor Department</div>
                        <div style={S.summaryMiniValue}>
                          {selectedDoctor?.department || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={S.sideCard}>
                    <div style={S.sectionEyebrow}>QUICK ACTIONS</div>
                    <div style={S.sectionTitleSmall}>Manage Appointment</div>

                    <div style={S.quickCard}>
                      <div style={S.quickTitle}>Current schedule</div>
                      <div style={S.quickSub}>
                        {formatDateTime(appointment.appointment_date)}
                      </div>
                    </div>

                    <div style={S.quickActionsCol}>
                      <button
                        onClick={() => navigate("/appointments")}
                        style={S.secondaryBtnFull}
                      >
                        View All Appointments
                      </button>

                      {canCancel ? (
                        <>
                          <button
                            onClick={handleRescheduleAppointment}
                            style={S.primaryBtnFull}
                          >
                            Reschedule Appointment
                          </button>

                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            style={{
                              ...S.dangerBtnFull,
                              opacity: cancelLoading ? 0.7 : 1,
                              cursor: cancelLoading ? "not-allowed" : "pointer",
                            }}
                            disabled={cancelLoading}
                          >
                            {cancelLoading ? "Cancelling..." : "Cancel Appointment"}
                          </button>
                        </>
                      ) : (
                        <div style={S.disabledHint}>
                          Reschedule and cancel are available only while the
                          appointment is not completed or cancelled.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section style={S.mainGrid} className="ad-main-grid">
                  <div style={S.card}>
                    <div style={S.cardHeaderSimple}>
                      <div style={S.sectionEyebrow}>BILLING</div>
                      <div style={S.sectionTitle}>Invoice</div>
                    </div>

                    {!invoice ? (
                      <div style={S.emptyState}>No invoice found yet.</div>
                    ) : (
                      <div style={S.miniGrid} className="ad-mini-grid">
                        <div style={S.miniInfoCard}>
                          <div style={S.infoLabel}>Invoice ID</div>
                          <div style={S.infoValueSmall}>{invoice.id ?? "N/A"}</div>
                        </div>

                        <div style={S.miniInfoCard}>
                          <div style={S.infoLabel}>Amount</div>
                          <div style={S.infoValueSmall}>
                            {invoice.amount ?? "N/A"}
                          </div>
                        </div>

                        <div style={S.miniInfoCard}>
                          <div style={S.infoLabel}>Status</div>
                          <div style={S.infoValueSmall}>
                            {invoice.status ?? "N/A"}
                          </div>
                        </div>

                        <div style={S.miniInfoCard}>
                          <div style={S.infoLabel}>Issued At</div>
                          <div style={S.infoValueSmall}>
                            {invoice.created_at
                              ? formatDateTime(invoice.created_at)
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeaderSimple}>
                      <div style={S.sectionEyebrow}>CONSULTATION</div>
                      <div style={S.sectionTitle}>Consultation Record</div>
                    </div>

                    {!consultation ? (
                      <div style={S.emptyState}>
                        No consultation record found yet.
                      </div>
                    ) : (
                      <div style={S.notesWrap}>
                        <div style={S.noteCard}>
                          <div style={S.infoLabel}>Diagnosis</div>
                          <div style={S.noteText}>
                            {consultation.diagnosis || "N/A"}
                          </div>
                        </div>

                        <div style={S.noteCard}>
                          <div style={S.infoLabel}>Prescription</div>
                          <div style={S.noteText}>
                            {consultation.prescription || "N/A"}
                          </div>
                        </div>

                        <div style={S.noteCard}>
                          <div style={S.infoLabel}>Notes</div>
                          <div style={S.noteText}>
                            {consultation.notes || "N/A"}
                          </div>
                        </div>

                        <div style={S.noteFooter}>
                          Created at:{" "}
                          {consultation.created_at
                            ? formatDateTime(consultation.created_at)
                            : "N/A"}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section style={S.bottomGrid} className="ad-bottom-grid">
                  <div style={S.card}>
                    <div style={S.cardHeaderSimple}>
                      <div style={S.sectionEyebrow}>LAB REPORTS</div>
                      <div style={S.sectionTitle}>Lab Tests</div>
                    </div>

                    {labTests.length === 0 ? (
                      <div style={S.emptyState}>
                        No lab tests found for this appointment.
                      </div>
                    ) : (
                      <div style={S.labList}>
                        {labTests.map((test) => (
                          <div key={test.id} style={S.labCard}>
                            <div style={S.labTop}>
                              <div>
                                <div style={S.labTitle}>
                                  {test.test_type || test.name || `Test #${test.id}`}
                                </div>
                                <div style={S.labMeta}>Lab ID #{test.id ?? "N/A"}</div>
                              </div>

                              <span
                                style={{
                                  ...S.statusPill,
                                  ...getStatusStyle(test.status),
                                }}
                              >
                                {test.status || "N/A"}
                              </span>
                            </div>

                            <div style={S.labContent}>
                              <div style={S.labField}>
                                <div style={S.infoLabel}>Result</div>
                                <div style={S.noteText}>
                                  {test.result || "Not uploaded yet"}
                                </div>
                              </div>

                              <div style={S.labField}>
                                <div style={S.infoLabel}>Created At</div>
                                <div style={S.infoSubStrong}>
                                  {test.created_at
                                    ? formatDateTime(test.created_at)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <div style={S.card}>
                <div style={S.emptyState}>Appointment not found.</div>
              </div>
            )}
            {showCancelConfirm && (
  <div style={S.modalOverlay}>
    <div style={S.modalCard}>
      <div style={S.modalEyebrow}>CONFIRM ACTION</div>
      <h3 style={S.modalTitle}>Cancel this appointment?</h3>
      <p style={S.modalText}>
        This action will cancel your appointment and may not be reversible.
        Are you sure you want to continue?
      </p>

      <div style={S.modalActions}>
        <button
          type="button"
          onClick={() => setShowCancelConfirm(false)}
          style={S.modalSecondaryBtn}
          disabled={cancelLoading}
        >
          Keep Appointment
        </button>

        <button
          type="button"
          onClick={handleCancelAppointment}
          style={S.modalDangerBtn}
          disabled={cancelLoading}
        >
          {cancelLoading ? "Cancelling..." : "Yes, Cancel It"}
        </button>
      </div>
    </div>
  </div>
)}
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
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.5,
    maxWidth: "650px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
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
  successBox: {
    marginBottom: "16px",
    background: "#EAF9F1",
    border: "1px solid #BFE8CF",
    color: "#1F8A57",
    borderRadius: "16px",
    padding: "14px 16px",
    fontWeight: "600",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 0.9fr",
    gap: "16px",
    marginBottom: "16px",
    alignItems: "start",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  mainCard: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  sideCard: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  card: {
    background: C.white,
    borderRadius: "22px",
    padding: "22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 24px rgba(31, 28, 58, 0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },
  cardHeaderSimple: {
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
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  infoBlock: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "18px",
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
    fontSize: "1.03rem",
    lineHeight: 1.45,
  },
  infoValueSmall: {
    color: C.text,
    fontWeight: "800",
    fontSize: "0.98rem",
    lineHeight: 1.45,
  },
  infoSub: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "5px",
    lineHeight: 1.45,
  },
  infoSubStrong: {
    color: C.textMid,
    fontSize: "14px",
    lineHeight: 1.45,
  },
  summaryStrip: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  summaryMini: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "14px",
  },
  summaryMiniLabel: {
    color: C.textSoft,
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "6px",
  },
  summaryMiniValue: {
    color: C.text,
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: 1.45,
  },
  quickCard: {
    marginTop: "14px",
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
  },
  quickTitle: {
    color: C.text,
    fontSize: "15px",
    fontWeight: "800",
  },
  quickSub: {
    color: C.textMid,
    fontSize: "14px",
    marginTop: "6px",
    lineHeight: 1.45,
  },
  quickActionsCol: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },
  disabledHint: {
    color: C.textSoft,
    fontSize: "13px",
    lineHeight: 1.5,
    background: C.lavenderSoft,
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: "14px",
    padding: "14px",
  },
  notesWrap: {
    display: "grid",
    gap: "12px",
  },
  noteCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
  },
  noteText: {
    color: C.textMid,
    fontSize: "14px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  noteFooter: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "4px",
  },
  miniGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  miniInfoCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "16px",
    padding: "16px",
  },
  labList: {
    display: "grid",
    gap: "12px",
  },
  labCard: {
    background: C.lavenderSoft,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: "18px",
    padding: "16px",
  },
  labTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  labTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "1rem",
  },
  labMeta: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "4px",
  },
  labContent: {
    display: "grid",
    gap: "12px",
  },
  labField: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "14px",
  },
  emptyState: {
    background: C.lavenderSoft,
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: "18px",
    padding: "24px 18px",
    color: C.textMid,
    fontSize: "14px",
  },
  secondaryBtn: {
    border: `1px solid rgba(255,255,255,0.24)`,
    background: C.white,
    color: C.textMid,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
  },
  lightPrimaryBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: C.white,
    color: C.navy,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
  },
  dangerBtn: {
    border: "none",
    background: "#D43F5E",
    color: C.white,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
  },
  secondaryBtnFull: {
    width: "100%",
    border: `1px solid ${C.borderStrong}`,
    background: C.white,
    color: C.textMid,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
    cursor: "pointer",
  },
  primaryBtnFull: {
    width: "100%",
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
  dangerBtnFull: {
    width: "100%",
    border: "none",
    background: "#D43F5E",
    color: C.white,
    borderRadius: "14px",
    padding: "12px 18px",
    fontFamily: F,
    fontWeight: "700",
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
  modalOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(4, 35, 63, 0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
},

modalCard: {
  width: "100%",
  maxWidth: "460px",
  background: C.white,
  borderRadius: "24px",
  border: `1px solid ${C.border}`,
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
  padding: "24px",
},

modalEyebrow: {
  color: C.textSoft,
  fontSize: "12px",
  letterSpacing: "0.12em",
  fontWeight: "800",
  marginBottom: "8px",
},

modalTitle: {
  margin: 0,
  color: C.text,
  fontSize: "1.35rem",
  fontWeight: "800",
},

modalText: {
  margin: "12px 0 0",
  color: C.textMid,
  fontSize: "15px",
  lineHeight: 1.6,
},
  
modalActions: {
  display: "flex",
  gap: "10px",
  marginTop: "22px",
  flexWrap: "wrap",
},

modalSecondaryBtn: {
  flex: 1,
  minWidth: "160px",
  border: `1px solid ${C.borderStrong}`,
  background: C.white,
  color: C.textMid,
  borderRadius: "14px",
  padding: "12px 18px",
  fontFamily: F,
  fontWeight: "700",
  cursor: "pointer",
},

modalDangerBtn: {
  flex: 1,
  minWidth: "160px",
  border: "none",
  background: "#D43F5E",
  color: C.white,
  borderRadius: "14px",
  padding: "12px 18px",
  fontFamily: F,
  fontWeight: "700",
  cursor: "pointer",
},
}

export default AppointmentDetailsPage