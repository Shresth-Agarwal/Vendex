import { FiBell, FiPackage, FiSettings, FiShoppingCart, FiTruck } from 'react-icons/fi';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { pipelineColumns } from '@/data/vendexContent';

type InventoryRow = {
  product: string;
  sku: string;
  stock: number;
  status: string;
  action: string;
};

const rows: InventoryRow[] = [
  { product: 'Artisan Sourdough Mix', sku: 'VNDX-SDM-01', stock: 450, status: 'In Stock', action: 'Approve' },
  { product: 'Premium Espresso Beans', sku: 'VNDX-ESB-04', stock: 12, status: 'Low Stock', action: 'Restock' },
  { product: 'Glass Storage Jars', sku: 'VNDX-GSJ-12', stock: 88, status: 'Reorder Soon', action: 'Review' },
];

export function ManufacturerPipelinePage() {
  return (
    <DashboardLayout
      title="Pipeline"
      subtitle="Current operational status across all nodes."
      topNavLinks={[
        { label: 'Overview', to: '/manufacturer' },
        { label: 'Inventory', to: '/store-owner' },
        { label: 'Orders', to: '/consumer' },
        { label: 'Contracts', to: '/manufacturer' },
      ]}
      sidebarTitle="Vendex"
      sidebarSubtitle="B2B Fulfillment"
      sidebarPrimaryAction={{ label: 'New Order', icon: 'add' }}
      sidebarTopItems={[
        { label: 'Pipeline', to: '/manufacturer', icon: FiShoppingCart },
        { label: 'Inventory', to: '/store-owner', icon: FiPackage },
        { label: 'Orders', to: '/manufacturer', icon: FiTruck },
        { label: 'Contracts', to: '/manufacturer', icon: FiSettings },
      ]}
      sidebarBottomItems={[
        { label: 'Help Center', to: '/login', icon: FiBell },
        { label: 'Log Out', to: '/', icon: FiSettings },
      ]}
      actions={
        <>
          <button className="btn-ghost p-2">
            <span className="material-symbols-outlined">send</span>
          </button>
          <div className="h-8 w-8 overflow-hidden border border-outline-variant bg-surface-container-high">
            <img
              alt="Store owner"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABn5LgqHe8k__RMnDY_Q14mteqFi-DiC5f-PY3zyfbTfBKkNonnaOFvU5dDWGwEgAHqOHPCQJQQ2zEtlJD-eYRJMJSu9y3SoDB7VVlUKPn3_Hil0kHmpg9WF274OXkMmiNLL7L95179o-MwOOd8nmzy5c6WGibvUCrt9S_KlPEuqqccKU8FF2BR8bayjTBIc5smNfHsPzUMFgEMxvLeIgtoU02sZMvxAqEljoeBObDruin59gDpPymRncV0-xbs1QsG8n7ooq9tKPr"
              className="h-full w-full object-cover"
            />
          </div>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <div className="muted-label">Stock Health</div>
          <div className="mt-2 text-4xl font-bold text-[#1b1c1c]">94%</div>
          <p className="mt-1 text-sm text-[#656464]">Optimal across 8 locations</p>
        </div>
        <div className="stat-card">
          <div className="muted-label">Pending Deliveries</div>
          <div className="mt-2 text-4xl font-bold text-[#1b1c1c]">12</div>
          <p className="mt-1 text-sm text-[#656464]">Expected within 48h</p>
        </div>
        <div className="stat-card border-error">
          <div className="muted-label text-error">Critical Alerts</div>
          <div className="mt-2 text-4xl font-bold text-error">2</div>
          <p className="mt-1 text-sm text-error">Low stock items</p>
        </div>
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
              render: (row) => <button className={row.status === 'Low Stock' ? 'btn-primary' : 'btn-secondary'}>{row.action}</button>,
            },
          ]}
          rows={rows}
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {pipelineColumns.map((column) => (
          <div key={column.title} className="page-card p-4">
            <h3 className="section-heading">{column.title}</h3>
            <div className="mt-4 space-y-3">
              {column.cards.map((card) => (
                <div key={card} className="border-l-2 border-[#121212] bg-surface-container-low p-4 text-sm text-[#41484b]">
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </DashboardLayout>
  );
}
