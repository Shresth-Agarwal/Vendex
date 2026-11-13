import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { flowSteps, roleCards } from '@/data/vendexContent';

const accentMap: Record<string, string> = {
  blue: 'bg-[#003d4c] text-white',
  teal: 'bg-[#0f766e] text-white',
  slate: 'bg-[#1f2323] text-white',
  red: 'bg-[#b91c1c] text-white',
};

export function LandingPage() {
  return (
    <MarketingLayout>
      <section className="surface-shell flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-[#1b1c1c] md:text-6xl">
          Modernizing the Global Supply Chain.
        </h1>
        <p className="max-w-2xl text-lg text-[#5f5e5e] md:text-xl">
          Vendex connects manufacturers, store owners, and consumers through a unified platform designed for visibility and operational precision.
        </p>
        <div className="flex gap-3">
          <Link to="/consumer" className="btn-primary px-6 py-3">
            Portal Access
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3">
            Login
          </Link>
        </div>
      </section>

      <section className="border-y border-outline-variant bg-surface-container-low py-16">
        <div className="surface-shell space-y-8">
          <div className="text-center">
            <p className="muted-label">The Continuous Loop</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b1c1c]">How Vendex moves work across the network.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {flowSteps.map((step, index) => (
              <article key={step.title} className="page-card p-6">
                <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#003d4c]">0{index + 1}</div>
                <h3 className="text-xl font-semibold text-[#1b1c1c]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#656464]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-shell py-16">
        <div className="text-center">
          <p className="muted-label">Tailored Interfaces</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b1c1c]">Solutions for every role.</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((card) => (
            <Link key={card.title} to={card.to} className={`page-card p-6 transition-transform hover:-translate-y-1 ${accentMap[card.accent] || ''}`}>
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 opacity-90">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
