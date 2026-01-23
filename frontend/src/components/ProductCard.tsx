'use client';

import React from 'react';
import { FiShoppingCart, FiPackage } from 'react-icons/fi';

interface ProductCardProps {
  product: {
    sku: string;
    productName?: string;
    name?: string;
    category?: string;
    unitCost?: number;
    imageUrl?: string;
    description?: string;
  };
  stock?: {
    onHand: number;
    available?: number;
  };
  onAddToCart?: (product: any) => void;
  showStock?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  stock,
  onAddToCart,
  showStock = true,
}) => {
  const getImageUrl = () => {
    if (product.imageUrl) {
      return product.imageUrl.startsWith('http') ? product.imageUrl : `/product/${product.imageUrl}`;
    }
    if (product.category) {
      const categoryLower = product.category.toLowerCase();
      if (categoryLower.includes('men')) {
        return '/product/men/default.jpg';
      } else if (categoryLower.includes('women')) {
        return '/product/women/default.jpg';
      }
    }
    return '/product/default.jpg';
  };

  const imageUrl = getImageUrl();
  const isInStock = stock ? stock.onHand > 0 : true;
  const stockStatus = stock
    ? stock.onHand === 0
      ? 'out'
      : stock.onHand < 10
      ? 'low'
      : 'in'
    : 'unknown';
  const productName = product.productName || product.name || 'Unknown Product';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/product/default.jpg';
          }}
        />
        {showStock && stock && (
          <div className="absolute top-2 right-2">
            {stockStatus === 'out' && (
              <span className="badge badge-danger">Out of Stock</span>
            )}
            {stockStatus === 'low' && (
              <span className="badge badge-warning">Low Stock</span>
            )}
            {stockStatus === 'in' && (
              <span className="badge badge-success">In Stock</span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
          {productName}
        </h3>
        {product.category && (
          <p className="text-sm text-gray-500">{product.category}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}
        {showStock && stock && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiPackage className="w-4 h-4" />
            <span>Stock: {stock.onHand}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-blue-600">
            ${(product.unitCost || 0).toFixed(2)}
          </span>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              disabled={!isInStock}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
