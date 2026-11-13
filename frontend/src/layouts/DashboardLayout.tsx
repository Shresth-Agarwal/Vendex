import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { SidebarNav } from '@/components/SidebarNav';
import type { IconType } from 'react-icons';

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  topNavLinks: Array<{ label: string; to: string }>;
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarTopItems: Array<{ label: string; to: string; icon: IconType }>;
  sidebarBottomItems?: Array<{ label: string; to: string; icon: IconType }>;
  sidebarPrimaryAction?: { label: string; icon?: string };
  actions?: ReactNode;
};

export function DashboardLayout({
  children,
  title,
  subtitle,
  topNavLinks,
  sidebarTitle,
  sidebarSubtitle,
  sidebarTopItems,
  sidebarBottomItems,
  sidebarPrimaryAction,
  actions,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface text-[#1b1c1c]">
      <AppHeader brand="Vendex" links={topNavLinks} searchPlaceholder="Search..." actions={actions} compact />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <SidebarNav
          title={sidebarTitle}
          subtitle={sidebarSubtitle}
          topItems={sidebarTopItems}
          bottomItems={sidebarBottomItems}
          primaryAction={sidebarPrimaryAction}
        />
        <main className="min-w-0 flex-1">
          <div className="surface-shell py-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-[#1b1c1c]">{title}</h1>
              <p className="mt-2 text-lg text-[#41484b]">{subtitle}</p>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
