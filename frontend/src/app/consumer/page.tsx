'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ProductCard } from '@/components/ProductCard';
import { productsApi, inventoryApi, ordersApi, aiApi } from '@/lib/api';
import { FiSearch, FiShoppingCart, FiSparkles } from 'react-icons/fi';

export default function ConsumerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [intentInput, setIntentInput] = useState('');
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentResults, setIntentResults] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CONSUMER') {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [productsData, inventoryData] = await Promise.all([
        productsApi.getAll(),
        inventoryApi.getAll(),
      ]);
      setProducts(productsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIntentBuilder = async () => {
    if (!intentInput.trim()) return;

    setIntentLoading(true);
    try {
      const result = await aiApi.processIntent(intentInput, inventory);
      setIntentResults(result);
      
      // Auto-add items to cart if action is SUCCESS
      if (result.action === 'SUCCESS' && result.bundle) {
        const newCart = new Map(cart);
        result.bundle.forEach((item: any) => {
          if (item.status === 'AVAILABLE') {
            const currentQty = newCart.get(item.sku) || 0;
            newCart.set(item.sku, currentQty + item.quantity_recommended);
          }
        });
        setCart(newCart);
      }
    } catch (error) {
      console.error('Error processing intent:', error);
      alert('Failed to process intent. Please try again.');
    } finally {
      setIntentLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const newCart = new Map(cart);
    const currentQty = newCart.get(product.sku) || 0;
    newCart.set(product.sku, currentQty + 1);
    setCart(newCart);
  };

  const removeFromCart = (sku: string) => {
    const newCart = new Map(cart);
    newCart.delete(sku);
    setCart(newCart);
  };

  const updateCartQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    const newCart = new Map(cart);
    newCart.set(sku, quantity);
    setCart(newCart);
  };

  const handleCheckout = async () => {
    if (cart.size === 0) return;

    try {
      const orderItems = Array.from(cart.entries()).map(([sku, quantity]) => {
        const product = products.find((p) => p.sku === sku);
        return {
          sku,
          quantity,
          unitPrice: product?.unitCost || 0,
        };
      });

      await ordersApi.create({
        items: orderItems,
        customerId: user?.id,
      });

      alert('Order placed successfully!');
      setCart(new Map());
      setShowCart(false);
      await loadData(); // Refresh inventory
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const getProductWithStock = (product: any) => {
    const stock = inventory.find((s) => s.sku === product.sku);
    return { product, stock };
  };

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartItems = Array.from(cart.entries()).map(([sku, quantity]) => {
    const product = products.find((p) => p.sku === sku);
    const stock = inventory.find((s) => s.sku === sku);
    return { product, stock, quantity };
  });

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.unitCost || 0) * item.quantity,
    0
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Consumer Dashboard</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="btn-primary flex items-center gap-2 relative"
        >
          <FiShoppingCart className="w-5 h-5" />
          Cart
          {cart.size > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.size}
            </span>
          )}
        </button>
      </div>

      {/* Intent Builder */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center gap-2 mb-4">
          <FiSparkles className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Intent Builder</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Tell us what you intend to buy, and we'll help you find the right products!
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={intentInput}
            onChange={(e) => setIntentInput(e.target.value)}
            placeholder="e.g., monthly grocery for family of 4"
            className="input-field flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleIntentBuilder()}
          />
          <button
            onClick={handleIntentBuilder}
            disabled={intentLoading || !intentInput.trim()}
            className="btn-primary"
          >
            {intentLoading ? 'Processing...' : 'Build Intent'}
          </button>
        </div>
        {intentResults && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <p className="font-semibold mb-2">{intentResults.message}</p>
            {intentResults.action === 'CLARIFY' && intentResults.clarifying_question && (
              <p className="text-sm text-gray-600">{intentResults.clarifying_question}</p>
            )}
            {intentResults.bundle && intentResults.bundle.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Suggested items:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {intentResults.bundle.map((item: any, idx: number) => (
                    <li key={idx}>
                      {item.sku} - Qty: {item.quantity_recommended} ({item.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const { stock } = getProductWithStock(product);
          return (
            <ProductCard
              key={product.sku}
              product={product}
              stock={stock}
              onAddToCart={addToCart}
            />
          );
        })}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(({ product, stock, quantity }) => (
                    <div key={product.sku} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="font-semibold">{product.productName}</h3>
                        <p className="text-sm text-gray-500">${product.unitCost.toFixed(2)} each</p>
                        {stock && (
                          <p className="text-xs text-gray-400">Stock: {stock.onHand}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(product.sku, quantity - 1)}
                            className="w-8 h-8 rounded border flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(product.sku, quantity + 1)}
                            className="w-8 h-8 rounded border flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold w-24 text-right">
                          ${(product.unitCost * quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.sku)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <button onClick={handleCheckout} className="btn-primary w-full">
                      Checkout
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowCart(false)}
                className="mt-4 btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
