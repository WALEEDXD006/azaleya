import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import type { ShippingRate } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { validateEmail, validateRequired, validatePhone, validatePostalCode } from '@/lib/validation';
import { Banknote, Check } from 'lucide-react';

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { navigate } = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.email?.split('@')[0] ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: 'Pakistan',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const snap = await getDocs(collection(db, 'shipping_rates'));
        const list: ShippingRate[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ShippingRate));
        setShippingRates(list);
      } catch (err) {
        console.error('Error loading shipping rates:', err);
      }
    };
    loadRates();
  }, []);

  const getShippingRate = () => {
    const cityRate = shippingRates.find(
      (r) => !r.is_default && r.city.toLowerCase() === form.city.trim().toLowerCase(),
    );
    if (cityRate) return cityRate.rate;
    const defaultRate = shippingRates.find((r) => r.is_default);
    return defaultRate?.rate ?? 300;
  };

  const shipping = getShippingRate();
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-cream-600 text-lg font-medium">You need to be signed in to place an order.</p>
        <p className="mt-2 text-sm text-cream-500">Please sign in or create an account to continue.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate('/signin')} className="btn-primary">
            Sign in
          </button>
          <button onClick={() => navigate('/signup')} className="btn-outline">
            Create account
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-cream-600">Your cart is empty.</p>
        <button onClick={() => navigate('/shop')} className="btn-outline mt-6">
          Browse shop
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="fade-in mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-cream-800">Order placed!</h1>
        <p className="mt-2 text-sm text-cream-600">
          Thank you for your order. We will contact you soon on your contact number.
        </p>
        <p className="mt-1 text-xs text-cream-500">Order reference: #{done.slice(0, 8)}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => navigate('/account')} className="btn-primary">
            View my orders
          </button>
          <button onClick={() => navigate('/shop')} className="btn-outline">
            Keep shopping
          </button>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const nameErr = validateRequired(form.name, 'Full name');
    if (nameErr) errs.name = nameErr;
    else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(form.name.trim())) errs.name = 'Full name can only contain letters and spaces.';
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    const addrErr = validateRequired(form.address, 'Address');
    if (addrErr) errs.address = addrErr;
    const cityErr = validateRequired(form.city, 'City');
    if (cityErr) errs.city = cityErr;
    else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(form.city.trim())) errs.city = 'City can only contain letters and spaces.';
    const postalErr = validatePostalCode(form.postal);
    if (postalErr) errs.postal = postalErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;

    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.image_url,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: Number(i.product.price),
      }));

      const docRef = await addDoc(collection(db, 'orders'), {
        user_id: user?.id ?? null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: `+92${form.phone.replace(/^0/, '')}`,
        shipping_address: form.address,
        city: form.city,
        postal_code: form.postal,
        country: form.country,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'pending',
        total,
        order_items: orderItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      clearCart();
      setDone(docRef.id);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="fade-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2 lg:space-y-8">
          {/* Contact + shipping */}
          <section className="card p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cream-500">
              Shipping details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v.replace(/[^A-Za-z .'-]/g, '') })} error={errors.name} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v.replace(/[^0-9+ -]/g, '') })} error={errors.phone} placeholder="03xx-xxxxxxx" />
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v.replace(/[^A-Za-z .'-]/g, '') })} error={errors.city} />
              <div className="sm:col-span-2">
                <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} error={errors.address} />
              </div>
              <Field label="Postal code" value={form.postal} onChange={(v) => setForm({ ...form, postal: v.replace(/\D/g, '') })} error={errors.postal} />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-cream-600">Country</span>
                <input
                  value="Pakistan"
                  readOnly
                  className="input-field cursor-not-allowed bg-cream-50 text-cream-500"
                />
              </label>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cream-500">Payment method</h2>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-cream-700 bg-cream-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-700 text-white">
                <Banknote size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-cream-800">Cash on Delivery</p>
                <p className="text-xs text-cream-500">Pay in cash when your order arrives at your doorstep</p>
              </div>
              <div className="h-4 w-4 rounded-full border-2 border-cream-700 bg-cream-700" />
            </div>
          </section>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cream-500">Order summary</h2>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={`${i.product.id}-${i.size}-${i.color}`} className="flex gap-3">
                  <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100">
                    {i.product.image_url && (
                      <img src={i.product.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cream-800">{i.product.name}</p>
                    <p className="text-xs text-cream-500">
                      {i.size} · {i.color} · Qty {i.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-cream-700">
                    {formatPrice(Number(i.product.price) * i.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-cream-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-cream-600">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream-600">Shipping</dt>
                <dd className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-cream-100 pt-2">
                <dt className="font-semibold text-cream-800">Total</dt>
                <dd className="font-semibold text-cream-800">{formatPrice(total)}</dd>
              </div>
            </dl>

            {errors.form && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>}

            <button onClick={placeOrder} disabled={placing} className="btn-primary mt-6 w-full">
              {placing ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-cream-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${error ? 'border-red-400' : ''}`}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
