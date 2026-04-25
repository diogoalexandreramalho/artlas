import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/auth/AuthContext';
import { AuthSplit, Field } from '@/features/auth/AuthSplit';
import { ApiError } from '@/lib/api';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(email, password);
      navigate(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplit>
      <div className="eyebrow mb-4">Open an account</div>
      <h1 className="display m-0" style={{ fontSize: 60 }}>
        Start your <span style={{ fontStyle: 'italic' }}>list</span>
      </h1>
      <p
        className="font-display mt-3.5 text-ink-2"
        style={{ fontSize: 18, fontStyle: 'italic' }}
      >
        A wishlist that thinks in cities.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-3.5">
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="input"
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••• (min 8 chars)"
            className="input"
            autoComplete="new-password"
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary mt-2 disabled:opacity-50"
          style={{ height: 48 }}
        >
          {isSubmitting ? 'Creating…' : 'Create account'} <Icon.arrow />
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-2">
        Already have an account?{' '}
        <Link
          to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`}
          className="cursor-pointer text-accent-deep"
          style={{ borderBottom: '1px solid currentColor' }}
        >
          Sign in
        </Link>
      </p>
    </AuthSplit>
  );
}
