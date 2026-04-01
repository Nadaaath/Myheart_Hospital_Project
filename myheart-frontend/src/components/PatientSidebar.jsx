import { useNavigate } from "react-router-dom"

const C = {
  navy: "#0C447C",
  navyDark: "#08345F",
  sidebar: "#ECE8F8",
  border: "#E4DFF4",
  borderStrong: "#D7D0F5",
  text: "#1F1C3A",
  textMid: "#6E6893",
  textSoft: "#9A94BC",
  white: "#FFFFFF",
}

const F = "'Plus Jakarta Sans', sans-serif"

function PatientSidebar({ active = "dashboard", profile }) {
  const navigate = useNavigate()

  const firstName =
    profile?.first_name ||
    profile?.name?.split(" ")?.[0] ||
    "Patient"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/")
  }

  const isActive = (key) => active === key

  return (
    <aside style={S.sidebar}>
      <div>
        {/* BRAND */}
        <div style={S.brandWrap}>
          <div style={S.brandIcon}>♥</div>
          <div>
            <div style={S.brandTitle}>MyHeart</div>
            <div style={S.brandSub}>Patient Portal</div>
          </div>
        </div>

        {/* MAIN */}
        <div style={S.sectionLabel}>MAIN</div>
        <div style={S.menu}>
          <button
            style={{
              ...S.menuItem,
              ...(isActive("dashboard") ? S.menuItemActive : {}),
            }}
            onClick={() => navigate("/dashboard")}
          >
            <span style={S.menuItemLeft}>
              <span>⊞</span>
              <span>Dashboard</span>
            </span>
          </button>

          <button
            style={{
              ...S.menuItem,
              ...(isActive("book") ? S.menuItemActive : {}),
            }}
            onClick={() => navigate("/book-appointment")}
          >
            <span style={S.menuItemLeft}>
              <span>＋</span>
              <span>Book Appointment</span>
            </span>
          </button>

          <button
            style={{
              ...S.menuItem,
              ...(isActive("appointments") ? S.menuItemActive : {}),
            }}
            onClick={() => navigate("/appointments")}
          >
            <span style={S.menuItemLeft}>
              <span>▦</span>
              <span>Appointments</span>
            </span>
          </button>
        </div>

        {/* HEALTH */}
        <div style={S.sectionLabel}>HEALTH</div>
        <div style={S.menu}>
          <button
  style={{
    ...S.menuItem,
    ...(isActive("prescriptions") ? S.menuItemActive : {}),
  }}
  onClick={() => navigate("/prescriptions")}
>
  <span style={S.menuItemLeft}>
    <span>💊</span>
    <span>Prescriptions</span>
  </span>
</button>   

          <button
  style={{
    ...S.menuItem,
    ...(isActive("lab-results") ? S.menuItemActive : {}),
  }}
  onClick={() => navigate("/lab-results")}
>
  <span style={S.menuItemLeft}>
    <span>🧪</span>
    <span>Lab Results</span>
  </span>
</button>   
          <button
  style={{
    ...S.menuItem,
    ...(isActive("") ? S.menuItemActive : {}),
  }}
  onClick={() => navigate("/health-reports")}
>
  <span style={S.menuItemLeft}>
    <span>📈</span>
              <span>Health Reports</span>
  </span>
</button> 

        </div>

        {/* ACCOUNT */}
        <div style={S.sectionLabel}>ACCOUNT</div>
        <div style={S.menu}>
          <button style={S.menuItem}>
            <span style={S.menuItemLeft}>
            </span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={S.sidebarFooter}>
        <div style={S.userRow}>
          <div style={S.userAvatar}>
            {(firstName?.[0] || "P").toUpperCase()}
          </div>
          <div>
            <div style={S.userName}>
              {profile?.first_name || firstName} {profile?.last_name || ""}
            </div>
            <div style={S.userRole}>Patient</div>
          </div>
        </div>

        <button onClick={handleLogout} style={S.logoutBtn}>
          ↩ Logout
        </button>
      </div>
    </aside>
  )
}

const S = {
  sidebar: {
    background: C.sidebar,
    borderRadius: "28px",
    padding: "24px 18px",
    minHeight: "calc(100vh - 36px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: "18px",
    border: `1px solid ${C.border}`,
    fontFamily: F,
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
  },

  brandIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
    color: C.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
  },

  brandTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: "26px",
  },

  brandSub: {
    color: C.textSoft,
    fontSize: "13px",
    marginTop: "4px",
  },

  sectionLabel: {
    marginTop: "20px",
    marginBottom: "10px",
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: C.textSoft,
    fontWeight: "800",
  },

  menu: {
    display: "grid",
    gap: "6px",
  },

  menuItem: {
    border: "none",
    background: "transparent",
    color: C.textMid,
    borderRadius: "14px",
    padding: "13px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  menuItemActive: {
    background: C.navy,
    color: C.white,
    boxShadow: "0 10px 24px rgba(12, 68, 124, 0.20)",
  },

  menuItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  sidebarFooter: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: `1px solid ${C.borderStrong}`,
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },

  userAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: C.navy,
    color: C.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "14px",
  },

  userName: {
    color: C.text,
    fontWeight: "700",
    fontSize: "14px",
  },

  userRole: {
    color: C.textSoft,
    fontSize: "12px",
  },

  logoutBtn: {
    border: "none",
    background: "transparent",
    color: C.textSoft,
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
}

export default PatientSidebar