import React, { useState, useEffect } from 'react';
import { getAllStock, getProducts, updateStock } from '../services/api';
import { getProductImageUrl } from '../utils/imageUtils';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './VendorDashboard.css';
import { FiPackage, FiRefreshCw, FiEdit2, FiSave, FiX, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

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

  // Calculate analytics data for charts
  const stockByCategory = inventory.reduce((acc, item) => {
    const category = item.category || 'Unknown';
    if (!acc[category]) {
      acc[category] = { category, totalStock: 0, productCount: 0 };
    }
    acc[category].totalStock += item.onHand;
    acc[category].productCount += 1;
    return acc;
  }, {});

  const categoryChartData = Object.values(stockByCategory).map(item => ({
    name: item.category,
    stock: item.totalStock,
    products: item.productCount,
  }));

  // Top products by stock
  const topProductsByStock = [...inventory]
    .sort((a, b) => b.onHand - a.onHand)
    .slice(0, 10)
    .map(item => ({
      name: item.productName.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName,
      stock: item.onHand,
    }));

  // Stock status distribution
  const stockStatusData = [
    { name: 'In Stock', value: inventory.filter(item => item.onHand >= 10).length, color: '#10B981' },
    { name: 'Low Stock', value: lowStockItems, color: '#F59E0B' },
    { name: 'Out of Stock', value: outOfStockItems, color: '#EF4444' },
  ];

  // Calculate daily/weekly/monthly stats (mock data based on current inventory)
  const timeSeriesData = [
    { period: 'Week 1', stock: Math.floor(totalStock * 0.9) },
    { period: 'Week 2', stock: Math.floor(totalStock * 0.95) },
    { period: 'Week 3', stock: totalStock },
    { period: 'Week 4', stock: Math.floor(totalStock * 1.05) },
  ];

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
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <h3>{lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <h3>{outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="analytics-section">
        <h2>Stock Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Stock by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FDE68A" />
                <XAxis dataKey="name" stroke="#CA8A04" />
                <YAxis stroke="#CA8A04" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFBEA', border: '1px solid #FDE68A', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="stock" fill="#FACC15" name="Total Stock" />
                <Bar dataKey="products" fill="#CA8A04" name="Product Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Stock Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFBEA', border: '1px solid #FDE68A', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Top Products by Stock</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsByStock} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#FDE68A" />
                <XAxis type="number" stroke="#CA8A04" />
                <YAxis dataKey="name" type="category" stroke="#CA8A04" width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFBEA', border: '1px solid #FDE68A', borderRadius: '8px' }}
                />
                <Bar dataKey="stock" fill="#FACC15" name="Stock Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Stock Trend (4 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FDE68A" />
                <XAxis dataKey="period" stroke="#CA8A04" />
                <YAxis stroke="#CA8A04" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFBEA', border: '1px solid #FDE68A', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  stroke="#FACC15" 
                  strokeWidth={3}
                  name="Total Stock"
                  dot={{ fill: '#CA8A04', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems > 0 || outOfStockItems > 0 ? (
          <div className="alerts-section">
            <h3>
              <FiAlertCircle /> Stock Alerts
            </h3>
            <div className="alerts-list">
              {inventory
                .filter(item => item.onHand < 10)
                .map(item => (
                  <div key={item.sku} className={`alert-item ${item.onHand === 0 ? 'critical' : 'warning'}`}>
                    <div className="alert-info">
                      <h4>{item.productName}</h4>
                      <p>SKU: {item.sku} | Current Stock: {item.onHand}</p>
                    </div>
                    <div className="alert-action">
                      <button onClick={() => handleEdit(item)} className="alert-btn">
                        Update Stock
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
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
