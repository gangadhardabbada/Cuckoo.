import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './ProfilePage.css';

const TIMEZONES = [
  'Asia/Kolkata (IST)',
  'UTC (GMT)',
  'America/New_York (EST/EDT)',
  'Europe/London (BST)',
  'Asia/Singapore (SGT)',
  'America/Los_Angeles (PST/PDT)'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const TIME_FORMATS = ['12-hour', '24-hour'];

export default function ProfilePage() {
  const toast = useToast();
  
  // Tab control state
  const [activeTab, setActiveTab] = useState('profile');

  // Load and merge Account Center state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cuckoo-profile-details');
    const defaultData = {
      // 1. PROFILE DETAILS
      name: 'Cuckoo Operator',
      username: 'cuckoo_operator',
      email: 'operator@cuckoo.local',
      phone: '+91 98765 43210',
      organization: 'Cuckoo On-Air Studio',
      role: 'Broadcaster',
      country: 'India',
      timezone: 'Asia/Kolkata (IST)',
      bio: 'Broadcasting updates, event notices, and news bulletins privately 1-to-1.',
      joinedDate: '2026-06-21',
      accountType: 'Enterprise Broadcaster',
      lastLogin: 'Today 08:30 AM',

      // 2. PREFERENCES
      theme: 'light',
      language: 'English',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12-hour',
      defaultDashboard: 'Overview',
      sidebarPreference: 'Expanded',

      // 3. NOTIFICATIONS
      notifyEmail: true,
      notifyCampaignCompletion: true,
      notifyFailureAlerts: true,
      notifyBroadcastWarnings: true,
      notifySystemUpdates: false,

      // 4. WHATSAPP ACCOUNTS
      whatsappAccounts: [
        {
          id: 'wa-web-1',
          type: 'WhatsApp Web',
          number: '+91 98765 43210',
          status: 'connected',
          connectedSince: '2026-06-21 10:42 AM',
          lastConnected: 'Today 08:30 AM',
          isPrimary: true,
        },
        {
          id: 'wa-cloud-1',
          type: 'Cloud API',
          number: '+91 88888 77777',
          status: 'disconnected',
          connectedSince: 'N/A',
          lastConnected: 'Yesterday 04:15 PM',
          isPrimary: false,
        }
      ],

      // 5. WORKSPACE SETTINGS
      defaultDelay: 3000,
      defaultTemplate: 'Event Invitation',
      autoSaveDrafts: true,
      variablePreview: true,
      contactValidationRules: 'Standard Indian Format (IN)',

      // 6. SECURITY
      twoFactorEnabled: false,
      activeSessions: [
        { id: 'sess-1', device: 'Chrome on Windows', ip: '192.168.1.15', lastActive: 'Active now', location: 'Bengaluru, India' },
        { id: 'sess-2', device: 'Safari on iPhone', ip: '172.56.21.89', lastActive: '2 hours ago', location: 'Bengaluru, India' }
      ],
      recentLogins: [
        { id: 'log-1', time: 'Today 08:30 AM', device: 'Chrome on Windows', location: 'Bengaluru, India' },
        { id: 'log-2', time: 'Yesterday 08:15 AM', device: 'Chrome on Windows', location: 'Bengaluru, India' },
        { id: 'log-3', time: 'June 21, 2026 10:42 AM', device: 'Safari on iPhone', location: 'Bengaluru, India' }
      ]
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error('Failed to parse stored details:', e);
      }
    }
    return defaultData;
  });

  // Password fields state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync state to localStorage on submit
  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('cuckoo-profile-details', JSON.stringify(profile));
    
    // Sync to user key in storage for dashboard compatibility
    const userSession = localStorage.getItem('user');
    if (userSession) {
      try {
        const u = JSON.parse(userSession);
        u.name = profile.name;
        u.email = profile.email;
        u.phone = profile.phone;
        localStorage.setItem('user', JSON.stringify(u));
      } catch (err) {
        console.warn('Could not sync user data:', err.message);
      }
    }
    toast.success('Account Center settings updated successfully');
  };

  const handleFieldChange = (field, val) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  // WhatsApp Account Actions
  const handleTogglePrimary = (accountId) => {
    setProfile((prev) => {
      const updated = prev.whatsappAccounts.map((acc) => ({
        ...acc,
        isPrimary: acc.id === accountId
      }));
      toast.success('Primary WhatsApp account updated');
      return { ...prev, whatsappAccounts: updated };
    });
  };

  const handleDisconnectAccount = (accountId) => {
    setProfile((prev) => {
      const updated = prev.whatsappAccounts.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            status: 'disconnected',
            connectedSince: 'N/A'
          };
        }
        return acc;
      });
      toast.warning(`Account disconnected successfully`);
      return { ...prev, whatsappAccounts: updated };
    });
  };

  const handleReconnectAccount = (accountId) => {
    setProfile((prev) => {
      const updated = prev.whatsappAccounts.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            status: 'connected',
            connectedSince: new Date().toLocaleString(),
            lastConnected: 'Just now'
          };
        }
        return acc;
      });
      toast.success(`Account re-established successfully`);
      return { ...prev, whatsappAccounts: updated };
    });
  };

  // Password Actions
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    toast.success('Your security password has been changed successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Device logs actions
  const handleSignOutAll = () => {
    setProfile(prev => ({
      ...prev,
      activeSessions: [prev.activeSessions[0]] // Keep current only
    }));
    toast.success('Signed out of all other active sessions successfully');
  };

  // Export File Download triggers
  const exportData = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename} successfully`);
  };

  const handleExportContacts = () => {
    const contactsMock = [
      { name: "Alice Smith", phone: "+919876543210", email: "alice@example.com" },
      { name: "Bob Johnson", phone: "+919876543211", email: "bob@example.com" }
    ];
    exportData('cuckoo_exported_contacts.json', contactsMock);
  };

  const handleExportCampaigns = () => {
    const campaignsMock = [
      { id: "camp_1", name: "Hackathon Welcome", recipients: 530, status: "completed", date: "2026-06-22" }
    ];
    exportData('cuckoo_exported_campaigns.json', campaignsMock);
  };

  const handleExportTemplates = () => {
    const templatesMock = [
      { name: "Event invitation", variables: ["first_name"] },
      { name: "Payment Alert", variables: ["name"] }
    ];
    exportData('cuckoo_exported_templates.json', templatesMock);
  };

  const handleExportWorkspace = () => {
    exportData('cuckoo_workspace_settings.json', {
      defaultDelay: profile.defaultDelay,
      defaultTemplate: profile.defaultTemplate,
      autoSaveDrafts: profile.autoSaveDrafts,
      variablePreview: profile.variablePreview
    });
  };

  // Deletion modals triggers
  const handleDeleteAccount = () => {
    const check = window.confirm('WARNING: Are you sure you want to permanently delete your Cuckoo account? This action is irreversible.');
    if (check) {
      toast.error('Account deleted. Logging out...');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 1500);
    }
  };

  const handleDeleteWorkspace = () => {
    const check = window.confirm('CAUTION: Are you sure you want to delete all Workspace campaign history? Custom lists and logs will be lost.');
    if (check) {
      toast.warning('Workspace history wiped clean.');
    }
  };

  // Initials generator
  const initials = profile.name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C';

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Account Center</h1>
        <p>Manage your account identity, WhatsApp devices, workspace configurations, and security.</p>
      </div>

      <div className="account-center-layout">
        {/* LEFT SIDEBAR: Nav Links index */}
        <div className="account-center-sidebar">
          <div className="account-user-card">
            <div className="profile-avatar-large">{initials}</div>
            <h3 className="user-card-name">{profile.name}</h3>
            <span className="user-card-role">{profile.role}</span>
          </div>

          <div className="account-tabs-list">
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile Details
            </button>
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              🎨 Preferences
            </button>
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              💬 WhatsApp Accounts
            </button>
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspace')}
            >
              🛠️ Workspace settings
            </button>
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security & Login
            </button>
            <button
              type="button"
              className={`tab-link-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              🛡️ Data & Privacy
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT: Dynamic Forms */}
        <div className="account-center-content">
          <form onSubmit={handleSaveAll}>
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">Identity & Profile</h3>
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.username}
                      onChange={(e) => handleFieldChange('username', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.organization}
                      onChange={(e) => handleFieldChange('organization', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.role}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-input"
                      value={profile.timezone}
                      onChange={(e) => handleFieldChange('timezone', e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Short Bio</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      value={profile.bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                    />
                  </div>
                </div>

                <div className="read-only-meta-block">
                  <h4 className="meta-block-title">Membership Metadata</h4>
                  <div className="meta-rows-grid">
                    <div className="meta-row">
                      <span className="label">Joined Date</span>
                      <span className="value">{profile.joinedDate}</span>
                    </div>
                    <div className="meta-row">
                      <span className="label">Account Type</span>
                      <span className="value">{profile.accountType}</span>
                    </div>
                    <div className="meta-row">
                      <span className="label">Last Security Login</span>
                      <span className="value">{profile.lastLogin}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">Layout & Language Settings</h3>
                <div className="preferences-section">
                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Theme Preference</strong>
                      <span className="preference-desc">Set background and coloring style</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '150px' }}
                      value={profile.theme}
                      onChange={(e) => handleFieldChange('theme', e.target.value)}
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark" disabled>Dark Mode (Beta)</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>System Language</strong>
                      <span className="preference-desc">Choose display language for menus</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '150px' }}
                      value={profile.language}
                      onChange={(e) => handleFieldChange('language', e.target.value)}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Date Format</strong>
                      <span className="preference-desc">Date pattern representation in tables</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '150px' }}
                      value={profile.dateFormat}
                      onChange={(e) => handleFieldChange('dateFormat', e.target.value)}
                    >
                      {DATE_FORMATS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Time Format</strong>
                      <span className="preference-desc">Timestamp 12-hour or 24-hour logs</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '150px' }}
                      value={profile.timeFormat}
                      onChange={(e) => handleFieldChange('timeFormat', e.target.value)}
                    >
                      {TIME_FORMATS.map((tf) => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Default Dashboard Landing</strong>
                      <span className="preference-desc">Redirect focus on loading session</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '150px' }}
                      value={profile.defaultDashboard}
                      onChange={(e) => handleFieldChange('defaultDashboard', e.target.value)}
                    >
                      <option value="Overview">Overview</option>
                      <option value="Campaigns">Campaigns</option>
                      <option value="Contacts">Contacts</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Sidebar State Preference</strong>
                      <span className="preference-desc">Sidebar menu expanded or collapsed</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '150px' }}
                      value={profile.sidebarPreference}
                      onChange={(e) => handleFieldChange('sidebarPreference', e.target.value)}
                    >
                      <option value="Expanded">Expanded</option>
                      <option value="Collapsed">Collapsed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">Communication Preferences</h3>
                <div className="preferences-section">
                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Email Summaries</strong>
                      <span className="preference-desc">Send reports after sending broadcasts</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.notifyEmail}
                      onChange={(e) => handleFieldChange('notifyEmail', e.target.checked)}
                    />
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Campaign Completion Alerts</strong>
                      <span className="preference-desc">Send a notification on campaign success</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.notifyCampaignCompletion}
                      onChange={(e) => handleFieldChange('notifyCampaignCompletion', e.target.checked)}
                    />
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Failure Warnings</strong>
                      <span className="preference-desc">Get notified immediately on invalid numbers or blockages</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.notifyFailureAlerts}
                      onChange={(e) => handleFieldChange('notifyFailureAlerts', e.target.checked)}
                    />
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Broadcast Safety Warnings</strong>
                      <span className="preference-desc">Warn if sending too fast or exceeding limit sizes</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.notifyBroadcastWarnings}
                      onChange={(e) => handleFieldChange('notifyBroadcastWarnings', e.target.checked)}
                    />
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Cuckoo Platform Updates</strong>
                      <span className="preference-desc">Subscribe to newsletter and new feature announcements</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.notifySystemUpdates}
                      onChange={(e) => handleFieldChange('notifySystemUpdates', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WHATSAPP ACCOUNTS */}
            {activeTab === 'whatsapp' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">WhatsApp Account Integrations</h3>
                <p className="tab-desc">Connect and manage your broadcasting nodes. Cuckoo supports scaling to multiple channels.</p>
                
                <div className="accounts-list-container">
                  {profile.whatsappAccounts.map((acc) => (
                    <div key={acc.id} className="whatsapp-account-card">
                      <div className="account-details-grid">
                        <div className="acc-meta">
                          <span className="acc-type-badge">{acc.type}</span>
                          <strong className="acc-number">{acc.number}</strong>
                        </div>
                        <div className="acc-stats-row">
                          <div className="stat-unit">
                            <span className="lbl">Status</span>
                            <span className={`val status-pill ${acc.status}`}>
                              {acc.status === 'connected' ? '✓ Connected' : '✕ Disconnected'}
                            </span>
                          </div>
                          <div className="stat-unit">
                            <span className="lbl">Connected Since</span>
                            <span className="val">{acc.connectedSince}</span>
                          </div>
                          <div className="stat-unit">
                            <span className="lbl">Last Refresh/Ping</span>
                            <span className="val">{acc.lastConnected}</span>
                          </div>
                        </div>
                      </div>

                      <div className="account-actions-footer">
                        <label className="primary-toggle-label">
                          <input
                            type="radio"
                            name="primaryAccountRadio"
                            checked={acc.isPrimary}
                            onChange={() => handleTogglePrimary(acc.id)}
                          />
                          <span>Primary Broadcaster</span>
                        </label>

                        <div className="btn-actions-row">
                          {acc.status === 'connected' ? (
                            <button
                              type="button"
                              className="wa-btn wa-btn-danger wa-btn-sm"
                              onClick={() => handleDisconnectAccount(acc.id)}
                            >
                              Disconnect Node
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="wa-btn wa-btn-primary wa-btn-sm"
                              onClick={() => handleReconnectAccount(acc.id)}
                            >
                              Reconnect Node
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: WORKSPACE SETTINGS */}
            {activeTab === 'workspace' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">Workspace Defaults</h3>
                <div className="preferences-section">
                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Default Campaign Delay</strong>
                      <span className="preference-desc">Delay timing chosen automatically at step 4</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '200px' }}
                      value={profile.defaultDelay}
                      onChange={(e) => handleFieldChange('defaultDelay', Number(e.target.value))}
                    >
                      <option value={1000}>1 Second (Fast)</option>
                      <option value={3000}>3 Seconds (Recommended)</option>
                      <option value={5000}>5 Seconds (Safe)</option>
                      <option value={10000}>10 Seconds (Very Safe)</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Default Base Template</strong>
                      <span className="preference-desc">Load this template automatically on opening composer</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '200px' }}
                      value={profile.defaultTemplate}
                      onChange={(e) => handleFieldChange('defaultTemplate', e.target.value)}
                    >
                      <option value="None">None (Blank Sheet)</option>
                      <option value="Event Invitation">Event Invitation</option>
                      <option value="Reminder">Reminder</option>
                      <option value="Meeting Notice">Meeting Notice</option>
                      <option value="Hackathon Update">Hackathon Update</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Auto Save Drafts</strong>
                      <span className="preference-desc">Periodically write composer editor values to memory</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.autoSaveDrafts}
                      onChange={(e) => handleFieldChange('autoSaveDrafts', e.target.checked)}
                    />
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Variable Preview Rendering</strong>
                      <span className="preference-desc">Resolve variables in Live preview bubble by default</span>
                    </div>
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={profile.variablePreview}
                      onChange={(e) => handleFieldChange('variablePreview', e.target.checked)}
                    />
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Contact Validation Rules</strong>
                      <span className="preference-desc">Checks phone country extensions when uploading</span>
                    </div>
                    <select
                      className="form-input"
                      style={{ width: '250px' }}
                      value={profile.contactValidationRules}
                      onChange={(e) => handleFieldChange('contactValidationRules', e.target.value)}
                    >
                      <option value="Standard Indian Format (IN)">Standard Indian Format (IN)</option>
                      <option value="Strict International Check (E.164)">Strict International Check (E.164)</option>
                      <option value="No Validation (Import Raw Columns)">No Validation (Import Raw Columns)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SECURITY */}
            {activeTab === 'security' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">Security & Sessions</h3>
                
                {/* 2FA UI */}
                <div className="security-card-box">
                  <div className="security-card-header">
                    <h4>Two-Factor Authentication (2FA)</h4>
                    <span className="badge-beta">Future Ready UI</span>
                  </div>
                  <p className="sec-desc">Verify login attempts with a secure code sent to your email or authenticator app.</p>
                  <label className="toggle-label-sec">
                    <input
                      type="checkbox"
                      className="wa-checkbox"
                      checked={profile.twoFactorEnabled}
                      onChange={(e) => handleFieldChange('twoFactorEnabled', e.target.checked)}
                    />
                    <span>Enable Two-Factor Authentication</span>
                  </label>
                </div>

                {/* Password Form */}
                <div className="security-card-box mt-24">
                  <h4>Change Password</h4>
                  <div className="password-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      className="wa-btn wa-btn-secondary"
                      style={{ alignSelf: 'flex-start' }}
                      onClick={handlePasswordChange}
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="security-card-box mt-24">
                  <div className="sec-header-row">
                    <h4>Active Logged-in Sessions</h4>
                    <button
                      type="button"
                      className="wa-btn wa-btn-danger wa-btn-sm"
                      onClick={handleSignOutAll}
                    >
                      Sign Out All Other Devices
                    </button>
                  </div>
                  <div className="sessions-table-wrapper" style={{ marginTop: '12px' }}>
                    <table className="wa-table">
                      <thead>
                        <tr>
                          <th>Device</th>
                          <th>IP Address</th>
                          <th>Location</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.activeSessions.map((sess) => (
                          <tr key={sess.id}>
                            <td><strong>{sess.device}</strong></td>
                            <td>{sess.ip}</td>
                            <td>{sess.location}</td>
                            <td>{sess.lastActive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Login History */}
                <div className="security-card-box mt-24">
                  <h4>Recent Logins History</h4>
                  <div className="sessions-table-wrapper" style={{ marginTop: '12px' }}>
                    <table className="wa-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Device</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.recentLogins.map((log) => (
                          <tr key={log.id}>
                            <td>{log.time}</td>
                            <td>{log.device}</td>
                            <td>{log.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: DATA & PRIVACY */}
            {activeTab === 'privacy' && (
              <div className="tab-pane-content">
                <h3 className="tab-section-title">Data Management & Privacy</h3>
                
                {/* Exports section */}
                <div className="privacy-card-box">
                  <h4>Export Workspace Data</h4>
                  <p className="sec-desc">Download a local backup copy of your campaign assets, list contacts, or preferences.</p>
                  <div className="export-buttons-grid">
                    <button type="button" className="wa-btn wa-btn-secondary" onClick={handleExportContacts}>
                      📥 Export Contacts (JSON)
                    </button>
                    <button type="button" className="wa-btn wa-btn-secondary" onClick={handleExportCampaigns}>
                      📥 Export Campaigns (JSON)
                    </button>
                    <button type="button" className="wa-btn wa-btn-secondary" onClick={handleExportTemplates}>
                      📥 Export Templates (JSON)
                    </button>
                    <button type="button" className="wa-btn wa-btn-secondary" onClick={handleExportWorkspace}>
                      📥 Export Workspace Settings (JSON)
                    </button>
                  </div>
                </div>

                {/* Policies */}
                <div className="privacy-card-box mt-24">
                  <h4>Data Retention & Privacy Information</h4>
                  <p className="sec-desc" style={{ lineHeight: '1.6' }}>
                    Cuckoo operates on a private architecture. We do not store or inspect your WhatsApp chat text or contact numbers outside the local SQLite scope. All 1-to-1 routing calculations are performed locally inside your verified instances.
                    <br /><br />
                    <strong>Data Retention:</strong> Campaigns and reports are kept locally in the server database for a default period of 90 days. You can change this period or trigger an instant deletion of database contents at any time.
                  </p>
                </div>

                {/* Destructive Deletions */}
                <div className="privacy-card-box mt-24 destructive-card">
                  <h4 style={{ color: 'var(--error)' }}>Destructive Workspace Actions</h4>
                  <p className="sec-desc">These operations will immediately clear records. Please perform exports beforehand.</p>
                  
                  <div className="destructive-buttons-row">
                    <button
                      type="button"
                      className="wa-btn wa-btn-danger"
                      onClick={handleDeleteWorkspace}
                    >
                      Delete Workspace History
                    </button>
                    <button
                      type="button"
                      className="wa-btn wa-btn-danger"
                      style={{ background: 'var(--error)', color: 'white' }}
                      onClick={handleDeleteAccount}
                    >
                      Delete Account Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions footer for form tab panels */}
            {activeTab !== 'security' && activeTab !== 'privacy' && (
              <div className="profile-footer">
                <button type="submit" className="wa-btn wa-btn-primary continue-cta-btn">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
