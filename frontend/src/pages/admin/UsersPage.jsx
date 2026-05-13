import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, KeyRound, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../api/client.js';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingBlock from '../../components/LoadingBlock.jsx';
import PageHeader from '../../components/PageHeader.jsx';

const blankForm = { name: '', email: '', password: '', role: 'user' };

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    const { data } = await api.get('/users');
    setUsers(data.users);
  }

  useEffect(() => {
    loadUsers().catch((error) => toast.error(apiError(error, 'Unable to load users')));
  }, []);

  async function createUser(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('User created');
      setForm(blankForm);
      await loadUsers();
    } catch (error) {
      toast.error(apiError(error, 'Unable to create user'));
    } finally {
      setSaving(false);
    }
  }

  async function quickUpdate(user) {
    const name = window.prompt('Update name', user.name);
    if (!name) return;
    try {
      await api.patch(`/users/${user.user_id}`, { name });
      toast.success('User updated');
      await loadUsers();
    } catch (error) {
      toast.error(apiError(error, 'Unable to update user'));
    }
  }

  async function resetPassword(user) {
    const password = window.prompt(`Set a new password for ${user.name}`);
    if (!password) return;
    try {
      await api.patch(`/users/${user.user_id}`, { password });
      toast.success('Password reset');
    } catch (error) {
      toast.error(apiError(error, 'Unable to reset password'));
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    try {
      await api.delete(`/users/${user.user_id}`);
      toast.success('User deleted');
      await loadUsers();
    } catch (error) {
      toast.error(apiError(error, 'Unable to delete user'));
    }
  }

  if (!users) return <LoadingBlock />;

  return (
    <>
      <PageHeader eyebrow="User management" title="Users" description="Create accounts, reset passwords, and open user history records." />

      <form className="panel mb-6 grid gap-4 p-4 md:grid-cols-[1fr_1fr_1fr_160px_auto]" onSubmit={createUser}>
        <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input
          className="field"
          type="password"
          placeholder="Initial password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn-primary" disabled={saving}>
          <Plus size={18} />
          Create
        </button>
      </form>

      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.user_id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <Link className="text-clinical-700 hover:underline" to={`/admin/users/${user.user_id}`}>
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-clinical-50 px-2.5 py-1 text-xs font-bold uppercase text-clinical-700">{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-secondary px-3 py-2" onClick={() => quickUpdate(user)} title="Edit user">
                          <Edit3 size={16} />
                        </button>
                        <button className="btn-secondary px-3 py-2" onClick={() => resetPassword(user)} title="Reset password">
                          <KeyRound size={16} />
                        </button>
                        <button className="btn-secondary px-3 py-2 text-red-600" onClick={() => deleteUser(user)} title="Delete user">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
