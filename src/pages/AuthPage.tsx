import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === 'signup') {
      const nameErr = validateName(name);
      if (nameErr) errs.name = nameErr;
    }
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, name);
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
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-cream-500">
          {mode === 'signin' ? 'Sign in to your Azaleya account' : 'Join Azaleya to shop and track orders'}
        </p>

        {/* Email/password form */}
        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-cream-600">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              />
              {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name}</span>}
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && <span className="mt-1 block text-xs text-red-500">{errors.email}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field ${errors.password ? 'border-red-400' : ''}`}
            />
            {errors.password && <span className="mt-1 block text-xs text-red-500">{errors.password}</span>}
          </label>

          {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cream-600">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrors({});
            }}
            className="font-medium text-cream-800 underline underline-offset-2"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

