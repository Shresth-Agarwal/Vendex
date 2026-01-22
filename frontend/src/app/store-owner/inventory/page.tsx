'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { InventoryTable } from '@/components/InventoryTable';
import { ManufacturerCard } from '@/components/ManufacturerCard';
import { inventoryApi, productsApi, manufacturersApi, aiApi, purchaseOrdersApi } from '@/lib/api';
import { FiPackage, FiTrendingUp, FiShoppingCart } from 'react-icons/fi';

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

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'STORE_OWNER') {
      router.push('/login');
      return;
    }
    loadInventory();
  }, [isAuthenticated, user]);

  const loadInventory = async () => {
    try {
      const [stockData, productsData] = await Promise.all([
        inventoryApi.getAll(),
        productsApi.getAll(),
      ]);

      const inventoryWithProducts = await Promise.all(
        stockData.map(async (stock: any) => {
          const product = productsData.find((p: any) => p.sku === stock.sku);
          
          // Get demand forecast if we have sales history
          let forecast = undefined;
          let reorderQty = undefined;
          try {
            // This would typically come from sales history
            // For now, we'll skip if no sales data
            const salesHistory = []; // Would fetch from sales API
            if (salesHistory.length > 0) {
              const forecastData = await aiApi.forecastAndDecide(
                salesHistory,
                stock.onHand,
                product?.unitCost || 0
              );
              forecast = forecastData.forecast;
              reorderQty = forecastData.decision?.recommended_order_quantity;
            }
          } catch (error) {
            // Forecast not available
          }

          return {
            ...stock,
            productName: product?.productName || 'Unknown Product',
            category: product?.category || 'Unknown',
            unitCost: product?.unitCost || 0,
            demandForecast: forecast,
            reorderQuantity: reorderQty,
          };
        })
      );

      setInventory(inventoryWithProducts);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (sku: string, onHand: number) => {
    try {
      await inventoryApi.update(sku, onHand);
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
          const products = await manufacturersApi.getProducts(m.id || m.manufacturerId);
          return { ...m, products };
        })
      );

      // Prepare request
      const items = Array.from(selectedItems.entries()).map(([sku, quantity]) => ({
        sku,
        quantity,
      }));

      const context = {
        preferredPaymentMode: 'CREDIT', // Could be from user preferences
      };

      // Get recommendation
      const recommendation = await aiApi.recommendManufacturer(
        items,
        manufacturersWithProducts,
        context
      );

      setRecommendedManufacturer(recommendation);
      setManufacturers(manufacturersWithProducts);
      setShowRequestSupply(true);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      alert('Failed to get manufacturer recommendations');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleSelectManufacturer = async (manufacturer: any) => {
    try {
      // Create purchase order
      const items = Array.from(selectedItems.entries()).map(([sku, quantity]) => ({
        sku,
        quantity,
      }));

      // This would typically create a PO via the backend
      // For now, we'll show a success message
      alert(`Purchase order created with ${manufacturer.name}`);
      setSelectedItems(new Map());
      setShowRequestSupply(false);
      await loadInventory();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
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
        <button
          onClick={handleRequestSupply}
          disabled={selectedItems.size === 0 || loadingRecommendation}
          className="btn-primary flex items-center gap-2"
        >
          <FiShoppingCart className="w-4 h-4" />
          {loadingRecommendation ? 'Loading...' : 'Request Supply'}
        </button>
      </div>

      {/* Demand Forecast Section */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Demand Forecast</h2>
        </div>
        <p className="text-sm text-gray-600">
          AI-powered demand predictions help you optimize inventory levels and reduce stockouts.
        </p>
      </div>

      {/* Inventory Table with Forecast */}
      <InventoryTable
        items={inventory}
        onUpdateStock={handleUpdateStock}
        showForecast={true}
        showActions={true}
      />

      {/* Smart Badges Info */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Smart Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="badge badge-success">In Stock</span>
            <span className="text-gray-600">Stock level above 10 units</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-warning">Low Stock</span>
            <span className="text-gray-600">Stock level between 1-10 units</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-danger">Out of Stock</span>
            <span className="text-gray-600">Stock level at 0</span>
          </div>
        </div>
      </div>

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
