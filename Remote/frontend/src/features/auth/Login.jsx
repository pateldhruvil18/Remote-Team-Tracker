import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";

const Login = ({ initialMode = "login", resetToken = "" }) => {
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'otp'
  const [formData, setFormData] = useState({
    email: "", password: "", firstName: "", lastName: "", role: "team_member",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [managerExists, setManagerExists] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, register, verifyOTP, resendOTP } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setError("");
    setSuccessMessage("");
  }, [initialMode]);

  useEffect(() => {
    const checkManager = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-manager`);
        const data = await response.json();
        if (data.success) setManagerExists(data.data.managerExists);
      } catch (err) { console.error("Manager check failed", err); }
    };
    checkManager();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); setSuccessMessage(""); };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== "") element.nextSibling.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      if (mode === "login") {
        const res = await login(formData.email, formData.password);
        if (!res.success) {
          if (res.needsVerification) setMode("otp");
          else setError(res.message || "Login failed");
        } else {
          window.location.hash = "dashboard";
        }
      } else if (mode === "signup") {
        const res = await register(formData);
        if (res.success) setMode("otp");
        else setError(res.message || "Registration failed");
      } else if (mode === "otp") {
        const res = await verifyOTP(formData.email, otp.join(""));
        if (!res.success) {
          setError(res.message || "Invalid code");
        } else {
          window.location.hash = "dashboard";
        }
      } else if (mode === "forgot_password") {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const res = await response.json();
        if (res.success) {
          setSuccessMessage("Reset link has been generated. Check backend console logs to copy/use it if running locally.");
        } else {
          setError(res.message || "Failed to process request");
        }
      } else if (mode === "reset_password") {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, password: formData.password }),
        });
        const res = await response.json();
        if (res.success) {
          alert("Password successfully reset! Redirecting to login...");
          window.location.hash = "login";
        } else {
          setError(res.message || "Failed to reset password");
        }
      }
    } catch (err) { setError("Network error. Is server running?"); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOTP(formData.email);
      setResendCooldown(60);
    } catch (err) { setError("Failed to resend"); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left side: Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-black relative p-20 flex-col justify-between">
        <div className="absolute inset-0 opacity-40">
          <img src="/hero1.png" alt="Remote Work" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">RT</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Remote Tracker</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-none tracking-tighter mb-6">
            ELEVATE YOUR <br /> WORKFLOW.
          </h2>
          <p className="text-gray-400 text-lg font-medium max-w-sm">
            Join the elite remote teams using Operational Intelligence to scale productivity.
          </p>
        </div>

        <div className="relative z-10 flex gap-10">
          <div>
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Teams</div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-gray-50/30">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
              {mode === 'login' ? 'Sign In' : 
               mode === 'signup' ? 'Create Account' : 
               mode === 'forgot_password' ? 'Reset Password' : 
               mode === 'reset_password' ? 'Choose Password' : 
               'Verify Identity'}
            </h1>
            <p className="text-gray-500 font-medium">
              {mode === 'login' ? 'Access your dashboard' : 
               mode === 'signup' ? 'Get started for free today' : 
               mode === 'forgot_password' ? 'Enter email to receive a password reset link' :
               mode === 'reset_password' ? 'Enter a new password for your account' :
               'Enter the 6-digit code sent to your email'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-3">
              <span>✕</span> {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl flex items-center gap-3">
              <span>✓</span> {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
              </div>
            )}

            {mode !== "otp" && mode !== "reset_password" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
              </div>
            )}

            {mode !== "otp" && mode !== "forgot_password" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {mode === "reset_password" ? "New Password" : "Password"}
                  </label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { window.location.hash = "forgot-password"; setError(""); setSuccessMessage(""); }}
                      className="text-xs font-semibold text-gray-500 hover:text-black hover:underline focus:outline-none">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Join as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, role: 'team_member'})}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${formData.role === 'team_member' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    TEAM MEMBER
                  </button>
                  <button type="button" disabled={managerExists} onClick={() => setFormData({...formData, role: 'manager'})}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${formData.role === 'manager' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'} ${managerExists ? 'opacity-30 cursor-not-allowed' : ''}`}>
                    MANAGER
                  </button>
                </div>
                {managerExists && <p className="text-[9px] text-gray-400 font-medium">Only one manager allowed per organization.</p>}
              </div>
            )}

            {mode === "otp" && (
              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otp.map((data, index) => (
                    <input
                      key={index} type="text" maxLength="1"
                      value={data} onChange={(e) => handleOtpChange(e.target, index)}
                      onFocus={(e) => e.target.select()}
                      className="w-full aspect-square text-center font-bold text-xl border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  ))}
                </div>
                <div className="text-center">
                  <button type="button" disabled={resendCooldown > 0} onClick={handleResend}
                    className="text-xs font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-widest disabled:opacity-30">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm tracking-widest hover:bg-gray-800 transition-all transform active:scale-95 disabled:opacity-50">
              {loading ? 'PROCESSING...' : 
               mode === 'otp' ? 'VERIFY CODE' : 
               mode === 'login' ? 'SIGN IN' : 
               mode === 'signup' ? 'CREATE ACCOUNT' :
               mode === 'forgot_password' ? 'SEND RESET LINK' :
               'RESET PASSWORD'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-500">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => { window.location.hash = "signup"; setError(""); setSuccessMessage(""); }}
                    className="text-black font-black hover:underline underline-offset-4">
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => { window.location.hash = "login"; setError(""); setSuccessMessage(""); }}
                    className="text-black font-black hover:underline underline-offset-4">
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
