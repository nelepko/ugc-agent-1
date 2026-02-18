import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import "./page-home.css";

export default function HomePage() {
  return (
    <div className="page-home">
      <header className="header">
        <div className="container">
          <h1 className="logo">UGC Content Builder</h1>
          <p className="tagline">
            Create 20–30 second, conversion-focused UGC videos for your brand. Pick a template, add your copy, and generate in one click.
          </p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="section">
            <h2 className="section-title">Choose a template</h2>
            <p className="section-desc">
              {TEMPLATES.length} templates inspired by top-performing UGC in the industry. Each is built for ~20–30 second videos.
            </p>
            <div className="template-grid">
              {TEMPLATES.map((t) => (
                <Link key={t.id} href={`/create?template=${t.id}`} className="template-card card">
                  <span className="template-name">{t.name}</span>
                  <span className="template-desc">{t.description}</span>
                  <span className="template-meta">{t.duration}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>For marketing leaders and managers. Build UGC that converts.</p>
        </div>
      </footer>
    </div>
  );
}
