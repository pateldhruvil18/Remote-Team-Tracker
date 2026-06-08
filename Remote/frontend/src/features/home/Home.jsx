import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import TeamMemberDashboard from "../../components/TeamMemberDashboard";
import ManagerDashboard from "../../components/ManagerDashboard";
import ImageCarousel from "../../components/ImageCarousel";

const Home = ({ initialTab }) => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium tracking-tight">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <main className="flex-1 w-full pb-20">
        {/* Hero Section with Carousel - Full width but contained height */}
        <section className="bg-black relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ImageCarousel />
            
            {/* Quick Greeting Info */}
            <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-4 mb-4">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter">
                    WELCOME BACK, <span className="text-gray-400">{user.firstName.toUpperCase()}</span>
                  </h1>
                  <p className="text-gray-500 font-medium mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {user.role}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                    System Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden min-h-[600px]">
            {user.role === "manager" ? <ManagerDashboard initialTab={initialTab} /> : <TeamMemberDashboard />}
          </div>
        </section>

        {/* Additional Info / Tips Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid md:grid-cols-3 gap-8">
          {[
            { title: "Peak Performance", desc: "Your productivity is up 12% this week. Keep utilizing the Pomodoro timer for deep focus sessions.", icon: "📈" },
            { title: "Team Synergy", desc: "3 new tasks have been assigned to your department. Review them in the tasks tab to stay ahead.", icon: "🤝" },
            { title: "Security First", desc: "Remember to verify your screenshots periodically. Our system ensures full transparency for all remote sessions.", icon: "🛡️" }
          ].map((tip, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{tip.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Remote Tracker · Premium Enterprise Edition
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
