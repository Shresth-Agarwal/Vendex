'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { shiftsApi, staffAvailabilityApi } from '@/lib/api';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

export default function StaffDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [shifts, setShifts] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      // Get shifts assigned to this staff member
      const allShifts = await shiftsApi.getAll();
      // Filter by current user (in production, backend would filter)
      setShifts(allShifts);

      // Get availability for current user
      if (user?.id) {
        try {
          const availabilityData = await staffAvailabilityApi.getByStaffId(user.id);
          setAvailability(availabilityData);
        } catch (error) {
          console.error('Error loading availability:', error);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
      
      <div className="card">
        <p className="text-gray-600">Welcome, {user?.username}!</p>
        <p className="text-sm text-gray-500 mt-2">
          View your shifts and manage your availability.
        </p>
      </div>

      {/* My Shifts */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiCalendar className="w-5 h-5" />
          My Shifts
        </h2>
        <div className="space-y-2">
          {shifts.length > 0 ? (
            shifts.map((shift) => (
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
                    </div>
                  </div>
                  <span className="badge badge-info">{shift.role || 'STAFF'}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No shifts assigned</p>
          )}
        </div>
      </div>

      {/* My Availability */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiUser className="w-5 h-5" />
          My Availability
        </h2>
        <div className="space-y-2">
          {availability.length > 0 ? (
            availability.map((avail) => (
              <div key={avail.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(avail.date || avail.availabilityDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success">Available</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No availability set</p>
          )}
        </div>
      </div>
    </div>
  );
}
