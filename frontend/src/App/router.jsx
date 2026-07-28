import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OtpVerifyPage from "../pages/OtpVerifyPage";
import DashboardPage from "../pages/DashboardPage";
import RepoChatPage from "../pages/RepoChatPage";
import CompareReposPage from "../pages/CompareReposPage";
import ComingSoonPage from "../pages/ComingSoonPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RepositoryPage from "../pages/RepositoryPage";



export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-otp", element: <OtpVerifyPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/repo/:repoId/chat",
    element: (
      <ProtectedRoute>
        <RepoChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/compare",
    element: (
      <ProtectedRoute>
        <CompareReposPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/repository",
    element: (
      <ProtectedRoute>
        <ComingSoonPage title="Repository" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/debugger",
    element: (
      <ProtectedRoute>
        <ComingSoonPage title="Debugger" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/indexing",
    element: (
      <ProtectedRoute>
        <ComingSoonPage title="Indexing" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <ComingSoonPage title="Settings" />
      </ProtectedRoute>
    ),
  },
  {
  path: "/repository",
  element: (
    <ProtectedRoute>
      <RepositoryPage />
    </ProtectedRoute>
  ),
},
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);