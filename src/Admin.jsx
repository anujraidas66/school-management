import { useCallback, useEffect, useState } from "react";

const statuses = ["new", "reviewing", "contacted", "enrolled", "closed"];

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Login({ csrfToken, onLogin }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await request("/api/admin/login", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      onLogin(result);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-back-link" href="/">← Back to school website</a>
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span className="admin-login-mark" aria-hidden="true">B</span>
        <p className="admin-eyebrow">Bright Future Academy</p>
        <h1>Welcome back</h1>
        <p className="admin-login-intro">Sign in to manage admissions enquiries.</p>
        <label htmlFor="admin-username">Username</label>
        <input id="admin-username" name="username" autoComplete="username" required autoFocus />
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <button className="admin-primary-button" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

function AdminDashboard({ csrfToken, username, onLogout }) {
  const isProgramsPage = window.location.pathname === "/admin/programs";
  const isFacilitiesPage = window.location.pathname === "/admin/facilities";
  const isGalleryPage = window.location.pathname === "/admin/gallery";
  const isNewsPage = window.location.pathname === "/admin/news";
  const isContactPage = window.location.pathname === "/admin/contact";
  const isOverviewPage = isProgramsPage || isFacilitiesPage || isGalleryPage || isNewsPage || isContactPage;
  const [stats, setStats] = useState({ total: 0, counts: {} });
  const [enquiries, setEnquiries] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(page),
        status: statusFilter,
        search,
      });
      const [statsResult, enquiryResult] = await Promise.all([
        request("/api/admin/stats"),
        request(`/api/admin/enquiries?${query}`),
      ]);
      setStats(statsResult);
      setEnquiries(enquiryResult.enquiries);
      setPages(Math.max(1, enquiryResult.pages));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (isOverviewPage) return undefined;
    const timeout = window.setTimeout(loadData, 180);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  async function updateStatus(id, status) {
    setError("");
    setNotice("");
    try {
      await request(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ status }),
      });
      setNotice("Enquiry status updated.");
      await loadData();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteEnquiry(enquiry) {
    if (!window.confirm(`Delete the enquiry from ${enquiry.studentName}? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await request(`/api/admin/enquiries/${enquiry._id}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrfToken },
      });
      setNotice("Enquiry deleted.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleLogout() {
    try {
      await request("/api/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
      });
      onLogout();
    } catch (logoutError) {
      setError(logoutError.message);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin"><span aria-hidden="true">B</span> Bright Future</a>
        <p className="admin-sidebar-label">WORKSPACE</p>
        <a className={`admin-sidebar-link${isOverviewPage ? "" : " active"}`} href="/admin" aria-current={isOverviewPage ? undefined : "page"}><span aria-hidden="true">▦</span> Enquiries</a>
        <a className={`admin-sidebar-link${isProgramsPage ? " active" : ""}`} href="/admin/programs" aria-current={isProgramsPage ? "page" : undefined}><span aria-hidden="true">◫</span> Programs</a>
        <a className={`admin-sidebar-link${isFacilitiesPage ? " active" : ""}`} href="/admin/facilities" aria-current={isFacilitiesPage ? "page" : undefined}><span aria-hidden="true">◇</span> Facilities</a>
        <a className={`admin-sidebar-link${isGalleryPage ? " active" : ""}`} href="/admin/gallery" aria-current={isGalleryPage ? "page" : undefined}><span aria-hidden="true">▧</span> Gallery</a>
        <a className={`admin-sidebar-link${isNewsPage ? " active" : ""}`} href="/admin/news" aria-current={isNewsPage ? "page" : undefined}><span aria-hidden="true">◉</span> News</a>
        <a className={`admin-sidebar-link${isContactPage ? " active" : ""}`} href="/admin/contact" aria-current={isContactPage ? "page" : undefined}><span aria-hidden="true">⌖</span> Contact us</a>
        <a className="admin-sidebar-link admin-website-link" href="/" target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span> View website</a>
        <div className="admin-sidebar-bottom">
          <span className="admin-user-avatar">{username.slice(0, 1).toUpperCase()}</span>
          <span className="admin-user-name">{username}<small>Administrator</small></span>
          <button type="button" className="admin-logout-icon" aria-label="Sign out" onClick={handleLogout}>↪</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div><p className="admin-eyebrow">{isProgramsPage ? "Academics" : isFacilitiesPage ? "Campus" : isGalleryPage ? "Media" : isNewsPage ? "Updates" : isContactPage ? "School details" : "Admissions"}</p><h1>{isProgramsPage ? "Programs" : isFacilitiesPage ? "Facilities" : isGalleryPage ? "Gallery" : isNewsPage ? "News" : isContactPage ? "Contact us" : "Enquiries"}</h1></div>
          <div className="admin-topbar-user"><span className="admin-user-avatar">{username.slice(0, 1).toUpperCase()}</span><span>{username}</span><button type="button" onClick={handleLogout}>Sign out</button></div>
        </header>
        <section className={`admin-content${isOverviewPage ? " admin-programs-content" : ""}`}>
          {isProgramsPage ? (
            <ProgramsOverview csrfToken={csrfToken} />
          ) : isFacilitiesPage ? (
            <FacilitiesOverview csrfToken={csrfToken} />
          ) : isGalleryPage ? (
            <GalleryOverview csrfToken={csrfToken} />
          ) : isNewsPage ? (
            <NewsOverview csrfToken={csrfToken} />
          ) : isContactPage ? (
            <ContactOverview csrfToken={csrfToken} />
          ) : (
            <>
          <div className="admin-welcome">
            <div><h2>Admissions overview</h2><p>Review and manage incoming student enquiries.</p></div>
            <span className="admin-live"><i /> Live data</span>
          </div>
          <div className="admin-stat-grid">
            <article className="admin-stat-card"><span className="admin-stat-icon blue">▤</span><p>Total enquiries</p><strong>{stats.total}</strong><small>All submissions</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon amber">✳</span><p>New</p><strong>{stats.counts.new ?? 0}</strong><small>Awaiting review</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon violet">◷</span><p>In progress</p><strong>{(stats.counts.reviewing ?? 0) + (stats.counts.contacted ?? 0)}</strong><small>Being followed up</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon green">✓</span><p>Enrolled</p><strong>{stats.counts.enrolled ?? 0}</strong><small>Successful admissions</small></article>
          </div>

          <section className="admin-table-card">
            <div className="admin-table-heading">
              <div><h2>All enquiries</h2><p>{stats.total} total submissions</p></div>
              <div className="admin-filters">
                <label className="admin-search"><span aria-hidden="true">⌕</span><input aria-label="Search enquiries" placeholder="Search name, email or phone" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
                <select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="all">All statuses</option>
                  {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="admin-alert admin-inline-alert" role="alert">{error}</p>}
            {notice && <p className="admin-notice" role="status">{notice}</p>}
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead><tr><th>STUDENT / PARENT</th><th>GRADE</th><th>ENQUIRY</th><th>RECEIVED</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {!loading && enquiries.map((enquiry) => (
                    <tr key={enquiry._id}>
                      <td><strong>{enquiry.studentName}</strong><span>{enquiry.email}</span><span>{enquiry.phone}</span></td>
                      <td>{enquiry.grade}</td>
                      <td><strong>{enquiry.topic}</strong>{enquiry.message && <span className="admin-message" title={enquiry.message}>{enquiry.message}</span>}</td>
                      <td className="admin-date">{formatDate(enquiry.createdAt)}</td>
                      <td>
                        <select
                          className={`status-select status-${enquiry.status}`}
                          aria-label={`Status for ${enquiry.studentName}`}
                          value={enquiry.status}
                          onChange={(event) => updateStatus(enquiry._id, event.target.value)}
                        >
                          {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td><button className="admin-delete" type="button" aria-label={`Delete enquiry from ${enquiry.studentName}`} onClick={() => deleteEnquiry(enquiry)}>Delete</button></td>
                    </tr>
                  ))}
                  {loading && <tr><td className="admin-empty" colSpan="6">Loading enquiries…</td></tr>}
                  {!loading && enquiries.length === 0 && <tr><td className="admin-empty" colSpan="6">No enquiries found. New submissions will appear here.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="admin-pagination">
              <span>Page {page} of {pages}</span>
              <div><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}>Next</button></div>
            </div>
          </section>
          <p className="admin-footer-note">Bright Future Academy · Admissions management</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

const contentTypes = {
  programs: {
    singular: "program",
    heading: "Academic programs",
    description: "Manage the learning stages shown on the public school website.",
    publicAnchor: "programs",
    summary: "Programs",
    icon: "◫",
    fields: [
      { name: "grades", label: "Grade range", maxLength: 60 },
      { name: "title", label: "Program name", maxLength: 100 },
      { name: "description", label: "Description", maxLength: 500, multiline: true },
    ],
  },
  facilities: {
    singular: "facility",
    heading: "Campus facilities",
    description: "Manage the spaces and services shown on the public school website.",
    publicAnchor: "facilities",
    summary: "Facilities",
    icon: "◇",
    fields: [
      { name: "icon", label: "Icon", maxLength: 8 },
      { name: "title", label: "Facility name", maxLength: 100 },
      { name: "description", label: "Description", maxLength: 500, multiline: true },
      { name: "detail", label: "Highlight", maxLength: 100 },
    ],
  },
  gallery: {
    singular: "gallery item",
    heading: "Campus gallery",
    description: "Manage photos and moments shown in the public gallery.",
    publicAnchor: "gallery",
    summary: "Gallery items",
    icon: "▧",
    fields: [
      { name: "title", label: "Gallery title", maxLength: 100 },
      { name: "category", label: "Category", maxLength: 20, select: ["academics", "sports", "arts", "events"] },
      { name: "colorOne", label: "Primary color", maxLength: 20, placeholder: "#2b4cb3" },
      { name: "colorTwo", label: "Secondary color", maxLength: 20, placeholder: "#16224a" },
      { name: "imageUrl", label: "Image URL (optional)", maxLength: 500, wide: true },
    ],
  },
  news: {
    singular: "news item",
    heading: "News and announcements",
    description: "Manage the latest updates shown on the public school website.",
    publicAnchor: "news",
    summary: "News items",
    icon: "◉",
    fields: [
      { name: "date", label: "Date", maxLength: 30, placeholder: "28 OCT 2026" },
      { name: "title", label: "News title", maxLength: 100 },
      { name: "description", label: "Description", maxLength: 1000, multiline: true, wide: true },
    ],
  },
};

function ContentManager({ type, csrfToken }) {
  const config = contentTypes[type];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formData, setFormData] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await request(`/api/admin/${type}`);
      setItems(result.items);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function startCreate() {
    const nextOrder = Math.max(0, ...items.map((item) => item.order)) + 1;
    setFormData(Object.fromEntries([
      ...config.fields.map(({ name }) => [name, ""]),
      ["order", String(nextOrder)],
    ]));
    setEditingId(null);
    setError("");
    setNotice("");
  }

  function startEdit(item) {
    setFormData(Object.fromEntries([
      ...config.fields.map(({ name }) => [name, item[name]]),
      ["order", String(item.order)],
    ]));
    setEditingId(item._id);
    setError("");
    setNotice("");
  }

  async function saveContent(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const body = { ...formData, order: Number(formData.order) };
    const endpoint = editingId
      ? `/api/admin/${type}/${editingId}`
      : `/api/admin/${type}`;

    try {
      await request(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: JSON.stringify(body),
      });
      setFormData(null);
      setEditingId(null);
      setNotice(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${editingId ? "updated" : "added"}.`);
      await loadItems();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteContent(item) {
    if (!window.confirm(`Delete "${item.title}"? This will also remove it from the public website.`)) return;
    setError("");
    setNotice("");
    try {
      await request(`/api/admin/${type}/${item._id}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrfToken },
      });
      setNotice(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted.`);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  const displayedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="admin-welcome">
        <div>
          <h2>{config.heading}</h2>
          <p>{config.description}</p>
        </div>
        <div className="admin-content-heading-actions">
          <a className="admin-programs-website-link" href={`/#${config.publicAnchor}`} target="_blank" rel="noreferrer">
            View on website <span aria-hidden="true">↗</span>
          </a>
          <button className="admin-add-button" type="button" onClick={startCreate}>＋ Add {config.singular}</button>
        </div>
      </div>
      <div className="admin-program-summary" aria-label={`${config.summary} summary`}>
        <article className="admin-program-summary-card">
          <span className="admin-stat-icon blue" aria-hidden="true">{config.icon}</span>
          <p>Total {config.summary.toLowerCase()}</p>
          <strong>{items.length}</strong>
          <small>Published on the website</small>
        </article>
        <article className="admin-program-summary-card">
          <span className="admin-stat-icon violet" aria-hidden="true">↕</span>
          <p>Display order</p>
          <strong>Custom</strong>
          <small>Change the order number while editing</small>
        </article>
        <article className="admin-program-summary-card">
          <span className="admin-stat-icon green" aria-hidden="true">✓</span>
          <p>Content status</p>
          <strong>Live</strong>
          <small>Changes are saved to the database</small>
        </article>
      </div>
      {error && <p className="admin-alert admin-content-alert" role="alert">{error}</p>}
      {notice && <p className="admin-notice admin-content-notice" role="status">{notice}</p>}
      {formData && (
        <form className="admin-editor-card" onSubmit={saveContent}>
          <div className="admin-editor-heading">
            <div>
              <h2>{editingId ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2>
              <p>Changes will appear on the public website after saving.</p>
            </div>
            <button type="button" className="admin-editor-close" aria-label="Cancel editing" onClick={() => { setFormData(null); setEditingId(null); }}>×</button>
          </div>
          <div className="admin-editor-fields">
            {config.fields.map((field) => (
              <label className={(field.multiline || field.wide) ? "admin-editor-field admin-editor-field-wide" : "admin-editor-field"} key={field.name}>
                {field.label}
                {field.multiline ? (
                  <textarea
                    name={field.name}
                    rows="3"
                    maxLength={field.maxLength}
                    required
                    value={formData[field.name]}
                    onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
                  />
                ) : field.select ? (
                  <select
                    name={field.name}
                    required
                    value={formData[field.name]}
                    onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
                  >
                    <option value="" disabled>Select a category</option>
                    {field.select.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type="text"
                    maxLength={field.maxLength}
                    placeholder={field.placeholder || ""}
                    required={field.name !== "imageUrl"}
                    value={formData[field.name]}
                    onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
                  />
                )}
              </label>
            ))}
            <label className="admin-editor-field">
              Display order
              <input
                name="order"
                type="number"
                min="1"
                max="10000"
                step="1"
                required
                value={formData.order}
                onChange={(event) => setFormData({ ...formData, order: event.target.value })}
              />
            </label>
          </div>
          <div className="admin-editor-actions">
            <button className="admin-add-button" type="submit" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : `Add ${config.singular}`}</button>
            <button className="admin-cancel-button" type="button" disabled={busy} onClick={() => { setFormData(null); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      )}
      {loading && items.length === 0 ? (
        <p className="admin-content-empty">Loading {config.summary.toLowerCase()}…</p>
      ) : displayedItems.length > 0 ? (
        <div className={type === "programs" ? "admin-program-grid" : type === "gallery" ? "admin-gallery-grid" : type === "news" ? "admin-news-grid" : "admin-facility-grid"}>
          {displayedItems.map((item) => (
            <article className={type === "programs" ? "admin-program-card" : type === "gallery" ? "admin-gallery-card" : type === "news" ? "admin-news-card" : "admin-facility-card"} key={item._id}>
              {type === "programs" ? (
                <>
                  <div className="admin-program-card-top">
                    <span className="admin-program-number">{String(item.order).padStart(2, "0")}</span>
                    <span className="admin-program-stage">Learning stage</span>
                  </div>
                  <p className="admin-program-grades">{item.grades}</p>
                  <h3>{item.title}</h3>
                  <p className="admin-program-description">{item.description}</p>
                </>
              ) : type === "gallery" ? (
                <>
                  <div
                    className="admin-gallery-preview"
                    style={item.imageUrl
                      ? { backgroundImage: `linear-gradient(rgba(10,20,40,.18), rgba(10,20,40,.62)), url("${item.imageUrl}")` }
                      : { "--tile-one": item.colorOne, "--tile-two": item.colorTwo }}
                  >
                    <span>{item.category}</span>
                  </div>
                  <h3>{item.title}</h3>
                </>
              ) : type === "news" ? (
                <>
                  <div className="admin-news-card-top">
                    <span className="admin-news-date">{item.date}</span>
                    <span className="admin-news-order">{String(item.order).padStart(2, "0")}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </>
              ) : (
                <>
                  <div className="admin-facility-card-top">
                    <span className="admin-facility-icon" aria-hidden="true">{item.icon}</span>
                    <span className="admin-facility-detail">{item.detail}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </>
              )}
              <div className="admin-content-card-actions">
                <button type="button" onClick={() => startEdit(item)}>Edit</button>
                <button type="button" className="admin-content-delete" onClick={() => deleteContent(item)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : !loading && !error ? (
        <p className="admin-content-empty">No {config.summary.toLowerCase()} yet. Add one to publish it on the website.</p>
      ) : null}
      <p className="admin-footer-note">Changes are saved to the database and served on the public school website.</p>
    </>
  );
}

function ProgramsOverview({ csrfToken }) {
  return <ContentManager type="programs" csrfToken={csrfToken} />;
}

function FacilitiesOverview({ csrfToken }) {
  return <ContentManager type="facilities" csrfToken={csrfToken} />;
}

function GalleryOverview({ csrfToken }) {
  return <ContentManager type="gallery" csrfToken={csrfToken} />;
}

function NewsOverview({ csrfToken }) {
  return <ContentManager type="news" csrfToken={csrfToken} />;
}

function ContactOverview({ csrfToken }) {
  const [formData, setFormData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    request("/api/admin/contact")
      .then((result) => setFormData(result.contact))
      .catch((loadError) => setError(loadError.message));
  }, []);

  function submitContact(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    request("/api/admin/contact", {
      method: "PUT",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify(formData),
    })
      .then((result) => {
        setFormData(result.contact);
        setNotice("Contact details updated.");
      })
      .catch((saveError) => setError(saveError.message))
      .finally(() => setBusy(false));
  }

  if (!formData) return <p className="admin-content-empty">{error || "Loading contact details…"}</p>;

  const fields = [
    ["address", "Address", "textarea", 300],
    ["phone", "Phone", "text", 40],
    ["email", "Email", "email", 254],
    ["officeHours", "Office hours", "textarea", 300],
    ["campusName", "Campus name", "text", 100],
    ["campusDescription", "Campus description", "textarea", 300],
  ];

  return (
    <>
      <div className="admin-welcome">
        <div><h2>Contact information</h2><p>Manage the address, phone, email and office hours shown on the website.</p></div>
        <a className="admin-programs-website-link" href="/#contact" target="_blank" rel="noreferrer">View on website <span aria-hidden="true">↗</span></a>
      </div>
      {error && <p className="admin-alert admin-content-alert" role="alert">{error}</p>}
      {notice && <p className="admin-notice admin-content-notice" role="status">{notice}</p>}
      <form className="admin-editor-card" onSubmit={submitContact}>
        <div className="admin-editor-heading">
          <div><h2>Public contact details</h2><p>Changes will appear across the website after saving.</p></div>
        </div>
        <div className="admin-editor-fields">
          {fields.map(([name, label, type, maxLength]) => (
            <label className={type === "textarea" ? "admin-editor-field admin-editor-field-wide" : "admin-editor-field"} key={name}>
              {label}
              {type === "textarea" ? (
                <textarea
                  name={name}
                  rows="3"
                  maxLength={maxLength}
                  required
                  value={formData[name]}
                  onChange={(event) => setFormData({ ...formData, [name]: event.target.value })}
                />
              ) : (
                <input
                  name={name}
                  type={type}
                  maxLength={maxLength}
                  required
                  value={formData[name]}
                  onChange={(event) => setFormData({ ...formData, [name]: event.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        <div className="admin-editor-actions">
          <button className="admin-add-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save contact details"}</button>
        </div>
      </form>
      <p className="admin-footer-note">Changes are saved to the database and served on the public school website.</p>
    </>
  );
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  const loadSession = useCallback(() => {
    setError("");
    request("/api/admin/session")
      .then(setSession)
      .catch((sessionError) => setError(sessionError.message));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (error) {
    return <main className="admin-login-page"><div className="admin-setup-error"><h1>Admin panel unavailable</h1><p>{error}</p><a href="/">Back to school website</a><button type="button" onClick={() => window.location.reload()}>Try again</button></div></main>;
  }
  if (!session) return <main className="admin-login-page"><p className="admin-loading">Loading admin panel…</p></main>;
  if (!session.authenticated) {
    return <Login csrfToken={session.csrfToken} onLogin={(result) => setSession({ ...session, ...result })} />;
  }
  return (
    <AdminDashboard
      csrfToken={session.csrfToken}
      username={session.username}
      onLogout={loadSession}
    />
  );
}
