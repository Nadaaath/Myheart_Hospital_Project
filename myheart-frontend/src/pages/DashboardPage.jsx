import PatientDashboard from "./PatientDashboard"
import DoctorDashboard from "./DoctorDashboard"

function DashboardPage() {
  const role = localStorage.getItem("role")

  if (role === "DOCTOR") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}

export default DashboardPage