'use client';

import React, { useState } from 'react';
import { FiDownload, FiMail, FiX } from 'react-icons/fi';
import { purchaseOrderAiApi } from '@/lib/api';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: any;
  onDownload?: (blob: Blob, filename: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  onDownload,
}) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!purchaseOrder) return;

    setLoading(true);
    try {
      const poId = purchaseOrder.id || purchaseOrder.purchaseOrderId;
      if (!poId) {
        throw new Error('Purchase order ID not found');
      }
      const blob = await purchaseOrderAiApi.generateReceipt(poId);
      const filename = `receipt_${purchaseOrder.purchaseOrderId || 'order'}.pdf`;
      
      if (onDownload) {
        onDownload(blob, filename);
      } else {
        // Default download behavior
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    // This would typically call a backend endpoint to email the receipt
    // For now, we'll just show a success message
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {purchaseOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold">
                    #{purchaseOrder.purchaseOrderId || purchaseOrder.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">
                    {new Date(
                      purchaseOrder.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {purchaseOrder.manufacturer && (
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-semibold">
                    {purchaseOrder.manufacturer.name}
                  </p>
                </div>
              )}

              {purchaseOrder.items && purchaseOrder.items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Items</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            Price
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrder.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2 text-sm">{item.productName || item.sku}</td>
                            <td className="px-4 py-2 text-sm">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              ${item.unitPrice?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium">
                              ${(
                                (item.unitPrice || 0) * item.quantity
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">
                      $
                      {purchaseOrder.items
                        ? purchaseOrder.items
                            .reduce(
                              (sum: number, item: any) =>
                                sum + (item.unitPrice || 0) * item.quantity,
                              0
                            )
                            .toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="btn-primary flex items-center gap-2 flex-1"
          >
            <FiDownload className="w-4 h-4" />
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            onClick={handleEmail}
            disabled={loading || emailSent}
            className="btn-secondary flex items-center gap-2 flex-1"
          >
            <FiMail className="w-4 h-4" />
            {emailSent ? 'Sent!' : 'Email Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
