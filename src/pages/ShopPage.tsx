import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Category } from '@/lib/types';
import { useRouter } from '@/context/RouterContext';
import { useCart } from '@/context/CartContext';
import { ProductCard } from './HomePage';
import { SlidersHorizontal, Search, X } from 'lucide-react';

export function ShopPage() {
  const { navigate, path } = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [sort, setSort] = useState<'new' | 'low' | 'high'>('new');
  const [search, setSearch] = useState('');

  // Parse category from query
  useEffect(() => {
    const qIndex = path.indexOf('?');
    if (qIndex >= 0) {
      const params = new URLSearchParams(path.slice(qIndex + 1));
      const cat = params.get('cat');
      if (cat) setActiveCat(cat);
    }
  }, [path]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const list: Category[] = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Category));
        list.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(list);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let q = collection(db, 'products');
        let snap;
        if (activeCat !== 'all') {
          const cat = categories.find((c) => c.slug === activeCat);
          if (cat) {
            snap = await getDocs(query(q, where('category_id', '==', cat.id)));
          } else {
            snap = await getDocs(q);
          }
        } else {
          snap = await getDocs(q);
        }

        let list: Product[] = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Product));

        // In-memory search filter
        if (search.trim()) {
          const term = search.trim().toLowerCase();
          list = list.filter((p) => p.name.toLowerCase().includes(term));
        }

        // In-memory sorting
        if (sort === 'low') {
          list.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sort === 'high') {
          list.sort((a, b) => Number(b.price) - Number(a.price));
        } else {
          list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }

        setProducts(list);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCat, sort, categories, search]);

  return (
    <div className="fade-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold text-cream-800 sm:text-4xl">Shop</h1>
        <p className="mt-2 text-sm text-cream-500">Curated pieces in warm, natural tones</p>
      </div>

      {/* Search bar */}
      <div className="mx-auto mt-6 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full rounded-full border border-cream-200 bg-white py-3 pl-12 pr-10 text-sm text-cream-800 placeholder-cream-400 focus:border-cream-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:mt-6 sm:flex-row">
        <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <FilterChip active={activeCat === 'all'} onClick={() => setActiveCat('all')}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={activeCat === c.slug} onClick={() => setActiveCat(c.slug)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-cream-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-cream-200 bg-white px-4 py-2 text-sm text-cream-700 focus:border-cream-500 focus:outline-none"
          >
            <option value="new">Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-cream-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-12 text-center text-cream-500 sm:mt-16">
          {search.trim() ? `No products found for "${search}".` : 'No products found in this category.'}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={() => navigate(`/product/${p.id}`)}
              onAdd={() => addItem(p, 1, p.sizes[0] ?? 'One Size', p.colors[0] ?? 'Default')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-cream-700 text-white' : 'border border-cream-200 bg-white text-cream-700 hover:bg-cream-50'
      }`}
    >
      {children}
    </button>
  );
}
