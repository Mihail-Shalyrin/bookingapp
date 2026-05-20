import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import MyBookingsPage from "./pages/user/MyBookingsPage";
import MyProjectsPage from "./pages/user/MyProjectsPage";
import ProjectRoomsPage from "./pages/user/ProjectRoomsPage";
import LoginPage from "./pages/LoginPage";
import RoomsPage from "./pages/user/RoomsPage";
import ObjectDetailsPage from "./pages/user/ObjectDetailsPage";
import MyReservedPage from "./pages/user/MyReservedPage";
import ProjectMembersPage from "./pages/user/ProjectMembersPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminProjectDetailsPage from "./pages/admin/AdminProjectDetailsPage";
import AdminProjectMembersPage from "./pages/admin/AdminProjectMembersPage";
import AdminProjectAvailablePage from "./pages/admin/AdminProjectAvailablePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserReservedPage from "./pages/admin/AdminUserReservedPage";
import AdminUserAvailablePage from "./pages/admin/AdminUserAvailablePage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminUserBookingsPage from "./pages/admin/AdminUserBookingsPage";
import AdminUserBookingAvailablePage from "./pages/admin/AdminUserBookingAvailablePage";
import AdminBookForUserPage from "./pages/admin/AdminBookForUserPage";


import SuperAdminProjectsPage from "./pages/superadmin/SuperAdminProjectsPage";
import SuperAdminUsersPage from "./pages/superadmin/SuperAdminUsersPage";
import SuperAdminEditUserPage from "./pages/superadmin/SuperAdminEditUserPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/superadmin/projects" element={
  <ProtectedRoute requiredRoles={["SUPERADMIN"]}>
    <SuperAdminProjectsPage />
  </ProtectedRoute>
} />

<Route path="/superadmin/users" element={
  <ProtectedRoute requiredRoles={["SUPERADMIN"]}>
    <SuperAdminUsersPage />
  </ProtectedRoute>
} />

<Route path="/superadmin/users/:id/edit" element={
  <ProtectedRoute requiredRoles={["SUPERADMIN"]}>
    <SuperAdminEditUserPage />
  </ProtectedRoute>
} />
<Route path="/admin/employees" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminEmployeesPage />
  </ProtectedRoute>
} />

<Route path="/admin/employees/:userId/bookings" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminUserBookingsPage />
  </ProtectedRoute>
} />

<Route path="/admin/employees/:userId/bookings/available" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminUserBookingAvailablePage />
  </ProtectedRoute>
} />

<Route path="/admin/employees/:userId/bookings/book/:objectId" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminBookForUserPage />
  </ProtectedRoute>
} />
<Route path="/admin/employees" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminEmployeesPage />
  </ProtectedRoute>
} />

<Route path="/admin/employees/:userId/bookings" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminUserBookingsPage />
  </ProtectedRoute>
} />

<Route path="/admin/users" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminUsersPage />
  </ProtectedRoute>
} />

<Route path="/admin/users/:userId/reserved" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminUserReservedPage />
  </ProtectedRoute>
} />

<Route path="/admin/users/:userId/available" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminUserAvailablePage />
  </ProtectedRoute>
} />





          <Route path="/admin/projects/:projectId/available" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminProjectAvailablePage />
  </ProtectedRoute>
} />
          <Route path="/admin/projects" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminProjectsPage />
  </ProtectedRoute>
} />
<Route path="/admin/projects/:projectId/members" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminProjectMembersPage />
  </ProtectedRoute>
} />
<Route path="/admin/projects/:projectId" element={
  <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
    <AdminProjectDetailsPage />
  </ProtectedRoute>
} />
          <Route path="/my-reserved" element={
  <ProtectedRoute requiredRoles={["USER"]}>
    <MyReservedPage />
  </ProtectedRoute>
} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/rooms" element={
            <ProtectedRoute requiredRoles={["USER"]}>
              <RoomsPage />
            </ProtectedRoute>
          } />

            <Route path="/my-projects" element={
  <ProtectedRoute requiredRoles={["USER"]}>
    <MyProjectsPage />
  </ProtectedRoute>
} />
<Route path="/projects/:projectId/members" element={
  <ProtectedRoute requiredRoles={["USER"]}>
    <ProjectMembersPage />
  </ProtectedRoute>
} />
<Route path="/projects/:projectId/rooms" element={
  <ProtectedRoute requiredRoles={["USER"]}>
    <ProjectRoomsPage />
  </ProtectedRoute>
} />

          <Route path="/my-bookings" element={
  <ProtectedRoute requiredRoles={["USER"]}>
    <MyBookingsPage />
  </ProtectedRoute>
} />

          <Route path="/objects/:objectId" element={
            <ProtectedRoute requiredRoles={["USER"]}>
              <ObjectDetailsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/rooms" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}