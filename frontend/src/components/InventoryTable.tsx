'use client';

import React, { useState } from 'react';
import { FiEdit2, FiSave, FiX, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface InventoryItem {
  sku: string;
  productName: string;
  category?: string;
  onHand: number;
  available: number;
  unitCost?: number;
  demandForecast?: number;
  reorderQuantity?: number;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock?: (sku: string, onHand: number) => Promise<void>;
  showForecast?: boolean;
  showActions?: boolean;
  onSelectItem?: (sku: string, quantity: number) => void;
  selectedItems?: Map<string, number>;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onUpdateStock,
  showForecast = false,
  showActions = true,
  onSelectItem,
  selectedItems,
}) => {
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleEdit = (item: InventoryItem) => {
    setEditingSku(item.sku);
    setEditValue(item.onHand.toString());
  };

  const handleCancel = () => {
    setEditingSku(null);
    setEditValue('');
  };

  const handleSave = async (sku: string) => {
    if (!onUpdateStock) return;
    
    const newStock = parseInt(editValue);
    if (isNaN(newStock) || newStock < 0) {
      alert('Please enter a valid number');
      return;
    }

    setLoading(sku);
    try {
      await onUpdateStock(sku, newStock);
      setEditingSku(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    } finally {
      setLoading(null);
    }
  };

  const getStockStatus = (onHand: number) => {
    if (onHand === 0) return { label: 'Out of Stock', badge: 'badge-danger' };
    if (onHand < 10) return { label: 'Low Stock', badge: 'badge-warning' };
    return { label: 'In Stock', badge: 'badge-success' };
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              {onSelectItem && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select Qty
                </th>
              )}
              {showForecast && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forecast
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Qty
                  </th>
                </>
              )}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const status = getStockStatus(item.onHand);
              const isEditing = editingSku === item.sku;
              const isLoading = loading === item.sku;

              return (
                <tr key={item.sku} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </div>
                      {item.category && (
                        <div className="text-sm text-gray-500">{item.category}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="input-field w-24"
                          min="0"
                        />
                        <button
                          onClick={() => handleSave(item.sku)}
                          disabled={isLoading}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiSave className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.onHand}
                        </span>
                        <span className={status.badge}>{status.label}</span>
                      </div>
                    )}
                  </td>
                  {onSelectItem && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max={item.onHand}
                        value={selectedItems?.get(item.sku) || 0}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0;
                          onSelectItem(item.sku, qty);
                        }}
                        className="input-field w-20"
                        placeholder="0"
                      />
                    </td>
                  )}
                  {showForecast && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.demandForecast !== undefined ? (
                          <div className="flex items-center gap-1 text-sm">
                            <FiTrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{item.demandForecast.toFixed(0)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.reorderQuantity !== undefined ? (
                          <div className="flex items-center gap-1 text-sm">
                            <FiPackage className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-blue-600">
                              {item.reorderQuantity}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </>
                  )}
                  {showActions && !isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
