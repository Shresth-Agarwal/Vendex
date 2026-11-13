import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

type AppHeaderProps = {
  brand: string;
  links: Array<{ label: string; to: string }>;
  searchPlaceholder?: string;
  actions?: ReactNode;
  compact?: boolean;
};

export function AppHeader({ brand, links, searchPlaceholder, actions, compact = false }: AppHeaderProps) {
  return (
    <header className="top-nav">
      <div className={`surface-shell flex items-center justify-between ${compact ? 'h-16' : 'py-4'}`}>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-black tracking-tighter text-[#003d4c]">
            {brand}
          </Link>
          {searchPlaceholder ? (
            <div className="relative hidden w-64 items-center md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#71787c]">search</span>
              <input className="input-field pl-9" placeholder={searchPlaceholder} />
            </div>
          ) : null}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>
    </header>
  );
}
