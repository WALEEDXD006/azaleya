import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { ShippingRate } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [defaultRate, setDefaultRate] = useState(300);

  useEffect(() => {
    api.get<ShippingRate[]>('/shipping-rates').then(({ data }) => {
      const rates = data ?? [];
      const def = rates.find((r) => r.is_default);
      if (def) setDefaultRate(def.rate);
    });
  }, []);

  if (items.length === 0) {
    return (
      <div className="fade-in mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-cream-300" />
        <h1 className="mt-4 font-serif text-3xl font-semibold text-cream-800">Your cart is empty</h1>
        <p className="mt-2 text-sm text-cream-500">Add some pieces you love to get started.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6">
          Browse the shop
        </button>
      </div>
    );
  }

  const shipping = subtotal >= 15000 ? 0 : defaultRate;
  const total = subtotal + shipping;

  return (
    <div className="fade-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">Shopping Cart</h1>
      <p className="mt-1 text-sm text-cream-500">{totalItems} item{totalItems !== 1 && 's'}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="card flex gap-4 p-4"
              >
                <button
                  onClick={() => navigate(`/product/${item.product.id}`)}
                  className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100"
                >
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-cream-400 text-xs">No image</div>
                  )}
                </button>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-cream-800">{item.product.name}</h3>
                      <p className="mt-1 text-xs text-cream-500">
                        {item.size} · {item.color}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.size, item.color)}
                      className="rounded-full p-2 text-cream-400 transition-colors hover:bg-cream-50 hover:text-red-500"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-cream-200">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="px-3 py-1.5 text-cream-700 hover:text-cream-900"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="px-3 py-1.5 text-cream-700 hover:text-cream-900"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-cream-700">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cream-500">Order Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-cream-600">Subtotal</dt>
                <dd className="font-medium text-cream-800">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream-600">Shipping</dt>
                <dd className="font-medium text-cream-800">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </dd>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-cream-500">
                  Add {formatPrice(15000 - subtotal)} more for free shipping.
                </p>
              )}
              <div className="border-t border-cream-100 pt-3">
                <div className="flex justify-between">
                  <dt className="text-base font-semibold text-cream-800">Total</dt>
                  <dd className="text-base font-semibold text-cream-800">{formatPrice(total)}</dd>
                </div>
              </div>
            </dl>
            <button
              onClick={() => navigate(user ? '/checkout' : '/signin')}
              className="btn-primary mt-6 w-full"
            >
              {user ? 'Proceed to checkout' : 'Sign in to checkout'}
            </button>
            <button onClick={() => navigate('/shop')} className="btn-ghost mt-2 w-full">
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
