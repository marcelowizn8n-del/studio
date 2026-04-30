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
          <button className="mf-icon-btn" type="button" aria-label="Notificações">
            ⌁
          </button>
          <button className="mf-icon-btn" type="button" aria-label="Configurações">
            ⚙
          </button>
          <button className="mf-avatar" onClick={onLogout} type="button" aria-label="Sair" />
        </div>
      </nav>
      {children}
    </main>
  );
}

type ProjectSideNavProps = {
  projectTitle?: string;
  active: "briefing" | "gallery" | "timeline" | "assets" | "home";
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
