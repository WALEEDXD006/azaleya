import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductReview } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useRouter } from '@/context/RouterContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [topReviews, setTopReviews] = useState<(ProductReview & { product_name?: string })[]>([]);

  useEffect(() => {
    // Load featured products
    const loadFeatured = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('featured', '==', true),
          limit(4)
        );
        const snap = await getDocs(q);
        const list: Product[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Product);
        });
        setFeatured(list);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Load top reviews
    const loadTopReviews = async () => {
      try {
        const q = query(
          collection(db, 'product_reviews'),
          orderBy('rating', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        const reviews: (ProductReview & { product_name?: string })[] = [];
        snap.forEach((doc) => {
          reviews.push({ id: doc.id, ...doc.data() } as ProductReview);
        });
        setTopReviews(reviews);
      } catch (err) {
        console.error('Error fetching top reviews:', err);
      }
    };

    loadFeatured();
    loadTopReviews();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-cream-600">
              New Collection
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-cream-800 sm:text-5xl lg:text-6xl">
              Quiet luxury, <br /> crafted in earthy tones.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream-600">
              Discover Azaleya's edit of natural-fabric pieces designed for everyday elegance —
              soft linens, flowing silks, and tailored wool.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate('/shop')} className="btn-primary">
                Shop the collection <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/about')} className="btn-outline">
                Our story
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-cream-200 sm:rounded-3xl">
              <img
                src="https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg"
                alt="Azaleya collection"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="border-y border-cream-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { t: 'Natural Fabrics', d: 'Linen, silk & cotton' },
            { t: 'Free Shipping', d: 'On orders over PKR 15,000' },
            { t: 'Easy Returns', d: '7-day return window' },
            { t: 'Cash on Delivery', d: 'Pay when you receive' },
          ].map((v) => (
            <div key={v.t} className="px-3 py-5 text-center sm:px-4 sm:py-6">
              <p className="text-sm font-semibold text-cream-800">{v.t}</p>
              <p className="mt-1 text-xs text-cream-500">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">Featured pieces</h2>
            <p className="mt-1 text-sm text-cream-500">Our most-loved styles this season</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="hidden text-sm font-medium text-cream-700 hover:text-cream-800 sm:inline-flex"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-cream-100" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={() => navigate(`/product/${p.id}`)} onAdd={() => addItem(p, 1, p.sizes[0] ?? 'One Size', p.colors[0] ?? 'Default')} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews */}
      {topReviews.length > 0 && (
        <section className="bg-cream-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">What our customers say</h2>
              <p className="mt-1 text-sm text-cream-500">Real reviews from real shoppers</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {topReviews.map((r) => (
                <div key={r.id} className="card p-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={16}
                        className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-cream-200'}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-medium text-cream-800">{r.title}</p>
                  {r.body && <p className="mt-2 text-sm leading-relaxed text-cream-600">{r.body}</p>}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-xs font-semibold text-cream-700">
                      {r.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-cream-800">{r.user_name}</p>
                      {r.product_name && <p className="text-[11px] text-cream-400">on {r.product_name}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram CTA */}
      <section className="bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <h2 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">Follow us</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cream-600">
            Tag <span className="font-medium text-cream-800">@azaleya_official_</span> on Instagram to be featured.
          </p>
          <a
            href="https://instagram.com/azaleya_official_"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6"
          >
            @azaleya_official_
          </a>
        </div>
      </section>
    </div>
  );
}

export function ProductCard({
  product,
  onOpen,
  onAdd,
}: {
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="group card overflow-hidden">
      <button onClick={onOpen} className="relative block aspect-[3/4] w-full overflow-hidden bg-cream-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cream-400">No image</div>
        )}
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-cream-700">
            Sold out
          </span>
        )}
      </button>
      <div className="p-4">
        <button onClick={onOpen} className="block text-left">
          <h3 className="text-sm font-medium text-cream-800">{product.name}</h3>
        </button>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-cream-700">{formatPrice(product.price)}</span>
          <button
            onClick={onAdd}
            disabled={product.stock === 0}
            className="rounded-full bg-cream-100 p-2 text-cream-700 transition-colors hover:bg-cream-200 disabled:opacity-40"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
