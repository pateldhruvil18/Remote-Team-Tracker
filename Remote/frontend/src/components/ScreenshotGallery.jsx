import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./ScreenshotGallery.css";

/**
 * Screenshot Gallery Component
 * Displays captured screenshots for managers to review team activity
 */
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

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  /**
   * Fetch screenshots from API
   */
  const fetchScreenshots = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedUser !== "all") params.append("userId", selectedUser);
      if (dateRange !== "all") {
        const dates = getDateRange(dateRange);
        if (dates.start) params.append("startDate", dates.start);
        if (dates.end) params.append("endDate", dates.end);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/screenshots?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setScreenshots(data.data.screenshots || []);
      } else {
        console.error("Failed to fetch screenshots");
        setScreenshots([]);
      }
    } catch (error) {
      console.error("Error fetching screenshots:", error);
      setScreenshots([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch users for filter dropdown
   */
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/database/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  /**
   * Get date range based on selection
   */
  const getDateRange = (range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "today":
        return {
          start: today.toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday.toISOString(),
          end: today.toISOString(),
        };
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          start: weekAgo.toISOString(),
          end: now.toISOString(),
        };
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          start: monthAgo.toISOString(),
          end: now.toISOString(),
        };
      default:
        return {};
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  /**
   * Fetch screenshot image with authentication and create blob URL
   */
  const fetchScreenshotImage = async (screenshot) => {
    try {
      const token = localStorage.getItem("token");
      console.log(`🖼️ Fetching screenshot image: ${screenshot._id}`);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/screenshots/${screenshot._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log(`✅ Screenshot fetched successfully: ${screenshot._id}`);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageUrls((prev) => ({
          ...prev,
          [screenshot._id]: imageUrl,
        }));
        return imageUrl;
      } else {
        console.error(
          `❌ Failed to fetch screenshot ${screenshot._id}:`,
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching screenshot ${screenshot._id}:`, error);
      return null;
    }
  };

  /**
   * Get screenshot URL (from cache or fetch)
   */
  const getScreenshotUrl = (screenshot) => {
    if (imageUrls[screenshot._id]) {
      return imageUrls[screenshot._id];
    }

    // Fetch the image if not cached
    fetchScreenshotImage(screenshot);

    // Return a placeholder while loading
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+";
  };

  if (loading) {
    return (
      <div className="screenshot-gallery">
        <div className="gallery-header">
          <h3>📸 Screenshot Gallery</h3>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading screenshots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screenshot-gallery">
      <div className="gallery-header">
        <h3>📸 Screenshot Gallery</h3>
        <div className="gallery-filters">
          {user.role === "manager" && (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Team Members</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          )}

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {screenshots.length === 0 ? (
        <div className="no-screenshots">
          <p>📷 No screenshots found for the selected criteria.</p>
          <p>
            Screenshots will appear here once team members start monitoring.
          </p>
        </div>
      ) : (
        <div className="screenshots-grid">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot._id}
              className="screenshot-card"
              onClick={() => setSelectedScreenshot(screenshot)}
            >
              <div className="screenshot-image">
                <img
                  src={getScreenshotUrl(screenshot)}
                  alt={`Screenshot from ${formatTime(screenshot.timestamp)}`}
                  loading="lazy"
                  onError={(e) => {
                    console.error(
                      "Failed to load screenshot image:",
                      screenshot._id
                    );
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmc8L3RleHQ+PC9zdmc+";
                  }}
                />
                <div className="screenshot-overlay">
                  <span className="view-icon">🔍</span>
                </div>
              </div>

              <div className="screenshot-info">
                <div className="screenshot-user">
                  {screenshot.userId?.firstName} {screenshot.userId?.lastName}
                </div>
                <div className="screenshot-time">
                  {formatTime(screenshot.timestamp)}
                </div>
                <div className="screenshot-source">
                  {screenshot.source === "browser"
                    ? "🌐 Browser"
                    : "🖥️ Desktop"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="screenshot-modal"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Screenshot Details</h4>
              <button
                className="close-btn"
                onClick={() => setSelectedScreenshot(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <img
                src={getScreenshotUrl(selectedScreenshot)}
                alt="Screenshot"
                className="modal-image"
                onError={(e) => {
                  console.error(
                    "Failed to load modal screenshot image:",
                    selectedScreenshot._id
                  );
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcgc2NyZWVuc2hvdDwvdGV4dD48L3N2Zz4=";
                }}
              />

              <div className="screenshot-details">
                <div className="detail-item">
                  <strong>User:</strong> {selectedScreenshot.userId?.firstName}{" "}
                  {selectedScreenshot.userId?.lastName}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong>{" "}
                  {formatTime(selectedScreenshot.timestamp)}
                </div>
                <div className="detail-item">
                  <strong>Source:</strong> {selectedScreenshot.source}
                </div>
                <div className="detail-item">
                  <strong>Size:</strong> {selectedScreenshot.formattedSize}
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
