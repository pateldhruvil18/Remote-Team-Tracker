import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      console.log("🔍 Auth Init - Token exists:", !!storedToken);
      console.log("🔍 Token value:", storedToken?.substring(0, 20) + "...");

      if (storedToken) {
        // Check if it's a demo token
        if (storedToken.startsWith("demo-token-")) {
          console.log("✅ Demo token detected, restoring demo user");
          const demoUser = {
            _id: "demo-user-id",
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com",
            role: "team_member",
            isActive: true,
          };
          setUser(demoUser);
          setToken(storedToken);
        } else {
          console.log("🔄 Real token detected, validating with backend...");
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/auth/profile`,
              {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("📡 Backend response status:", response.status);

            if (response.ok) {
              const data = await response.json();
              console.log("✅ User authenticated:", data.data.user.email);
              setUser(data.data.user);
              setToken(storedToken);
            } else {
              console.log("❌ Token validation failed, clearing auth");
              localStorage.removeItem("token");
              setToken(null);
            }
          } catch (error) {
            console.error("❌ Auth initialization error:", error);
            console.log("🧹 Clearing invalid token");
            localStorage.removeItem("token");
            setToken(null);
          }
        }
      } else {
        console.log("ℹ️ No token found in localStorage");
      }

      console.log("🏁 Auth initialization complete");
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const { user, tokens } = data.data;
        setUser(user);
        setToken(tokens.accessToken);
        localStorage.setItem("token", tokens.accessToken);
        return { success: true, user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);

      // Demo mode fallback - if backend is not available, create a demo user
      if (email === "demo@example.com" && password === "Password123") {
        const demoUser = {
          _id: "demo-user-id",
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com",
          role: "team_member",
          isActive: true,
        };

        const demoToken = "demo-token-" + Date.now();
        setUser(demoUser);
        setToken(demoToken);
        localStorage.setItem("token", demoToken);
        return { success: true, user: demoUser };
      }

      return {
        success: false,
        message: "Network error. Please try again or use demo credentials.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (data.success) {
        const { user, tokens } = data.data;
        setUser(user);
        setToken(tokens.accessToken);
        localStorage.setItem("token", tokens.accessToken);
        return { success: true, user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
