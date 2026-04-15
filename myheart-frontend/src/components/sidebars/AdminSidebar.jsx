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
  red: "#EF4444",
}

const F = "'Plus Jakarta Sans', sans-serif"

function AdminSidebar({ active = "dashboard" }) {
  const navigate = useNavigate()

  const role = localStorage.getItem("role") || "ADMIN"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("reference_id")
    navigate("/")
  }

  const isActive = (key) => active === key

  return (
    <aside style={S.sidebar}>
      <div>
        <div style={S.brandWrap}>
          <div style={S.brandIcon}>♥</div>
          <div>
            <div style={S.brandTitle}>MyHeart</div>
            <div style={S.brandSub}>Admin Control</div>
          </div>
        </div>

        <div style={S.sectionLabel}>MANAGEMENT</div>
        <div style={S.menu}>
          <button
            style={{
              ...S.menuItem,
              ...(isActive("dashboard") ? S.menuItemActive : {}),
            }}
            onClick={() => navigate("/admin/dashboard")}
          >
            <span style={S.menuItemLeft}>
              <span>⊞</span>
              <span>Dashboard</span>
            </span>
          </button>

          <button
            style={{
              ...S.menuItem,
              ...(isActive("patients") ? S.menuItemActive : {}),
            }}
            onClick={() => navigate("/admin/patients")}
          >
            <span style={S.menuItemLeft}>
              <span>👤</span>
              <span>Patients</span>
            </span>
          </button>

          <button
            style={{
              ...S.menuItem,
              ...(isActive("doctors") ? S.menuItemActive : {}),
            }}
            onClick={() => navigate("/admin/doctors")}
          >
            <span style={S.menuItemLeft}>
              <span>🩺</span>
              <span>Doctors</span>
            </span>
          </button>
        </div>

        <div style={S.sectionLabel}>QUICK ACTIONS</div>
        <div style={S.menu}>
          <button
            style={S.menuItem}
            onClick={() => navigate("/admin/patients")}
          >
            <span style={S.menuItemLeft}>
              <span>＋</span>
              <span>Add Patient</span>
            </span>
          </button>

          <button
            style={S.menuItem}
            onClick={() => navigate("/admin/doctors")}
          >
            <span style={S.menuItemLeft}>
              <span>＋</span>
              <span>Add Doctor</span>
            </span>
          </button>
          <button
  style={{
    ...S.menuItem,
    ...(isActive("labs") ? S.menuItemActive : {}),
  }}
  onClick={() => navigate("/admin/labs")}
>
  <span style={S.menuItemLeft}>
    <span>🧪</span>
    <span>Labs</span>
  </span>
</button>
        </div>
      </div>

      <div style={S.sidebarFooter}>
        <div style={S.userRow}>
          <div style={S.userAvatar}>A</div>
          <div>
            <div style={S.userName}>Administrator</div>
            <div style={S.userRole}>{role}</div>
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
    color: C.red,
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
  },
}

export default AdminSidebar