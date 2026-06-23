import { useState, useEffect, useRef } from 'react';
import { contactsAPI, whatsappAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import './ContactsPage.css';

export default function ContactsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState(null); // { total, valid, invalid, duplicates, groups, previewRows }
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [listName, setListName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Persistent list viewing workspace
  const [viewingList, setViewingList] = useState(null);
  const [viewContacts, setViewContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | valid | invalid
  
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

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
    loadLists();
  }, []);

  // ── File upload handling (Uses Node Discovery Engine) ──────────────────────────

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('Please upload a CSV or Excel (.xlsx, .xls) file');
      return;
    }

    setUploading(true);
    try {
      const res = await whatsappAPI.uploadFile(file);
      const data = res.data;
      
      setPreviewData({
        name: file.name,
        total: data.totalContacts,
        valid: data.validContacts,
        invalid: data.invalidContacts,
        duplicates: data.duplicateContacts,
        groups: data.detectedGroups || [],
        previewRows: data.previewRows || [],
      });
      setSelectedGroupId('all');
      setListName(file.name.replace(/\.[^/.]+$/, ''));
      toast.success(`Discovered ${data.totalContacts} contacts across ${data.detectedGroups?.length || 0} groups.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to parse file');
    } finally {
      setUploading(false);
    }
  };

  const handleMockLoad = () => {
    const data = {
      name: 'sample_contacts.csv',
      totalContacts: 5,
      validContacts: 3,
      invalidContacts: 1,
      duplicateContacts: 1,
      detectedGroups: [
        {
          id: 'group_0',
          label: 'Leaders',
          nameCol: 'Full Name',
          phoneCol: 'Phone Number',
          confidence: 95,
          stats: { total: 1, valid: 1, invalid: 0, duplicates: 0 },
          contacts: [
            { row: 2, name: 'Alice Smith', phone: '+919876543210', normalizedPhone: '919876543210', isValid: true, error: null }
          ]
        },
        {
          id: 'group_1',
          label: 'Members',
          nameCol: 'Full Name',
          phoneCol: 'Phone Number',
          confidence: 90,
          stats: { total: 3, valid: 2, invalid: 1, duplicates: 0 },
          contacts: [
            { row: 3, name: 'Bob Johnson', phone: '+919876543211', normalizedPhone: '919876543211', isValid: true, error: null },
            { row: 4, name: 'Charlie Brown', phone: '+919876543212', normalizedPhone: '919876543212', isValid: true, error: null },
            { row: 6, name: 'Invalid User', phone: '12345', normalizedPhone: '12345', isValid: false, error: 'Invalid phone pattern' }
          ]
        }
      ],
      previewRows: [
        { "Full Name": "Alice Smith", "Phone Number": "+919876543210", "Email": "alice@example.com", "Group": "Leaders", "Role": "Organizer" },
        { "Full Name": "Bob Johnson", "Phone Number": "+919876543211", "Email": "bob@example.com", "Group": "Members", "Role": "Speaker" },
        { "Full Name": "Charlie Brown", "Phone Number": "+919876543212", "Email": "charlie@example.com", "Group": "Members", "Role": "Attendee" },
        { "Full Name": "Alice Smith", "Phone Number": "+919876543210", "Email": "alice@example.com", "Group": "Leaders", "Role": "Organizer" },
        { "Full Name": "Invalid User", "Phone Number": "12345", "Email": "invalid@example.com", "Group": "Members", "Role": "Attendee" }
      ]
    };
    
    setPreviewData({
      name: data.name,
      total: data.totalContacts,
      valid: data.validContacts,
      invalid: data.invalidContacts,
      duplicates: data.duplicateContacts,
      groups: data.detectedGroups,
      previewRows: data.previewRows,
    });
    setSelectedGroupId('all');
    setListName(data.name.replace(/\.[^/.]+$/, ''));
    toast.success('Mock contacts loaded successfully (Demo Mode)');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  // ── Save contacts ────────────────────────────────────────────

  const handleSave = async () => {
    if (!listName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    let finalContacts = [];
    if (selectedGroupId === 'all') {
      previewData.groups.forEach(g => {
        finalContacts = finalContacts.concat(g.contacts);
      });
    } else {
      const g = previewData.groups.find(group => group.id === selectedGroupId);
      if (g) finalContacts = g.contacts;
    }

    const validContacts = finalContacts.filter((c) => c.isValid);
    if (validContacts.length === 0) {
      toast.error('No valid contacts found in the selected import mode');
      return;
    }

    setSaving(true);
    try {
      // Map schema keys to backend database expected columns
      const formatted = validContacts.map(c => ({
        name: c.name,
        phone: c.normalizedPhone,
        email: c.email || '',
        is_valid: true
      }));

      await contactsAPI.saveContacts({
        list_name: listName.trim(),
        contacts: formatted,
      });

      toast.success(`Saved ${formatted.length} contacts to "${listName}"`);
      setPreviewData(null);
      setListName('');
      loadLists();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save contacts');
    } finally {
      setSaving(false);
    }
  };

  // ── View list contacts ───────────────────────────────────────

  const handleViewList = async (list) => {
    try {
      const res = await contactsAPI.getListContacts(list.id);
      setViewingList(res.data.list);
      setViewContacts(res.data.contacts);
      setSearchQuery('');
      setFilterStatus('all');
    } catch {
      toast.error('Failed to load contacts');
    }
  };

  // ── Delete list ──────────────────────────────────────────────

  const handleDelete = async (listId) => {
    try {
      await contactsAPI.deleteList(listId);
      toast.success('Contact list deleted');
      setDeleteConfirm(null);
      setViewingList(null);
      loadLists();
    } catch {
      toast.error('Failed to delete list');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter inline contacts inside a list
  const filteredContacts = viewContacts.filter((c) => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    
    if (filterStatus === 'all') return matchSearch;
    if (filterStatus === 'valid') return matchSearch && c.is_valid;
    if (filterStatus === 'invalid') return matchSearch && !c.is_valid;
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading contacts workspace...</p>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <div className="page-header">
        <h1>Contacts Workspace</h1>
        <p>Import spreadsheets, parse multiple user segments, clean duplicates, and review contacts</p>
      </div>

      {/* VIEWING LIST WORKSPACE */}
      {viewingList ? (
        <div className="contacts-list-workspace">
          <div className="workspace-list-header">
            <button className="btn btn-secondary btn-sm" onClick={() => setViewingList(null)}>
              ← Back to lists
            </button>
            <div className="list-title-area">
              <h2>{viewingList.name}</h2>
              <span className="list-meta">
                {viewingList.valid_contacts} contacts · Created {formatDate(viewingList.created_at)}
              </span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(viewingList)}>
              Delete List
            </button>
          </div>

          <div className="workspace-filters-bar">
            <input
              type="text"
              className="form-input search-box"
              placeholder="Search contacts by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="filter-chips">
              <button 
                className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All Contacts
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'valid' ? 'active' : ''}`}
                onClick={() => setFilterStatus('valid')}
              >
                Valid
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'invalid' ? 'active' : ''}`}
                onClick={() => setFilterStatus('invalid')}
              >
                Invalid
              </button>
            </div>

            <div className="workspace-duplicates-badge">
              🛡️ Duplicates Cleaned: {viewingList.total_contacts - viewingList.valid_contacts}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No contacts found matching the filters
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name || '—'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.phone}</td>
                      <td>
                        <span className={`badge ${c.is_valid ? 'badge-success' : 'badge-error'}`}>
                          {c.is_valid ? '✓ Valid' : '✕ Invalid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : previewData ? (
        /* IMPORT ZONE PREVIEW */
        <div className="contacts-preview-workspace">
          <div className="workspace-list-header">
            <h2>Spreadsheet Import Summary</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreviewData(null)}>
              Cancel Import
            </button>
          </div>

          {/* Import Summary Card */}
          <div className="wa-import-summary-grid" style={{ marginBottom: '24px' }}>
            <div className="wa-summary-stat-card">
              <span className="wa-stat-card-label">Contacts Found</span>
              <span className="wa-stat-card-value">{previewData.total}</span>
            </div>
            <div className="wa-summary-stat-card success">
              <span className="wa-stat-card-label">Valid Contacts</span>
              <span className="wa-stat-card-value text-success">{previewData.valid}</span>
            </div>
            <div className="wa-summary-stat-card warning">
              <span className="wa-stat-card-label">Duplicates Removed</span>
              <span className="wa-stat-card-value text-warning">{previewData.duplicates}</span>
            </div>
            <div className="wa-summary-stat-card info">
              <span className="wa-stat-card-label">Segments Found</span>
              <span className="wa-stat-card-value text-info">{previewData.groups.length}</span>
            </div>
          </div>

          {/* Group Segment Mode Select */}
          {previewData.groups.length > 0 && (
            <div className="workspace-group-section">
              <h3>Select Import Segment</h3>
              <div className="wa-group-options" style={{ marginTop: '8px', marginBottom: '24px' }}>
                <label className={`wa-group-option ${selectedGroupId === 'all' ? 'selected' : ''}`}>
                  <input type="radio" name="group-import" value="all" checked={selectedGroupId === 'all'} onChange={() => setSelectedGroupId('all')} />
                  <div>
                    <strong>All Contacts</strong>
                    <div className="wa-text-sm text-secondary">Merge and import all groups ({previewData.total})</div>
                  </div>
                </label>
                {previewData.groups.map(g => (
                  <label key={g.id} className={`wa-group-option ${selectedGroupId === g.id ? 'selected' : ''}`}>
                    <input type="radio" name="group-import" value={g.id} checked={selectedGroupId === g.id} onChange={() => setSelectedGroupId(g.id)} />
                    <div>
                      <strong>{g.label} Segment</strong>
                      <div className="wa-text-sm text-secondary">{g.stats.total} contacts ({g.stats.valid} valid)</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* List Name Details */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Save as Contact List Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Hackathon RSVP, Students List"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>

          {/* Preview Table Header */}
          <h3>Spreadsheet Preview (First 5 Rows)</h3>
          <div className="table-wrapper" style={{ marginTop: '8px', marginBottom: '24px' }}>
            <table className="table">
              <thead>
                <tr>
                  {previewData.previewRows.length > 0 && Object.keys(previewData.previewRows[0]).map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.previewRows.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="profile-footer">
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '✓ Import Valid Contacts into Nest'}
            </button>
          </div>
        </div>
      ) : (
        /* HOME STATE - LISTS & UPLOADER */
        <div className="contacts-dashboard">
          {/* Persistent Import Dropzone */}
          <div
            className={`upload-zone ${dragActive ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: '32px' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {uploading ? (
              <>
                <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
                <div className="upload-zone-text">Running Smart Heuristic Discovery...</div>
              </>
            ) : (
              <>
                <div className="upload-zone-icon">📊</div>
                <div className="upload-zone-text">
                  Drag & drop your Excel or CSV here, or click to browse
                </div>
                <div className="upload-zone-hint">
                  Supports XLSX, XLS, CSV. Auto-extracts Names, Phones, Emails, Roles, and Groups.
                </div>
                <div className="demo-link-divider">
                  <span>or</span>
                </div>
                <div className="demo-actions-row" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm" onClick={handleMockLoad}>
                    ⚡ Load Mock Contacts (Demo Mode)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* List display */}
          <div className="contacts-lists">
            <h2 style={{ marginBottom: '16px' }}>Your Contact Lists</h2>

            {lists.length === 0 ? (
              <div className="empty-state-container">
                <img src="/logo.png" className="empty-state-logo-img" alt="Cuckoo bird logo" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '16px', opacity: '0.7' }} />
                <div className="empty-state-title">Your nest is empty.</div>
                <div className="empty-state-description">
                  Upload contacts to create your first list.
                </div>
              </div>
            ) : (
              <div className="contacts-list-grid">
                {lists.map((list) => (
                  <div key={list.id} className="contacts-list-card" onClick={() => handleViewList(list)}>
                    <div className="contacts-list-card-header">
                      <div className="contacts-list-card-icon">📋</div>
                      <div className="contacts-list-card-info">
                        <div className="contacts-list-card-name">{list.name}</div>
                        <div className="contacts-list-card-meta">
                          {list.valid_contacts} contacts · {formatDate(list.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="contacts-list-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleViewList(list)}>
                        Open Workspace
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(list)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Contact List"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm?.id)}>
              Delete List
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>"{deleteConfirm?.name}"</strong>?
          This will remove all {deleteConfirm?.valid_contacts} contacts. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
