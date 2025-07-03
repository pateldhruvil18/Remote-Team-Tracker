import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Timer from "./pages/Timer";

import ScreenshotMonitoring from "./pages/ScreenshotMonitoring";
import "./App.css";
import "./styles/responsive.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("landing");

  console.log("🎯 App State - Loading:", loading, "User:", !!user, user?.email);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "landing";
      setCurrentPage(hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle public pages (no authentication required)
  if (currentPage === "landing") {
    return <Landing />;
  }

  if (currentPage === "login") {
    return <Login />;
  }

  // For authenticated pages, check if user is logged in
  if (!user) {
    // If trying to access authenticated page without login, redirect to login
    window.location.hash = "login";
    return <Login />;
  }

  // Render different authenticated pages based on current route
  switch (currentPage) {
    case "tasks":
      return <Tasks />;
    case "timer":
      return <Timer />;
    case "screenshot-monitoring":
      return <ScreenshotMonitoring />;
    case "analytics":
      return <Analytics />;
    case "profile":
      return <Profile />;
    case "dashboard":
    default:
      return <Home />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
