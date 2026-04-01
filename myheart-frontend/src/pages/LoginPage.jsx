import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

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
  lavenderGlow: "rgba(127, 119, 221, 0.2)",
  white: "#FFFFFF",
  inputBg: "#F8F9FF",
  inputBorder: "#E2E8F0",
  inputFocus: "#7F77DD",
  textDark: "#1E293B",
  textMid: "#475569",
  textLight: "#94A3B8",
  textWhiteMid: "rgba(255, 255, 255, 0.85)",
  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.08)",
  errorBorder: "rgba(239, 68, 68, 0.2)",
  // New color for the highlighted phrase
  highlight: "#AFA9EC", // Warm gold - you can change this to any color
}

const F = "'Plus Jakarta Sans', sans-serif"

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #F1F5F9 0%, #E6EDF5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: F,
    padding: "32px 20px",
  },
  shell: {
    display: "flex",
    width: "100%",
    maxWidth: 1120,
    minHeight: 640,
    borderRadius: 32,
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  left: {
    flex: "0 0 52%",
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 50%, ${C.navyDeep} 100%)`,
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  circleTL: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.03)",
    pointerEvents: "none",
  },
  circleBR: {
    position: "absolute",
    bottom: -120,
    right: -80,
    width: 360,
    height: 360,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.03)",
    pointerEvents: "none",
  },
  logoChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: 100,
    padding: "8px 20px 8px 14px",
    width: "fit-content",
    marginBottom: 40,
    backdropFilter: "blur(10px)",
  },
  logoChipText: {
    fontSize: 15,
    fontWeight: 700,
    color: C.white,
    letterSpacing: "0.01em",
  },
  headline: {
    fontSize: "clamp(36px, 4.5vw, 54px)",
    fontWeight: 800,
    color: C.white,
    lineHeight: 1.2,
    marginBottom: 20,
    letterSpacing: "-0.02em",
  },
  highlightText: {
    color: C.highlight,
    position: "relative",
    display: "inline-block",
  },
  desc: {
    fontSize: 15,
    color: C.textWhiteMid,
    lineHeight: 1.65,
    marginBottom: 48,
    maxWidth: 380,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: "auto",
  },
  featureCard: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: "18px 24px",
    transition: "all 0.25s ease",
    cursor: "default",
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: C.white,
    marginBottom: 4,
  },
  featureSub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  right: {
    flex: "1 1 48%",
    background: C.lavenderCard,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 36px",
  },
  card: {
    background: C.white,
    borderRadius: 32,
    padding: "44px 40px",
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.08)",
  },
  badge: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.lavenderAccent,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: C.textDark,
    marginBottom: 8,
    letterSpacing: "-0.02em",
  },
  cardSub: {
    fontSize: 14,
    color: C.textMid,
    marginBottom: 32,
    lineHeight: 1.5,
  },
  fieldWrap: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: C.textDark,
    marginBottom: 8,
    display: "block",
  },
  inputRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    background: C.inputBg,
    border: `2px solid ${C.inputBorder}`,
    borderRadius: 16,
    padding: "15px 18px 15px 48px",
    fontSize: 15,
    fontWeight: 500,
    color: C.textDark,
    fontFamily: F,
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    opacity: 0.6,
  },
  showBtn: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: C.lavenderAccent,
    fontFamily: F,
    padding: "6px 8px",
    borderRadius: 8,
    transition: "all 0.2s",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: C.errorBg,
    border: `1px solid ${C.errorBorder}`,
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 20,
    fontSize: 13,
    color: C.error,
    lineHeight: 1.4,
  },
  loginBtn: {
    width: "100%",
    padding: "16px 20px",
    background: `linear-gradient(135deg, ${C.lavenderAccent} 0%, ${C.lavenderLight} 100%)`,
    color: C.white,
    border: "none",
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: F,
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    letterSpacing: "0.01em",
    marginTop: 8,
    boxShadow: `0 8px 20px ${C.lavenderGlow}`,
  },
  cardFooter: {
    marginTop: 24,
    fontSize: 12,
    color: C.textLight,
    lineHeight: 1.5,
    textAlign: "center",
  },
}

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M12 21s-9-5.6-9-12a6 6 0 0 1 9-5.2A6 6 0 0 1 21 9c0 6.4-9 12-9 12z" />
  </svg>
)

const HeartbeatLine = () => (
  <svg
    width="100"
    height="20"
    viewBox="0 0 100 20"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.9 }}
  >
    <path
      d="M0 10 H15 L20 4 L28 16 L36 8 L42 10 H100"
      style={{
        strokeDasharray: 180,
        strokeDashoffset: 180,
        animation: "heartbeat 2.2s ease-in-out infinite",
      }}
    />
  </svg>
)

const MailIcon = () => (
  <svg
    style={S.inputIcon}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={C.lavenderAccent}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

const LockIcon = () => (
  <svg
    style={S.inputIcon}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={C.lavenderAccent}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const AlertIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={C.error}
    strokeWidth="2"
    strokeLinecap="round"
    style={{ flexShrink: 0, marginTop: 1 }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const features = [
  {
    title: "Appointments",
    sub: "Book and manage visits easily",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8.01" y2="14" />
        <line x1="12" y1="14" x2="12.01" y2="14" />
      </svg>
    ),
  },
  {
    title: "Lab Results",
    sub: "Follow your test requests and reports",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    title: "Medical History",
    sub: "Keep your health information organized",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
]

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("remembered_email")
    if (saved) setEmail(saved)
  }, [])

  const inputStyle = (field) => ({
    ...S.input,
    borderColor: focused === field ? C.inputFocus : C.inputBorder,
    boxShadow: focused === field ? `0 0 0 3px ${C.lavenderGlow}` : "none",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.post("/auth/login", { email, password })
      const { token, role } = res.data

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)
      localStorage.setItem("remembered_email", email)

      navigate("/dashboard")
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Please check your credentials."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes mhFadeUp {
          from { 
            opacity: 0; 
            transform: translateY(24px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes heartbeat {
          0%   { stroke-dashoffset: 180; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -180; }
        }
        
        .mh-left { 
          animation: mhFadeUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; 
        }
        
        .mh-card { 
          animation: mhFadeUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.1s both; 
        }
        
        .mh-feat {
          transition: all 0.25s ease !important;
        }
        
        .mh-feat:hover { 
          background: rgba(255, 255, 255, 0.15) !important;
          transform: translateX(4px);
        }
        
        .mh-btn { 
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .mh-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(127, 119, 221, 0.35) !important;
        }
        
        .mh-btn:active { 
          transform: translateY(0px) scale(0.98) !important;
        }
        
        .mh-btn:disabled { 
          opacity: 0.6 !important; 
          cursor: not-allowed !important;
          transform: none !important;
        }
        
        .mh-show-btn:hover {
          background: rgba(127, 119, 221, 0.1) !important;
        }
        
        input:focus {
          outline: none;
        }
        
        @media (max-width: 980px) {
          .mh-shell {
            flex-direction: column !important;
            max-width: 760px !important;
          }
          .mh-left-pane, .mh-right-pane {
            flex: none !important;
            width: 100% !important;
          }
        }
        
        @media (max-width: 640px) {
          .mh-page {
            padding: 16px !important;
          }
          .mh-left-pane {
            padding: 32px !important;
          }
          .mh-right-pane {
            padding: 28px 20px !important;
          }
          .mh-card-box {
            padding: 32px 24px !important;
          }
        }
      `}</style>

      <div style={S.page} className="mh-page">
        <div style={S.shell} className="mh-shell">
          <div style={S.left} className="mh-left mh-left-pane">
            <div style={S.circleTL} />
            <div style={S.circleBR} />

            <div style={S.logoChip}>
              <HeartIcon />
              <HeartbeatLine />
              <span style={S.logoChipText}>MyHeart</span>
            </div>

            <h1 style={S.headline}>
              Your health,
              <br />
              <span style={S.highlightText}>all in one</span> secure
              <br />
              place.
            </h1>

            <p style={S.desc}>
              Book appointments, view consultations, track invoices, and access
              lab results through a calm and secure patient portal.
            </p>

            <div style={S.featureList}>
              {features.map((f, idx) => (
                <div 
                  key={f.title} 
                  className="mh-feat"
                  style={{
                    ...S.featureCard,
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  <div style={S.featureIconWrap}>{f.icon}</div>
                  <div>
                    <div style={S.featureTitle}>{f.title}</div>
                    <div style={S.featureSub}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.right} className="mh-right-pane">
            <div style={S.card} className="mh-card mh-card-box">
              <p style={S.badge}>HOSPITAL PORTAL</p>
              <h2 style={S.cardTitle}>Welcome back</h2>
              <p style={S.cardSub}>
                Sign in to continue to your healthcare dashboard.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={S.fieldWrap}>
                  <label style={S.fieldLabel}>Email address</label>
                  <div style={S.inputRow}>
                    <MailIcon />
                    <input
                      type="email"
                      placeholder="patient@myheart.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle("email")}
                      required
                    />
                  </div>
                </div>

                <div style={S.fieldWrap}>
                  <label style={S.fieldLabel}>Password</label>
                  <div style={S.inputRow}>
                    <LockIcon />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle("password"), paddingRight: 70 }}
                      required
                    />
                    <button
                      type="button"
                      style={S.showBtn}
                      className="mh-show-btn"
                      onClick={() => setShowPw((v) => !v)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={S.errorBox}>
                    <AlertIcon />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  style={S.loginBtn}
                  className="mh-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span>Signing in</span>
                      <span style={{ display: "inline-block", animation: "pulse 0.8s infinite" }}>...</span>
                    </>
                  ) : (
                    "Login to Dashboard"
                  )}
                </button>
              </form>

              <p style={S.cardFooter}>
                Secure access for patients, doctors, and staff through MyHeart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}