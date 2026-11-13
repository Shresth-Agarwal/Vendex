import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import { AppHeader } from '@/components/AppHeader';
import { marketingNav } from '@/data/vendexContent';

type MarketingLayoutProps = {
  children: ReactNode;
  compactHeader?: boolean;
  showFooter?: boolean;
  showLoginAction?: boolean;
};

export function MarketingLayout({
  children,
  compactHeader = false,
  showFooter = true,
  showLoginAction = true,
}: MarketingLayoutProps) {
  return (
    <div className="page-stack">
      <AppHeader
        brand="Vendex"
        links={marketingNav}
        compact={compactHeader}
        actions={
          <>
            {showLoginAction ? (
              <Link className="btn-secondary hidden md:inline-flex" to="/login">
                <FiLogIn /> Login
              </Link>
            ) : null}
            <Link className="btn-primary" to="/consumer">
              Portal Access
            </Link>
          </>
        }
      />
      <main>{children}</main>
      {showFooter ? (
        <footer className="border-t border-outline-variant bg-surface-container-lowest">
          <div className="surface-shell flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
            <p className="text-sm font-semibold text-[#003d4c]">© 2024 Vendex Global Supply Chain. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#656464]">
              <Link to="/">Privacy Policy</Link>
              <Link to="/">Terms of Service</Link>
              <Link to="/">Security</Link>
              <Link to="/">Status</Link>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
