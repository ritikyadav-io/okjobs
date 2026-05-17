import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            The AI Career Operating System. Discover, apply, and land roles faster.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { to: "/", label: "Home" },
          { to: "/signup", label: "Get started" },
          { to: "/login", label: "Log in" },
        ]} />
        <FooterCol title="Company" links={[
          { to: "/about", label: "About" },
          { to: "/blog", label: "Blog" },
        ]} />
        <FooterCol title="Legal" links={[
          { to: "/privacy", label: "Privacy" },
          { to: "/terms", label: "Terms" },
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Zenith. All rights reserved.</div>
          <div>Reach Your Zenith.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-sm font-bold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-foreground">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
