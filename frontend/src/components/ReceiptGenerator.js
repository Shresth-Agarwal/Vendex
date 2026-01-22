import React, { useState, useEffect } from 'react';
import { getProducts, getAllStock, getAllPurchaseOrders } from '../services/api';
import { generateReceipt } from '../services/api';
import './ReceiptGenerator.css';
import { FiShoppingCart, FiDownload, FiPrinter, FiPlus, FiMinus, FiX } from 'react-icons/fi';

const ReceiptGenerator = () => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      const stockData = await getAllStock();
      
      const productsWithStock = productsData.map(product => {
        const stock = stockData.find(s => s.sku === product.sku);
        return {
          ...product,
          stock: stock?.onHand || 0,
        };
      });

      setProducts(productsWithStock.filter(p => p.active && p.stock > 0));
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (product) => {
    const existingItem = selectedItems.find(item => item.sku === product.sku);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Cannot add more items. Stock limit reached.');
        return;
      }
      setSelectedItems(selectedItems.map(item =>
        item.sku === product.sku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
  };

  const removeItem = (sku) => {
    setSelectedItems(selectedItems.filter(item => item.sku !== sku));
  };

  const updateQuantity = (sku, delta) => {
    setSelectedItems(selectedItems.map(item => {
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

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => 
      sum + (item.unitCost * item.quantity), 0
    );
    const tax = subtotal * 0.1; // 10% tax
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  };

  const handleGenerateReceipt = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to generate a receipt.');
      return;
    }

    setGenerating(true);
    try {
      const { subtotal, tax, grandTotal } = calculateTotals();
      const now = new Date().toISOString();

      // Create receipt data structure matching backend expectations
      const receiptData = {
        purchaseOrder: {
          purchaseOrderId: Date.now(),
          createdAt: now,
          approvedAt: now,
        },
        manufacturer: {
          name: 'Demo Manufacturer',
          emailId: 'manufacturer@example.com',
          paymentMode: 'CASH',
          advanceRequired: false,
        },
        items: selectedItems.map(item => ({
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
        totals: {
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        },
      };

      // Try to generate PDF from backend
      try {
        const blob = await generateReceipt(receiptData);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_${receiptData.purchaseOrder.purchaseOrderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (backendError) {
        // If backend fails, generate client-side receipt
        console.warn('Backend receipt generation failed, using client-side:', backendError);
        generateClientSideReceipt(receiptData);
      }
    } catch (err) {
      alert('Failed to generate receipt. Please try again.');
      console.error('Error generating receipt:', err);
    } finally {
      setGenerating(false);
    }
  };

  const generateClientSideReceipt = (receiptData) => {
    // Create a printable receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #FACC15; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #CA8A04; margin: 0; }
            .info { margin: 10px 0; }
            .items { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #FDE68A; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-weight: bold; font-size: 1.1em; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Vendex Receipt</h1>
            <p>Order #${receiptData.purchaseOrder.purchaseOrderId}</p>
          </div>
          <div class="info">
            <p><strong>Date:</strong> ${new Date(receiptData.purchaseOrder.createdAt).toLocaleString()}</p>
            <p><strong>Manufacturer:</strong> ${receiptData.manufacturer.name}</p>
            <p><strong>Email:</strong> ${receiptData.manufacturer.emailId}</p>
          </div>
          <div class="items">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.items.map(item => `
                  <tr>
                    <td>${item.sku}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitCost.toFixed(2)}</td>
                    <td>$${(item.unitCost * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="totals">
            <p>Subtotal: $${receiptData.totals.subtotal}</p>
            <p>Tax (10%): $${receiptData.totals.tax}</p>
            <p class="total-row">Grand Total: $${receiptData.totals.grandTotal}</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handlePrint = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to print.');
      return;
    }
    generateClientSideReceipt({
      purchaseOrder: {
        purchaseOrderId: Date.now(),
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      },
      manufacturer: {
        name: 'Demo Manufacturer',
        emailId: 'manufacturer@example.com',
        paymentMode: 'CASH',
        advanceRequired: false,
      },
      items: selectedItems.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
      totals: (() => {
        const { subtotal, tax, grandTotal } = calculateTotals();
        return {
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        };
      })(),
    });
  };

  const { subtotal, tax, grandTotal } = calculateTotals();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="receipt-generator">
      <div className="receipt-header">
        <h1>Receipt Generator</h1>
        <p>Select products and quantities to generate a receipt</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="receipt-content">
        <div className="products-section">
          <h2>Available Products</h2>
          <div className="products-grid">
            {products.length === 0 ? (
              <p className="no-products">No products available</p>
            ) : (
              products.map(product => (
                <div key={product.sku} className="product-card">
                  <div className="product-info">
                    <h3>{product.productName}</h3>
                    <p className="product-sku">SKU: {product.sku}</p>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">${product.unitCost.toFixed(2)}</p>
                    <p className="product-stock">Stock: {product.stock}</p>
                  </div>
                  <button
                    className="add-item-btn"
                    onClick={() => addItem(product)}
                    disabled={product.stock === 0}
                  >
                    <FiPlus /> Add to Receipt
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="receipt-section">
          <h2>Receipt Items</h2>
          {selectedItems.length === 0 ? (
            <div className="empty-receipt">
              <FiShoppingCart size={48} />
              <p>No items selected</p>
              <p className="hint">Add products from the left to generate a receipt</p>
            </div>
          ) : (
            <>
              <div className="receipt-items">
                {selectedItems.map(item => (
                  <div key={item.sku} className="receipt-item">
                    <div className="item-info">
                      <h4>{item.productName}</h4>
                      <p>SKU: {item.sku} | ${item.unitCost.toFixed(2)} each</p>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item.sku, -1)}>
                        <FiMinus />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.sku, 1)}>
                        <FiPlus />
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.sku)}
                      >
                        <FiX />
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.unitCost * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="receipt-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-actions">
                <button
                  className="action-btn print-btn"
                  onClick={handlePrint}
                  disabled={generating}
                >
                  <FiPrinter /> Print Receipt
                </button>
                <button
                  className="action-btn download-btn"
                  onClick={handleGenerateReceipt}
                  disabled={generating}
                >
                  <FiDownload /> {generating ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
