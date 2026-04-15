import { BrowserRouter, Routes, Route } from "react-router-dom"

import LoginPage from "./pages/auth/LoginPage"

import DashboardPage from "./pages/DashboardPage"
import CatalogPage from "./pages/CatalogPage"

import BookAppointmentPage from "./pages/patient/BookAppointmentPage"
import MyAppointmentsPage from "./pages/patient/MyAppointmentsPage"
import AppointmentDetailsPage from "./pages/patient/AppointmentDetailsPage"
import PrescriptionsPage from "./pages/patient/PrescriptionsPage"
import HealthReportsPage from "./pages/patient/HealthReportsPage"
import LabResultsPage from "./pages/patient/LabResultsPage"

import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage"
import DoctorAppointmentDetailsPage from "./pages/doctor/DoctorAppointmentDetailsPage"
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage"
import DoctorLabsPage from "./pages/doctor/DoctorLabsPage"

import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminPatientsPage from "./pages/admin/AdminPatientsPage"
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage"
import AdminLabsPage from "./pages/admin/AdminLabsPage"
import AdminPatientDetailsPage from "./pages/admin/AdminPatientDetailsPage"
import ProtectedRoute from "./components/common/ProtectedRoute"
import RoleProtectedRoute from "./components/common/RoleProtectedRoute"
import AdminDoctorDetailsPage from "./pages/admin/AdminDoctorDetailsPage"

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
          path="/doctor/labs"
          element={
            <ProtectedRoute>
              <DoctorLabsPage />
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
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/patients"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPatientsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDoctorsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/labs"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLabsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
  path="/admin/doctors/:id"
  element={
    <RoleProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDoctorDetailsPage />
    </RoleProtectedRoute>
  }
/>
        <Route
  path="/admin/patients/:id"
  element={
    <RoleProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminPatientDetailsPage />
    </RoleProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  )
}

export default App