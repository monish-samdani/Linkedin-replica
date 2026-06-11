import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/ui/FormInput';
import PasswordInput from '../../components/ui/PasswordInput';

function getPasswordStrength(password) {
  if (!password) return 0;
  if (password.length < 8) return 1;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (hasUpper && hasNumber && password.length >= 8) return 3;
  if (hasUpper || hasNumber) return 2;
  return 1;
}

function StrengthBars({ strength }) {
  const colors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];
  return (
    <div className="mb-4 flex gap-1">
      {[1, 2, 3].map((level) => (
        <div
          key={level}
          className={`h-1 flex-1 rounded ${strength >= level ? colors[strength] : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/profile/setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <h1 className="text-center font-display text-xl text-gray-900">
          Make the most of your professional life
        </h1>

        {error && (
          <div className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <FormInput
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
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
          <StrengthBars strength={strength} />
          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Agree & Join'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already on LinkedIn Replica?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
