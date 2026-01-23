'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { InventoryTable } from '@/components/InventoryTable';
import { ManufacturerCard } from '@/components/ManufacturerCard';
import { productsApi, stockApi, manufacturersApi, purchaseOrderAiApi, purchaseOrdersApi, inventoryAgentApi } from '@/lib/api';
import { FiPackage, FiTrendingUp, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [showRequestSupply, setShowRequestSupply] = useState(false);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [recommendedManufacturer, setRecommendedManufacturer] = useState<any>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [forecasts, setForecasts] = useState<Map<string, any>>(new Map());
  const [manualSku, setManualSku] = useState('');
  const [manualForecast, setManualForecast] = useState<any>(null);
  const [loadingManualForecast, setLoadingManualForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Direct FastAPI input states
  const [directForecastInput, setDirectForecastInput] = useState('');
  const [directForecastResult, setDirectForecastResult] = useState<any>(null);
  const [loadingDirectForecast, setLoadingDirectForecast] = useState(false);
  
  const [directDecisionInput, setDirectDecisionInput] = useState({
    forecast: '',
    confidence: '',
    currentStock: '',
    unitCost: '',
  });
  const [directDecisionResult, setDirectDecisionResult] = useState<any>(null);
  const [loadingDirectDecision, setLoadingDirectDecision] = useState(false);
  
  const [directForecastDecideInput, setDirectForecastDecideInput] = useState({
    salesHistory: '',
    currentStock: '',
    unitCost: '',
  });
  const [directForecastDecideResult, setDirectForecastDecideResult] = useState<any>(null);
  const [loadingDirectForecastDecide, setLoadingDirectForecastDecide] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [isAuthenticated, user]);

  const loadInventory = async () => {
    setError(null);
    try {
      const productsData = await productsApi.getAll();
      
      const inventoryWithStock = await Promise.all(
        productsData.map(async (product: any) => {
          try {
            const stock = await stockApi.getBySku(product.sku);
            return {
              ...product,
              ...stock,
              productName: product.productName || product.name,
              unitCost: product.unitCost || 0,
            };
          } catch (error) {
            console.warn(`Could not load stock for ${product.sku}:`, error);
            return {
              ...product,
              sku: product.sku,
              onHand: 0,
              lastUpdated: new Date().toISOString(),
              productName: product.productName || product.name,
              unitCost: product.unitCost || 0,
            };
          }
        })
      );

      setInventory(inventoryWithStock);

      // Load forecasts for low stock items (with error handling)
      const lowStockItems = inventoryWithStock.filter((item: any) => item.onHand < 10);
      const forecastMap = new Map<string, any>();
      
      for (const item of lowStockItems.slice(0, 5)) {
        try {
          const forecast = await inventoryAgentApi.forecastAndDecide(item.sku);
          forecastMap.set(item.sku, forecast);
        } catch (error) {
          console.warn(`Could not get forecast for ${item.sku}:`, error);
          // Continue without this forecast
        }
      }
      
      setForecasts(forecastMap);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      setError(error?.message || 'Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (sku: string, onHand: number) => {
    try {
      await stockApi.update(sku, onHand);
      await loadInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const handleRequestSupply = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to request');
      return;
    }

    setLoadingRecommendation(true);
    try {
      // Get all manufacturers
      const allManufacturers = await manufacturersApi.getAll();
      
      // Get manufacturer products
      const manufacturersWithProducts = await Promise.all(
        allManufacturers.map(async (m: any) => {
          try {
            const products = await manufacturersApi.getProducts(m.id || m.manufacturerId);
            return { ...m, products };
          } catch {
            return { ...m, products: [] };
          }
        })
      );

      setManufacturers(manufacturersWithProducts);
      
      // Create a temporary purchase order to get recommendations
      // Note: In production, you'd create the PO first, then get recommendations
      // For now, we'll just show all manufacturers
      setShowRequestSupply(true);
    } catch (error) {
      console.error('Error getting manufacturers:', error);
      alert('Failed to load manufacturers');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleSelectManufacturer = async (manufacturer: any) => {
    try {
      // Create purchase order items
      const items = Array.from(selectedItems.entries()).map(([sku, quantity]) => ({
        sku,
        quantity,
      }));

      // Note: Purchase order creation would typically be done through a separate endpoint
      // For now, we'll show a success message
      alert(`Purchase order request created with ${manufacturer.name || manufacturer.manufacturerName}`);
      setSelectedItems(new Map());
      setShowRequestSupply(false);
      await loadInventory();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    }
  };

  const handleSelectItem = (sku: string, quantity: number) => {
    const next = new Map(selectedItems);
    if (quantity > 0) {
      next.set(sku, quantity);
    } else {
      next.delete(sku);
    }
    setSelectedItems(next);
  };

  const handleManualForecast = async () => {
    if (!manualSku.trim()) return;
    
    setLoadingManualForecast(true);
    setError(null);
    try {
      const forecast = await inventoryAgentApi.forecastAndDecide(manualSku.trim());
      setManualForecast({ sku: manualSku.trim(), forecast });
    } catch (error: any) {
      console.error('Error getting manual forecast:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to get forecast. Please check the SKU and try again.');
      setManualForecast(null);
    } finally {
      setLoadingManualForecast(false);
    }
  };

  const handleDirectForecast = async () => {
    if (!directForecastInput.trim()) {
      setError('Please enter sales history as comma-separated numbers');
      return;
    }
    
    setLoadingDirectForecast(true);
    setError(null);
    try {
      const salesHistory = directForecastInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (salesHistory.length === 0) {
        throw new Error('Invalid sales history format. Please enter comma-separated numbers.');
      }
      
      const response = await fetch('http://localhost:8000/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales_history: salesHistory }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Forecast request failed');
      }
      
      const result = await response.json();
      setDirectForecastResult(result);
    } catch (error: any) {
      console.error('Error calling direct forecast:', error);
      setError(error?.message || 'Failed to get forecast. Please check your input.');
      setDirectForecastResult(null);
    } finally {
      setLoadingDirectForecast(false);
    }
  };

  const handleDirectDecision = async () => {
    const forecast = parseFloat(directDecisionInput.forecast);
    const confidence = parseFloat(directDecisionInput.confidence);
    const currentStock = parseInt(directDecisionInput.currentStock);
    const unitCost = parseFloat(directDecisionInput.unitCost);
    
    if (isNaN(forecast) || isNaN(confidence) || isNaN(currentStock) || isNaN(unitCost)) {
      setError('Please fill all fields with valid numbers');
      return;
    }
    
    setLoadingDirectDecision(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast,
          confidence,
          current_stock: currentStock,
          unit_cost: unitCost,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Decision request failed');
      }
      
      const result = await response.json();
      setDirectDecisionResult(result);
    } catch (error: any) {
      console.error('Error calling direct decision:', error);
      setError(error?.message || 'Failed to get decision. Please check your input.');
      setDirectDecisionResult(null);
    } finally {
      setLoadingDirectDecision(false);
    }
  };

  const handleDirectForecastDecide = async () => {
    if (!directForecastDecideInput.salesHistory.trim()) {
      setError('Please enter sales history');
      return;
    }
    
    const salesHistory = directForecastDecideInput.salesHistory.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const currentStock = parseInt(directForecastDecideInput.currentStock);
    const unitCost = parseFloat(directForecastDecideInput.unitCost);
    
    if (salesHistory.length === 0 || isNaN(currentStock) || isNaN(unitCost)) {
      setError('Please fill all fields with valid numbers');
      return;
    }
    
    setLoadingDirectForecastDecide(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/forecast-and-decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sales_history: salesHistory,
          current_stock: currentStock,
          unit_cost: unitCost,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Forecast and decide request failed');
      }
      
      const result = await response.json();
      setDirectForecastDecideResult(result);
    } catch (error: any) {
      console.error('Error calling direct forecast-and-decide:', error);
      setError(error?.message || 'Failed to get forecast and decision. Please check your input.');
      setDirectForecastDecideResult(null);
    } finally {
      setLoadingDirectForecastDecide(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex gap-2">
          <button onClick={loadInventory} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleRequestSupply}
            disabled={selectedItems.size === 0 || loadingRecommendation}
            className="btn-primary flex items-center gap-2"
          >
            <FiShoppingCart className="w-4 h-4" />
            {loadingRecommendation ? 'Loading...' : 'Request Supply'}
          </button>
        </div>
      </div>

      {/* Demand Forecast Section */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">AI Demand Forecast</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          AI-powered demand predictions help you optimize inventory levels and reduce stockouts.
        </p>
        {forecasts.size > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from(forecasts.entries()).map(([sku, forecast]) => {
              const item = inventory.find((i) => i.sku === sku);
              return (
                <div key={sku} className="bg-white p-4 rounded-lg border">
                  <p className="font-semibold">{item?.productName || sku}</p>
                  {forecast.forecast && (
                    <p className="text-sm text-gray-600">
                      Forecast: {forecast.forecast.demand_forecast || 'N/A'}
                    </p>
                  )}
                  {forecast.decision && (
                    <p className="text-sm text-primary-600">
                      Recommended Order: {forecast.decision.recommended_order_quantity || 0}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Forecast Input */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Manual Forecast</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Enter a SKU to get AI-powered demand forecast and inventory decision.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={manualSku}
            onChange={(e) => setManualSku(e.target.value)}
            placeholder="Enter SKU (e.g., PROD-001)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleManualForecast}
            disabled={loadingManualForecast || !manualSku.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loadingManualForecast ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FiTrendingUp className="w-4 h-4" />
            )}
            Get Forecast
          </button>
        </div>
        
        {manualForecast && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Forecast for {manualForecast.sku}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Forecast:</span> {manualForecast.forecast.forecast?.toFixed(1)} units
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {(manualForecast.forecast.confidence * 100)?.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Decision:</span> {manualForecast.forecast.decision?.quantity > 0 ? `Order ${manualForecast.forecast.decision.quantity} units` : 'No action needed'}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {manualForecast.forecast.decision?.reason || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Direct FastAPI Endpoints */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Direct FastAPI Endpoints</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test FastAPI endpoints directly with your own input data.
        </p>
        
        <div className="space-y-6">
          {/* Forecast Endpoint */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">1. Forecast Endpoint</h3>
            <p className="text-sm text-gray-600 mb-2">Enter sales history as comma-separated numbers (e.g., 10, 15, 12, 18, 20)</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={directForecastInput}
                onChange={(e) => setDirectForecastInput(e.target.value)}
                placeholder="10, 15, 12, 18, 20"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleDirectForecast}
                disabled={loadingDirectForecast || !directForecastInput.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {loadingDirectForecast ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Get Forecast'
                )}
              </button>
            </div>
            {directForecastResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-sm overflow-auto">{JSON.stringify(directForecastResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Decision Endpoint */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">2. Decision Endpoint</h3>
            <p className="text-sm text-gray-600 mb-2">Enter forecast, confidence, current stock, and unit cost</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <input
                type="number"
                value={directDecisionInput.forecast}
                onChange={(e) => setDirectDecisionInput({ ...directDecisionInput, forecast: e.target.value })}
                placeholder="Forecast"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                step="0.01"
                value={directDecisionInput.confidence}
                onChange={(e) => setDirectDecisionInput({ ...directDecisionInput, confidence: e.target.value })}
                placeholder="Confidence (0-1)"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                value={directDecisionInput.currentStock}
                onChange={(e) => setDirectDecisionInput({ ...directDecisionInput, currentStock: e.target.value })}
                placeholder="Current Stock"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                step="0.01"
                value={directDecisionInput.unitCost}
                onChange={(e) => setDirectDecisionInput({ ...directDecisionInput, unitCost: e.target.value })}
                placeholder="Unit Cost"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleDirectDecision}
              disabled={loadingDirectDecision}
              className="btn-primary"
            >
              {loadingDirectDecision ? 'Loading...' : 'Get Decision'}
            </button>
            {directDecisionResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-sm overflow-auto">{JSON.stringify(directDecisionResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Forecast and Decide Endpoint */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">3. Forecast and Decide Endpoint</h3>
            <p className="text-sm text-gray-600 mb-2">Enter sales history, current stock, and unit cost</p>
            <div className="space-y-2 mb-2">
              <input
                type="text"
                value={directForecastDecideInput.salesHistory}
                onChange={(e) => setDirectForecastDecideInput({ ...directForecastDecideInput, salesHistory: e.target.value })}
                placeholder="Sales History (comma-separated): 10, 15, 12, 18, 20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={directForecastDecideInput.currentStock}
                  onChange={(e) => setDirectForecastDecideInput({ ...directForecastDecideInput, currentStock: e.target.value })}
                  placeholder="Current Stock"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={directForecastDecideInput.unitCost}
                  onChange={(e) => setDirectForecastDecideInput({ ...directForecastDecideInput, unitCost: e.target.value })}
                  placeholder="Unit Cost"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <button
              onClick={handleDirectForecastDecide}
              disabled={loadingDirectForecastDecide}
              className="btn-primary"
            >
              {loadingDirectForecastDecide ? 'Loading...' : 'Get Forecast & Decision'}
            </button>
            {directForecastDecideResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-sm overflow-auto">{JSON.stringify(directForecastDecideResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable
        items={inventory}
        onUpdateStock={handleUpdateStock}
        showForecast={true}
        showActions={true}
        onSelectItem={handleSelectItem}
        selectedItems={selectedItems}
      />

      {/* Request Supply Modal */}
      {showRequestSupply && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Select Manufacturer</h2>
              
              {recommendedManufacturer && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Recommended Manufacturer</h3>
                  <ManufacturerCard
                    manufacturer={recommendedManufacturer}
                    isRecommended={true}
                    onSelect={() => handleSelectManufacturer(recommendedManufacturer)}
                  />
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">All Available Manufacturers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manufacturers.map((m) => (
                    <ManufacturerCard
                      key={m.id || m.manufacturerId}
                      manufacturer={m}
                      onSelect={() => handleSelectManufacturer(m)}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowRequestSupply(false)}
                className="btn-secondary w-full mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
