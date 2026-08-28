import { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ShippingRate } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { validateRequired, validatePrice } from '@/lib/validation';
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react';

export function AdminShipping() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShippingRate | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'shipping_rates'));
      const list: ShippingRate[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ShippingRate));
      list.sort((a, b) => {
        if (a.is_default) return -1;
        if (b.is_default) return 1;
        return a.city.localeCompare(b.city);
      });
      setRates(list);
    } catch (err) {
      console.error('Error loading shipping rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (r: ShippingRate) => {
    if (r.is_default) {
      alert('The default rate cannot be deleted. You can edit it instead.');
      return;
    }
    if (!confirm(`Delete shipping rate for "${r.city}"?`)) return;
    try {
      await deleteDoc(doc(db, 'shipping_rates', r.id));
      load();
    } catch (err) {
      console.error('Error deleting shipping rate:', err);
    }
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (r: ShippingRate) => {
    setEditing(r);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-cream-500">{rates.length} shipping rates</p>
          <p className="mt-1 text-xs text-cream-400">
            Set delivery charges per city. The default rate applies when no city-specific rate is found.
          </p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add rate
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-cream-100 bg-white">
        {/* Mobile card layout */}
        <div className="divide-y divide-cream-50 sm:hidden">
          {loading && (
            <div className="px-4 py-8 text-center text-cream-400">Loading…</div>
          )}
          {!loading && rates.length === 0 && (
            <div className="px-4 py-8 text-center text-cream-400">No shipping rates yet.</div>
          )}
          {!loading && rates.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-cream-800">{r.city}</p>
                <p className="text-xs text-cream-500">{formatPrice(r.rate)}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${r.is_default ? 'bg-cream-100 text-cream-700' : 'bg-blue-50 text-blue-600'}`}>
                  {r.is_default ? 'Default' : 'City-specific'}
                </span>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={() => openEdit(r)}
                  className="rounded-full p-2 text-cream-600 hover:bg-cream-100"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => del(r)}
                  className="rounded-full p-2 text-cream-600 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table layout */}
        <table className="hidden w-full text-left text-sm sm:table">
          <thead className="bg-cream-50 text-xs uppercase tracking-wider text-cream-500">
            <tr>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Shipping Charge</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-cream-400">Loading…</td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-cream-400">No shipping rates yet.</td>
              </tr>
            ) : (
              rates.map((r) => (
                <tr key={r.id} className="hover:bg-cream-50/50">
                  <td className="px-4 py-3 font-medium text-cream-800">{r.city}</td>
                  <td className="px-4 py-3 text-cream-700">{formatPrice(r.rate)}</td>
                  <td className="px-4 py-3">
                    {r.is_default ? (
                      <span className="rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-cream-700">Default</span>
                    ) : (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">City-specific</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-full p-2 text-cream-600 hover:bg-cream-100"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => del(r)}
                        className="rounded-full p-2 text-cream-600 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ShippingForm
          rate={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ShippingForm({
  rate,
  onClose,
  onSaved,
}: {
  rate: ShippingRate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [city, setCity] = useState(rate?.city ?? '');
  const [rateVal, setRateVal] = useState(rate ? String(rate.rate) : '');
  const [isDefault, setIsDefault] = useState(rate?.is_default ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const cityErr = validateRequired(city, 'City');
    const rateErr = validatePrice(rateVal);
    if (cityErr || rateErr) {
      setError(cityErr ?? rateErr);
      return;
    }
    setSaving(true);
    const payload = {
      city: city.trim(),
      rate: Number(rateVal),
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    };
    try {
      if (rate) {
        await updateDoc(doc(db, 'shipping_rates', rate.id), payload);
      } else {
        await addDoc(collection(db, 'shipping_rates'), {
          ...payload,
          created_at: new Date().toISOString(),
        });
      }
      setSaving(false);
      onSaved();
    } catch (err: any) {
      setSaving(false);
      setError(err.message || 'Failed to save shipping rate');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-cream-800">
            {rate ? 'Edit shipping rate' : 'New shipping rate'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-cream-500 hover:bg-cream-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">City name</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Multan"
              className="input-field"
              disabled={rate?.is_default}
            />
            {rate?.is_default && (
              <span className="mt-1 block text-xs text-cream-400">The default rate city name cannot be changed.</span>
            )}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">Shipping charge (PKR)</span>
            <input
              type="number"
              value={rateVal}
              onChange={(e) => setRateVal(e.target.value)}
              placeholder="e.g. 350"
              className="input-field"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-cream-300 text-cream-700 focus:ring-cream-400"
            />
            <span className="text-sm text-cream-700">
              Use as default rate (applies when no city-specific rate is found)
            </span>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save rate'}
          </button>
        </div>
      </div>
    </div>
  );
}
