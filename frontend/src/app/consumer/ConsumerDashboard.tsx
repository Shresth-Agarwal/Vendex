'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ProductCard } from '@/components/ProductCard';
import { productsApi, stockApi, salesApi, customerIntentApi } from '@/lib/api';
import { FiSearch, FiShoppingCart, FiZap, FiLogIn } from 'react-icons/fi';

export default function ConsumerDashboard() {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Map<string, any>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [intentInput, setIntentInput] = useState('');
  const [intentResults, setIntentResults] = useState<any>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError(null);
    try {
      const productsData = await productsApi.getAll();
      setProducts(productsData || []);

      const stockEntries = await Promise.all(
        (productsData || []).map(async (p: any) => {
          try {
            const stock = await stockApi.getBySku(p.sku);
            return [p.sku, stock];
          } catch (err) {
            console.warn(`Could not load stock for ${p.sku}:`, err);
            return [p.sku, { sku: p.sku, onHand: 0 }];
          }
        })
      );

      setInventory(new Map(stockEntries));
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load products. Please try again.');
      setProducts([]);
      setInventory(new Map());
    } finally {
      setLoading(false);
    }
  }

  async function handleIntentBuilder() {
    if (!intentInput.trim()) return;
    setIntentLoading(true);
    setError(null);
    try {
      const result = await customerIntentApi.processIntent(intentInput);
      setIntentResults(result);
    } catch (err: any) {
      console.error('Error processing intent:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to process intent. Please try again.');
      setIntentResults(null);
    } finally {
      setIntentLoading(false);
    }
  }

  function addToCart(product: any) {
    const stock = inventory.get(product.sku);
    if (!stock || stock.onHand <= 0) return;

    const next = new Map(cart);
    next.set(product.sku, (next.get(product.sku) || 0) + 1);
    setCart(next);
  }

  if (loading) {
    return <p className="text-center py-10">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Browse Products</h1>
        {!isAuthenticated ? (
          <Link href="/login" className="btn-secondary flex gap-2 items-center">
            <FiLogIn /> Sign In
          </Link>
        ) : (
          <button className="btn-primary" onClick={() => setShowCart(!showCart)}>
            <FiShoppingCart /> Cart ({cart.size})
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={intentInput}
            onChange={(e) => setIntentInput(e.target.value)}
            placeholder="monthly grocery for family of 4"
          />
          <button
            className="btn-primary"
            onClick={handleIntentBuilder}
            disabled={intentLoading}
          >
            <FiZap />
          </button>
        </div>
        {intentResults && <pre className="mt-4">{JSON.stringify(intentResults, null, 2)}</pre>}
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          className="input-field pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products"
        />
      </div>

      {products.length === 0 && !loading && (
        <div className="card text-center py-8">
          <p className="text-gray-500">No products found. Please check back later.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products
          .filter((p) =>
            (p.productName || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((p) => {
            const stock = inventory.get(p.sku);
            return (
              <ProductCard
                key={p.sku}
                product={p}
                stock={stock}
                onAddToCart={addToCart}
              />
            );
          })}
      </div>
    </div>
  );
}
