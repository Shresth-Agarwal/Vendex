import React, { useState } from 'react';
import {
  addAvailability,
  addSale,
  assignStaffToShift,
  createProduct,
  createShift,
  createStaff,
  deactivateStaff,
  getAvailability,
  getOpenShifts,
  getProducts,
  getPurchaseOrders,
  getSales,
  getShifts,
  getStaff,
  getStock,
  removeAvailability,
  updateProduct,
  updatePurchaseOrderStatus,
  updateStaff,
  updateStock
} from '../api/operations';
import { toApiError } from '../api/client';

type JsonLike = unknown;

function JsonViewer({ value }: { value: JsonLike }) {
  if (value == null) return <span className="muted">No data yet.</span>;
  return (
    <pre className="log-panel" style={{ maxHeight: 260 }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export const OperationsView: React.FC = () => {
  const [products, setProducts] = useState<JsonLike>(null);
  const [stock, setStock] = useState<JsonLike>(null);
  const [sales, setSales] = useState<JsonLike>(null);
  const [staff, setStaffState] = useState<JsonLike>(null);
  const [availability, setAvailabilityState] = useState<JsonLike>(null);
  const [shifts, setShifts] = useState<JsonLike>(null);
  const [purchaseOrders, setPurchaseOrdersState] = useState<JsonLike>(null);
  const [error, setError] = useState<string | null>(null);

  const [skuForStock, setSkuForStock] = useState('');
  const [skuForSales, setSkuForSales] = useState('');
  const [statusPoId, setStatusPoId] = useState('');
  const [statusPoValue, setStatusPoValue] = useState('APPROVED');

  async function handle<T>(fn: () => Promise<T>, onData: (v: T) => void) {
    setError(null);
    try {
      const data = await fn();
      onData(data);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
    }
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Operations console</div>
            <div className="card-subtitle">
              Thin, JSON-first controls over all demo endpoints (products, stock, sales,
              staff, shifts, POs).
            </div>
          </div>
          <span className="card-badge">/demo/*</span>
        </div>
        {error && <div className="error-text">Error: {error}</div>}
        <p className="secondary-text">
          Payloads intentionally accept raw JSON so you can match your backend DTOs exactly
          (or copy them from Swagger). Spring Boot remains the only thing the frontend
          talks to.
        </p>
      </section>

      {/* Products & stock */}
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Products & stock</div>
            <div className="card-subtitle">
              CRUD over catalog and stock levels using <code>/demo/products</code> and{' '}
              <code>/demo/stock</code>.
            </div>
          </div>
        </div>
        <div className="stack-v">
          <div className="stack-h wrap">
            <button
              type="button"
              className="primary-button"
              onClick={() => handle(getProducts, setProducts)}
            >
              Load products
            </button>
            <span className="secondary-text">
              Use Swagger to craft a JSON body for new/updated products.
            </span>
          </div>
          <JsonViewer value={products} />

          <div className="divider" />

          <div className="stack-h wrap">
            <div className="stack-v">
              <label className="field-label" htmlFor="sku-stock">
                SKU for stock lookup
              </label>
              <input
                id="sku-stock"
                className="text-input"
                placeholder="SKU"
                value={skuForStock}
                onChange={(e) => setSkuForStock(e.target.value)}
              />
            </div>
            <div className="stack-v" style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  skuForStock &&
                  handle(() => getStock(skuForStock.trim()), setStock)
                }
              >
                Get stock
              </button>
            </div>
          </div>
          <JsonViewer value={stock} />
        </div>
      </section>

      {/* Sales & POs */}
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Sales & purchase orders</div>
            <div className="card-subtitle">
              Inspect recent sales and manage PO statuses to update inventory.
            </div>
          </div>
        </div>
        <div className="stack-v">
          <div className="stack-h wrap">
            <div className="stack-v">
              <label className="field-label" htmlFor="sku-sales">
                SKU for sales lookup
              </label>
              <input
                id="sku-sales"
                className="text-input"
                placeholder="SKU"
                value={skuForSales}
                onChange={(e) => setSkuForSales(e.target.value)}
              />
            </div>
            <div className="stack-v" style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  skuForSales &&
                  handle(() => getSales(skuForSales.trim()), setSales)
                }
              >
                Get recent sales
              </button>
            </div>
          </div>
          <JsonViewer value={sales} />

          <div className="divider" />

          <div className="stack-h wrap">
            <button
              type="button"
              className="primary-button"
              onClick={() => handle(getPurchaseOrders, setPurchaseOrdersState)}
            >
              Load purchase orders
            </button>
            <div className="stack-h wrap">
              <input
                className="text-input"
                style={{ maxWidth: 120 }}
                placeholder="PO id"
                value={statusPoId}
                onChange={(e) => setStatusPoId(e.target.value)}
              />
              <input
                className="text-input"
                style={{ maxWidth: 160 }}
                placeholder="Status (e.g. APPROVED)"
                value={statusPoValue}
                onChange={(e) => setStatusPoValue(e.target.value)}
              />
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  statusPoId &&
                  handle(
                    () =>
                      updatePurchaseOrderStatus(
                        Number(statusPoId),
                        statusPoValue || 'APPROVED'
                      ),
                    setPurchaseOrdersState
                  )
                }
              >
                Update status
              </button>
            </div>
          </div>
          <JsonViewer value={purchaseOrders} />
        </div>
      </section>

      {/* Staff, availability & shifts */}
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Staff & shifts</div>
            <div className="card-subtitle">
              Explore staff, availability and shifts endpoints that power the AI roster.
            </div>
          </div>
        </div>
        <div className="stack-v">
          <div className="stack-h wrap">
            <button
              type="button"
              className="primary-button"
              onClick={() => handle(getStaff, setStaffState)}
            >
              Load staff
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => handle(getShifts, setShifts)}
            >
              Load shifts
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => handle(getOpenShifts, setShifts)}
            >
              Load open shifts
            </button>
          </div>

          <div className="stack-h wrap">
            <div style={{ flex: 1 }}>
              <div className="field-label">Staff</div>
              <JsonViewer value={staff} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="field-label">Shifts</div>
              <JsonViewer value={shifts} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

