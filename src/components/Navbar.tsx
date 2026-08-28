import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';

export function Navbar() {
  const { totalItems } = useCart();
  const { user, profile, signOut } = useAuth();
  const { navigate, path } = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'About', to: '/about' },
  ];

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cream-100 bg-cream-50/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          className="rounded-full p-2 text-cream-700 hover:bg-cream-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <button onClick={() => go('/')} className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-wide text-cream-800">
            AZALEYA
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          {links.map((l) => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className={`text-sm font-medium transition-colors ${
                path === l.to ? 'text-cream-800' : 'text-cream-600 hover:text-cream-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {profile?.role === 'admin' && (
            <button
              onClick={() => go('/admin')}
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-cream-700 hover:bg-cream-100 md:inline-flex"
            >
              Admin
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => go('/account')}
                className="rounded-full p-2 text-cream-700 hover:bg-cream-100"
                aria-label="Account"
              >
                <User size={20} />
              </button>
              <button
                onClick={signOut}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-cream-600 hover:bg-cream-100 md:inline-flex"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => go('/auth')}
              className="rounded-full p-2 text-cream-700 hover:bg-cream-100"
              aria-label="Sign in"
            >
              <User size={20} />
            </button>
          )}
          <button
            onClick={() => go('/cart')}
            className="relative rounded-full p-2 text-cream-700 hover:bg-cream-100"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-cream-700 px-1 text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-cream-100 bg-cream-50 md:hidden">
          <div className="flex flex-col px-4 py-2">
            {links.map((l) => (
              <button
                key={l.to}
                onClick={() => go(l.to)}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-cream-700 hover:bg-cream-100"
              >
                {l.label}
              </button>
            ))}
            {profile?.role === 'admin' && (
              <button
                onClick={() => go('/admin')}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-cream-700 hover:bg-cream-100"
              >
                Admin Panel
              </button>
            )}
            {user && (
              <button
                onClick={() => go('/account')}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-cream-700 hover:bg-cream-100"
              >
                My Account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
