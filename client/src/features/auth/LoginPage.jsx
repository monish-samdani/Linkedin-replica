import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/ui/FormInput';
import PasswordInput from '../../components/ui/PasswordInput';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(form);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-1 px-4 py-16">
      <div className="card mx-auto max-w-md p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-brand-500 text-lg font-bold text-white">
            in
          </div>
        </div>
        <h1 className="text-center font-display text-2xl text-gray-900">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Sign in to your LinkedIn Replica account</p>

        {error && (
          <div className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          <PasswordInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-brand-500 hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-600">
          New to LinkedIn Replica?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:underline">
            Join now
          </Link>
        </p>
      </div>
    </div>
  );
}
