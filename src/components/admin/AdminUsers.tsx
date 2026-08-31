import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validateName } from '@/lib/validation';
import { Users, Pencil, Trash2, X, ShieldCheck, User, Search } from 'lucide-react';

type UserRole = 'user' | 'admin';

type AppUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
};

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AppUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(user.full_name ?? '');
  const [email] = useState(user.email); // email is read-only (Firebase Auth owns it)
  const [phone, setPhone] = useState(user.phone ?? '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const nameErr = fullName.trim() ? validateName(fullName) : null;
    if (nameErr) { setError(nameErr); return; }

    setSaving(true);
    try {
      // Update profile document
      await updateDoc(doc(db, 'profiles', user.id), {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        role,
        updated_at: new Date().toISOString(),
      });

      // Keep roles collection in sync
      await setDoc(
        doc(db, 'roles', user.id),
        { user_id: user.id, email: user.email, role, created_at: user.created_at },
        { merge: true },
      );

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-cream-800">Edit User</h2>
          <button onClick={onClose} className="rounded-full p-2 text-cream-500 hover:bg-cream-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Email — read-only */}
          <div>
            <span className="mb-1 block text-xs font-medium text-cream-600">Email (cannot change)</span>
            <input value={email} readOnly className="input-field cursor-not-allowed bg-cream-50 text-cream-400" />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-cream-600">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="User's full name"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-cream-600">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+923001234567"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-cream-600">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input-field"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filtered, setFiltered] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'profiles'));
      const list: AppUser[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AppUser));
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) =>
            u.email.toLowerCase().includes(q) ||
            (u.full_name ?? '').toLowerCase().includes(q),
        ),
      );
    }
  }, [search, users]);

  const handleDelete = async (u: AppUser) => {
    if (u.email === 'officialazaleya@gmail.com') {
      alert('The primary admin account cannot be deleted.');
      return;
    }
    if (!confirm(`Delete user "${u.email}"?\n\nThis removes their profile and role data. Their Firebase Auth account will remain but they will have no access.`)) return;
    setDeleting(u.id);
    try {
      await deleteDoc(doc(db, 'profiles', u.id));
      await deleteDoc(doc(db, 'roles', u.id));
      load();
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setDeleting(null);
    }
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-cream-500">Total Users</p>
          <p className="mt-1 text-2xl font-semibold text-cream-800">{users.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-cream-500">Admins</p>
          <p className="mt-1 text-2xl font-semibold text-cream-800">{adminCount}</p>
        </div>
        <div className="card col-span-2 p-4 sm:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-cream-500">Regular Users</p>
          <p className="mt-1 text-2xl font-semibold text-cream-800">{userCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-field pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-cream-400">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-cream-400">
          {search ? 'No users match your search.' : 'No users found.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-100">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-left text-xs font-semibold uppercase tracking-wider text-cream-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 bg-white">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cream-100">
                        {u.role === 'admin'
                          ? <ShieldCheck size={16} className="text-cream-700" />
                          : <User size={16} className="text-cream-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-cream-800">{u.full_name ?? <span className="italic text-cream-400">No name</span>}</p>
                        <p className="text-xs text-cream-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream-600">{u.phone ?? <span className="italic text-cream-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-cream-800 text-white'
                        : 'bg-cream-100 text-cream-700'
                    }`}>
                      {u.role === 'admin' ? <ShieldCheck size={11} /> : <User size={11} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-cream-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(u)}
                        className="rounded-lg p-2 text-cream-500 hover:bg-cream-100 hover:text-cream-800 transition-colors"
                        title="Edit user"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deleting === u.id}
                        className="rounded-lg p-2 text-cream-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
