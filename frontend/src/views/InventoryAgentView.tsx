import React, { useState } from 'react';
import type { ForecastAndDecision } from '../api/inventory';
import { bulkForecast, forecastForSku } from '../api/inventory';
import { toApiError } from '../api/client';

export const InventoryAgentView: React.FC = () => {
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [result, setResult] = useState<(ForecastAndDecision & { sku: string }) | null>(null);
  const [bulkResult, setBulkResult] = useState<(ForecastAndDecision & { sku?: string })[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  async function handleSingleForecast(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim()) {
      setError('Enter a SKU to forecast.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await forecastForSku({ sku: sku.trim() });
      setResult(data);
      setRawResponse(data);
      setError(null);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      setResult(null);
      setRawResponse(null);
      console.error('Forecast error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkForecast() {
    setBulkLoading(true);
    setError(null);
    setBulkResult(null);
    try {
      const data = await bulkForecast();
      setBulkResult(data);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Inventory Management</div>
            <div className="card-subtitle">
              Get AI-powered recommendations on how much stock to order for your products.
            </div>
          </div>
        </div>

        <form onSubmit={handleSingleForecast} className="stack-v" aria-label="Single SKU form">
          <div className="stack-v">
            <label className="field-label" htmlFor="sku-input">
              Product Code (SKU)
            </label>
            <input
              id="sku-input"
              className="text-input"
              placeholder="e.g. SKU-1234"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div className="stack-h wrap">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Get Recommendation'}
            </button>
            <button
              type="button"
              className="primary-button"
              style={{ background: 'transparent', color: 'var(--accent-strong)' }}
              onClick={handleBulkForecast}
              disabled={bulkLoading}
            >
              {bulkLoading ? 'Analyzing...' : 'Analyze All Products'}
            </button>
          </div>

          <p className="secondary-text">
            Our AI analyzes your sales history and current stock levels to recommend the optimal order quantity.
          </p>

          {error && <div className="error-text">Error: {error}</div>}
        </form>

        {rawResponse && (
          <details className="stack-v" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--accent-strong)' }}>
              View raw response (debug)
            </summary>
            <pre className="log-panel" style={{ marginTop: '0.5rem', overflow: 'auto' }}>
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recommendation Details</div>
            <div className="card-subtitle">AI analysis and ordering recommendation for your product.</div>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-tile">
            <div className="metric-label">SKU</div>
            <div className="metric-value">{result?.sku ?? '—'}</div>
          </div>
          <div className="metric-tile">
            <div className="metric-label">Forecast qty</div>
            <div className="metric-value">
              {result?.forecast != null ? result.forecast : '—'}
            </div>
          </div>
          <div className="metric-tile">
            <div className="metric-label">Confidence</div>
            <div className="metric-value">
              {result?.confidence != null ? `${(result.confidence * 100).toFixed(0)}%` : '—'}
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="stack-v">
          <div className="field-label">Decision</div>
            {result?.decision ? (
            <div className="message-bubble ai">
              <div className="stack-v" style={{ gap: '0.75rem' }}>
                <div>
                  <strong>Recommended Action:</strong> {result.decision.action?.replace('_', ' ')}
                </div>
                <div>
                  <strong>Order Quantity:</strong> {result.decision.quantity} units
                </div>
                <div>
                  <strong>Reasoning:</strong> {result.decision.reason}
                </div>
              </div>
            </div>
          ) : (
            <div className="message-bubble ai">
              <span className="muted">
                Enter a product code above to get an AI-powered ordering recommendation.
              </span>
            </div>
          )}
        </div>

        {bulkResult && (
          <>
            <div className="divider" />
              <div className="field-label">All Products Summary</div>
            <div className="log-panel">
              {bulkResult.map((row, idx) => (
                <div key={idx} className="log-line">
                  <span className="key">{row.sku ?? `Item ${idx + 1}`}</span>
                  <span className="value">
                    {' '}
                    → {row.forecast ?? '—'} units @{' '}
                    {row.confidence != null ? `${(row.confidence * 100).toFixed(0)}%` : '—'}
                    {row.decision && ` | ${row.decision.action}: ${row.decision.quantity}`}
                  </span>
                </div>
              ))}
              {bulkResult.length === 0 && (
                <div className="muted">No SKUs returned from bulk forecast.</div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
};

