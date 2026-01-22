'use client';

import React from 'react';
import { FiStar, FiMapPin, FiDollarSign, FiTruck } from 'react-icons/fi';

interface ManufacturerCardProps {
  manufacturer: {
    manufacturerId?: number;
    id?: number;
    name: string;
    emailId?: string;
    phone?: string;
    location?: string;
    distanceKm?: number;
    averageRating?: number;
    total_cost?: number;
    preferredPaymentMode?: string;
    advanceRequired?: boolean;
  };
  isRecommended?: boolean;
  onSelect?: (manufacturer: any) => void;
  showDetails?: boolean;
}

export const ManufacturerCard: React.FC<ManufacturerCardProps> = ({
  manufacturer,
  isRecommended = false,
  onSelect,
  showDetails = true,
}) => {
  const id = manufacturer.manufacturerId || manufacturer.id;
  const rating = manufacturer.averageRating || 0;

  return (
    <div
      className={`card border-2 transition-all ${
        isRecommended
          ? 'border-primary-500 bg-primary-50 shadow-lg'
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      {isRecommended && (
        <div className="absolute top-2 right-2">
          <span className="badge badge-info">⭐ Best Match</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{manufacturer.name}</h3>
            {manufacturer.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <FiMapPin className="w-4 h-4" />
                <span>{manufacturer.location}</span>
              </div>
            )}
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="space-y-2 pt-2 border-t">
            {manufacturer.distanceKm !== undefined && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiTruck className="w-4 h-4" />
                <span>{manufacturer.distanceKm.toFixed(1)} km away</span>
              </div>
            )}
            {manufacturer.total_cost !== undefined && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiDollarSign className="w-4 h-4" />
                <span className="font-semibold">${manufacturer.total_cost.toFixed(2)}</span>
              </div>
            )}
            {manufacturer.preferredPaymentMode && (
              <div className="text-sm text-gray-600">
                Payment: {manufacturer.preferredPaymentMode}
              </div>
            )}
            {manufacturer.advanceRequired && (
              <span className="badge badge-warning">Advance Required</span>
            )}
          </div>
        )}

        {onSelect && (
          <button
            onClick={() => onSelect(manufacturer)}
            className="btn-primary w-full mt-4"
          >
            {isRecommended ? 'Select Recommended' : 'Select Manufacturer'}
          </button>
        )}
      </div>
    </div>
  );
};
