import Link from "next/link";
import { ReactNode } from "react";

type StudioShellProps = {
  active?: "dashboard" | "projects" | "library" | "scenes";
  children: ReactNode;
  onLogout?: () => void;
};

export function StudioShell({ active = "dashboard", children, onLogout }: StudioShellProps) {
  return (
    <main className="mf-shell">
      <nav className="mf-topnav">
        <Link href="/" className="mf-brand">
          MythosForge
        </Link>
        <div className="mf-navlinks">
          <Link className={active === "dashboard" ? "active" : ""} href="/">
            Dashboard
          </Link>
          <Link className={active === "projects" ? "active" : ""} href="/projects">
            Projects
          </Link>
          <Link className={active === "library" ? "active" : ""} href="/projects">
            Library
          </Link>
          <Link className={active === "scenes" ? "active" : ""} href="/projects">
            Scenes
          </Link>
        </div>
        <div className="mf-nav-actions">
          <div className="mf-search-wrap">
            <svg className="mf-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input className="mf-search-input" type="search" placeholder="Search scenes..." />
          </div>
          <button className="mf-icon-btn" type="button" aria-label="Notificações">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <Link className="mf-icon-btn" href="/settings" aria-label="Configurações">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a8 8 0 0 0 .1-1.2v-1.6l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-2.1-1.2L14.7 4H9.3L9 7.1a7.4 7.4 0 0 0-2.1 1.2l-2.4-1-2 3.4 2 1.5v1.6a8 8 0 0 0 .1 1.2l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 2.1 1.2l.3 3.1h5.4l.3-3.1a7.4 7.4 0 0 0 2.1-1.2l2.4 1 2-3.4-2.2-1.5Z" />
            </svg>
          </Link>
          <button className="mf-user-btn" onClick={onLogout} type="button" aria-label="Sair da conta">
            <span>MS</span>
            Sair
          </button>
        </div>
      </nav>
      {children}
    </main>
  );
}

type ProjectSideNavProps = {
  projectTitle?: string;
  active: "briefing" | "story" | "gallery" | "timeline" | "assets" | "home";
  projectId: string;
  portraitSrc?: string;
};

export function ProjectSideNav({ projectTitle, active, projectId, portraitSrc }: ProjectSideNavProps) {
  const shortTitle = projectTitle || "Project Alpha";

  return (
    <aside className="mf-sidebar">
      <div className="mf-project-header">
        <div className="mf-project-icon">
          {portraitSrc ? (
            <img src={portraitSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </div>
        <div className="mf-project-meta">
          <strong className="mf-project-title">{shortTitle}</strong>
          <span className="mf-project-act">ACT I: THE DESCENT</span>
        </div>
      </div>

      <Link
        className="mf-primary mf-new-chapter-btn"
        href={`/projects/${projectId}/scenes`}
      >
        + New Chapter
      </Link>

      <nav className="mf-sidebar-nav">
        <Link className={`mf-side-item ${active === "home" ? "active" : ""}`} href="/projects">
          <svg className="mf-side-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          Home
        </Link>
        <Link className={`mf-side-item ${active === "briefing" ? "active" : ""}`} href={`/projects/${projectId}/briefing`}>
          <svg className="mf-side-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
          Briefing
        </Link>
        <Link className={`mf-side-item ${active === "story" ? "active" : ""}`} href={`/projects/${projectId}/story`}>
          <svg className="mf-side-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          Story
        </Link>
        <Link className={`mf-side-item ${active === "gallery" ? "active" : ""}`} href={`/projects/${projectId}/image-prompts`}>
          <svg className="mf-side-icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M2 15l5-5 4 4 3-3 8 8" /><circle cx="8.5" cy="8.5" r="1.5" /></svg>
          Gallery
        </Link>
        <Link className={`mf-side-item ${active === "timeline" ? "active" : ""}`} href={`/projects/${projectId}/scenes`}>
          <svg className="mf-side-icon" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          Timeline
        </Link>
        <Link className={`mf-side-item ${active === "assets" ? "active" : ""}`} href={`/projects/${projectId}/video-prompts`}>
          <svg className="mf-side-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="13" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><line x1="12" y1="13" x2="5" y2="16" /><line x1="12" y1="13" x2="19" y2="16" /></svg>
          Assets
        </Link>
      </nav>

      <div className="mf-storage-widget">
        <span className="mf-storage-label">STORAGE</span>
        <div className="mf-storage-bar">
          <div className="mf-storage-fill" style={{ width: "62%" }} />
        </div>
        <span className="mf-storage-text">12.4 GB of 20 GB used</span>
      </div>
    </aside>
  );
}

export function StudioFooter() {
  return (
    <footer className="mf-footer">
      <div style={{ display: "flex", justifyContent: "center", gap: "34px", flexWrap: "wrap", marginBottom: "34px" }}>
        <span>Documentation</span>
        <span>Community</span>
        <span>Privacy</span>
        <span>Support</span>
      </div>
      <strong style={{ color: "#fff", display: "block", marginBottom: "18px" }}>MythosForge</strong>
      <span>© 2026 MythosForge AI Toolset. Crafted for visionaries.</span>
    </footer>
  );
}
