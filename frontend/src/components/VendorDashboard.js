import React, { useState, useEffect } from 'react';
import { getAllStock, getProducts, updateStock } from '../services/api';
import { getProductImageUrl } from '../utils/imageUtils';
import './VendorDashboard.css';
import { FiPackage, FiRefreshCw, FiEdit2, FiSave, FiX } from 'react-icons/fi';

const VendorDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSku, setEditingSku] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const stockData = await getAllStock();
      const productsData = await getProducts();
      
      const inventoryWithProducts = stockData.map(stock => {
        const product = productsData.find(p => p.sku === stock.sku);
        return {
          ...stock,
          productName: product?.productName || 'Unknown Product',
          category: product?.category || 'Unknown',
          unitCost: product?.unitCost || 0,
          active: product?.active ?? true,
          imageUrl: product?.imageUrl,
          description: product?.description,
        };
      });

      setInventory(inventoryWithProducts);
      setError(null);
    } catch (err) {
      setError('Failed to load inventory. Please try again later.');
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingSku(item.sku);
    setEditValue(item.onHand.toString());
  };

  const handleCancelEdit = () => {
    setEditingSku(null);
    setEditValue('');
  };

  const handleSave = async (sku) => {
    const newStock = parseInt(editValue);
    if (isNaN(newStock) || newStock < 0) {
      alert('Please enter a valid stock quantity (non-negative number)');
      return;
    }

    try {
      await updateStock(sku, newStock);
      setInventory(inventory.map(item =>
        item.sku === sku
          ? { ...item, onHand: newStock, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      ));
      setEditingSku(null);
      setEditValue('');
    } catch (err) {
      alert('Failed to update stock. Please try again.');
      console.error('Error updating stock:', err);
    }
  };

  const getStockStatus = (onHand) => {
    if (onHand === 0) return { status: 'out-of-stock', label: 'Out of Stock' };
    if (onHand < 10) return { status: 'low-stock', label: 'Low Stock' };
    return { status: 'in-stock', label: 'In Stock' };
  };

  const totalItems = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + item.onHand, 0);
  const lowStockItems = inventory.filter(item => item.onHand < 10 && item.onHand > 0).length;
  const outOfStockItems = inventory.filter(item => item.onHand === 0).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <button className="refresh-btn" onClick={loadInventory}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-info">
            <h3>{totalItems}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stock-icon">
            <FiPackage />
          </div>
          <div className="stat-info">
            <h3>{totalStock}</h3>
            <p>Total Stock Units</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-info">
            <h3>{lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-info">
            <h3>{outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      <div className="inventory-section">
        <h2>Inventory Management</h2>
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit Cost</th>
                <th>Stock On Hand</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No inventory data available
                  </td>
                </tr>
              ) : (
                inventory.map(item => {
                  const stockStatus = getStockStatus(item.onHand);
                  const isEditing = editingSku === item.sku;
                  const imageUrl = getProductImageUrl(item.sku, item.category, item.imageUrl);

                  return (
                    <tr key={item.sku} className={!item.active ? 'inactive-product' : ''}>
                      <td>
                        <div className="product-image-cell">
                          <img
                            src={imageUrl}
                            alt={item.productName}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </td>
                      <td>{item.sku}</td>
                      <td>{item.productName}</td>
                      <td className="category-cell">{item.category}</td>
                      <td>${item.unitCost.toFixed(2)}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="stock-input"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span className={`stock-value ${stockStatus.status}`}>
                            {item.onHand}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${stockStatus.status}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td>
                        {item.lastUpdated
                          ? new Date(item.lastUpdated).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="action-buttons">
                            <button
                              className="save-btn"
                              onClick={() => handleSave(item.sku)}
                              title="Save"
                            >
                              <FiSave />
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                              title="Cancel"
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit Stock"
                          >
                            <FiEdit2 />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
