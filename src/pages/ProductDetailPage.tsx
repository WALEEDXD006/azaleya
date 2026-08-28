import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductReview } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useRouter } from '@/context/RouterContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { validateRequired, validateRating } from '@/lib/validation';
import { ShoppingBag, Check, ArrowLeft, Star } from 'lucide-react';

export function ProductDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<Product[]>([]);

  const loadReviews = async (productId: string) => {
    try {
      const q = query(collection(db, 'product_reviews'), where('product_id', '==', productId));
      const snap = await getDocs(q);
      const rlist: ProductReview[] = [];
      snap.forEach((d) => rlist.push({ id: d.id, ...d.data() } as ProductReview));
      rlist.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setReviews(rlist);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() } as Product;
          setProduct(p);
          setSize(p.sizes[0] ?? 'One Size');
          setColor(p.colors[0] ?? 'Default');

          // Load reviews
          await loadReviews(p.id);

          // Load related products
          try {
            const relSnap = await getDocs(collection(db, 'products'));
            const rlist: Product[] = [];
            relSnap.forEach((d) => {
              if (d.id !== p.id) {
                const item = { id: d.id, ...d.data() } as Product;
                if (!p.category_id || item.category_id === p.category_id) {
                  rlist.push(item);
                }
              }
            });
            setRelated(rlist.slice(0, 4));
          } catch (e) {
            console.error('Error fetching related products:', e);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, qty, size, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-cream-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-cream-100" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-cream-100" />
            <div className="h-24 w-full animate-pulse rounded bg-cream-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-cream-600">This product could not be found.</p>
        <button onClick={() => navigate('/shop')} className="btn-outline mt-6">
          Back to shop
        </button>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="fade-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <button
        onClick={() => navigate('/shop')}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-cream-600 hover:text-cream-800 sm:mb-6"
      >
        <ArrowLeft size={16} /> Back to shop
      </button>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-cream-100 sm:rounded-3xl">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-cream-400">No image</div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 sm:mt-3">
            <p className="text-xl font-semibold text-cream-700 sm:text-2xl">{formatPrice(product.price)}</p>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-cream-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-cream-500">({reviews.length} review{reviews.length !== 1 && 's'})</span>
              </div>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-cream-600">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream-500">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[3rem] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      size === s
                        ? 'border-cream-700 bg-cream-700 text-white'
                        : 'border-cream-200 bg-white text-cream-700 hover:border-cream-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream-500">Color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      color === c
                        ? 'border-cream-700 bg-cream-700 text-white'
                        : 'border-cream-200 bg-white text-cream-700 hover:border-cream-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-cream-500">Quantity</p>
            <div className="mt-2 inline-flex items-center rounded-full border border-cream-200 bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-cream-700 hover:text-cream-900"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 text-cream-700 hover:text-cream-900"
              >
                +
              </button>
            </div>
          </div>

          {product.stock === 0 ? (
            <p className="mt-8 text-sm font-medium text-red-600">Currently sold out</p>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={handleAdd} className="btn-primary">
                {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                {added ? 'Added to cart' : 'Add to cart'}
              </button>
              <button onClick={() => navigate('/cart')} className="btn-outline">
                View cart
              </button>
            </div>
          )}

          <p className="mt-6 text-xs text-cream-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} · Free shipping over PKR 15,000
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12 sm:mt-16">
        <h2 className="font-serif text-xl font-semibold text-cream-800 sm:text-2xl">Customer Reviews</h2>
        <div className="mt-2 flex items-center gap-3">
          {reviews.length > 0 ? (
            <>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={18}
                    className={n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-cream-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-cream-600">
                {avgRating.toFixed(1)} out of 5 · {reviews.length} review{reviews.length !== 1 && 's'}
              </span>
            </>
          ) : (
            <span className="text-sm text-cream-500">No reviews yet. Be the first to review this product.</span>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Review list */}
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-sm font-semibold text-cream-700">
                      {r.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cream-800">{r.user_name}</p>
                      <p className="text-xs text-cream-400">
                        {new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-cream-200'}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-cream-800">{r.title}</p>
                {r.body && <p className="mt-1 text-sm leading-relaxed text-cream-600">{r.body}</p>}
              </div>
            ))}
          </div>

          {/* Review form */}
          <ReviewForm
            productId={product.id}
            userName={user?.email?.split('@')[0] ?? ''}
            onSubmitted={() => {
              loadReviews(product.id);
            }}
          />
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <h2 className="font-serif text-xl font-semibold text-cream-800 sm:text-2xl">You may also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <button key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group card overflow-hidden text-left">
                <div className="relative block aspect-[3/4] w-full overflow-hidden bg-cream-100">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-cream-400">No image</div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-xs font-medium text-cream-800 sm:text-sm">{p.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-cream-700 sm:mt-2 sm:text-sm">{formatPrice(p.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewForm({
  productId,
  userName,
  onSubmitted,
}: {
  productId: string;
  userName: string;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState(userName);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    const errs: Record<string, string> = {};
    const nameErr = validateRequired(name, 'Your name');
    if (nameErr) errs.name = nameErr;
    const ratingErr = validateRating(rating);
    if (ratingErr) errs.rating = ratingErr;
    const titleErr = validateRequired(title, 'Review title');
    if (titleErr) errs.title = titleErr;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'product_reviews'), {
        product_id: productId,
        user_name: name.trim(),
        rating,
        title: title.trim(),
        body: body.trim() || null,
        created_at: new Date().toISOString(),
      });
      setSaving(false);
      setSuccess(true);
      setTitle('');
      setBody('');
      setRating(0);
      setTimeout(() => setSuccess(false), 3000);
      onSubmitted();
    } catch (err: any) {
      setSaving(false);
      setErrors({ form: err.message || 'Failed to submit review' });
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-cream-500">Write a review</h3>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream-600">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`input-field ${errors.name ? 'border-red-400' : ''}`}
            placeholder="Your name"
          />
          {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name}</span>}
        </label>

        <div>
          <span className="mb-1 block text-xs font-medium text-cream-600">Rating</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-cream-200'}
                />
              </button>
            ))}
          </div>
          {errors.rating && <span className="mt-1 block text-xs text-red-500">{errors.rating}</span>}
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream-600">Review title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`input-field ${errors.title ? 'border-red-400' : ''}`}
            placeholder="Summarize your experience"
          />
          {errors.title && <span className="mt-1 block text-xs text-red-500">{errors.title}</span>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream-600">Review (optional)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Share details about the product, fit, quality, etc."
          />
        </label>

        {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">Review submitted! Thank you.</p>}

        <button onClick={submit} disabled={saving} className="btn-primary w-full">
          {saving ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}
