// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as userApi from '../api/userApi';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Editable profile fields
  const [editMode, setEditMode] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await userApi.getMyProfileAPI();
        setProfile(data);
        setPermanentAddress(data.permanent_address || data.permanentAddress || '');
        setResidentPhone(data.resident_phone || data.residentPhone || '');
        setMobilePhone(data.mobile_phone || data.mobilePhone || '');
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setError('');
    setSuccessMsg('');
    setSavingProfile(true);
    try {
      const updated = await userApi.updateMyProfileAPI({
        permanentAddress,
        residentPhone,
        mobilePhone
      });
      setProfile(updated);
      setPermanentAddress(updated.permanent_address || updated.permanentAddress || '');
      setResidentPhone(updated.resident_phone || updated.residentPhone || '');
      setMobilePhone(updated.mobile_phone || updated.mobilePhone || '');
      setSuccessMsg('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setPermanentAddress(profile?.permanent_address || profile?.permanentAddress || '');
    setResidentPhone(profile?.resident_phone || profile?.residentPhone || '');
    setMobilePhone(profile?.mobile_phone || profile?.mobilePhone || '');
    setEditMode(false);
    setError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill out all password fields');
      return;
    }

    if (newPassword.length < 3) {
      setError('New password must be at least 3 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setSaving(true);
    try {
      await userApi.changeMyPasswordAPI(currentPassword, newPassword);
      setSuccessMsg('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const displayProfile = profile || user || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Profile</h1>
        <p className="text-slate-500">View your details and update your password.</p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          Loading profile...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Profile Details</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Detail label="Name" value={displayProfile.name || displayProfile.full_name || displayProfile.fullName || '—'} />
                <Detail label="Email" value={displayProfile.email || '—'} />
                <Detail label="Role" value={displayProfile.role || '—'} />
                <Detail label="Index Number" value={displayProfile.index_number || displayProfile.indexNumber || '—'} />
                <Detail label="Full Name" value={displayProfile.full_name || displayProfile.fullName || '—'} />
                <Detail label="Name with Initials" value={displayProfile.name_with_initials || displayProfile.nameWithInitials || '—'} />

                {editMode ? (
                  <EditableField label="Permanent Address" value={permanentAddress} onChange={setPermanentAddress} />
                ) : (
                  <Detail label="Permanent Address" value={displayProfile.permanent_address || displayProfile.permanentAddress || '—'} />
                )}

                {editMode ? (
                  <EditableField label="Resident Phone" value={residentPhone} onChange={setResidentPhone} />
                ) : (
                  <Detail label="Resident Phone" value={displayProfile.resident_phone || displayProfile.residentPhone || '—'} />
                )}

                {editMode ? (
                  <EditableField label="Mobile Phone" value={mobilePhone} onChange={setMobilePhone} />
                ) : (
                  <Detail label="Mobile Phone" value={displayProfile.mobile_phone || displayProfile.mobilePhone || '—'} />
                )}

                <Detail label="Gender" value={displayProfile.gender || '—'} />
              </div>

              {editMode && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Change Password</h2>

              {error && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
    <div className="text-xs uppercase text-slate-400 font-semibold mb-1">{label}</div>
    <div className="text-slate-700 dark:text-slate-200 font-medium break-words">{value}</div>
  </div>
);

const EditableField = ({ label, value, onChange }) => (
  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-blue-300 dark:border-blue-600">
    <div className="text-xs uppercase text-blue-500 font-semibold mb-1">{label}</div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm font-medium"
    />
  </div>
);

export default Profile;
