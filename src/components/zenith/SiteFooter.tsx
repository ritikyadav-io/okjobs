import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { SunsetStripe } from "./SunsetStripe";

export function SiteFooter() {
  return (
    <>
      <SunsetStripe />
      <footer className="bg-cream text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-700">
              A quiet, editorial career operating system. Discover roles, tailor resumes, and
              track every conversation — in one place.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { to: "/", label: "Home" },
            { to: "/dashboard", label: "Open the app" },
            { to: "/blog", label: "Blog" },
          ]} />
          <FooterCol title="Company" links={[
            { to: "/about", label: "About" },
            { to: "/blog", label: "Writings" },
          ]} />
          <FooterCol title="Legal" links={[
            { to: "/privacy", label: "Privacy" },
            { to: "/terms", label: "Terms" },
          ]} />
        </div>
        <div className="border-t border-[hsl(var(--beige-deep))]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-slate-700 sm:flex-row">
            <div>© {new Date().getFullYear()} OkJobs. Reach your OkJobs.</div>
            <div className="font-display text-sm">Frontier career OS. In your hands.</div>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-[hsl(var(--primary))] hover:underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
