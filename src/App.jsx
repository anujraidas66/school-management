import { useEffect, useRef, useState } from "react";
import Admin from "./Admin.jsx";

const navigation = [
  ["About", "about"],
  ["Programs", "programs"],
  ["Facilities", "facilities"],
  ["Faculty", "faculty"],
  ["News", "news"],
  ["Gallery", "gallery"],
  ["Contact", "contact"],
];

const faculty = [
  ["SA", "Mrs. Sunita Adhikari", "Principal", "M.Ed., 24 years in school leadership."],
  ["RS", "Mr. Rajesh Shrestha", "Head of Science", "M.Sc. Physics, 15 years teaching Grades 9–12."],
  ["PT", "Ms. Priya Thapa", "Head of English", "M.A. English, leads the debate and writing clubs."],
  ["BK", "Mr. Bikash Karki", "Computer and Robotics", "B.E. Computer, runs the new robotics lab."],
];

const news = [
  ["28 OCT 2026", "Grade 10 team wins inter-school quiz", "Our students took first place at the national championship held in Lalitpur."],
  ["15 OCT 2026", "New robotics lab opens", "The lab is open to Grades 6 and above, with weekly coding and building sessions."],
  ["02 OCT 2026", "Admissions open for 2027", "Applications are being accepted for all grades. Seats are limited."],
];

const gallery = [
  ["academics", "Library reading hour", "#2b4cb3", "#16224a"],
  ["events", "Annual Science Fair", "#8a3fb0", "#3b1d6b"],
  ["academics", "Robotics lab session", "#0b7285", "#0a3a4a"],
  ["sports", "Sports Day relay", "#0f7a5c", "#0a3f43"],
  ["sports", "Football team practice", "#2f8f2f", "#1a4d2a"],
  ["arts", "Art exhibition", "#b4560f", "#6b2d12"],
  ["arts", "Annual concert", "#b02a5b", "#5c1535"],
  ["events", "Grade 12 farewell", "#5a4fcf", "#2a2569"],
];

const galleryFilters = ["all", "academics", "sports", "arts", "events"];

const defaultContact = {
  address: "Bright Future Academy, Kathmandu, Bagmati Province, Nepal",
  phone: "9843978644",
  email: "info@brightfuture.edu.np",
  officeHours: "Sunday to Friday, 9:00 AM to 4:00 PM\nClosed on Saturdays and public holidays",
  campusName: "Kathmandu campus",
  campusDescription: "We look forward to welcoming your family.",
};

function SectionHeading({ label, title, description }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{label}</p>
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
    </div>
  );
}

function Header({ contact = defaultContact }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>{contact.phone} <span aria-hidden="true">·</span> {contact.email}</span>
          <span>Admissions open for the 2027 session</span>
        </div>
      </div>
      <header className="site-header">
        <nav className="container nav" aria-label="Main navigation">
          <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark" aria-hidden="true">B</span>
            Bright Future Academy
          </a>
          <ul className="desktop-nav">
            {navigation.map(([label, id]) => (
              <li key={id}><a className="nav-link" href={`#${id}`}>{label}</a></li>
            ))}
            <li><a className="button button-small" href="#admission">Apply now</a></li>
          </ul>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </nav>
        {menuOpen && (
          <ul className="mobile-nav container" id="mobile-menu">
            {navigation.map(([label, id]) => (
              <li key={id}><a href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a></li>
            ))}
            <li><a className="mobile-apply" href="#admission" onClick={() => setMenuOpen(false)}>Apply now →</a></li>
          </ul>
        )}
      </header>
    </>
  );
}

function Hero() {
  const events = [
    ["20", "NOV", "Annual Science Fair", "School auditorium, 10:00 AM"],
    ["02", "DEC", "Parent–Teacher Meeting", "All classrooms, 9:00 AM"],
    ["15", "DEC", "Annual Sports Day", "School ground, 8:00 AM"],
  ];

  return (
    <>
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-tag">Est. 1998 <span>·</span> Nursery to Grade 12</p>
            <h1>Learn. Grow.<br /><span>Lead.</span></h1>
            <p className="hero-description">
              Small classes, qualified teachers, and a campus built for curious children.
              Every student is known by name.
            </p>
            <div className="hero-actions">
              <a className="button button-accent" href="#admission">Apply for admission</a>
              <a className="button button-outline" href="#about">About the school</a>
            </div>
          </div>
          <aside className="events-card" aria-label="Upcoming events">
            <div className="events-title"><span className="live-dot" /> Upcoming events</div>
            {events.map(([day, month, title, details]) => (
              <div className="event" key={title}>
                <span className="event-date">{day}<small>{month}</small></span>
                <div><p>{title}</p><small>{details}</small></div>
              </div>
            ))}
            <a className="events-link" href="#news">See what's happening <span aria-hidden="true">→</span></a>
          </aside>
        </div>
      </section>
      <section className="stats-band" aria-label="School statistics">
        <div className="container stats-grid">
          {[["28", "Years of teaching"], ["1,800", "Students"], ["90", "Teachers"], ["1 : 22", "Teacher to student ratio"]].map(([value, label]) => (
            <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>
          ))}
        </div>
      </section>
    </>
  );
}

