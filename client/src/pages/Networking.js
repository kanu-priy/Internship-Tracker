import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";

const styles = `
  .net-root {
    display: flex;
    min-height: 100vh;
    background: #f5f3ef;
    color: #2a2a2a;
    font-family: 'Outfit', sans-serif;
  }
  .net-main {
    flex: 1;
    padding: 32px 40px;
    max-width: 1200px;
    box-sizing: border-box;
  }
  .net-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  .net-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #2a2a2a;
  }
  .net-sub {
    font-size: 13px;
    color: #8a857e;
    margin-top: 4px;
  }
  .btn-wine {
    background: #6b2737;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 9px 18px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(107, 39, 55, 0.2);
  }
  .btn-wine:hover {
    background: #541e2b;
    transform: translateY(-1px);
  }
  .btn-secondary {
    background: #ffffff;
    color: #2a2a2a;
    border: 1px solid #e4e0d9;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-secondary:hover {
    background: #f0ede8;
    border-color: #d4cfc7;
  }

  /* Summary Metrics Strip */
  .metrics-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .metric-card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .metric-label {
    font-size: 11px;
    font-weight: 700;
    color: #8a857e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .metric-val {
    font-size: 22px;
    font-weight: 800;
    color: #2a2a2a;
    margin-top: 4px;
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
  }
  .search-input {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 12px;
    color: #2a2a2a;
    outline: none;
    min-width: 240px;
  }
  .filter-select {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 20px;
    padding: 8px 14px;
    font-size: 12px;
    color: #2a2a2a;
    outline: none;
    cursor: pointer;
  }

  /* Contacts Grid */
  .contacts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }
  .contact-card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 14px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s;
  }
  .contact-card:hover {
    border-color: #d4cfc7;
    box-shadow: 0 8px 24px rgba(0,0,0,0.04);
    transform: translateY(-2px);
  }
  .contact-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  .contact-name {
    font-size: 15px;
    font-weight: 800;
    color: #2a2a2a;
  }
  .contact-role {
    font-size: 12px;
    color: #6b2737;
    font-weight: 700;
    margin-top: 1px;
  }
  .contact-company {
    font-size: 12px;
    color: #8a857e;
    font-weight: 500;
  }

  /* Status Badges */
  .badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    display: inline-block;
  }
  .badge-identified { background: #f0ede8; color: #6a655e; border: 1px solid #e4e0d9; }
  .badge-contacted { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
  .badge-replied { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
  .badge-referral { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .badge-noresponse { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

  .contact-body {
    margin: 12px 0;
    font-size: 12px;
    color: #5a5650;
    line-height: 1.5;
  }
  .contact-meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #8a857e;
    margin-top: 6px;
  }

  .contact-actions {
    display: flex;
    gap: 8px;
    border-top: 1px solid #f0ede8;
    padding-top: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .btn-action {
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 700;
    color: #4a453e;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .btn-action:hover {
    background: #ffffff;
    border-color: #6b2737;
    color: #6b2737;
  }

  /* Modal styling */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  }
  .modal-card {
    background: #ffffff;
    width: 90%; max-width: 540px;
    border-radius: 16px;
    border: 1px solid #e4e0d9;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    font-family: 'Outfit', sans-serif;
  }
  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0ede8;
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 800; font-size: 15px; color: #2a2a2a;
  }
  .modal-body {
    padding: 20px;
    max-height: 520px;
    overflow-y: auto;
  }
  .form-group {
    margin-bottom: 14px;
  }
  .form-label {
    font-size: 11px;
    font-weight: 700;
    color: #6a655e;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }
  .form-input {
    width: 100%;
    border: 1px solid #e4e0d9;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    box-sizing: border-box;
    background: #faf8f5;
    outline: none;
  }
  .form-input:focus {
    border-color: #6b2737;
    background: #ffffff;
  }
  .modal-footer {
    padding: 14px 20px;
    border-top: 1px solid #f0ede8;
    background: #faf8f5;
    display: flex; justify-content: flex-end; gap: 10px;
  }
`;

