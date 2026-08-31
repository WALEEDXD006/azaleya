import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { validateEmail, validatePassword } from '@/lib/validation';
import { CheckCircle2 } from 'lucide-react';

type Mode = 'signin' | 'forgot';

export function SignInPage() {
  const { signIn, resetPassword } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.error) {
      setErrors({ form: res.error });
      return;
    }
    navigate('/');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const emailErr = validateEmail(resetEmail);
    if (emailErr) { setResetError(emailErr); return; }

    setResetLoading(true);
    const res = await resetPassword(resetEmail);
    setResetLoading(false);
    if (res.error) {
      setResetError(res.error);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="fade-in mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 sm:py-16">
      <div className="card p-6 sm:p-8">

        {/* ── Sign In ── */}
        {mode === 'signin' && (
          <>
            <h1 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-cream-500">Sign in to your Azaleya account</p>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-cream-600">Email</span>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="mt-1 block text-xs text-red-500">{errors.email}</span>}
              </label>

              <label className="block">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-cream-600">Password</span>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setResetEmail(email); }}
                    className="text-xs text-cream-500 underline underline-offset-2 hover:text-cream-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && <span className="mt-1 block text-xs text-red-500">{errors.password}</span>}
              </label>

              {errors.form && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>
              )}

              <button id="signin-submit" type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-cream-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-cream-800 underline underline-offset-2"
              >
                Create one
              </button>
            </p>
          </>
        )}

        {/* ── Forgot Password ── */}
        {mode === 'forgot' && (
          <>
            {resetSent ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h1 className="mt-4 font-serif text-2xl font-semibold text-cream-800">Check your inbox</h1>
                <p className="mt-2 text-sm text-cream-500">
                  We sent a password reset link to <span className="font-medium text-cream-700">{resetEmail}</span>.
                  Check your email and follow the link to set a new password.
                </p>
                <button
                  onClick={() => { setMode('signin'); setResetSent(false); }}
                  className="btn-primary mt-6 w-full"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setMode('signin')}
                  className="mb-4 flex items-center gap-1 text-xs text-cream-500 hover:text-cream-800 transition-colors"
                >
                  ← Back to sign in
                </button>
                <h1 className="font-serif text-2xl font-semibold text-cream-800">Reset your password</h1>
                <p className="mt-1 text-sm text-cream-500">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleReset} className="mt-6 space-y-4" noValidate>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-cream-600">Email address</span>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className={`input-field ${resetError ? 'border-red-400' : ''}`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {resetError && <span className="mt-1 block text-xs text-red-500">{resetError}</span>}
                  </label>

                  <button type="submit" disabled={resetLoading} className="btn-primary w-full">
                    {resetLoading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
