import React, { useState } from 'react';
import { generateRoster, generateDefaultShifts } from '../api/roster';
import { toApiError } from '../api/client';

export const RosterView: React.FC = () => {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [defaultShiftLoading, setDefaultShiftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roster, setRoster] = useState<Awaited<ReturnType<typeof generateRoster>> | null>(null);
  const [defaultShifts, setDefaultShifts] = useState<Awaited<ReturnType<typeof generateDefaultShifts>> | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    setError(null);
    setRoster(null);
    try {
      const res = await generateRoster(date);
      setRoster(res);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDefaultShifts() {
    setDefaultShiftLoading(true);
    setError(null);
    setDefaultShifts(null);
    try {
      const res = await generateDefaultShifts(date || undefined);
      setDefaultShifts(res);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
    } finally {
      setDefaultShiftLoading(false);
    }
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Staff Scheduling</div>
            <div className="card-subtitle">
              Generate AI-powered staff schedules and manage shifts for your store
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="stack-v" aria-label="Roster form">
          <div className="stack-h wrap">
            <div className="stack-v" style={{ flex: '1 1 200px' }}>
              <label className="field-label" htmlFor="date-input">
                Select Date
              </label>
              <input
                id="date-input"
                type="date"
                className="text-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="stack-h wrap" style={{ gap: '8px', alignSelf: 'flex-end' }}>
              <button
                type="submit"
                className="primary-button"
                disabled={loading || !date}
              >
                {loading ? 'Generating...' : 'Generate Smart Schedule'}
              </button>
              <button
                type="button"
                className="primary-button"
                style={{ background: 'transparent', color: 'var(--accent-strong)', border: '1px solid var(--border-subtle)' }}
                onClick={handleGenerateDefaultShifts}
                disabled={defaultShiftLoading || !date}
              >
                {defaultShiftLoading ? 'Creating...' : 'Create Default Shifts'}
              </button>
            </div>
          </div>

          {error && <div className="error-text">Error: {error}</div>}
        </form>
      </section>

      {roster && (
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Schedule Overview</div>
              <div className="card-subtitle">
                Staff assignments for {new Date(roster.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="stack-v">
            <div className="metric-grid" style={{ marginBottom: '16px' }}>
              <div className="metric-tile">
                <div className="metric-label">Coverage</div>
                <div className="metric-value">{roster.coveragePercentage.toFixed(0)}%</div>
              </div>
              <div className="metric-tile">
                <div className="metric-label">Schedule Status</div>
                <div className="metric-value" style={{ color: roster.overtimeRisk ? 'var(--danger)' : 'var(--success)' }}>
                  {roster.overtimeRisk ? '⚠️ Overtime Risk' : '✓ Healthy'}
                </div>
              </div>
              <div className="metric-tile">
                <div className="metric-label">Staff Assigned</div>
                <div className="metric-value">{roster.assignments.length}</div>
              </div>
            </div>

            <div className="divider" />

            {roster.assignments.length > 0 ? (
              <div className="stack-v" style={{ gap: '8px' }}>
                <div className="field-label">Staff Assignments</div>
                {roster.assignments.map((assignment, idx) => (
                  <div key={`${assignment.staffId}-${assignment.shiftId}-${idx}`} className="message-bubble ai" style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{assignment.staffName}</div>
                    <div className="secondary-text" style={{ fontSize: '0.75rem' }}>
                      Shift #{assignment.shiftId}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="secondary-text">No staff assignments for this date.</p>
            )}
          </div>
        </section>
      )}

      {defaultShifts && (
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Default Shifts Created</div>
              <div className="card-subtitle">
                {defaultShifts.length} shifts created for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="stack-v" style={{ gap: '8px' }}>
            {defaultShifts.map((shift, idx) => (
              <div key={shift.id || idx} className="message-bubble ai" style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>
                  {shift.startTime} - {shift.endTime}
                </div>
                <div className="secondary-text" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                  Skill: {shift.requiredSkill.replace('_', ' ')}
                </div>
                <div className="secondary-text" style={{ fontSize: '0.75rem' }}>
                  Status: {shift.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!roster && !defaultShifts && (
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Getting Started</div>
            </div>
          </div>
          <div className="stack-v">
            <p className="secondary-text">
              <strong>Generate Smart Schedule:</strong> Uses AI to automatically assign staff based on availability and requirements.
            </p>
            <p className="secondary-text">
              <strong>Create Default Shifts:</strong> Creates standard shift templates (10 AM - 10 PM) that you can then assign staff to manually.
            </p>
          </div>
        </section>
      )}
    </>
  );
};
