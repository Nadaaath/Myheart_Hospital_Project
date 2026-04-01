import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import BookAppointmentPage from "./pages/BookAppointmentPage"
import MyAppointmentsPage from "./pages/MyAppointmentsPage"
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage"
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage"
import DoctorAppointmentDetailsPage from "./pages/DoctorAppointmentDetailsPage"
import DoctorPatientsPage from "./pages/DoctorPatientsPage"
import PrescriptionsPage from "./pages/PrescriptionsPage"
import HealthReportsPage from "./pages/HealthReportsPage"
import LabResultsPage from "./pages/LabResultsPage"
import DoctorLabsPage from "./pages/DoctorLabsPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
  path="/prescriptions"
  element={
    <ProtectedRoute>
      <PrescriptionsPage />
    </ProtectedRoute>
  }
/>

       <Route
  path="/lab-results"
  element={
    <ProtectedRoute>
      <LabResultsPage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/book-appointment"
  element={
    <ProtectedRoute>
      <BookAppointmentPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <MyAppointmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute>
              <DoctorAppointmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/appointments/:id"
          element={
            <ProtectedRoute>
              <DoctorAppointmentDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute>
              <DoctorPatientsPage />
            </ProtectedRoute>
          }
        />

        <Route
  path="/health-reports"
  element={
    <ProtectedRoute>
      <HealthReportsPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/doctor/labs"
          element={
            <ProtectedRoute>
              <DoctorLabsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App