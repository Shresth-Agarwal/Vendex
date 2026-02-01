'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { shiftsApi, staffApi, rosterApi } from '@/lib/api';
import { FiCalendar, FiClock, FiUser, FiUsers, FiPlus, FiRefreshCw } from 'react-icons/fi';

export default function ShiftsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [shifts, setShifts] = useState<any[]>([]);
  const [openShifts, setOpenShifts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    role: 'CASHIER',
  });
  const [manualRosterDate, setManualRosterDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualRosterResult, setManualRosterResult] = useState<any>(null);
  const [loadingManualRoster, setLoadingManualRoster] = useState(false);

  useEffect(() => {
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [shiftsData, openShiftsData, staffData] = await Promise.all([
        shiftsApi.getAll(),
        shiftsApi.getOpen(),
        staffApi.getAll(),
      ]);
      setShifts(shiftsData);
      setOpenShifts(openShiftsData);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shiftsApi.create(formData);
      setShowCreateModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        role: 'CASHIER',
      });
      await loadData();
      alert('Shift created successfully');
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift');
    }
  };

  const handleAssignStaff = async (shiftId: number, staffId: number) => {
    try {
      await shiftsApi.assignStaff(shiftId, staffId);
      await loadData();
      alert('Staff assigned successfully');
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Failed to assign staff');
    }
  };

  const handleGenerateDefault = async () => {
    try {
      await shiftsApi.generateDefault();
      await loadData();
      alert('Default shifts generated successfully');
    } catch (error) {
      console.error('Error generating default shifts:', error);
      alert('Failed to generate default shifts');
    }
  };

  const handleGenerateRoster = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      await rosterApi.generate(date);
      await loadData();
      alert('Roster generated successfully');
    } catch (error) {
      console.error('Error generating roster:', error);
      alert('Failed to generate roster');
    }
  };

  const handleManualRosterGeneration = async (date: string) => {
    setLoadingManualRoster(true);
    try {
      const result = await rosterApi.generate(date);
      setManualRosterResult(result);
      await loadData(); // Refresh the data
    } catch (error) {
      console.error('Error generating manual roster:', error);
      alert('Failed to generate roster. Please try again.');
    } finally {
      setLoadingManualRoster(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Shifts & Roster Management</h1>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateDefault}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Generate Default
          </button>
          <button
            onClick={handleGenerateRoster}
            className="btn-secondary flex items-center gap-2"
          >
            <FiCalendar className="w-4 h-4" />
            Generate Roster
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Create Shift
          </button>
        </div>
      </div>

      {/* Manual Roster Generation */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">AI Staff Assignment</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Generate optimized staff assignments for any date using AI-powered scheduling.
        </p>
        <div className="flex gap-2">
          <input
            type="date"
            value={manualRosterDate}
            onChange={(e) => setManualRosterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => manualRosterDate && handleManualRosterGeneration(manualRosterDate)}
            disabled={loadingManualRoster || !manualRosterDate}
            className="btn-primary flex items-center gap-2"
          >
            {loadingManualRoster ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FiUsers className="w-4 h-4" />
            )}
            Generate Roster
          </button>
        </div>
        
        {manualRosterResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Roster Generated for {manualRosterDate}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Assignments:</span> {manualRosterResult.assignments?.length || 0}
              </div>
              <div>
                <span className="font-medium">Coverage:</span> {(manualRosterResult.coveragePercentage * 100)?.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Overtime Risk:</span> {manualRosterResult.overtimeRisk ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Status:</span> Success
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Open Shifts */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiClock className="w-5 h-5" />
          Open Shifts ({openShifts.length})
        </h2>
        <div className="space-y-2">
          {openShifts.map((shift) => (
            <div key={shift.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(shift.date || shift.shiftDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {shift.startTime} - {shift.endTime}
                    </span>
                    <span className="badge badge-info">{shift.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignStaff(shift.id, parseInt(e.target.value));
                      }
                    }}
                    className="input-field"
                    defaultValue=""
                  >
                    <option value="">Assign Staff...</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.username || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {openShifts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No open shifts</p>
          )}
        </div>
      </div>

      {/* All Shifts */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiCalendar className="w-5 h-5" />
          All Shifts ({shifts.length})
        </h2>
        <div className="space-y-2">
          {shifts.map((shift) => (
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

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Create Shift</h2>
              <form onSubmit={handleCreateShift} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="input-field"
                    required
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
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
