import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactsAPI, messagesAPI } from '../services/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLists: 0,
    totalContacts: 0,
    totalCampaigns: 0,
    totalSent: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [listsRes, jobsRes] = await Promise.all([
        contactsAPI.getLists(),
        messagesAPI.getJobs(),
      ]);

      const lists = listsRes.data.lists;
      const jobs = jobsRes.data.jobs;

      setStats({
        totalLists: lists.length,
        totalContacts: lists.reduce((sum, l) => sum + l.valid_contacts, 0),
        totalCampaigns: jobs.length,
        totalSent: jobs.reduce((sum, j) => sum + j.sent, 0),
      });

      setRecentJobs(jobs.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { class: 'badge-pending', icon: '⏳' },
      sending: { class: 'badge-warning', icon: '📤' },
      completed: { class: 'badge-success', icon: '✓' },
      failed: { class: 'badge-error', icon: '✕' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.icon} {status}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your broadcasting overview.</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => navigate('/contacts')}>
          <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
            👥
          </div>
          <div className="stat-card-value">{stats.totalContacts}</div>
          <div className="stat-card-label">Total Contacts</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/contacts')}>
          <div className="stat-card-icon" style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}>
            📋
          </div>
          <div className="stat-card-value">{stats.totalLists}</div>
          <div className="stat-card-label">Contact Lists</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/campaigns')}>
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            📡
          </div>
          <div className="stat-card-value">{stats.totalCampaigns}</div>
          <div className="stat-card-label">Campaigns</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            ✉️
          </div>
          <div className="stat-card-value">{stats.totalSent}</div>
          <div className="stat-card-label">Messages Sent</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="quick-action-card" onClick={() => navigate('/contacts')}>
            <span className="quick-action-icon">📤</span>
            <span className="quick-action-label">Upload Contacts</span>
            <span className="quick-action-desc">Import CSV file</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/compose')}>
            <span className="quick-action-icon">✍️</span>
            <span className="quick-action-label">New Broadcast</span>
            <span className="quick-action-desc">Compose a message</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/campaigns')}>
            <span className="quick-action-icon">📊</span>
            <span className="quick-action-label">View Campaigns</span>
            <span className="quick-action-desc">Track delivery</span>
          </button>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Recent Campaigns</h2>
          {recentJobs.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/campaigns')}>
              View All →
            </button>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📡</div>
            <div className="empty-state-title">No campaigns yet</div>
            <div className="empty-state-description">
              Upload your contacts and send your first broadcast message!
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/compose')}>
              Create First Campaign →
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id} onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{job.list_name || 'Broadcast'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {job.message_body.length > 60 ? job.message_body.slice(0, 60) + '...' : job.message_body}
                      </div>
                    </td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td style={{ color: 'var(--success)' }}>{job.sent}/{job.total}</td>
                    <td style={{ color: 'var(--error)' }}>{job.failed}</td>
                    <td>{formatDate(job.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
