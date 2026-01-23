'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { staffApi, shiftsApi, staffAvailabilityApi } from '@/lib/api';
import { FiUserPlus, FiEdit2, FiTrash2, FiCalendar, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function StaffPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CASHIER',
  });

  useEffect(() => {
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [staffData, shiftsData] = await Promise.all([
        staffApi.getAll(),
        shiftsApi.getAll(),
      ]);
      setStaff(staffData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await staffApi.update(editingStaff.id, formData);
      } else {
        await staffApi.create(formData);
      }
      setShowModal(false);
      setEditingStaff(null);
      setFormData({ username: '', email: '', password: '', role: 'CASHIER' });
      await loadData();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member');
    }
  };

  const handleEdit = (staffMember: any) => {
    setEditingStaff(staffMember);
    setFormData({
      username: staffMember.username,
      email: staffMember.email,
      password: '',
      role: staffMember.role || 'CASHIER',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await staffApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  const handleAssignShift = async (shiftId: number, staffId: number) => {
    try {
      await shiftsApi.assignStaff(shiftId, staffId);
      await loadData();
      alert('Shift assigned successfully');
    } catch (error) {
      console.error('Error assigning shift:', error);
      alert('Failed to assign shift');
    }
  };

  const handleGenerateDefaultShifts = async () => {
    try {
      await shiftsApi.generateDefault();
      await loadData();
      alert('Default shifts generated successfully');
    } catch (error) {
      console.error('Error generating shifts:', error);
      alert('Failed to generate shifts');
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
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateDefaultShifts}
            className="btn-secondary flex items-center gap-2"
          >
            <FiCalendar className="w-4 h-4" />
            Generate Default Shifts
          </button>
          <button
            onClick={() => {
              setEditingStaff(null);
              setFormData({ username: '', email: '', password: '', role: 'CASHIER' });
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiUserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {member.username || member.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-info">{member.role || 'STAFF'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
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

      {/* Shifts Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiCalendar className="w-5 h-5" />
            Staff Shifts
          </h2>
          <Link href="/store-owner/shifts" className="text-primary-600 hover:text-primary-800">
            Manage Shifts →
          </Link>
        </div>
        <div className="space-y-2">
          {shifts.slice(0, 10).map((shift) => (
            <div key={shift.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {shift.staff?.username || shift.staffName || 'Unassigned'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(shift.date || shift.shiftDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                </div>
                <span className="badge badge-info">{shift.role || shift.staff?.role || 'STAFF'}</span>
              </div>
            </div>
          ))}
          {shifts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No shifts scheduled</p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingStaff ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingStaff}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingStaff ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStaff(null);
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
