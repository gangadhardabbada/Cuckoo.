import { useState, useEffect } from 'react';
import { messagesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import './CampaignsPage.css';

export default function CampaignsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobLogs, setJobLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  // Auto-refresh for active jobs
  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === 'sending' || j.status === 'pending');
    if (!hasActive) return;

    const interval = setInterval(loadJobs, 3000);
    return () => clearInterval(interval);
  }, [jobs]);

  const loadJobs = async () => {
    try {
      const res = await messagesAPI.getJobs();
      setJobs(res.data.jobs);
    } catch (err) {
      console.error('Load jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewJobDetail = async (job) => {
    setSelectedJob(job);
    setLoadingLogs(true);
    try {
      const res = await messagesAPI.getJobDetail(job.id);
      setSelectedJob(res.data.job);
      setJobLogs(res.data.logs);
    } catch (err) {
      toast.error('Failed to load job details');
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { cls: 'badge-pending', icon: '⏳', label: 'Pending' },
      sending: { cls: 'badge-warning', icon: '📤', label: 'Sending' },
      completed: { cls: 'badge-success', icon: '✓', label: 'Completed' },
      failed: { cls: 'badge-error', icon: '✕', label: 'Failed' },
      sent: { cls: 'badge-success', icon: '✓', label: 'Sent' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgress = (job) => {
    if (job.total === 0) return 0;
    return Math.round(((job.sent + job.failed) / job.total) * 100);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <h1>Campaigns</h1>
        <p>Track the status and delivery of your broadcast messages</p>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <div className="empty-state-title">No campaigns yet</div>
          <div className="empty-state-description">
            Your broadcast campaigns will appear here once you send your first message.
          </div>
        </div>
      ) : (
        <div className="campaigns-list">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`campaign-card ${job.status === 'sending' ? 'campaign-card-active' : ''}`}
              onClick={() => viewJobDetail(job)}
            >
              <div className="campaign-card-header">
                <div className="campaign-card-info">
                  <div className="campaign-card-name">{job.list_name || 'Broadcast'}</div>
                  <div className="campaign-card-date">{formatDate(job.created_at)}</div>
                </div>
                {getStatusBadge(job.status)}
              </div>

              <div className="campaign-card-message">
                {job.message_body.length > 120 ? job.message_body.slice(0, 120) + '...' : job.message_body}
              </div>

              <div className="campaign-card-progress">
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${job.status === 'completed' ? 'success' : ''}`}
                    style={{ width: `${getProgress(job)}%` }}
                  />
                </div>
                <div className="campaign-card-progress-stats">
                  <span className="campaign-stat-sent">✓ {job.sent} sent</span>
                  {job.failed > 0 && <span className="campaign-stat-failed">✕ {job.failed} failed</span>}
                  <span className="campaign-stat-total">{job.total} total</span>
                </div>
              </div>

              {job.status === 'sending' && (
                <div className="campaign-card-live">
                  <span className="campaign-live-dot" />
                  Sending messages...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Job detail modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => { setSelectedJob(null); setJobLogs([]); }}
        title={`Campaign: ${selectedJob?.list_name || 'Broadcast'}`}
      >
        {selectedJob && (
          <div className="campaign-detail">
            <div className="campaign-detail-stats">
              <div className="campaign-detail-stat">
                <div className="campaign-detail-stat-value" style={{ color: 'var(--text-primary)' }}>
                  {selectedJob.total}
                </div>
                <div className="campaign-detail-stat-label">Total</div>
              </div>
              <div className="campaign-detail-stat">
                <div className="campaign-detail-stat-value" style={{ color: 'var(--success)' }}>
                  {selectedJob.sent}
                </div>
                <div className="campaign-detail-stat-label">Sent</div>
              </div>
              <div className="campaign-detail-stat">
                <div className="campaign-detail-stat-value" style={{ color: 'var(--error)' }}>
                  {selectedJob.failed}
                </div>
                <div className="campaign-detail-stat-label">Failed</div>
              </div>
            </div>

            <div className="progress-bar" style={{ marginBottom: '20px' }}>
              <div
                className={`progress-bar-fill ${selectedJob.status === 'completed' ? 'success' : ''}`}
                style={{ width: `${getProgress(selectedJob)}%` }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Status:</strong> {getStatusBadge(selectedJob.status)}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Message:</strong>
              <div className="campaign-detail-message">{selectedJob.message_body}</div>
            </div>

            {loadingLogs ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              jobLogs.length > 0 && (
                <div>
                  <strong>Delivery Log:</strong>
                  <div className="campaign-detail-logs" style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
                    <div className="table-wrapper">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Contact</th>
                            <th>Phone</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobLogs.map((log) => (
                            <tr key={log.id}>
                              <td>{log.contact_name || '—'}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.contact_phone}</td>
                              <td>{getStatusBadge(log.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
