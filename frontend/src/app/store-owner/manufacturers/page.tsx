'use client';

import React, { useState, useEffect } from 'react';
import { manufacturersApi } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiStar, FiCreditCard } from 'react-icons/fi';
import Link from 'next/link';

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    try {
      const data = await manufacturersApi.getAll();
      setManufacturers(data);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingManufacturer) {
        await manufacturersApi.update(editingManufacturer.id || editingManufacturer.manufacturerId, formData);
      } else {
        await manufacturersApi.create(formData);
      }
      setShowModal(false);
      setEditingManufacturer(null);
      setFormData({
        name: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
      });
      await loadManufacturers();
      alert(editingManufacturer ? 'Manufacturer updated successfully' : 'Manufacturer created successfully');
    } catch (error) {
      console.error('Error saving manufacturer:', error);
      alert('Failed to save manufacturer');
    }
  };

  const handleEdit = (manufacturer: any) => {
    setEditingManufacturer(manufacturer);
    setFormData({
      name: manufacturer.name || manufacturer.manufacturerName || '',
      location: manufacturer.location || '',
      contactEmail: manufacturer.contactEmail || '',
      contactPhone: manufacturer.contactPhone || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this manufacturer?')) return;
    try {
      await manufacturersApi.delete(id);
      await loadManufacturers();
      alert('Manufacturer deleted successfully');
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
      alert('Failed to delete manufacturer');
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
        <h1 className="text-3xl font-bold text-gray-900">Manufacturer Management</h1>
        <button
          onClick={() => {
            setEditingManufacturer(null);
            setFormData({
              name: '',
              location: '',
              contactEmail: '',
              contactPhone: '',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Manufacturer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manufacturers.map((manufacturer) => (
          <div key={manufacturer.id || manufacturer.manufacturerId} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {manufacturer.name || manufacturer.manufacturerName}
                </h3>
                {manufacturer.location && (
                  <p className="text-sm text-gray-500 mt-1">{manufacturer.location}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(manufacturer)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(manufacturer.id || manufacturer.manufacturerId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {manufacturer.contactEmail && (
                <p className="text-gray-600">Email: {manufacturer.contactEmail}</p>
              )}
              {manufacturer.contactPhone && (
                <p className="text-gray-600">Phone: {manufacturer.contactPhone}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex gap-2">
              <Link
                href={`/store-owner/manufacturers/${manufacturer.id || manufacturer.manufacturerId}/products`}
                className="btn-secondary flex items-center gap-2 flex-1 text-sm"
              >
                <FiPackage className="w-4 h-4" />
                Products
              </Link>
              <Link
                href={`/store-owner/manufacturers/${manufacturer.id || manufacturer.manufacturerId}/ratings`}
                className="btn-secondary flex items-center gap-2 flex-1 text-sm"
              >
                <FiStar className="w-4 h-4" />
                Ratings
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingManufacturer ? 'Edit Manufacturer' : 'Add Manufacturer'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingManufacturer ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingManufacturer(null);
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
