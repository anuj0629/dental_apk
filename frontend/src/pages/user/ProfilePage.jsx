import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { api, apiError } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../state/AuthContext.jsx';

export default function ProfilePage() {
  const { user, updateStoredUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      const { data } = await api.patch('/users/profile', payload);
      updateStoredUser(data.user);
      setPassword('');
      toast.success('Profile updated');
    } catch (error) {
      toast.error(apiError(error, 'Unable to update profile'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Profile" title="Account settings" description="Update your name or password while keeping your login email unchanged." />
      <form className="panel max-w-2xl space-y-5 p-5" onSubmit={submit}>
        <label className="block">
          <span className="label">Email</span>
          <input className="field mt-1.5 bg-slate-50" value={user.email} disabled />
        </label>
        <label className="block">
          <span className="label">Name</span>
          <input className="field mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block">
          <span className="label">New Password</span>
          <input
            className="field mt-1.5"
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="btn-primary" disabled={saving}>
          <Save size={18} />
          Save Changes
        </button>
      </form>
    </>
  );
}
