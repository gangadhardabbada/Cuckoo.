import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsAPI, messagesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import './ComposePage.css';

export default function ComposePage() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedListData, setSelectedListData] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const MAX_CHARS = 1024;

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const res = await contactsAPI.getLists();
      setLists(res.data.lists);
    } catch (err) {
      console.error('Load lists error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedList) {
      const list = lists.find((l) => l.id === parseInt(selectedList));
      setSelectedListData(list || null);
    } else {
      setSelectedListData(null);
    }
  }, [selectedList, lists]);

  const handleSend = async () => {
    setSending(true);
    try {
      await messagesAPI.sendBroadcast({
        list_id: parseInt(selectedList),
        message: message.trim(),
      });
      toast.success('Broadcast started! Messages are being sent.');
      setShowConfirm(false);
      navigate('/campaigns');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start broadcast');
    } finally {
      setSending(false);
    }
  };

  const canSend = selectedList && message.trim().length > 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="compose-page">
      <div className="page-header">
        <h1>Compose Message</h1>
        <p>Write and send a private WhatsApp message to your contacts</p>
      </div>

      <div className="compose-layout">
        {/* Compose form */}
        <div className="compose-form">
          {/* Select contact list */}
          <div className="compose-section">
            <h3>📋 Select Contact List</h3>
            {lists.length === 0 ? (
              <div className="compose-empty-list">
                <p>No contact lists available.</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/contacts')}>
                  Upload Contacts →
                </button>
              </div>
            ) : (
              <div className="compose-list-grid">
                {lists.map((list) => (
                  <label
                    key={list.id}
                    className={`compose-list-option ${selectedList === String(list.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="contactList"
                      value={list.id}
                      checked={selectedList === String(list.id)}
                      onChange={(e) => setSelectedList(e.target.value)}
                    />
                    <div className="compose-list-option-content">
                      <div className="compose-list-option-icon">📋</div>
                      <div>
                        <div className="compose-list-option-name">{list.name}</div>
                        <div className="compose-list-option-count">{list.valid_contacts} contacts</div>
                      </div>
                    </div>
                    <div className="compose-list-option-check">
                      {selectedList === String(list.id) && '✓'}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Compose message */}
          <div className="compose-section">
            <h3>✍️ Write Your Message</h3>
            <div className="compose-textarea-wrapper">
              <textarea
                className="form-textarea compose-textarea"
                placeholder="Type your message here... 

You can use multiple lines, emojis, and formatting.

Example:
Hi! 👋

We're excited to announce our new product launch! 🚀

Visit our website for more details.

Thank you!"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessage(e.target.value);
                  }
                }}
              />
              <div className="compose-char-count">
                <span className={message.length > MAX_CHARS * 0.9 ? 'compose-char-warning' : ''}>
                  {message.length}
                </span>
                / {MAX_CHARS}
              </div>
            </div>
          </div>

          {/* Send button */}
          <div className="compose-actions">
            <button
              className="btn btn-success btn-lg"
              disabled={!canSend}
              onClick={() => setShowConfirm(true)}
            >
              📤 Send Broadcast
            </button>
          </div>
        </div>

        {/* Preview panel */}
        <div className="compose-preview">
          <h3>Preview</h3>
          <div className="whatsapp-preview">
            <div className="whatsapp-preview-header">
              <div className="whatsapp-preview-header-avatar">📨</div>
              <div>
                <div className="whatsapp-preview-header-name">WA Broadcaster</div>
                <div className="whatsapp-preview-header-status">online</div>
              </div>
            </div>
            <div className="whatsapp-preview-body">
              <div className="whatsapp-preview-bg" />
              {message.trim() ? (
                <div className="whatsapp-bubble">
                  <div className="whatsapp-bubble-text">
                    {message}
                  </div>
                  <div className="whatsapp-bubble-time">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>
              ) : (
                <div className="whatsapp-preview-placeholder">
                  Your message preview will appear here
                </div>
              )}
            </div>
          </div>

          {selectedListData && (
            <div className="compose-preview-info">
              <div className="compose-preview-info-row">
                <span>Recipients</span>
                <span className="compose-preview-info-value">{selectedListData.valid_contacts}</span>
              </div>
              <div className="compose-preview-info-row">
                <span>Contact List</span>
                <span className="compose-preview-info-value">{selectedListData.name}</span>
              </div>
              <div className="compose-preview-info-row">
                <span>Message Length</span>
                <span className="compose-preview-info-value">{message.length} chars</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Broadcast"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handleSend} disabled={sending}>
              {sending ? (
                <><span className="spinner" /> Sending...</>
              ) : (
                '📤 Confirm & Send'
              )}
            </button>
          </>
        }
      >
        <p>
          You are about to send a private WhatsApp message to{' '}
          <strong>{selectedListData?.valid_contacts} contacts</strong> in{' '}
          <strong>"{selectedListData?.name}"</strong>.
        </p>
        <br />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Each contact will receive an individual 1-to-1 message. They will not see other recipients.
        </p>
      </Modal>
    </div>
  );
}
