import { useState, useEffect } from 'react';
import { FiBell, FiBarChart2, FiBox, FiPackage, FiSettings, FiTruck } from 'react-icons/fi';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { inventoryRows as initialInventory, storeOwnerMetrics as initialMetrics } from '@/data/vendexContent';
import { catalogService, operationsService } from '@/services/api';

export function StoreOwnerCommandCenterPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [inventory, setInventory] = useState(initialInventory);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // API Placeholder: Fetch metrics
    operationsService.listMetrics?.()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // In a real app, map backend response to metric format
        }
      })
      .catch((err) => console.log('Using fallback metrics', err.message));

    // API Placeholder: Fetch inventory
    catalogService.listInventory()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // Map backend response
        }
      })
      .catch((err) => console.log('Using fallback inventory', err.message));
  }, []);

  const handleAction = (actionName: string) => {
    setIsProcessing(true);
    // API Placeholder: Perform action
    setTimeout(() => {
      setIsProcessing(false);
      alert(`${actionName} triggered! (Backend integration pending)`);
    }, 800);
  };

  return (
    <DashboardLayout
      title="Overview"
      subtitle="Global supply-chain operations at a glance."
      topNavLinks={[
        { label: 'Overview', to: '/store-owner' },
        { label: 'Inventory', to: '/store-owner' },
        { label: 'Analytics', to: '/manufacturer' },
        { label: 'Discover', to: '/store-owner/discovery' },
      ]}
      sidebarTitle="Command Center"
      sidebarSubtitle="Global Supply Chain"
      sidebarPrimaryAction={{ label: 'Manual Control Panel', icon: 'settings_suggest' }}
      sidebarTopItems={[
        { label: 'Overview', to: '/store-owner', icon: FiBarChart2 },
        { label: 'Inventory', to: '/store-owner', icon: FiPackage },
        { label: 'Stock Health', to: '/store-owner', icon: FiBox },
        { label: 'Shipments', to: '/manufacturer', icon: FiTruck },
        { label: 'Analytics', to: '/manufacturer', icon: FiBarChart2 },
      ]}
      sidebarBottomItems={[
        { label: 'Help Center', to: '/login', icon: FiBell },
        { label: 'Log Out', to: '/', icon: FiSettings },
      ]}
      actions={
        <>
          <button className="btn-ghost p-2">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="btn-ghost p-2">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="h-8 w-8 overflow-hidden border border-outline-variant bg-surface-container-high">
            <img
              alt="Store Owner Avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABn5LgqHe8k__RMnDY_Q14mteqFi-DiC5f-PY3zyfbTfBKkNonnaOFvU5dDWGwEgAHqOHPCQJQQ2zEtlJD-eYRJMJSu9y3SoDB7VVlUKPn3_Hil0kHmpg9WF274OXkMmiNLL7L95179o-MwOOd8nmzy5c6WGibvUCrt9S_KlPEuqqccKU8FF2BR8bayjTBIc5smNfHsPzUMFgEMxvLeIgtoU02sZMvxAqEljoeBObDruin59gDpPymRncV0-xbs1QsG8n7ooq9tKPr"
              className="h-full w-full object-cover"
            />
          </div>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="muted-label">{metric.label}</span>
              <metric.icon className="text-[#003d4c]" />
            </div>
            <div className="mt-2 text-4xl font-bold text-[#1b1c1c]">{metric.value}</div>
            <p className="mt-1 text-sm text-[#656464]">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 page-card">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
          <h3 className="section-heading">Inventory Matrix</h3>
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
        </div>
        <DataTable
          columns={[
            { key: 'product', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'stock', label: 'Current Stock', align: 'right', render: (row) => `${row.stock} units` },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <span className={`chip ${row.status === 'In Stock' ? 'chip-success' : row.status === 'Low Stock' ? 'chip-danger' : 'chip-warning'}`}>{row.status}</span>,
            },
            {
              key: 'action',
              label: 'Quick Actions',
              align: 'right',
              render: (row) => (
                <button 
                  className={row.status === 'Low Stock' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => handleAction(row.action as string)}
                >
                  {row.action}
                </button>
              ),
            },
          ]}
          rows={inventory}
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="page-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="section-heading">Operational Alerts</h3>
            <span className="chip chip-danger">2 active</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="border-l-2 border-error bg-error/5 p-4 text-sm text-[#41484b]">Premium Espresso Beans are below threshold.</div>
            <div className="border-l-2 border-[#121212] bg-surface-container-low p-4 text-sm text-[#41484b]">Shipment ETA updated for the east warehouse.</div>
          </div>
        </div>
        <aside className="page-card p-6">
          <h3 className="section-heading">Manual Control</h3>
          <p className="mt-2 text-sm text-[#656464]">Backend actions are pending integration.</p>
          <button 
            className="btn-primary mt-6 w-full"
            onClick={() => handleAction('Approve')}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          <button 
            className="btn-secondary mt-3 w-full"
            onClick={() => handleAction('Instant Restock')}
            disabled={isProcessing}
          >
            Instant Restock
          </button>
        </aside>
      </section>
    </DashboardLayout>
  );
}