function About() {
  return (
    <section className="container about section-space" id="about">
      <div className="promise-card">
        <span className="promise-icon" aria-hidden="true">✦</span>
        <p className="eyebrow eyebrow-light">Our promise</p>
        <p className="promise-quote">Every child leaves us able to think clearly, speak confidently, and act kindly.</p>
        <p className="promise-caption">Principal's message, Academic Year 2027</p>
      </div>
      <div className="about-copy">
        <SectionHeading label="About us" title="A school where every child is known" />
        <p className="muted">Bright Future Academy combines a strong academic base with sport, music, and values education. Small classes mean each student gets real attention from their teacher.</p>
        <ul className="check-list">
          <li>Qualified, caring faculty</li>
          <li>Smart classrooms, science and computer labs</li>
          <li>Safe campus with school bus routes</li>
          <li>Sports, music, art, and student clubs</li>
        </ul>
      </div>
    </section>
  );
}

function ContentMessage({ loading, error, onRetry }) {
  if (loading) return <p className="public-content-message">Loading…</p>;
  if (error) {
    return (
      <div className="public-content-error" role="alert">
        <p>{error}</p>
        <button type="button" onClick={onRetry}>Try again</button>
      </div>
    );
  }
  return null;
}

function Programs({ programs, loading, error, onRetry }) {
  return (
    <section className="section-tint section-space" id="programs">
      <div className="container">
        <SectionHeading label="Academics" title="Programs by stage" description="Learning that fits each age and builds skills step by step." />
        <ContentMessage loading={loading && programs.length === 0} error={error} onRetry={onRetry} />
        {programs.length > 0 && <div className="card-grid program-grid">
          {programs.map(({ _id, grades, title, description }) => (
            <article className="card program-card" key={_id}>
              <span className="program-grades">{grades}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>}
        {!loading && !error && programs.length === 0 && <p className="public-content-message">No programs are currently available.</p>}
      </div>
    </section>
  );
}

function Facilities({ facilities, loading, error, onRetry }) {
  return (
    <section className="container section-space" id="facilities">
      <SectionHeading label="Facilities" title="Built for learning, sport and safety" description="A welcoming campus with the tools students need to thrive." />
      <ContentMessage loading={loading && facilities.length === 0} error={error} onRetry={onRetry} />
      {facilities.length > 0 && <div className="card-grid facility-grid">
        {facilities.map(({ _id, icon, title, description, detail }) => (
          <article className="card facility-card" key={_id}>
            <span className="facility-icon" aria-hidden="true">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="facility-detail">{detail}</span>
          </article>
        ))}
      </div>}
      {!loading && !error && facilities.length === 0 && <p className="public-content-message">No facilities are currently available.</p>}
    </section>
  );
}

function Faculty() {
  return (
    <section className="section-tint section-space" id="faculty">
      <div className="container">
        <SectionHeading label="Faculty" title="Teachers who know their students" description="A caring, experienced team supporting every learner." />
        <div className="card-grid faculty-grid">
          {faculty.map(([initials, name, role, description]) => (
            <article className="card teacher-card" key={name}>
              <span className="teacher-avatar" aria-hidden="true">{initials}</span>
              <h3>{name}</h3>
              <span className="teacher-role">{role}</span>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function News({ items = [] }) {
  const newsItems = items.length > 0
    ? items.map((item) => [item.date, item.title, item.description])
    : news;
  return (
    <section className="container section-space" id="news">
      <SectionHeading label="Latest" title="News and announcements" />
      <div className="card-grid news-grid">
        {newsItems.map(([date, title, description]) => (
          <article className="card news-card" key={title}>
            <span className="news-date">{date}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <a href="#admission" aria-label={`Ask us about ${title}`}>Read more <span aria-hidden="true">→</span></a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Gallery({ items = [] }) {
  const [filter, setFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);
  const closeButton = useRef(null);
  const galleryItems = items.length > 0
    ? items.map((item) => [item.category, item.title, item.colorOne, item.colorTwo, item.imageUrl])
    : gallery.map((item) => [...item, ""]);
  const visibleItems = galleryItems.filter(([category]) => filter === "all" || category === filter);
  const activeItem = activeIndex === null ? null : visibleItems[activeIndex];

  useEffect(() => {
    if (activeItem) closeButton.current?.focus();
  }, [activeItem]);

  useEffect(() => {
    if (!activeItem) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + visibleItems.length) % visibleItems.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % visibleItems.length);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, visibleItems.length]);

  return (
    <section className="section-tint section-space" id="gallery">
      <div className="container">
        <SectionHeading label="Gallery" title="Life at Bright Future" description="A few moments from life on campus." />
        <div className="filter-list" role="group" aria-label="Filter gallery">
          {galleryFilters.map((category) => (
            <button
              className="filter-chip"
              type="button"
              key={category}
              aria-pressed={filter === category}
              onClick={() => { setFilter(category); setActiveIndex(null); }}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {visibleItems.map(([category, title, colorOne, colorTwo], index) => (
            <button
              className="gallery-tile"
              type="button"
              key={title}
              style={visibleItems[index][4]
                ? { backgroundImage: `linear-gradient(rgba(10,20,40,.12), rgba(10,20,40,.72)), url("${visibleItems[index][4]}")`, backgroundSize: "cover", backgroundPosition: "center" }
                : { "--tile-one": colorOne, "--tile-two": colorTwo }}
              aria-label={`View ${title}`}
              onClick={() => setActiveIndex(index)}
            >
              <span className="tile-symbol" aria-hidden="true">{category === "sports" ? "✳" : category === "arts" ? "✦" : category === "events" ? "✧" : "▤"}</span>
              <span>{title}</span>
            </button>
          ))}
        </div>
      </div>
      {activeItem && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery viewer" onClick={(event) => {
          if (event.target === event.currentTarget) setActiveIndex(null);
        }}>
          <button className="lightbox-close" type="button" ref={closeButton} aria-label="Close gallery" onClick={() => setActiveIndex(null)}>×</button>
          <button className="lightbox-arrow lightbox-prev" type="button" aria-label="Previous image" onClick={() => setActiveIndex((index) => (index - 1 + visibleItems.length) % visibleItems.length)}>‹</button>
          <figure className="lightbox-figure">
            <div
              className="lightbox-image"
              style={activeItem[4]
                ? { backgroundImage: `url("${activeItem[4]}")`, backgroundSize: "cover", backgroundPosition: "center" }
                : { "--tile-one": activeItem[2], "--tile-two": activeItem[3] }}
            >
              <span aria-hidden="true">✦</span>
            </div>
            <figcaption>{activeItem[1]}</figcaption>
          </figure>
          <button className="lightbox-arrow lightbox-next" type="button" aria-label="Next image" onClick={() => setActiveIndex((index) => (index + 1) % visibleItems.length)}>›</button>
        </div>
      )}
    </section>
  );
}

function Admission({ programs, programsLoading }) {
  const [status, setStatus] = useState({ kind: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ kind: "", message: "" });
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const enquiry = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn't send your enquiry. Please try again.");
      form.reset();
      setStatus({ kind: "success", message: result.message });
    } catch (error) {
      setStatus({ kind: "error", message: error.message || "Unable to connect. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container admission section-space" id="admission">
      <div className="admission-copy">
        <SectionHeading label="Admissions" title="Let's start a conversation" description="Ask about admission, fees, scholarships, or a campus visit. Our admissions office replies within two working days." />
        <h3 className="admission-steps-title">How admission works</h3>
        <ol className="admission-steps">
          <li><span>1</span><p><strong>Send an enquiry</strong> with the grade you are applying for.</p></li>
          <li><span>2</span><p><strong>Visit the campus</strong> and meet the class teacher.</p></li>
          <li><span>3</span><p><strong>Entrance assessment</strong> for Grade 1 and above.</p></li>
          <li><span>4</span><p><strong>Confirm your seat</strong> by submitting documents and the admission fee.</p></li>
        </ol>
      </div>
      <form className="card admission-form" onSubmit={handleSubmit}>
        <h3>Send an enquiry</h3>
        <p className="form-intro">Fill in your details and our team will be in touch.</p>
        <label htmlFor="studentName">Student's name</label>
        <input id="studentName" name="studentName" autoComplete="name" maxLength="120" required />
        <div className="form-row">
          <div>
            <label htmlFor="grade">Applying for</label>
            <select id="grade" name="grade" defaultValue="" required disabled={programsLoading || programs.length === 0}>
              <option value="" disabled>{programsLoading ? "Loading programs…" : "Select a program"}</option>
              {programs.map(({ _id, grades }) => <option key={_id} value={grades}>{grades}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength="40" required />
          </div>
        </div>
        <label htmlFor="topic">Enquiry about</label>
        <select id="topic" name="topic" defaultValue="Admission">
          {["Admission", "Fees and scholarships", "School transport", "Campus visit", "Something else"].map((topic) => <option key={topic}>{topic}</option>)}
        </select>
        <label htmlFor="email">Parent's email</label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength="254" required />
        <label htmlFor="message">Message <span className="optional">(optional)</span></label>
        <textarea id="message" name="message" rows="3" maxLength="2000" />
        <button className="button form-submit" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send enquiry"}
        </button>
        {status.message && <p className={`form-status ${status.kind}`} role="status">{status.message}</p>}
      </form>
    </section>
  );
}

function Contact({ contact = defaultContact }) {
  return (
    <section className="section-tint section-space" id="contact">
      <div className="container">
        <SectionHeading label="Contact" title="Find us and reach the right office" description="Our team is happy to help with questions about school life and admissions." />
        <div className="contact-grid">
          <div className="card contact-card">
            <dl>
              <div><dt>Address</dt><dd>{contact.address}</dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${contact.phone}`}>{contact.phone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
              <div><dt>Office hours</dt><dd>{contact.officeHours.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</dd></div>
            </dl>
          </div>
          <div className="contact-highlight">
            <span aria-hidden="true">⌖</span>
            <div><p>{contact.campusName}</p><small>{contact.campusDescription}</small></div>
            <span className="contact-pin" aria-hidden="true">●</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ contact = defaultContact }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><a className="footer-brand" href="#home">Bright Future Academy</a><p>Nurturing curious minds and confident leaders since 1998.</p></div>
        <div><h2>Quick links</h2><ul>{[["About", "about"], ["Programs", "programs"], ["News", "news"], ["Admissions", "admission"], ["Contact", "contact"]].map(([label, id]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}<li><a href="/admin">Admin panel</a></li></ul></div>
        <div><h2>Contact</h2><p>{contact.address.split(",").slice(-2).join(",").trim()}<br /><a href={`tel:${contact.phone}`}>{contact.phone}</a><br /><a href={`mailto:${contact.email}`}>{contact.email}</a></p></div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Bright Future Academy. All rights reserved.</div>
    </footer>
  );
}

function SchoolWebsite() {
  const [content, setContent] = useState({
    programs: [],
    facilities: [],
    gallery: [],
    news: [],
    contact: defaultContact,
    programsLoading: true,
    facilitiesLoading: true,
    galleryLoading: true,
    newsLoading: true,
    programsError: "",
    facilitiesError: "",
    galleryError: "",
    newsError: "",
  });
  const [contentRevision, setContentRevision] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadContent(endpoint, key) {
      try {
        const response = await fetch(endpoint);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load school information.");
        if (!Array.isArray(result.items)) throw new Error("The school information response was invalid.");
        if (active) {
          setContent((current) => ({
            ...current,
            [key]: result.items,
            [`${key}Error`]: "",
            [`${key}Loading`]: false,
          }));
        }
      } catch (error) {
        if (active) {
          setContent((current) => ({
            ...current,
            [`${key}Error`]: error.message || "Unable to connect. Please try again.",
            [`${key}Loading`]: false,
          }));
        }
      }
    }

    loadContent("/api/programs", "programs");
    loadContent("/api/facilities", "facilities");
    loadContent("/api/gallery", "gallery");
    loadContent("/api/news", "news");
    async function loadContact() {
      try {
        const response = await fetch("/api/contact");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load contact information.");
        if (active) setContent((current) => ({ ...current, contact: result.contact }));
      } catch {
        if (active) setContent((current) => ({ ...current, contact: defaultContact }));
      }
    }
    loadContact();
    return () => { active = false; };
  }, [contentRevision]);

  function retryContent() {
    setContent((current) => ({
      ...current,
      programsLoading: true,
      facilitiesLoading: true,
      galleryLoading: true,
      newsLoading: true,
      programsError: "",
      facilitiesError: "",
      galleryError: "",
      newsError: "",
    }));
    setContentRevision((revision) => revision + 1);
  }

  return (
    <>
      <Header contact={content.contact} />
      <main>
        <Hero />
        <About />
        <Programs
          programs={content.programs}
          loading={content.programsLoading}
          error={content.programsError}
          onRetry={retryContent}
        />
        <Facilities
          facilities={content.facilities}
          loading={content.facilitiesLoading}
          error={content.facilitiesError}
          onRetry={retryContent}
        />
        <Faculty />
        <News items={content.news} />
        <Gallery items={content.gallery} />
        <Admission programs={content.programs} programsLoading={content.programsLoading} />
        <Contact contact={content.contact} />
      </main>
      <Footer contact={content.contact} />
    </>
  );
}

export default function App() {
  if (window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")) {
    return <Admin />;
  }
  return <SchoolWebsite />;
}
