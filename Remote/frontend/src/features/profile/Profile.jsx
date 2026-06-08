import { useState, useEffect } from 'react';
import { useAuth } from "../../store/AuthContext";

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', role: '', phone: '',
    department: '', jobTitle: '', bio: '', location: '', timezone: '', avatar: ''
  });

  const [settingsData, setSettingsData] = useState({
    pomodoroLength: 25, shortBreakLength: 5, longBreakLength: 15,
    autoStartBreaks: false, autoStartPomodoros: false, notifications: true,
    screenshotEnabled: true, screenshotInterval: 5, theme: 'light', language: 'en'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || '',
        department: user.department || '',
        jobTitle: user.jobTitle || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC',
        avatar: user.avatar || ''
      });
      if (user.settings) {
        setSettingsData({ ...user.settings });
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        if (updateUser) updateUser(data.data.user);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsData })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully' });
        if (updateUser) updateUser(data.data.user);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-black p-8 text-white relative">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-white text-black rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                profileData.firstName?.[0] + profileData.lastName?.[0]
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h1>
              <p className="text-gray-400 text-sm mt-1">{profileData.email}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider">
                {profileData.role}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === tab.id ? 'border-black text-black bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
            </div>
          )}

          {activeTab === 'personal' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">First Name</label>
                  <input type="text" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Last Name</label>
                  <input type="text" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Location</label>
                  <input type="text" value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'professional' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Department</label>
                  <input type="text" value={profileData.department} onChange={e => setProfileData({...profileData, department: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Job Title</label>
                  <input type="text" value={profileData.jobTitle} onChange={e => setProfileData({...profileData, jobTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Bio</label>
                  <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})}
                    rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all resize-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Pomodoro Timer</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Work Length (min)</label>
                      <input type="number" value={settingsData.pomodoroLength} onChange={e => setSettingsData({...settingsData, pomodoroLength: parseInt(e.target.value)})}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Break Length (min)</label>
                      <input type="number" value={settingsData.shortBreakLength} onChange={e => setSettingsData({...settingsData, shortBreakLength: parseInt(e.target.value)})}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Monitoring</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Enable Screenshots</label>
                      <button type="button" onClick={() => setSettingsData({...settingsData, screenshotEnabled: !settingsData.screenshotEnabled})}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsData.screenshotEnabled ? 'bg-black' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsData.screenshotEnabled ? 'translate-x-6' : ''}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Interval (min)</label>
                      <input type="number" value={settingsData.screenshotInterval} onChange={e => setSettingsData({...settingsData, screenshotInterval: parseInt(e.target.value)})}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                  {saving ? 'Update Settings' : 'Update Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
