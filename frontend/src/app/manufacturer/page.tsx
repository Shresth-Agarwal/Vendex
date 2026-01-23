'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { purchaseOrdersApi, purchaseOrderAiApi } from '@/lib/api';
import { FiPackage, FiCheck, FiX, FiDownload, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function ManufacturerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    try {
      const data = await purchaseOrdersApi.getAll();
      // Filter orders for this manufacturer (in production, backend would filter)
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      // Gracefully handle error - show empty state instead of crashing
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: number) => {
    try {
      await purchaseOrdersApi.approve(orderId);
      await loadOrders();
    } catch (error: any) {
      console.error('Error accepting order:', error);
      alert(error?.response?.data?.message || error?.message || 'Failed to accept order. Please try again.');
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
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      alert(error?.response?.data?.message || error?.message || 'Failed to download receipt. Please try again.');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manufacturer Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/manufacturer/orders" className="btn-primary">
            View All Orders
          </Link>
          <Link href="/manufacturer/chat" className="btn-secondary flex items-center gap-2">
            <FiMessageCircle className="w-4 h-4" />
            Messages
          </Link>
        </div>
      </div>

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

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || order.purchaseOrderItems?.length || 0} items
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
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
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-4">No orders yet</p>
          )}
        </div>
        {orders.length > 5 && (
          <div className="mt-4 text-center">
            <Link href="/manufacturer/orders" className="text-primary-600 hover:text-primary-800">
              View All Orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
