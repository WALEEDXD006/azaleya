import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { validateEmail, validatePassword } from '@/lib/validation';

export function SignInPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fade-in mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 sm:py-16">
      <div className="card p-6 sm:p-8">
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
            <span className="mb-1 block text-xs font-medium text-cream-600">Password</span>
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
      </div>
    </div>
  );
}
