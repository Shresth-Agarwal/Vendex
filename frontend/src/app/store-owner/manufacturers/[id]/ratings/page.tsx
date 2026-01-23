'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { manufacturersApi } from '@/lib/api';
import { FiPlus, FiStar, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function ManufacturerRatingsPage() {
  const params = useParams();
  const manufacturerId = Number(params.id);
  const [ratings, setRatings] = useState<any[]>([]);
  const [manufacturer, setManufacturer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (manufacturerId) {
      loadData();
    }
  }, [manufacturerId]);

  const loadData = async () => {
    try {
      const [ratingsData, manufacturerData] = await Promise.all([
        manufacturersApi.getRatings(manufacturerId),
        manufacturersApi.getById(manufacturerId),
      ]);
      setRatings(ratingsData);
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
      await manufacturersApi.createRating(manufacturerId, formData);
      setShowModal(false);
      setFormData({
        rating: 5,
        comment: '',
      });
      await loadData();
      alert('Rating added successfully');
    } catch (error) {
      console.error('Error saving rating:', error);
      alert('Failed to save rating');
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

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store-owner/manufacturers" className="text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manufacturer Ratings</h1>
            {manufacturer && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">{manufacturer.name || manufacturer.manufacturerName}</p>
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({ratings.length} reviews)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Rating
        </button>
      </div>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < (rating.rating || 0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="font-semibold text-gray-900">{rating.rating || 0}/5</span>
                </div>
                {rating.comment && (
                  <p className="text-gray-700">{rating.comment}</p>
                )}
                {rating.reviewerName && (
                  <p className="text-sm text-gray-500 mt-2">- {rating.reviewerName}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {ratings.length === 0 && (
          <div className="card text-center py-12">
            <FiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No ratings yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add Rating</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <FiStar
                          className={`w-8 h-8 ${
                            star <= formData.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="input-field"
                    rows={4}
                    placeholder="Write your review..."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    Submit Rating
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ rating: 5, comment: '' });
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
