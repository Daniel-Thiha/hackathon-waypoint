import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { authRoutes } from "./modules/auth/routers/auth.router";
import { forecastRoutes } from "./modules/forecast/routers/forecast.router";
import { safePlaceRoutes } from "./modules/safe-place/routers/safe-place.router";
import { survivorRoutes } from "./modules/survivor/routers/survivor.router";
import { rescueRoutes } from "./modules/rescue/routers/rescue.router";

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      ...authRoutes,
      ...forecastRoutes,
      ...safePlaceRoutes,
      ...survivorRoutes,
      ...rescueRoutes,
    ],
  },
]);

export default mainRouter;
