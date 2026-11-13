import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { authService } from '@/services/authService';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', role: 'CONSUMER' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const data = await authService.login({ email: formData.email, password: formData.password });
        if (data && data.token) {
          localStorage.setItem('auth_token', data.token);
          navigate('/consumer'); // Redirect to protected route
        }
      } else {
        await authService.register(formData);
        // After registration, login automatically or redirect
        const data = await authService.login({ email: formData.email, password: formData.password });
        if (data && data.token) {
          localStorage.setItem('auth_token', data.token);
          navigate('/consumer');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MarketingLayout compactHeader={false} showFooter={false} showLoginAction={false}>
      <section className="surface-shell flex items-center justify-center py-20">
        <div className="page-card w-full max-w-md p-8">
          <div className="text-center">
            <p className="muted-label">Account Access</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1b1c1c]">{isLogin ? 'Sign in to Vendex' : 'Create your account'}</h1>
          </div>
          
          {error && (
            <div className="mt-4 p-3 border border-red-200 bg-red-50 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <input 
                className="input-field" 
                name="username"
                placeholder="Username" 
                value={formData.username}
                onChange={handleInputChange}
                required 
              />
            )}
            <input 
              className="input-field" 
              name="email"
              placeholder="Email address" 
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
            <input 
              className="input-field" 
              name="password"
              placeholder="Password" 
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
            {!isLogin && (
              <input 
                className="input-field" 
                name="role"
                placeholder="Role (CONSUMER, STORE_OWNER, MANUFACTURER)" 
                value={formData.role}
                onChange={handleInputChange}
              />
            )}
            <button 
              className="btn-primary w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </form>
          
          <button 
            className="mt-4 w-full text-sm font-semibold text-[#003d4c]" 
            onClick={() => { setIsLogin(!isLogin); setError(null); }} 
            type="button"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-[#656464] hover:text-[#003d4c]">
              Return home
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
