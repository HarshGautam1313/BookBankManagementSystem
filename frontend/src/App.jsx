import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";

import AuthPage        from "./pages/AuthPage";
import AdminDashboard  from "./pages/AdminDashboard";
import AdminAnalytics  from "./pages/AdminAnalytics";
import StudentPortal   from "./pages/StudentPortal";

// Protect routes — redirect to login if no token
function Protected({ children, role }) {
  const token = localStorage.getItem("token");
  const raw   = localStorage.getItem("user");
  const user  = raw && raw !== "undefined" ? JSON.parse(raw) : {};
  if (!token) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  }
  return children;
}

// Redirect already-logged-in users away from the auth page
function AuthRoute() {
  const token = localStorage.getItem("token");
  const raw   = localStorage.getItem("user");
  const user  = raw && raw !== "undefined" ? JSON.parse(raw) : {};
  if (token) return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  return <AuthPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<AuthRoute />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <Protected role="admin"><AdminDashboard /></Protected>
        } />
        <Route path="/admin/analytics" element={
          <Protected role="admin"><AdminAnalytics /></Protected>
        } />

        {/* Student routes */}
        <Route path="/student" element={
          <Protected role="student"><StudentPortal /></Protected>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}