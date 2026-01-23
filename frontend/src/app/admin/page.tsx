'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import { FiUser, FiTrash2, FiEdit2, FiShield } from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    // Admin endpoints require authentication, but let backend handle it
    loadUsers();
  }, [isAuthenticated, user]);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      await loadUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await adminApi.updateUserRole(selectedUser.id, newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      await loadUsers();
      alert('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const openRoleModal = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role || '');
    setShowRoleModal(true);
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
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Consumers</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'CONSUMER').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Store Owners</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.role === 'STORE_OWNER').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Manufacturers</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'MANUFACTURER').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Username
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-info">{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openRoleModal(user)}
                      className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                    >
                      <FiShield className="w-4 h-4" />
                      Role
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Update User Role</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    User: {selectedUser.username} ({selectedUser.email})
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="CONSUMER">Consumer</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="MANUFACTURER">Manufacturer</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdateRole} className="btn-primary flex-1">
                    Update Role
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedUser(null);
                      setNewRole('');
                    }}
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
