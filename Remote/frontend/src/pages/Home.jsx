import React from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import TeamMemberDashboard from "../components/TeamMemberDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();

  // Show different dashboards based on user role
  const renderDashboard = () => {
    if (!user) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (user.role === "manager") {
      return <ManagerDashboard />;
    } else {
      return <TeamMemberDashboard />;
    }
  };

  return (
    <div className="home-page">
      <Header />

      <main className="home-content">{renderDashboard()}</main>
    </div>
  );
};

export default Home;
