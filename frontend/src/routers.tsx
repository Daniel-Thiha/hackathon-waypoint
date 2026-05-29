import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { additionRoutes } from "./modules/addition/routers/addition.router";
import { multiplicationRoutes } from "./modules/multiplication/routers/multiplication.router";
import { authRoutes } from "./modules/auth/routers/auth.router";

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      ...authRoutes,
      ...additionRoutes,
      ...multiplicationRoutes,
    ],
  },
]);

export default mainRouter;
