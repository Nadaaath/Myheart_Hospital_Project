import { Navigate } from "react-router-dom"
import PatientDashboard from "./patient/PatientDashboard"
import DoctorDashboard from "./doctor/DoctorDashboard"
import AdminDashboardPage from "./admin/AdminDashboardPage"

function DashboardPage() {
  const role = localStorage.getItem("role")

  if (role === "ADMIN") {
    return <AdminDashboardPage />
  }

  if (role === "DOCTOR") {
    return <DoctorDashboard />
  }

  if (role === "PATIENT") {
    return <PatientDashboard />
  }

  return <Navigate to="/" replace />
}

export default DashboardPage