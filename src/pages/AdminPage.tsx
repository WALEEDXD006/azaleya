import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import type { Product, Category, Order, OrderItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { ShoppingBag, LayoutGrid, TrendingUp, Truck, Tag, Users } from 'lucide-react';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminShipping } from '@/components/admin/AdminShipping';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminUsers } from '@/components/admin/AdminUsers';

type Tab = 'overview' | 'categories' | 'products' | 'orders' | 'shipping' | 'users';

export function AdminPage() {
  const { user, profile, loading } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const loadOrders = async () => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
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
      console.error('Error fetching admin orders:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const list: Product[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Product));
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setProducts(list);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      Promise.all([loadOrders(), loadProducts()]).finally(() => setDataLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  if (loading || (!user && dataLoading)) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-cream-500">Loading…</div>;
  }
  if (!user || profile?.role !== 'admin') return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'categories', label: 'Categories', icon: <Tag size={16} /> },
    { id: 'products', label: 'Products', icon: <LayoutGrid size={16} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
    { id: 'shipping', label: 'Shipping', icon: <Truck size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
  ];

  return (
    <div className="fade-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">Admin Panel</h1>
          <p className="mt-1 text-sm text-cream-500">Manage products and review orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-cream-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
              tab === t.id
                ? 'border-cream-700 text-cream-800'
                : 'border-transparent text-cream-500 hover:text-cream-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overview' && <AdminOverview orders={orders} products={products} />}
        {tab === 'categories' && <AdminCategories />}
        {tab === 'products' && <AdminProducts products={products} onChange={loadProducts} />}
        {tab === 'orders' && <AdminOrders orders={orders} onChange={loadOrders} />}
        {tab === 'shipping' && <AdminShipping />}
        {tab === 'users' && <AdminUsers />}
      </div>
    </div>
  );
}

export type AdminProductsProps = {
  products: Product[];
  onChange: () => void;
};

export type AdminOrdersProps = {
  orders: (Order & { items: OrderItem[] })[];
  onChange: () => void;
};

export type AdminOverviewProps = {
  orders: (Order & { items: OrderItem[] })[];
  products: Product[];
};

export type { Product, Category, Order, OrderItem };
