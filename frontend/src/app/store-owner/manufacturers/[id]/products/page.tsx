'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { manufacturersApi } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function ManufacturerProductsPage() {
  const params = useParams();
  const router = useRouter();
  const manufacturerId = Number(params.id);
  const [products, setProducts] = useState<any[]>([]);
  const [manufacturer, setManufacturer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    sku: '',
    productName: '',
    unitPrice: 0,
    minOrderQuantity: 1,
    leadTimeDays: 0,
  });

  useEffect(() => {
    if (manufacturerId) {
      loadData();
    }
  }, [manufacturerId]);

  const loadData = async () => {
    try {
      const [productsData, manufacturerData] = await Promise.all([
        manufacturersApi.getProducts(manufacturerId),
        manufacturersApi.getById(manufacturerId),
      ]);
      setProducts(productsData);
      setManufacturer(manufacturerData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await manufacturersApi.updateProduct(manufacturerId, editingProduct.id, formData);
      } else {
        await manufacturersApi.createProduct(manufacturerId, formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        sku: '',
        productName: '',
        unitPrice: 0,
        minOrderQuantity: 1,
        leadTimeDays: 0,
      });
      await loadData();
      alert(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku || '',
      productName: product.productName || '',
      unitPrice: product.unitPrice || 0,
      minOrderQuantity: product.minOrderQuantity || 1,
      leadTimeDays: product.leadTimeDays || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await manufacturersApi.deleteProduct(manufacturerId, productId);
      await loadData();
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store-owner/manufacturers" className="text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manufacturer Products</h1>
            {manufacturer && (
              <p className="text-gray-600">{manufacturer.name || manufacturer.manufacturerName}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              sku: '',
              productName: '',
              unitPrice: 0,
              minOrderQuantity: 1,
              leadTimeDays: 0,
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Order Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time (Days)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.sku}</td>
                <td className="px-6 py-4 text-sm">{product.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">${(product.unitPrice || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.minOrderQuantity || 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.leadTimeDays || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Quantity</label>
                  <input
                    type="number"
                    value={formData.minOrderQuantity}
                    onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
