import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { EcosystemHubPage } from '@/pages/EcosystemHubPage';
import { InteractiveHubPage } from '@/pages/InteractiveHubPage';
import { ConsumerMarketplacePage } from '@/pages/ConsumerMarketplacePage';
import { ManufacturerPipelinePage } from '@/pages/ManufacturerPipelinePage';
import { StoreOwnerCommandCenterPage } from '@/pages/StoreOwnerCommandCenterPage';
import { ManufacturerDiscoveryPage } from '@/pages/ManufacturerDiscoveryPage';
import { LoginPage } from '@/pages/LoginPage';
import { PrivateRoute } from '@/components/PrivateRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ecosystem-hub" element={<EcosystemHubPage />} />
      <Route path="/interactive-hub" element={<InteractiveHubPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/consumer" element={<ConsumerMarketplacePage />} />
        <Route path="/manufacturer" element={<ManufacturerPipelinePage />} />
        <Route path="/store-owner" element={<StoreOwnerCommandCenterPage />} />
        <Route path="/store-owner/discovery" element={<ManufacturerDiscoveryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
