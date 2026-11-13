import { FiBell, FiHelpCircle, FiLogOut, FiPackage, FiSearch, FiSettings } from 'react-icons/fi';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ManufacturerCard } from '@/components/ManufacturerCard';
import { manufacturerCards, manufacturerDiscoveryFilters } from '@/data/vendexContent';

export function ManufacturerDiscoveryPage() {
  return (
    <DashboardLayout
      title="Manufacturer Discovery"
      subtitle="Search, compare, and route supplier requests through a focused discovery workspace."
      topNavLinks={[
        { label: 'Overview', to: '/store-owner' },
        { label: 'Inventory', to: '/store-owner' },
        { label: 'Discover', to: '/store-owner/discovery' },
        { label: 'Analytics', to: '/manufacturer' },
      ]}
      sidebarTitle="Supply Chain"
      sidebarSubtitle="Global Operations"
      sidebarPrimaryAction={{ label: 'Search Network', icon: 'search' }}
      sidebarTopItems={[
        { label: 'Overview', to: '/store-owner', icon: FiPackage },
        { label: 'Manufacturer Discovery', to: '/store-owner/discovery', icon: FiPackage },
      ]}
      sidebarBottomItems={[
        { label: 'Support', to: '/login', icon: FiHelpCircle },
        { label: 'Log Out', to: '/', icon: FiLogOut },
      ]}
      actions={
        <>
          <button className="btn-ghost p-2">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="btn-ghost p-2">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="page-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="section-heading">Filters</h3>
            <button className="text-sm font-semibold text-[#003d4c]">Reset</button>
          </div>
          <div className="mt-6 space-y-6">
            <div>
              <p className="muted-label mb-3">Product Category</p>
              <div className="space-y-2">
                {manufacturerDiscoveryFilters.map((filter, index) => (
                  <label key={filter} className="flex items-center gap-3 rounded-sm px-2 py-1 transition-colors hover:bg-surface-container-low">
                    <input type="checkbox" defaultChecked={index === 0} />
                    <span className="text-sm text-[#1b1c1c]">{filter}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="muted-label mb-3">Location</p>
              <div className="space-y-2">
                {['Midwest', 'West Coast', 'South', 'Northeast'].map((item, index) => (
                  <label key={item} className="flex items-center gap-3 rounded-sm px-2 py-1 transition-colors hover:bg-surface-container-low">
                    <input type="checkbox" defaultChecked={index < 2} />
                    <span className="text-sm text-[#1b1c1c]">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="page-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="section-heading">Discovery Network</h3>
                <p className="mt-1 text-sm text-[#656464]">A clean vendor directory with compare-first decisions.</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary">
                  <span className="material-symbols-outlined text-sm">search</span>
                  Search
                </button>
                <button className="btn-secondary">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filter
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 border border-outline-variant bg-surface-container-lowest p-1">
              <input className="input-field border-none bg-transparent" placeholder="Search by manufacturer, product, or location..." />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {manufacturerCards.map((card) => (
              <ManufacturerCard key={card.name} {...card} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
