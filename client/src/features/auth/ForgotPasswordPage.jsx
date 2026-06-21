import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import FormInput from '../../components/ui/FormInput';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Something went wrong. Please try again.'
      );
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

        {submitted ? (
          <>
            <h1 className="text-center font-display text-2xl text-gray-900">Check your email</h1>
            <p className="mt-4 rounded bg-green-50 px-4 py-3 text-center text-sm text-green-700">
              If an account with that email exists, you&apos;ll receive a reset link shortly.
            </p>
            <p className="mt-6 text-center text-sm text-gray-600">
              <Link to="/login" className="font-semibold text-brand-500 hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-center font-display text-2xl text-gray-900">Forgot password?</h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-brand-500 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
