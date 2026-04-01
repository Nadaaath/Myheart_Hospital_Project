import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

function CatalogPage() {
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("ALL")

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await api.get("/catalog?is_bookable=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setServices(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error(err)
        setError("Failed to load catalog")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const departments = useMemo(() => {
    const uniqueDepartments = [...new Set(
      services
        .map((service) => service.department)
        .filter(Boolean)
    )]

    return ["ALL", ...uniqueDepartments.sort()]
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesDepartment =
        selectedDepartment === "ALL" ||
        service.department === selectedDepartment

      const searchValue = search.toLowerCase().trim()

      const matchesSearch =
        !searchValue ||
        service.name?.toLowerCase().includes(searchValue) ||
        service.description?.toLowerCase().includes(searchValue) ||
        service.department?.toLowerCase().includes(searchValue) ||
        service.category?.toLowerCase().includes(searchValue)

      return matchesDepartment && matchesSearch
    })
  }, [services, search, selectedDepartment])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px 32px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#1f2937" }}>Medical Services</h1>
            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
              Browse available services and book the one that fits your needs.
            </p>
          </div>

          <button onClick={() => navigate("/dashboard")} style={topButtonStyle}>
            Back to Dashboard
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "20px 24px",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "16px",
            }}
          >
            <input
              type="text"
              placeholder="Search by service, description, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={inputStyle}
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "ALL" ? "All Departments" : department}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: "14px", color: "#6b7280", fontSize: "14px" }}>
            {loading
              ? "Loading services..."
              : `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} found`}
          </div>
        </div>

        {loading && <p>Loading services...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && filteredServices.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No services match your search or department filter.
          </div>
        )}

        {!loading && !error && filteredServices.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredServices.map((service) => (
              <div
                key={service.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "22px",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "260px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        color: "#1f2937",
                        fontSize: "18px",
                        lineHeight: "1.4",
                      }}
                    >
                      {service.name || "Unnamed service"}
                    </h3>

                    <span style={priceBadgeStyle}>
                      {service.direct_price != null
                        ? `${service.direct_price} DH`
                        : "N/A"}
                    </span>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <span style={departmentBadgeStyle}>
                      {service.department || "No department"}
                    </span>
                  </div>

                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                      lineHeight: "1.6",
                      minHeight: "72px",
                    }}
                  >
                    {service.description || "No description available"}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/book/${service.id}`)}
                  style={cardButtonStyle}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  background: "#f9fafb",
}

const topButtonStyle = {
  border: "none",
  background: "#1d4ed8",
  color: "white",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
}

const cardButtonStyle = {
  border: "none",
  background: "#e8f0ff",
  color: "#1d4ed8",
  padding: "12px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  marginTop: "18px",
}

const priceBadgeStyle = {
  background: "#dcfce7",
  color: "#166534",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: "bold",
  fontSize: "13px",
  whiteSpace: "nowrap",
}

const departmentBadgeStyle = {
  display: "inline-block",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
}

export default CatalogPage