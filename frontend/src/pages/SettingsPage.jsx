import { useState } from 'react';
import './SettingsPage.css';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const toast = useToast();
  const [delay, setDelay] = useState('3000');
  const [sessionSave, setSessionSave] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure Cuckoo options and messaging preferences</p>
      </div>

      <div className="settings-grid">
        {/* Card 1: Connection & Rate Limiting */}
        <div className="settings-card">
          <h3>⏱️ Delivery Preferences</h3>
          <p className="settings-card-desc">Control the rate and safety intervals of outgoing broadcasts.</p>
          
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Safe Delay between messages</label>
            <select 
              className="form-input" 
              value={delay} 
              onChange={(e) => setDelay(e.target.value)}
            >
              <option value="1000">1 Second (Fast)</option>
              <option value="3000">3 Seconds (Recommended)</option>
              <option value="5000">5 Seconds (Safe)</option>
              <option value="10000">10 Seconds (Very Safe)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              A higher delay helps prevent carrier detection and potential spam blocks.
            </span>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={sessionSave} 
                onChange={(e) => setSessionSave(e.target.checked)} 
              />
              <strong>Save Linked Session Details</strong>
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '22px', display: 'block' }}>
              Keep WhatsApp linked across dashboard reloads. Disable to require QR scanning every session.
            </span>
          </div>
        </div>

        {/* Card 2: Account & Brand */}
        <div className="settings-card">
          <h3>📦 Brand Details</h3>
          <p className="settings-card-desc">Information about this Cuckoo instance.</p>
          
          <div className="brand-info-panel" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="Cuckoo Logo" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
              <div>
                <strong>Cuckoo</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Private Messaging Gateway</div>
              </div>
            </div>
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border-default)' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Version: 1.2.0-cuckoo<br />
              Environment: Development<br />
              OS: Windows Sandbox
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
