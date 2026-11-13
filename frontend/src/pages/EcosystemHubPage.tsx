import { MarketingLayout } from '@/layouts/MarketingLayout';
import { ecosystemNodes } from '@/data/vendexContent';

export function EcosystemHubPage() {
  return (
    <MarketingLayout compactHeader showFooter>
      <section className="surface-shell relative flex items-center justify-center overflow-hidden py-16">
        <div className="relative flex h-[620px] w-full max-w-6xl items-center justify-center">
          <div className="absolute z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-center">
            <span className="text-3xl font-bold tracking-tight text-[#003d4c]">Vendex</span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#656464]">Core Platform</span>
          </div>

          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-50" viewBox="0 0 1000 600">
            <line x1="250" y1="120" x2="500" y2="300" stroke="#c0c8cb" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="750" y1="120" x2="500" y2="300" stroke="#c0c8cb" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="500" y1="500" x2="500" y2="300" stroke="#c0c8cb" strokeDasharray="4 4" strokeWidth="1" />
          </svg>

          {ecosystemNodes.map((node, index) => {
            const Icon = node.icon;
            const positionClass =
              index === 0
                ? 'top-[10%] left-[15%]'
                : index === 1
                  ? 'top-[10%] right-[15%]'
                  : 'bottom-[10%] left-1/2 -translate-x-1/2';

            return (
              <button
                key={node.label}
                className={`absolute ${positionClass} z-20 flex h-32 w-32 flex-col items-center justify-center rounded-full border bg-surface-container-lowest text-center transition-transform hover:scale-105 ${
                  node.active ? 'border-[#121212]' : 'border-outline-variant opacity-70 hover:opacity-100'
                }`}
              >
                <Icon className="mb-1 text-2xl text-[#003d4c]" />
                <span className="text-sm font-semibold text-[#1b1c1c]">{node.label}</span>
              </button>
            );
          })}

          <aside className="absolute right-0 top-0 z-40 flex h-full w-full max-w-md flex-col justify-center border-l border-outline-variant bg-surface-container-lowest p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-[#1b1c1c]">Consumer Tools</h2>
              <p className="mt-3 text-base leading-7 text-[#41484b]">
                Streamline purchasing with intelligent interfaces designed for clarity and speed.
              </p>
            </div>
            <div className="space-y-4">
              <div className="border-l-2 border-[#121212] bg-surface-container-low p-4">
                <h3 className="text-lg font-semibold text-[#1b1c1c]">AI Intent Builder</h3>
                <p className="mt-1 text-sm text-[#656464]">Natural language translates user needs into precise product queries.</p>
              </div>
              <div className="border-l-2 border-outline-variant p-4">
                <h3 className="text-lg font-semibold text-[#1b1c1c]">Smart Recommendations</h3>
                <p className="mt-1 text-sm text-[#656464]">Context-aware suggestions based on supply-chain availability.</p>
              </div>
              <div className="border-l-2 border-outline-variant p-4">
                <h3 className="text-lg font-semibold text-[#1b1c1c]">Simple Checkout</h3>
                <p className="mt-1 text-sm text-[#656464]">Frictionless transactional flows optimized for minimal cognitive load.</p>
              </div>
            </div>
            <button className="btn-primary mt-8 self-start px-6 py-3">Explore Consumer View</button>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  );
}
