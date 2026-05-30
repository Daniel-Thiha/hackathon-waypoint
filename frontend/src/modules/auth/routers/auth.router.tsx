import { Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import StaffPortalPage from "../pages/StaffPortalPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import RescuerAuthPage from "../pages/RescuerAuthPage";
import RescuerLoginPage from "../pages/RescuerLoginPage";
import RescuerSignupPage from "../pages/RescuerSignupPage";
import SurvivorPortal from "../pages/SurvivorPortal";
import AdminDashboard from "../pages/AdminDashboard";
import RescueDashboard from "../pages/RescueDashboard";
import ProtectedRoute from "../../../middlewares/ProtectedRoute";

export const authRoutes = [
  { index: true, element: <LandingPage /> },
  { path: "staff", element: <StaffPortalPage /> },
  { path: "staff/admin/login", element: <AdminLoginPage /> },
  { path: "staff/rescuer", element: <RescuerAuthPage /> },
  { path: "staff/rescuer/login", element: <RescuerLoginPage /> },
  { path: "staff/rescuer/signup", element: <RescuerSignupPage /> },
  { path: "login", element: <Navigate to="/" replace /> },
  { path: "survivor", element: <SurvivorPortal /> },
  {
    path: "admin",
    element: (
      <ProtectedRoute roles={["Admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "rescue",
    element: (
      <ProtectedRoute roles={["RescueTeam"]}>
        <RescueDashboard />
      </ProtectedRoute>
    ),
  },
];