export default function Networking() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterReferral, setFilterReferral] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [outreachTarget, setOutreachTarget] = useState(null);
  const [outreachType, setOutreachType] = useState("Referral Request");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [generating, setGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "Technical Recruiter",
    email: "",
    linkedinUrl: "",
    outreachType: "Referral Request",
    status: "Identified",
    referralStatus: "None",
    nextFollowUpDate: "",
    notes: "",
    internshipId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [resContacts, resApps] = await Promise.all([
        fetch("http://localhost:5000/api/contacts", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/internships", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resContacts.ok) {
        const data = await resContacts.json();
        setContacts(data);
      }
      if (resApps.ok) {
        const apps = await resApps.json();
        setInternships(apps);
      }
    } catch (err) {
      setToast({ message: "Failed to load networking CRM data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingContact
        ? `http://localhost:5000/api/contacts/${editingContact._id}`
        : "http://localhost:5000/api/contacts";
      const method = editingContact ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save contact");

      setToast({
        message: editingContact ? "Contact updated!" : "Added new contact!",
        type: "success",
      });
      setShowAddModal(false);
      setEditingContact(null);
      fetchData();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to remove this contact?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete contact");
      setToast({ message: "Contact deleted", type: "info" });
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  // Generate AI Outreach Draft
  const handleGenerateOutreach = async (contact, type = outreachType) => {
    setOutreachTarget(contact);
    setOutreachType(type);
    setGenerating(true);
    setGeneratedDraft("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/me/ai-actions/contact-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactName: contact.name,
          company: contact.company,
          role: contact.role,
          outreachType: type,
          targetRole: contact.internshipId?.role || "Software Engineering Intern",
          customNote: contact.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to draft outreach");
      setGeneratedDraft(data.result);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: "Copied to clipboard!", type: "success" });
  };

  const handleOpenGmail = (text, contact) => {
    const subjectMatch = text.match(/Subject:\s*(.+)/i);
    const subject = subjectMatch ? encodeURIComponent(subjectMatch[1].trim()) : encodeURIComponent(`Inquiry regarding ${contact.company}`);
    const body = encodeURIComponent(text.replace(/Subject:.+\n/i, "").trim());
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email || "")}&su=${subject}&body=${body}`, "_blank");
  };

  // Filtered Contacts
  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchRef = filterReferral === "All" || c.referralStatus === filterReferral;
    return matchSearch && matchStatus && matchRef;
  });

  const totalContacted = contacts.filter((c) => c.status !== "Identified").length;
  const totalReplied = contacts.filter((c) => c.status === "Replied" || c.status === "Referral Secured").length;
  const totalReferrals = contacts.filter((c) => c.referralStatus === "Confirmed").length;
  const replyRate = totalContacted > 0 ? Math.round((totalReplied / totalContacted) * 100) : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="net-root">
        <Sidebar />
        <div className="net-main">
          {/* HEADER */}
          <div className="net-header">
            <div>
              <div className="net-title">👥 Networking & Recruiter CRM</div>
              <div className="net-sub">
                Track recruiters, alumni, coffee chats, follow-ups, and referral requests in one place.
              </div>
            </div>
            <button
              className="btn-wine"
              onClick={() => {
                setEditingContact(null);
                setFormData({
                  name: "",
                  company: "",
                  role: "Technical Recruiter",
                  email: "",
                  linkedinUrl: "",
                  outreachType: "Referral Request",
                  status: "Identified",
                  referralStatus: "None",
                  nextFollowUpDate: "",
                  notes: "",
                  internshipId: "",
                });
                setShowAddModal(true);
              }}
            >
              + Add Contact
            </button>
          </div>

          {/* METRICS STRIP */}
          <div className="metrics-strip">
            <div className="metric-card">
              <span className="metric-label">Total People Tracked</span>
              <span className="metric-val">{contacts.length}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Outreach Sent</span>
              <span className="metric-val">{totalContacted}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Response Rate</span>
              <span className="metric-val" style={{ color: "#15803d" }}>{replyRate}%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Referrals Confirmed</span>
              <span className="metric-val" style={{ color: "#b45309" }}>{totalReferrals} ⭐</span>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by name, company, or role..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Outreach Statuses</option>
              <option value="Identified">Identified</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up Sent">Follow-up Sent</option>
              <option value="Replied">Replied</option>
              <option value="Referral Secured">Referral Secured</option>
              <option value="No Response">No Response</option>
            </select>
            <select
              className="filter-select"
              value={filterReferral}
              onChange={(e) => setFilterReferral(e.target.value)}
            >
              <option value="All">All Referral Stages</option>
              <option value="None">No Referral</option>
              <option value="Requested">Referral Requested</option>
              <option value="Confirmed">Referral Confirmed ⭐</option>
              <option value="Declined">Referral Declined</option>
            </select>
          </div>

          {/* CONTACTS GRID */}
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#8a857e" }}>Loading networking contacts...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", background: "#ffffff", border: "1px solid #e4e0d9", borderRadius: "14px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>👥</div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "#2a2a2a" }}>No contacts found</div>
              <div style={{ fontSize: "12px", color: "#8a857e", marginTop: "4px" }}>
                Add recruiters, alumni, or engineers to start tracking personal outreach and referrals.
              </div>
            </div>
          ) : (
            <div className="contacts-grid">
              {filtered.map((c) => (
                <div key={c._id} className="contact-card">
                  <div>
                    <div className="contact-top">
                      <div>
                        <div className="contact-name">{c.name}</div>
                        <div className="contact-role">{c.role}</div>
                        <div className="contact-company">{c.company}</div>
                      </div>
                      <span className={`badge badge-${c.status.toLowerCase().replace(/\s+/g, '')}`}>
                        {c.status}
                      </span>
                    </div>

                    {c.referralStatus !== "None" && (
                      <div style={{ marginTop: "4px" }}>
                        <span className="badge badge-referral">
                          Referral: {c.referralStatus} {c.referralStatus === "Confirmed" ? "⭐" : ""}
                        </span>
                      </div>
                    )}

                    <div className="contact-body">
                      {c.notes ? c.notes : <span style={{ color: "#a8a29e", fontStyle: "italic" }}>No notes logged yet.</span>}
                    </div>

                    {c.lastContactDate && (
                      <div className="contact-meta-row">
                        <span>🗓️ Last Contact: {c.lastContactDate}</span>
                      </div>
                    )}
                    {c.nextFollowUpDate && (
                      <div className="contact-meta-row" style={{ color: "#b45309", fontWeight: 700 }}>
                        <span>⏰ Follow-up: {c.nextFollowUpDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="contact-actions">
                    <button
                      className="btn-action"
                      style={{ color: "#6b2737", fontWeight: 700 }}
                      onClick={() => handleGenerateOutreach(c, "Referral Request")}
                    >
                      ✨ AI Draft
                    </button>
                    {c.linkedinUrl && (
                      <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="btn-action">
                        🔗 LinkedIn
                      </a>
                    )}
                    <button
                      className="btn-action"
                      onClick={() => {
                        setEditingContact(c);
                        setFormData({
                          name: c.name,
                          company: c.company,
                          role: c.role,
                          email: c.email || "",
                          linkedinUrl: c.linkedinUrl || "",
                          outreachType: c.outreachType || "Referral Request",
                          status: c.status,
                          referralStatus: c.referralStatus,
                          nextFollowUpDate: c.nextFollowUpDate || "",
                          notes: c.notes || "",
                          internshipId: c.internshipId?._id || "",
                        });
                        setShowAddModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button className="btn-action" style={{ color: "#b91c1c" }} onClick={() => handleDeleteContact(c._id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT CONTACT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>{editingContact ? "Edit Contact" : "Add New Contact"}</div>
              <button className="btn-secondary" style={{ padding: "4px 8px" }} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveContact}>
              <div className="modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name *</label>
                    <input
                      required
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sarah Chen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input
                      required
                      type="text"
                      className="form-input"
                      placeholder="e.g. Barclays"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Position / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Recruiter / Alum"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link to Application (Optional)</label>
                    <select
                      className="form-input"
                      value={formData.internshipId}
                      onChange={(e) => setFormData({ ...formData, internshipId: e.target.value })}
                    >
                      <option value="">None</option>
                      {internships.map((app) => (
                        <option key={app._id} value={app._id}>
                          {app.company} — {app.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="sarah@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Outreach Status</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Identified">Identified (Not yet contacted)</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Follow-up Sent">Follow-up Sent</option>
                      <option value="Replied">Replied</option>
                      <option value="Referral Secured">Referral Secured</option>
                      <option value="No Response">No Response</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Referral Status</label>
                    <select
                      className="form-input"
                      value={formData.referralStatus}
                      onChange={(e) => setFormData({ ...formData, referralStatus: e.target.value })}
                    >
                      <option value="None">None</option>
                      <option value="Requested">Referral Requested</option>
                      <option value="Confirmed">Referral Confirmed ⭐</option>
                      <option value="Declined">Referral Declined</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Next Follow-Up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Responses</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    placeholder="e.g. Spoke about distributed systems. Mentioned opening opening up in October."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-wine">
                  {editingContact ? "Save Changes" : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI OUTREACH DRAFT MODAL */}
      {outreachTarget && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <div>✨ Personalized AI Outreach ({outreachTarget.name} @ {outreachTarget.company})</div>
              <button className="btn-secondary" style={{ padding: "4px 8px" }} onClick={() => setOutreachTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Outreach Goal Selector */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px", overflowX: "auto", paddingBottom: "4px" }}>
                {[
                  { label: "🤝 Referral Request", val: "Referral Request" },
                  { label: "☕ Coffee Chat", val: "Coffee Chat" },
                  { label: "🎯 Recruiter Pitch", val: "Recruiter Pitch" },
                  { label: "🎓 Alumni Connect", val: "Alumni Connection" },
                ].map((type) => (
                  <button
                    key={type.val}
                    className="btn-secondary"
                    style={{
                      fontSize: "11px",
                      padding: "6px 12px",
                      background: outreachType === type.val ? "#6b2737" : "#ffffff",
                      color: outreachType === type.val ? "#ffffff" : "#2a2a2a",
                      borderColor: outreachType === type.val ? "#6b2737" : "#e4e0d9",
                    }}
                    onClick={() => handleGenerateOutreach(outreachTarget, type.val)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {generating ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#8a857e" }}>
                  Generating personalized outreach message based on your resume and {outreachTarget.name}'s role...
                </div>
              ) : generatedDraft ? (
                <div
                  style={{
                    background: "#faf8f5",
                    border: "1px solid #e4e0d9",
                    borderRadius: "12px",
                    padding: "16px",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    color: "#2a2a2a",
                  }}
                >
                  {generatedDraft}
                </div>
              ) : null}
            </div>

            {!generating && generatedDraft && (
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => handleOpenGmail(generatedDraft, outreachTarget)}
                >
                  ✉️ Open in Gmail
                </button>
                <button
                  className="btn-wine"
                  onClick={() => copyToClipboard(generatedDraft)}
                >
                  📋 Copy Message
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      )}
    </>
  );
}
