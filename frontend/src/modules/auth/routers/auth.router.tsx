import LoginPage from "../pages/LoginPage";
import SurvivorPortal from "../pages/SurvivorPortal";
import AdminDashboard from "../pages/AdminDashboard";
import RescueDashboard from "../pages/RescueDashboard";
import ProtectedRoute from "../../../middlewares/ProtectedRoute";

export const authRoutes = [
  { path: "login", element: <LoginPage /> },
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
