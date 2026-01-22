import React, { useState, useEffect } from 'react';
import { getProducts, getStock, createSale } from '../services/api';
import { getProductImageUrl, generateProductDescription } from '../utils/imageUtils';
import { mockProducts } from '../data/mockProducts';
import './CustomerShop.css';
import { FiShoppingCart, FiPlus, FiMinus, FiSearch } from 'react-icons/fi';

const CustomerShop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      const productsWithStock = await Promise.all(
        productsData
          .filter(p => p.active)
          .map(async (product) => {
            try {
              const stock = await getStock(product.sku);
              return { ...product, stock: stock.onHand };
            } catch (err) {
              return { ...product, stock: 0 };
            }
          })
      );
      setProducts(productsWithStock);
      setError(null);
    } catch (err) {
      // If backend fails, use mock data
      console.warn('Backend not available, using mock data:', err.message);
      setProducts(mockProducts);
      setError('Using demo products (backend not connected)');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('This product is out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.sku === product.sku);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Cannot add more items. Stock limit reached.');
        return;
      }
      setCart(cart.map(item =>
        item.sku === product.sku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (sku) => {
    setCart(cart.filter(item => item.sku !== sku));
  };

  const updateQuantity = (sku, delta) => {
    setCart(cart.map(item => {
      if (item.sku === sku) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > item.stock) {
          alert('Cannot add more items. Stock limit reached.');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      for (const item of cart) {
        await createSale({
          sku: item.sku,
          quantitySold: item.quantity,
          saleDate: new Date().toISOString().split('T')[0],
        });
      }
      alert('Order placed successfully!');
      setCart([]);
      setShowCart(false);
      loadProducts(); // Refresh products to update stock
    } catch (err) {
      // If backend fails, simulate checkout with mock data
      console.warn('Backend not available, simulating checkout:', err.message);
      // Update stock in mock products
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const cartItem = cart.find(item => item.sku === product.sku);
          if (cartItem) {
            return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
          }
          return product;
        })
      );
      alert('Order placed successfully! (Demo mode - backend not connected)');
      setCart([]);
      setShowCart(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="customer-shop">
      <div className="shop-header">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="cart-button" onClick={() => setShowCart(!showCart)}>
          <FiShoppingCart />
          <span className="cart-badge">{cartItemCount}</span>
          Cart
        </button>
      </div>

      {error && (
        <div className={`error-message ${error.includes('demo') || error.includes('Demo') ? 'info' : ''}`}>
          {error}
        </div>
      )}

      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              cart.map(item => {
                const imageUrl = getProductImageUrl(item.sku, item.category, item.imageUrl);
                return (
                  <div key={item.sku} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={imageUrl}
                        alt={item.productName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.productName}</h4>
                      <p>${item.unitCost.toFixed(2)} each</p>
                    </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.sku, -1)}>
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.sku, 1)}>
                      <FiPlus />
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.sku)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.unitCost * item.quantity).toFixed(2)}
                  </div>
                </div>
                );
              })
            )}
          </div>
          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <strong>Total: ${cartTotal.toFixed(2)}</strong>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          )}
        </div>
      )}

      <div className="products-container">
        <h1 className="page-title">Shop Products</h1>
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No products found</p>
          ) : (
            filteredProducts.map(product => {
              const imageUrl = getProductImageUrl(product.sku, product.category, product.imageUrl);
              const description = generateProductDescription(product);
              
              return (
                <div key={product.sku} className="product-card">
                  <div className="product-image">
                    <img
                      src={imageUrl}
                      alt={product.productName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="product-placeholder" style={{ display: 'none' }}>
                      {product.productName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.productName}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-description">{description}</p>
                    <p className="product-price">${product.unitCost.toFixed(2)}</p>
                    <div className="product-stock">
                      {product.stock > 0 ? (
                        <span className="in-stock">In Stock: {product.stock}</span>
                      ) : (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      <FiPlus /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerShop;
