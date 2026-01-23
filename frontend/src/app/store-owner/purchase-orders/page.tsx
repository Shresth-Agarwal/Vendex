'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { purchaseOrdersApi, purchaseOrderAiApi, manufacturersApi } from '@/lib/api';
import { FiPackage, FiCheck, FiX, FiDownload, FiSend, FiTruck } from 'react-icons/fi';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    try {
      const data = await purchaseOrdersApi.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await purchaseOrdersApi.approve(id);
      await loadOrders();
      alert('Purchase order approved successfully');
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve purchase order');
    }
  };

  const handleFinalizeManufacturer = async (id: number, manufacturerId: number) => {
    try {
      await purchaseOrdersApi.finalizeManufacturer(id, manufacturerId);
      await loadOrders();
      alert('Manufacturer finalized successfully');
    } catch (error) {
      console.error('Error finalizing manufacturer:', error);
      alert('Failed to finalize manufacturer');
    }
  };

  const handleMarkSent = async (id: number) => {
    try {
      await purchaseOrdersApi.markSent(id);
      await loadOrders();
      alert('Purchase order marked as sent');
    } catch (error) {
      console.error('Error marking as sent:', error);
      alert('Failed to update purchase order');
    }
  };

  const handleMarkReceived = async (id: number) => {
    try {
      await purchaseOrdersApi.markReceived(id);
      await loadOrders();
      alert('Purchase order marked as received');
    } catch (error) {
      console.error('Error marking as received:', error);
      alert('Failed to update purchase order');
    }
  };

  const handleGenerateReceipt = async (poId: number) => {
    try {
      const blob = await purchaseOrderAiApi.generateReceipt(poId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${poId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt');
    }
  };

  const handleGetRecommendation = async (poId: number) => {
    setLoadingRecommendation(true);
    try {
      const recommendation = await purchaseOrderAiApi.recommendManufacturer(poId, 'CREDIT');
      setRecommendation(recommendation);
      setSelectedOrder(orders.find((o) => o.id === poId));
      setShowRecommendation(true);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      alert('Failed to get manufacturer recommendation');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; badge: string }> = {
      PENDING: { label: 'Pending', badge: 'badge-warning' },
      APPROVED: { label: 'Approved', badge: 'badge-success' },
      FINALIZED: { label: 'Finalized', badge: 'badge-info' },
      SENT: { label: 'Sent', badge: 'badge-info' },
      RECEIVED: { label: 'Received', badge: 'badge-success' },
    };
    const statusInfo = statusMap[status] || { label: status, badge: 'badge-info' };
    return <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>;
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
      <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter((o) => o.status === 'PENDING').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === 'APPROVED').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Received</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter((o) => o.status === 'RECEIVED').length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.items?.length || order.purchaseOrderItems?.length || 0} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(order.id)}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1"
                        >
                          <FiCheck className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleGetRecommendation(order.id)}
                          disabled={loadingRecommendation}
                          className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                        >
                          Get Recommendation
                        </button>
                      </>
                    )}
                    {order.status === 'APPROVED' && !order.manufacturerId && (
                      <button
                        onClick={() => handleGetRecommendation(order.id)}
                        disabled={loadingRecommendation}
                        className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      >
                        Finalize Manufacturer
                      </button>
                    )}
                    {order.status === 'APPROVED' && order.manufacturerId && (
                      <button
                        onClick={() => handleMarkSent(order.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FiSend className="w-4 h-4" />
                        Mark Sent
                      </button>
                    )}
                    {order.status === 'SENT' && (
                      <button
                        onClick={() => handleMarkReceived(order.id)}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                      >
                        <FiTruck className="w-4 h-4" />
                        Mark Received
                      </button>
                    )}
                    {order.status !== 'PENDING' && (
                      <button
                        onClick={() => handleGenerateReceipt(order.id)}
                        className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      >
                        <FiDownload className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommendation Modal */}
      {showRecommendation && recommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Manufacturer Recommendation</h2>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Recommended Manufacturer</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(recommendation, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (selectedOrder && recommendation.manufacturerId) {
                        handleFinalizeManufacturer(selectedOrder.id, recommendation.manufacturerId);
                        setShowRecommendation(false);
                      }
                    }}
                    className="btn-primary flex-1"
                  >
                    Use This Manufacturer
                  </button>
                  <button
                    onClick={() => setShowRecommendation(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
