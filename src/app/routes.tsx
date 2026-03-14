import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Insights } from "./pages/Insights";
import { Transactions } from "./pages/Transactions";
import { Settings } from "./pages/Settings";
import { Welcome } from "./pages/Welcome";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "insights", element: <Insights /> },
      { path: "transactions", element: <Transactions /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);