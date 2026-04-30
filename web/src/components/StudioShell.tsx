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
          <Link className="mf-icon-btn" href="/settings" aria-label="Configurações" title="Configurações">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a8 8 0 0 0 .1-1.2v-1.6l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-2.1-1.2L14.7 4H9.3L9 7.1a7.4 7.4 0 0 0-2.1 1.2l-2.4-1-2 3.4 2 1.5v1.6a8 8 0 0 0 .1 1.2l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 2.1 1.2l.3 3.1h5.4l.3-3.1a7.4 7.4 0 0 0 2.1-1.2l2.4 1 2-3.4-2.2-1.5Z" />
            </svg>
          </Link>
          <button className="mf-user-btn" onClick={onLogout} type="button" aria-label="Sair da conta" title="Sair da conta">
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
};

export function ProjectSideNav({ projectTitle, active, projectId }: ProjectSideNavProps) {
  const shortTitle = projectTitle || "Project Alpha";

  return (
    <aside className="mf-sidebar">
      <div className="mf-sidebar-portrait" />
      <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "18px 0 26px" }}>
        <strong style={{ color: "#fff", lineHeight: 1.1 }}>{shortTitle}</strong>
        <span style={{ color: "#8f9bb4", fontSize: "12px", textTransform: "uppercase" }}>Act I</span>
      </div>
      <nav style={{ display: "grid", gap: "6px" }}>
        <Link className={`mf-side-item ${active === "home" ? "active" : ""}`} href="/projects">
          ▦ Home
        </Link>
        <Link className={`mf-side-item ${active === "briefing" ? "active" : ""}`} href={`/projects/${projectId}/briefing`}>
          ▣ Briefing
        </Link>
        <Link className={`mf-side-item ${active === "story" ? "active" : ""}`} href={`/projects/${projectId}/story`}>
          ▤ Story
        </Link>
        <Link className={`mf-side-item ${active === "gallery" ? "active" : ""}`} href={`/projects/${projectId}/image-prompts`}>
          ▧ Gallery
        </Link>
        <Link className={`mf-side-item ${active === "timeline" ? "active" : ""}`} href={`/projects/${projectId}/scenes`}>
          ⌁ Timeline
        </Link>
        <Link className={`mf-side-item ${active === "assets" ? "active" : ""}`} href={`/projects/${projectId}/video-prompts`}>
          ▵ Assets
        </Link>
      </nav>
      <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link className="mf-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center" }} href={`/projects/${projectId}/scenes`}>
          + New Chapter
        </Link>
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
