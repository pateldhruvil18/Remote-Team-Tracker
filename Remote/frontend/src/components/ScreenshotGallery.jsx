import { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";

const ScreenshotGallery = () => {
  const { user } = useAuth();
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [users, setUsers] = useState([]);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    fetchScreenshots();
    if (user.role === "manager") {
      fetchUsers();
    }
  }, [selectedUser, dateRange]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const fetchScreenshots = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (selectedUser !== "all") params.append("userId", selectedUser);
      if (dateRange !== "all") {
        const dates = getDateRange(dateRange);
        if (dates.start) params.append("startDate", dates.start);
        if (dates.end) params.append("endDate", dates.end);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/screenshots?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setScreenshots(data.data.screenshots || []);
      }
    } catch (error) {
      console.error("Error fetching screenshots:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/database/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (range) {
      case "today": return { start: today.toISOString(), end: new Date(today.getTime() + 86400000).toISOString() };
      case "yesterday": return { start: new Date(today.getTime() - 86400000).toISOString(), end: today.toISOString() };
      case "week": return { start: new Date(today.getTime() - 604800000).toISOString(), end: now.toISOString() };
      default: return {};
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const fetchScreenshotImage = async (screenshot) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/screenshots/${screenshot._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageUrls(prev => ({ ...prev, [screenshot._id]: imageUrl }));
        return imageUrl;
      }
    } catch (error) { console.error("Error image:", error); }
    return null;
  };

  const getScreenshotUrl = (screenshot) => {
    if (imageUrls[screenshot._id]) return imageUrls[screenshot._id];
    fetchScreenshotImage(screenshot);
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWlscyIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9BRElORzwvdGV4dD48L3N2Zz4=";
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400 font-bold tracking-widest uppercase">Fetching visual records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>🖼️</span> Activity Timeline
          </h3>
          <p className="text-sm text-gray-500">Review visual pulse of team productivity.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {user.role === "manager" && (
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-xs font-bold transition-all">
              <option value="all">ALL MEMBERS</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
            </select>
          )}
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-xs font-bold transition-all">
            <option value="today">TODAY</option>
            <option value="yesterday">YESTERDAY</option>
            <option value="week">THIS WEEK</option>
            <option value="all">ALL TIME</option>
          </select>
        </div>
      </div>

      {screenshots.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="text-4xl mb-4 opacity-20">📷</div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No visual records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {screenshots.map((s) => (
            <div key={s._id} onClick={() => setSelectedScreenshot(s)}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img src={getScreenshotUrl(s)} alt="Snapshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-black p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">🔍</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-gray-900 uppercase truncate">
                    {s.userId?.firstName} {s.userId?.lastName}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400">{s.source === 'browser' ? '🌐 Web' : '🖥️ OS'}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">{formatTime(s.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedScreenshot(null)}>
          <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedScreenshot(null)} className="absolute top-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold z-10 hover:scale-110 transition-transform">✕</button>
            
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
                <img src={getScreenshotUrl(selectedScreenshot)} alt="Fullscreen" className="max-w-full max-h-[80vh] object-contain" />
              </div>
              <div className="w-full lg:w-80 p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Captured By</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedScreenshot.userId?.firstName} {selectedScreenshot.userId?.lastName}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</h4>
                  <p className="text-sm font-medium text-gray-700">{formatTime(selectedScreenshot.timestamp)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Details</h4>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Source</span>
                      <span className="text-gray-900">{selectedScreenshot.source.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">File Size</span>
                      <span className="text-gray-900">{selectedScreenshot.formattedSize || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <button onClick={() => window.open(getScreenshotUrl(selectedScreenshot), '_blank')}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all">
                    OPEN ORIGINAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGallery;
