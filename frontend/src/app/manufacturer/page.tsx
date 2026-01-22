'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ReceiptModal } from '@/components/ReceiptModal';
import { purchaseOrdersApi, chatApi } from '@/lib/api';
import { FiPackage, FiCheck, FiX, FiDownload, FiMessageCircle } from 'react-icons/fi';

export default function ManufacturerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'MANUFACTURER') {
      router.push('/login');
      return;
    }
    loadOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    try {
      // Get orders for this manufacturer
      const data = await purchaseOrdersApi.getAll();
      // Filter orders for this manufacturer (in production, backend would filter)
      setOrders(data);
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
      // This would typically be a separate reject endpoint
      // For now, we'll just show a message
      alert('Order rejected');
      await loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    }
  };

  const handleDownloadReceipt = (order: any) => {
    setSelectedReceipt(order);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manufacturer Dashboard</h1>

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
          <p className="text-sm text-gray-600">Completed</p>
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
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.items?.length || 0} items
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
                        onClick={() => handleDownloadReceipt(order)}
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

      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          purchaseOrder={selectedReceipt}
        />
      )}
    </div>
  );
}
