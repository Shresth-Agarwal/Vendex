import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, action, children, className = '' }: SectionCardProps) {
  return (
    <section className={`page-card ${className}`}>
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
        <h3 className="section-heading text-lg">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
