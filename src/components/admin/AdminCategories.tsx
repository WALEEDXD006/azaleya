import { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import { validateRequired } from '@/lib/validation';
import { Plus, Pencil, Trash2, X, FolderTree } from 'lucide-react';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const list: Category[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Category));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(list);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"? This could break products that use this category.`)) return;
    try {
      await deleteDoc(doc(db, 'categories', c.id));
      load();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream-500">{categories.length} categories</p>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add category
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-cream-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-50 font-medium text-cream-700">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-cream-500">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-cream-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-cream-50/50">
                  <td className="p-4 font-medium text-cream-800">
                    <div className="flex items-center gap-2">
                      <FolderTree size={16} className="text-cream-400" />
                      {c.name}
                    </div>
                  </td>
                  <td className="p-4 text-cream-600">{c.slug}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setShowForm(true);
                        }}
                        className="rounded-full p-2 text-cream-600 hover:bg-cream-100 hover:text-cream-900"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => del(c)}
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
        <CategoryForm
          category={editing}
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

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const nameErr = validateRequired(name, 'Name');
    const slugErr = validateRequired(slug, 'Slug');
    if (nameErr || slugErr) {
      setError(nameErr ?? slugErr);
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      updated_at: new Date().toISOString(),
    };
    try {
      if (category) {
        await updateDoc(doc(db, 'categories', category.id), payload);
      } else {
        await addDoc(collection(db, 'categories'), {
          ...payload,
          created_at: new Date().toISOString(),
        });
      }
      setSaving(false);
      onSaved();
    } catch (err: any) {
      setSaving(false);
      setError(err.message || 'Failed to save category');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-cream-800">
            {category ? 'Edit category' : 'New category'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-cream-500 hover:bg-cream-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">Category name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Auto-generate slug if not editing
                if (!category) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }
              }}
              className="input-field"
              placeholder="e.g., Summer Collection"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cream-600">URL Slug</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input-field"
              placeholder="e.g., summer-collection"
            />
          </label>

          <div className="pt-2">
            <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Saving...' : 'Save category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
