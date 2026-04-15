import AdminSidebar from "../sidebars/AdminSidebar"

const C = {
  pageBg: "#F4F2FB",
}

const F = "'Plus Jakarta Sans', sans-serif"

function AdminLayout({ title, active = "dashboard", children, hero = null }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 1180px) {
          .ad-shell {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .ad-page {
            padding: 14px !important;
          }

          .ad-content {
            padding: 0 !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          padding: "18px",
          fontFamily: F,
        }}
        className="ad-page"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "18px",
            alignItems: "start",
          }}
          className="ad-shell"
        >
          <AdminSidebar active={active} />

          <main style={{ padding: "4px 0 0" }} className="ad-content">
            {hero ? (
              hero
            ) : (
              <div style={{ marginBottom: "18px", paddingLeft: "4px" }}>
                <h1
                  style={{
                    margin: 0,
                    color: "#1F1C3A",
                    fontSize: "2rem",
                    fontWeight: "800",
                  }}
                >
                  {title}
                </h1>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </>
  )
}

export default AdminLayout