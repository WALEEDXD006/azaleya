import { formatPrice } from '@/lib/format';
import { ShoppingBag, Package, IndianRupee, Clock } from 'lucide-react';
import type { AdminOverviewProps } from '@/pages/AdminPage';

export function AdminOverview({ orders, products }: AdminOverviewProps) {
  const revenue = orders
    .filter((o) => o.payment_status === 'paid' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => o.order_status === 'pending').length;
  const lowStock = products.filter((p) => p.stock <= 5);

  const stats = [
    { label: 'Total revenue', value: formatPrice(revenue), icon: <IndianRupee size={18} />, tint: 'bg-green-100 text-green-700' },
    { label: 'Orders', value: String(orders.length), icon: <ShoppingBag size={18} />, tint: 'bg-blue-100 text-blue-700' },
    { label: 'Pending orders', value: String(pending), icon: <Clock size={18} />, tint: 'bg-amber-100 text-amber-700' },
    { label: 'Products', value: String(products.length), icon: <Package size={18} />, tint: 'bg-cream-200 text-cream-700' },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${s.tint}`}>{s.icon}</div>
            <p className="mt-3 text-2xl font-semibold text-cream-800">{s.value}</p>
            <p className="text-xs text-cream-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-cream-800">Recent orders</h3>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-cream-500">No orders yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-cream-800">{o.customer_name}</p>
                    <p className="text-xs text-cream-500">{o.items.length} items</p>
                  </div>
                  <span className="font-medium text-cream-700">{formatPrice(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-cream-800">Low stock alert</h3>
          {lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-cream-500">All products are well stocked.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-cream-800">{p.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
