import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./store/AuthContext";
import Landing from "./features/home/Landing";
import Login from "./features/auth/Login";
import Home from "./features/home/Home";
import Tasks from "./features/tasks/Tasks";
import Profile from "./features/profile/Profile";
import ScreenshotMonitoring from "./features/screenshots/ScreenshotMonitoring";
import Header from "./components/Header";
import PomodoroTimer from "./components/PomodoroTimer";
import AnalyticsPage from "./components/AnalyticsPage";
import "./App.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("landing");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "landing";
      const page = hash.split("?")[0];
      setCurrentPage(page);
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing System...</p>
      </div>
    );
  }

  // Auth Guard
  const renderPage = () => {
    if (user && (currentPage === "login" || currentPage === "signup" || currentPage === "forgot-password" || currentPage === "reset-password")) {
      window.location.hash = "dashboard";
      return <Home />;
    }

    if (currentPage === "landing") return <Landing />;
    if (currentPage === "login") return <Login initialMode="login" />;
    if (currentPage === "signup") return <Login initialMode="signup" />;
    if (currentPage === "forgot-password") return <Login initialMode="forgot_password" />;
    if (currentPage === "reset-password") {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash.split("?")[1] || "");
      const token = params.get("token") || "";
      return <Login initialMode="reset-password" resetToken={token} />;
    }
    
    if (!user) {
      window.location.hash = "login";
      return <Login initialMode="login" />;
    }

    switch (currentPage) {
      case "dashboard": return <Home />;
      case "tasks": return <Tasks />;
      case "profile": return <Profile />;
      case "screenshot-monitoring": return <ScreenshotMonitoring />;
      case "timer": return <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8"><PomodoroTimer /></div>;
      case "analytics": return <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8"><AnalyticsPage /></div>;
      case "team":
        if (user?.role === "manager") {
          return <Home initialTab="team" />;
        }
        return <Home />;
      default: return <Home />;
    }
  };

  const showHeader = user && !["landing", "login", "signup", "forgot-password", "reset-password"].includes(currentPage);

  return (
    <div className="app selection:bg-black selection:text-white">
      {showHeader && <Header />}
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
