import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword, validateResetToken } from '../../api/auth';
import PasswordInput from '../../components/ui/PasswordInput';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('validating');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { valid } = await validateResetToken(token);
        if (active) setStatus(valid ? 'valid' : 'invalid');
      } catch {
        if (active) setStatus('invalid');
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, form.password);
      toast.success('Password reset! Please sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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

        {status === 'validating' && (
          <p className="text-center text-sm text-gray-600">Verifying your reset link...</p>
        )}

        {status === 'invalid' && (
          <>
            <h1 className="text-center font-display text-2xl text-gray-900">Link expired</h1>
            <p className="mt-4 rounded bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              This password reset link is invalid or has expired.
            </p>
            <p className="mt-6 text-center text-sm text-gray-600">
              <Link to="/forgot-password" className="font-semibold text-brand-500 hover:underline">
                Request a new reset link
              </Link>
            </p>
          </>
        )}

        {status === 'valid' && (
          <>
            <h1 className="text-center font-display text-2xl text-gray-900">Set a new password</h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Choose a strong password you haven&apos;t used before.
            </p>

            {error && (
              <div className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <PasswordInput
                label="New password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <PasswordInput
                label="Confirm password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Resetting...
                  </span>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              <Link to="/login" className="font-semibold text-brand-500 hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
