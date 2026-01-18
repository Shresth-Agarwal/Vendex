import React, { useEffect, useState } from 'react';
import { bootstrapAuthFromStorage, loginUser, logoutUser, registerUser } from '../api/auth';
import {
  adminDeleteUser,
  adminGetUsers,
  adminUpdateUserRole,
  deleteCurrentUser,
  getCurrentUser
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

export const AuthAndAdminView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerPayload, setRegisterPayload] = useState(
    JSON.stringify(
      {
        email: 'admin@example.com',
        username: 'admin',
        password: 'changeme',
        role: 'ADMIN'
      },
      null,
      2
    )
  );
  const [currentUser, setCurrentUser] = useState<JsonLike>(null);
  const [users, setUsers] = useState<JsonLike>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      bootstrapAuthFromStorage();
    } catch {
      // ignore SSR issues
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    try {
      await loginUser({ email, password });
      setStatus('Logged in. Token stored in localStorage and attached to future requests.');
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    try {
      const payload = JSON.parse(registerPayload);
      await registerUser(payload);
      setStatus('User registered successfully.');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Registration payload is not valid JSON.');
      } else {
        const apiErr = toApiError(err);
        setError(apiErr.message);
      }
    }
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Authentication</div>
            <div className="card-subtitle">
              Use Spring Boot&apos;s JWT endpoints for register / login. Token is then
              reused for protected user/admin APIs.
            </div>
          </div>
          <span className="card-badge">/register · /login · /user · /admin</span>
        </div>
        {error && <div className="error-text">Error: {error}</div>}
        {status && <div className="secondary-text">{status}</div>}

        <div className="stack-h wrap">
          <form onSubmit={handleLogin} className="stack-v" style={{ flex: 1 }}>
            <div className="field-label">Login</div>
            <input
              className="text-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="text-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="stack-h wrap">
              <button type="submit" className="primary-button">
                Login
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  logoutUser();
                  setStatus('Logged out and token cleared.');
                }}
              >
                Logout
              </button>
            </div>
          </form>

          <form onSubmit={handleRegister} className="stack-v" style={{ flex: 1 }}>
            <div className="field-label">Register payload (JSON)</div>
            <textarea
              className="text-input textarea-input"
              value={registerPayload}
              onChange={(e) => setRegisterPayload(e.target.value)}
            />
            <button type="submit" className="primary-button">
              Register user
            </button>
          </form>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Current user</div>
            <div className="card-subtitle">
              Uses <code>/user/me</code> and <code>/user/me</code> DELETE. Requires a
              valid JWT from the auth panel.
            </div>
          </div>
        </div>
        <div className="stack-h wrap">
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              setError(null);
              try {
                const data = await getCurrentUser();
                setCurrentUser(data);
              } catch (err) {
                const apiErr = toApiError(err);
                setError(apiErr.message);
              }
            }}
          >
            Load current user
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              setError(null);
              try {
                await deleteCurrentUser();
                setCurrentUser(null);
                setStatus('Current user deleted.');
              } catch (err) {
                const apiErr = toApiError(err);
                setError(apiErr.message);
              }
            }}
          >
            Delete current user
          </button>
        </div>
        <JsonViewer value={currentUser} />
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Admin</div>
            <div className="card-subtitle">
              Explore admin-only endpoints under <code>/admin</code>. Requires ADMIN role.
            </div>
          </div>
        </div>
        <div className="stack-h wrap">
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              setError(null);
              try {
                const data = await adminGetUsers();
                setUsers(data);
              } catch (err) {
                const apiErr = toApiError(err);
                setError(apiErr.message);
              }
            }}
          >
            Load all users
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              const idStr = window.prompt('User id to delete?');
              if (!idStr) return;
              setError(null);
              try {
                await adminDeleteUser(Number(idStr));
                const data = await adminGetUsers();
                setUsers(data);
              } catch (err) {
                const apiErr = toApiError(err);
                setError(apiErr.message);
              }
            }}
          >
            Delete user by id
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              const userId = window.prompt('User id to change role?');
              const role = window.prompt('New role (e.g. ADMIN or USER)?');
              if (!userId || !role) return;
              setError(null);
              try {
                await adminUpdateUserRole({
                  userId: Number(userId),
                  role
                });
                const data = await adminGetUsers();
                setUsers(data);
              } catch (err) {
                const apiErr = toApiError(err);
                setError(apiErr.message);
              }
            }}
          >
            Change user role
          </button>
        </div>
        <JsonViewer value={users} />
      </section>
    </>
  );
};

