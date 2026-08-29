import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import type { Order, OrderItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Package } from 'lucide-react';

export function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const loadUserOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), where('user_id', '==', user.id));
        const snap = await getDocs(q);
        const list: (Order & { items: OrderItem[] })[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            ...data,
            items: data.order_items || [],
          } as Order & { items: OrderItem[] });
        });
        list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setOrders(list);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="fade-in mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">My account</h1>
          <p className="mt-1 text-sm text-cream-500">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="btn-outline">
              Admin panel
            </button>
          )}
          <button onClick={signOut} className="btn-ghost">
            Sign out
          </button>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-cream-500 sm:mt-10">Order history</h2>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-cream-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 card p-6 text-center sm:p-10">
          <Package size={40} className="mx-auto text-cream-300" />
          <p className="mt-3 text-sm text-cream-600">You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary mt-4">
            Start shopping
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3 sm:space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-cream-800">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-cream-500">
                    {new Date(o.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.order_status} />
                  <span className="text-sm font-semibold text-cream-800">{formatPrice(o.total)}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
                {o.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-2 rounded-lg bg-cream-50 p-2">
                    <div className="h-12 w-10 overflow-hidden rounded bg-cream-200">
                      {it.product_image && (
                        <img src={it.product_image} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-cream-800">{it.product_name}</p>
                      <p className="text-[11px] text-cream-500">
                        {it.size} · {it.color} · Qty {it.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colors[status] ?? 'bg-cream-100 text-cream-700'}`}>
      {status}
    </span>
  );
}
