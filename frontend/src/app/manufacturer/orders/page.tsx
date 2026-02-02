'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { purchaseOrdersApi, purchaseOrderAiApi } from '@/lib/api';
import { FiPackage, FiCheck, FiX, FiDownload } from 'react-icons/fi';

export default function ManufacturerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrdersApi.getAll();
      setOrders(data);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: number) => {
    try {
      await purchaseOrdersApi.approve(orderId);
      await loadOrders();
      alert('Order accepted successfully');
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    }
  };

  const handleReject = async (orderId: number) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    try {
      // Note: Reject endpoint would need to be added to backend
      alert('Order rejected');
      await loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    }
  };

  const handleDownloadReceipt = async (orderId: number) => {
    try {
      const blob = await purchaseOrderAiApi.generateReceipt(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; badge: string }> = {
      PENDING: { label: 'Pending', badge: 'badge-warning' },
      APPROVED: { label: 'Approved', badge: 'badge-success' },
      SENT: { label: 'Sent', badge: 'badge-info' },
      RECEIVED: { label: 'Received', badge: 'badge-success' },
      REJECTED: { label: 'Rejected', badge: 'badge-danger' },
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

  if (!hasLoaded) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Click the button below to load all purchase orders</p>
          <button onClick={loadOrders} className="btn-primary">View All Purchase Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>

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
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(order.id)}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1"
                        >
                          <FiCheck className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <FiX className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {order.status !== 'PENDING' && (
                      <button
                        onClick={() => handleDownloadReceipt(order.id)}
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
    </div>
  );
}
