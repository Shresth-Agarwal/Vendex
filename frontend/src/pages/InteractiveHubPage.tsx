import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { FiPackage, FiShoppingBag, FiUsers } from 'react-icons/fi';

const nodes = [
  { label: 'Consumers', icon: FiShoppingBag, active: true },
  { label: 'Store Owners', icon: FiUsers, active: false },
  { label: 'Manufacturers', icon: FiPackage, active: false },
];

export function InteractiveHubPage() {
  return (
    <MarketingLayout compactHeader>
      <section className="surface-shell flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center py-16">
        <div className="relative flex h-[600px] w-full max-w-5xl items-center justify-center overflow-hidden">
          <div className="absolute z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-center">
            <span className="text-2xl font-bold tracking-tight text-[#003d4c]">Vendex</span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#656464]">Core Platform</span>
          </div>
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const classes =
              index === 0
                ? 'top-[10%] left-[15%]'
                : index === 1
                  ? 'top-[10%] right-[15%]'
                  : 'bottom-[10%] left-1/2 -translate-x-1/2';
            return (
              <button
                key={node.label}
                className={`absolute ${classes} z-20 flex h-32 w-32 flex-col items-center justify-center rounded-full border text-center transition-transform hover:scale-105 ${
                  node.active ? 'border-[#121212] bg-surface-container-low' : 'border-outline-variant bg-white opacity-70 hover:opacity-100'
                }`}
              >
                <Icon className="mb-1 text-2xl text-[#003d4c]" />
                <span className="text-sm font-semibold text-[#1b1c1c]">{node.label}</span>
              </button>
            );
          })}
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-outline-variant bg-surface-container-lowest p-8">
            <div className="flex h-full flex-col justify-center">
              <p className="muted-label">Consumer Experience</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b1c1c]">The Unified Commerce Ecosystem</h2>
              <p className="mt-4 text-base leading-7 text-[#41484b]">
                The hub makes the relationship between shoppers, stores, and manufacturers feel explicit and easy to navigate.
              </p>
              <Link to="/consumer" className="btn-primary mt-8 self-start px-6 py-3">
                Get Started
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  );
}
