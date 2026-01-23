'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { salesApi, productsApi, stockApi, inventoryAgentApi } from '@/lib/api';
import { FiBarChart, FiTrendingUp, FiPackage, FiDollarSign } from 'react-icons/fi';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    topProducts: [] as any[],
    lowStockItems: 0,
  });
  const [manualAnalysisSku, setManualAnalysisSku] = useState('');
  const [manualAnalysis, setManualAnalysis] = useState<any>(null);
  const [loadingManualAnalysis, setLoadingManualAnalysis] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [isAuthenticated, user]);

  const loadAnalytics = async () => {
    try {
      const products = await productsApi.getAll();
      
      // Get sales data for all products
      const salesPromises = products.slice(0, 10).map(async (product: any) => {
        try {
          const sales = await salesApi.getBySku(product.sku);
          return { sku: product.sku, productName: product.productName || product.name, sales };
        } catch {
          return { sku: product.sku, productName: product.productName || product.name, sales: [] };
        }
      });

      const salesResults = await Promise.all(salesPromises);
      const allSales = salesResults.flatMap((r) => r.sales);
      setSalesData(allSales);

      // Get inventory data
      const inventoryPromises = products.map(async (product: any) => {
        try {
          const stock = await stockApi.getBySku(product.sku);
          return {
            ...product,
            ...stock,
            productName: product.productName || product.name,
          };
        } catch {
          return {
            ...product,
            onHand: 0,
            productName: product.productName || product.name,
          };
        }
      });

      const inventoryResults = await Promise.all(inventoryPromises);
      setInventoryData(inventoryResults);

      // Get forecasts for low stock items
      const lowStockItems = inventoryResults.filter((item: any) => item.onHand < 10).slice(0, 5);
      const forecastPromises = lowStockItems.map(async (item: any) => {
        try {
          const forecast = await inventoryAgentApi.forecastAndDecide(item.sku);
          return { ...item, forecast };
        } catch {
          return { ...item, forecast: null };
        }
      });

      const forecastResults = await Promise.all(forecastPromises);
      setForecasts(forecastResults.filter((f) => f.forecast));

      // Calculate stats
      const totalRevenue = allSales.reduce(
        (sum, sale) => sum + (sale.unitPrice || 0) * (sale.quantitySold || 0),
        0
      );

      const productSales = salesResults.map((r) => ({
        sku: r.sku,
        productName: r.productName,
        totalSales: r.sales.reduce((sum: number, s: any) => sum + (s.quantitySold || 0), 0),
      }));

      const topProducts = productSales
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      setStats({
        totalSales: allSales.length,
        totalRevenue,
        topProducts,
        lowStockItems: inventoryResults.filter((item: any) => item.onHand < 10).length,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalysis = async () => {
    if (!manualAnalysisSku.trim()) return;
    
    setLoadingManualAnalysis(true);
    try {
      // Get current stock for the SKU
      const stockData = await stockApi.getBySku(manualAnalysisSku.trim());
      const forecast = await inventoryAgentApi.forecastAndDecide(manualAnalysisSku.trim());
      
      setManualAnalysis({
        sku: manualAnalysisSku.trim(),
        currentStock: stockData.onHand || 0,
        forecast: forecast.forecast,
        confidence: forecast.confidence,
        decision: forecast.decision
      });
    } catch (error) {
      console.error('Error getting manual analysis:', error);
      alert('Failed to analyze product. Please check the SKU and try again.');
    } finally {
      setLoadingManualAnalysis(false);
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
      <div className="flex items-center gap-2">
        <FiBarChart className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">{stats.totalSales}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
            </div>
            <FiPackage className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Products</p>
              <p className="text-2xl font-bold text-blue-600">{stats.topProducts.length}</p>
            </div>
            <FiBarChart className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Manual Forecast Analysis */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Manual Forecast Analysis</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Analyze demand forecasting and inventory decisions for any product SKU.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={manualAnalysisSku}
            onChange={(e) => setManualAnalysisSku(e.target.value)}
            placeholder="Enter SKU (e.g., PROD-001)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleManualAnalysis}
            disabled={loadingManualAnalysis || !manualAnalysisSku.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loadingManualAnalysis ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FiBarChart className="w-4 h-4" />
            )}
            Analyze
          </button>
        </div>
        
        {manualAnalysis && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Analysis for {manualAnalysis.sku}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Stock:</span> {manualAnalysis.currentStock} units
              </div>
              <div>
                <span className="font-medium">Forecast:</span> {manualAnalysis.forecast?.toFixed(1)} units
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {(manualAnalysis.confidence * 100)?.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Recommendation:</span> {manualAnalysis.decision?.quantity > 0 ? `Order ${manualAnalysis.decision.quantity}` : 'Maintain stock'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
        <div className="space-y-2">
          {stats.topProducts.map((product, idx) => (
            <div key={product.sku} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                <span className="font-medium">{product.productName}</span>
              </div>
              <span className="text-primary-600 font-semibold">{product.totalSales} units</span>
            </div>
          ))}
          {stats.topProducts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No sales data available</p>
          )}
        </div>
      </div>

      {/* Demand Forecasts */}
      {forecasts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI Demand Forecasts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecasts.map((item) => (
              <div key={item.sku} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{item.productName}</h4>
                {item.forecast && (
                  <div className="space-y-1 text-sm">
                    {item.forecast.forecast && (
                      <p className="text-gray-600">
                        Forecast: {item.forecast.forecast.demand_forecast || 'N/A'}
                      </p>
                    )}
                    {item.forecast.decision && (
                      <p className="text-primary-600 font-medium">
                        Recommended Order: {item.forecast.decision.recommended_order_quantity || 0}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Power BI Embed (if configured) */}
      {process.env.NEXT_PUBLIC_POWER_BI_URL && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src={process.env.NEXT_PUBLIC_POWER_BI_URL}
            className="w-full h-[800px] border-0"
            title="Power BI Dashboard"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
