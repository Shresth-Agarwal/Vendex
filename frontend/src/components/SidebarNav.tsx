import { NavLink } from 'react-router-dom';
import type { IconType } from 'react-icons';

type SidebarNavProps = {
  title: string;
  subtitle: string;
  primaryAction?: { label: string; icon?: string; onClick?: () => void };
  topItems: Array<{ label: string; to: string; icon: IconType }>;
  bottomItems?: Array<{ label: string; to: string; icon: IconType }>;
};

export function SidebarNav({ title, subtitle, primaryAction, topItems, bottomItems = [] }: SidebarNavProps) {
  return (
    <aside className="hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-outline-variant bg-surface-container-lowest p-4 md:flex md:flex-col">
      <div className="mb-8 px-2">
        <h2 className="text-lg font-black tracking-tight text-[#003d4c]">{title}</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#656464]">{subtitle}</p>
      </div>

      {primaryAction ? (
        <button className="btn-primary mb-4 w-full justify-center">
          {primaryAction.icon ? <span className="material-symbols-outlined text-[18px]">{primaryAction.icon}</span> : null}
          {primaryAction.label}
        </button>
      ) : null}

      <nav className="flex flex-1 flex-col gap-1">
        {topItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <item.icon className="text-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {bottomItems.length ? (
        <div className="mt-auto border-t border-outline-variant pt-4">
          <nav className="flex flex-col gap-1">
            {bottomItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <item.icon className="text-[18px]" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}
    </aside>
  );
}
