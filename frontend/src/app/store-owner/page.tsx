'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { InventoryTable } from '@/components/InventoryTable';
import { inventoryApi, productsApi, aiApi } from '@/lib/api';
import { FiPackage, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

export default function StoreOwnerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'STORE_OWNER') {
      router.push('/login');
      return;
    }
    loadInventory();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadInventory, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadInventory = async () => {
    try {
      const [stockData, productsData] = await Promise.all([
        inventoryApi.getAll(),
        productsApi.getAll(),
      ]);

      const inventoryWithProducts = stockData.map((stock: any) => {
        const product = productsData.find((p: any) => p.sku === stock.sku);
        return {
          ...stock,
          productName: product?.productName || 'Unknown Product',
          category: product?.category || 'Unknown',
          unitCost: product?.unitCost || 0,
        };
      });

      setInventory(inventoryWithProducts);

      // Calculate stats
      const totalItems = inventoryWithProducts.length;
      const lowStock = inventoryWithProducts.filter((item: any) => item.onHand > 0 && item.onHand < 10).length;
      const outOfStock = inventoryWithProducts.filter((item: any) => item.onHand === 0).length;
      const totalValue = inventoryWithProducts.reduce(
        (sum: number, item: any) => sum + item.onHand * item.unitCost,
        0
      );

      setStats({ totalItems, lowStock, outOfStock, totalValue });
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
        <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
        <button onClick={loadInventory} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
            <FiPackage className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <FiPackage className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalValue.toFixed(2)}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable
        items={inventory}
        onUpdateStock={handleUpdateStock}
        showActions={true}
      />
    </div>
  );
}
