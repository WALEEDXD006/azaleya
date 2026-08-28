import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminOrdersProps } from '@/pages/AdminPage';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export function AdminOrders({ orders, onChange }: AdminOrdersProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (order: Order, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        order_status: status,
        updated_at: new Date().toISOString(),
      });
      onChange();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  return (
    <div>
      <p className="text-sm text-cream-500">{orders.length} orders</p>

      <div className="mt-4 space-y-3">
        {orders.length === 0 && (
          <div className="card p-10 text-center text-sm text-cream-500">No orders yet.</div>
        )}
        {orders.map((o) => {
          const open = expanded === o.id;
          return (
            <div key={o.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(open ? null : o.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-cream-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-cream-600">
                    #{o.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream-800">{o.customer_name}</p>
                    <p className="text-xs text-cream-500">
                      {new Date(o.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {o.items.length} item{o.items.length !== 1 && 's'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-cream-800">{formatPrice(o.total)}</span>
                  <StatusPill status={o.order_status} />
                  {open ? <ChevronUp size={16} className="text-cream-400" /> : <ChevronDown size={16} className="text-cream-400" />}
                </div>
              </button>

              {open && (
                <div className="border-t border-cream-100 bg-cream-50/40 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-500">Customer</h4>
                      <dl className="mt-2 space-y-1 text-sm text-cream-700">
                        <div><dt className="inline font-medium">Email: </dt><dd className="inline">{o.customer_email}</dd></div>
                        {o.customer_phone && <div><dt className="inline font-medium">Phone: </dt><dd className="inline">{o.customer_phone}</dd></div>}
                      </dl>
                      <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-cream-500">Shipping</h4>
                      <p className="mt-2 text-sm text-cream-700">
                        {o.shipping_address}<br />
                        {o.city}{o.postal_code ? `, ${o.postal_code}` : ''}<br />
                        {o.country}
                      </p>
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-500">Payment</h4>
                        <p className="mt-2 text-sm text-cream-700 capitalize">
                          {o.payment_method === 'cod' ? 'Cash on Delivery' : o.payment_method} ·{' '}
                          <span className={o.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                            {o.payment_status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-500">Items</h4>
                      <div className="mt-2 space-y-2">
                        {o.items.map((it: OrderItem) => (
                          <div key={it.id} className="flex items-center gap-3 rounded-lg bg-white p-2">
                            <div className="h-12 w-10 overflow-hidden rounded bg-cream-100">
                              {it.product_image && <img src={it.product_image} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-cream-800">{it.product_name}</p>
                              <p className="text-xs text-cream-500">
                                {it.size} · {it.color} · Qty {it.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-cream-700">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-500">Update status</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(o, s)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                                o.order_status === s
                                  ? 'bg-cream-700 text-white'
                                  : 'border border-cream-200 bg-white text-cream-700 hover:bg-cream-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`hidden rounded-full px-3 py-1 text-xs font-medium capitalize sm:inline ${colors[status] ?? 'bg-cream-100 text-cream-700'}`}>
      {status}
    </span>
  );
}
