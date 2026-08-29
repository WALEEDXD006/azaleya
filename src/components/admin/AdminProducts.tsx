import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { validateRequired, validatePrice } from '@/lib/validation';
import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';
import type { AdminProductsProps } from '@/pages/AdminPage';

export function AdminProducts({ products, onChange }: AdminProductsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const list: Category[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Category));
        list.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(list);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'products', p.id));
      onChange();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream-500">{products.length} products</p>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-cream-100 bg-white">
        {/* Mobile card layout */}
        <div className="divide-y divide-cream-50 sm:hidden">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded bg-cream-100">
                {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cream-800">{p.name}</p>
                <p className="text-xs text-cream-500">
                  {formatPrice(p.price)} · {p.stock} in stock
                </p>
                <p className="text-xs text-cream-400">
                  {categories.find((c) => c.id === p.category_id)?.name ?? 'No category'}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-full p-2 text-cream-600 hover:bg-cream-100"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => del(p)}
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
              <th className="px-4 py-3">Product</th>
              <th className="hidden px-4 py-3 md:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="hidden px-4 py-3 md:table-cell">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-cream-100">
                      {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="font-medium text-cream-800">{p.name}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-cream-600 md:table-cell">
                  {categories.find((c) => c.id === p.category_id)?.name ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium text-cream-700">{formatPrice(p.price)}</td>
                <td className="hidden px-4 py-3 text-cream-600 md:table-cell">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-full p-2 text-cream-600 hover:bg-cream-100"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => del(p)}
                      className="rounded-full p-2 text-cream-600 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? '');
  const [sizes, setSizes] = useState((product?.sizes ?? []).join(', '));
  const [colors, setColors] = useState((product?.colors ?? []).join(', '));
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    if (file.size > 700 * 1024) {
      setError('Image is too large. Please select an image under 700KB.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const save = async () => {
    setError(null);
    const nameErr = validateRequired(name, 'Name');
    const priceErr = validatePrice(price);
    if (nameErr || priceErr) {
      setError(nameErr ?? priceErr);
      return;
    }
    setSaving(true);
    const payload = {
      name,
      description: description || null,
      price: Number(price),
      image_url: imageUrl || null,
      category_id: categoryId || null,
      sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
      stock: Number(stock) || 0,
      featured,
      updated_at: new Date().toISOString(),
    };

    try {
      if (product) {
        await updateDoc(doc(db, 'products', product.id), payload);
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          created_at: new Date().toISOString(),
        });
      }
      setSaving(false);
      onSaved();
    } catch (err: any) {
      setSaving(false);
      setError(err.message || 'Failed to save product');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-cream-800">
            {product ? 'Edit product' : 'New product'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-cream-500 hover:bg-cream-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <FormField label="Name" value={name} onChange={setName} />
          <div>
            <span className="mb-1 block text-xs font-medium text-cream-600">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <FormField label="Price (PKR)" value={price} onChange={setPrice} type="number" />
            <FormField label="Stock" value={stock} onChange={setStock} type="number" />
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-cream-600">Product image</span>
            <div className="flex items-center gap-4">
              <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-cream-200 bg-cream-50">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-cream-300">
                    <Upload size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-outline w-full"
                >
                  {uploading ? (
                    <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><Upload size={16} /> Upload image</>
                  )}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs font-medium text-cream-500 hover:text-red-500"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">Category</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <FormField label="Sizes (comma separated)" value={sizes} onChange={setSizes} placeholder="S, M, L" />
          <FormField label="Colors (comma separated)" value={colors} onChange={setColors} placeholder="Beige, White" />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-cream-300 text-cream-700 focus:ring-cream-400"
            />
            <span className="text-sm text-cream-700">Featured on homepage</span>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-cream-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </label>
  );
}
