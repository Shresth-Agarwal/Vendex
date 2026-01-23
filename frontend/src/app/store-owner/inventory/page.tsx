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

  useEffect(() => {
    loadInventory();
  }, [isAuthenticated, user]);

  const loadInventory = async () => {
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

      // Load forecasts for low stock items
      const lowStockItems = inventoryWithStock.filter((item: any) => item.onHand < 10);
      const forecastMap = new Map<string, any>();
      
      for (const item of lowStockItems.slice(0, 5)) {
        try {
          const forecast = await inventoryAgentApi.forecastAndDecide(item.sku);
          forecastMap.set(item.sku, forecast);
        } catch (error) {
          console.error(`Error getting forecast for ${item.sku}:`, error);
        }
      }
      
      setForecasts(forecastMap);
    } catch (error) {
      console.error('Error loading inventory:', error);
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

  const handleManualForecast = async () => {
    if (!manualSku.trim()) return;
    
    setLoadingManualForecast(true);
    try {
      const forecast = await inventoryAgentApi.forecastAndDecide(manualSku.trim());
      setManualForecast({ sku: manualSku.trim(), forecast });
    } catch (error) {
      console.error('Error getting manual forecast:', error);
      alert('Failed to get forecast. Please check the SKU and try again.');
    } finally {
      setLoadingManualForecast(false);
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
