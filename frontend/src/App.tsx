import React from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { InventoryAgentView } from './views/InventoryAgentView';
import { CustomerIntentView } from './views/CustomerIntentView';
import { RosterView } from './views/RosterView';
import { OperationsView } from './views/OperationsView';
import { AuthAndAdminView } from './views/AuthAndAdminView';

const navItems = [
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/customer', label: 'Customer Support', icon: '💬' },
  { path: '/roster', label: 'Staff Schedule', icon: '🧑‍💼' },
  { path: '/operations', label: 'Operations', icon: '🧮' },
  { path: '/admin', label: 'Settings', icon: '🛡️' }
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-logo">
        <div className="logo-mark" />
        <div className="logo-text">
          <span className="logo-title">Vendex</span>
          <span className="logo-subtitle">AI Retail Copilot</span>
        </div>
      </div>
      <nav className="app-nav" aria-label="Main sections">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              type="button"
              className={`nav-pill${active ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

const App: React.FC = () => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<InventoryAgentView />} />
          <Route path="/customer" element={<CustomerIntentView />} />
          <Route path="/roster" element={<RosterView />} />
          <Route path="/operations" element={<OperationsView />} />
          <Route path="/admin" element={<AuthAndAdminView />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

