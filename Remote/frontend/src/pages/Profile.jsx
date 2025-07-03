import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './Profile.css';

const Profile = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: '',
    department: '',
    jobTitle: '',
    bio: '',
    location: '',
    timezone: '',
    avatar: ''
  });

  const [settingsData, setSettingsData] = useState({
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
    screenshotEnabled: true,
    screenshotInterval: 5,
    theme: 'light',
    language: 'en'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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

      setSettingsData({
        pomodoroLength: user.settings?.pomodoroLength || 25,
        shortBreakLength: user.settings?.shortBreakLength || 5,
        longBreakLength: user.settings?.longBreakLength || 15,
        autoStartBreaks: user.settings?.autoStartBreaks || false,
        autoStartPomodoros: user.settings?.autoStartPomodoros || false,
        notifications: user.settings?.notifications !== false,
        screenshotEnabled: user.settings?.screenshotEnabled !== false,
        screenshotInterval: user.settings?.screenshotInterval || 5,
        theme: user.settings?.theme || 'light',
        language: user.settings?.language || 'en'
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Profile updated successfully!');
      } else {
        showMessage('error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: settingsData })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Settings updated successfully!');
      } else {
        showMessage('error', data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showMessage('error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileData(prev => ({ ...prev, avatar: data.data.avatarUrl }));
        showMessage('success', 'Avatar updated successfully!');
      } else {
        showMessage('error', data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Header />
      
      <main className="profile-content">
        <div className="profile-header">
          <div className="header-left">
            <h1>👤 My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '⚠️'}
            </span>
            {message.text}
          </div>
        )}

        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </div>
                )}
                <label className="avatar-upload-btn">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadAvatar(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="profile-name">
                {profileData.firstName} {profileData.lastName}
              </div>
              <div className="profile-role">{profileData.role}</div>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="nav-icon">👤</span>
                Personal Info
              </button>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="nav-icon">⚙️</span>
                Settings
              </button>
              <button
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <span className="nav-icon">🔒</span>
                Security
              </button>
            </nav>
          </div>

          <div className="profile-main">
            {activeTab === 'personal' && (
              <div className="tab-content">
                <h2>Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      <span className="label-icon">👤</span>
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">
                      <span className="label-icon">👤</span>
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <span className="label-icon">📧</span>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <span className="label-icon">📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="jobTitle">
                      <span className="label-icon">💼</span>
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={profileData.jobTitle}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your job title"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="department">
                      <span className="label-icon">🏢</span>
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your department"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="bio">
                      <span className="label-icon">📝</span>
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="form-textarea"
                      placeholder="Tell us about yourself"
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">
                      <span className="label-icon">📍</span>
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your location"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timezone">
                      <span className="label-icon">🌍</span>
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={profileData.timezone}
                      onChange={handleProfileChange}
                      className="form-select"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Asia/Shanghai">Shanghai</option>
                      <option value="Asia/Kolkata">India</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="save-btn"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <h2>Productivity Settings</h2>
                
                <div className="settings-section">
                  <h3>🍅 Pomodoro Timer</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="pomodoroLength">
                        <span className="label-icon">⏰</span>
                        Pomodoro Length (minutes)
                      </label>
                      <input
                        type="number"
                        id="pomodoroLength"
                        name="pomodoroLength"
                        value={settingsData.pomodoroLength}
                        onChange={handleSettingsChange}
                        className="form-input"
                        min="5"
                        max="60"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="shortBreakLength">
                        <span className="label-icon">☕</span>
                        Short Break (minutes)
                      </label>
                      <input
                        type="number"
                        id="shortBreakLength"
                        name="shortBreakLength"
                        value={settingsData.shortBreakLength}
                        onChange={handleSettingsChange}
                        className="form-input"
                        min="1"
                        max="30"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="longBreakLength">
                        <span className="label-icon">🛋️</span>
                        Long Break (minutes)
                      </label>
                      <input
                        type="number"
                        id="longBreakLength"
                        name="longBreakLength"
                        value={settingsData.longBreakLength}
                        onChange={handleSettingsChange}
                        className="form-input"
                        min="5"
                        max="60"
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="autoStartBreaks"
                        checked={settingsData.autoStartBreaks}
                        onChange={handleSettingsChange}
                      />
                      <span className="checkbox-custom"></span>
                      Auto-start breaks
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="autoStartPomodoros"
                        checked={settingsData.autoStartPomodoros}
                        onChange={handleSettingsChange}
                      />
                      <span className="checkbox-custom"></span>
                      Auto-start pomodoros
                    </label>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>🔔 Notifications</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifications"
                        checked={settingsData.notifications}
                        onChange={handleSettingsChange}
                      />
                      <span className="checkbox-custom"></span>
                      Enable notifications
                    </label>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>📸 Screenshot Monitoring</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="screenshotEnabled"
                        checked={settingsData.screenshotEnabled}
                        onChange={handleSettingsChange}
                      />
                      <span className="checkbox-custom"></span>
                      Enable screenshot monitoring
                    </label>
                  </div>
                  
                  {settingsData.screenshotEnabled && (
                    <div className="form-group">
                      <label htmlFor="screenshotInterval">
                        <span className="label-icon">⏱️</span>
                        Screenshot Interval (minutes)
                      </label>
                      <select
                        id="screenshotInterval"
                        name="screenshotInterval"
                        value={settingsData.screenshotInterval}
                        onChange={handleSettingsChange}
                        className="form-select"
                      >
                        <option value="1">Every minute</option>
                        <option value="2">Every 2 minutes</option>
                        <option value="5">Every 5 minutes</option>
                        <option value="10">Every 10 minutes</option>
                        <option value="15">Every 15 minutes</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="settings-section">
                  <h3>🎨 Appearance</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="theme">
                        <span className="label-icon">🌙</span>
                        Theme
                      </label>
                      <select
                        id="theme"
                        name="theme"
                        value={settingsData.theme}
                        onChange={handleSettingsChange}
                        className="form-select"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="language">
                        <span className="label-icon">🌐</span>
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={settingsData.language}
                        onChange={handleSettingsChange}
                        className="form-select"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="save-btn"
                    onClick={saveSettings}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="tab-content">
                <h2>Security Settings</h2>
                
                <div className="settings-section">
                  <h3>🔒 Change Password</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label htmlFor="currentPassword">
                        <span className="label-icon">🔑</span>
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        placeholder="Enter your current password"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">
                        <span className="label-icon">🔒</span>
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        placeholder="Enter new password"
                        minLength="6"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">
                        <span className="label-icon">🔒</span>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        placeholder="Confirm new password"
                        minLength="6"
                      />
                    </div>
                  </div>

                  <div className="password-requirements">
                    <h4>Password Requirements:</h4>
                    <ul>
                      <li className={passwordData.newPassword.length >= 6 ? 'valid' : ''}>
                        At least 6 characters long
                      </li>
                      <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                        Contains uppercase letter
                      </li>
                      <li className={/[a-z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                        Contains lowercase letter
                      </li>
                      <li className={/\d/.test(passwordData.newPassword) ? 'valid' : ''}>
                        Contains number
                      </li>
                    </ul>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="save-btn"
                      onClick={changePassword}
                      disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                    >
                      {saving ? (
                        <>
                          <span className="loading-spinner"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🔒</span>
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
