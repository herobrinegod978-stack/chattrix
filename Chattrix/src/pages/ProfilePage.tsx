import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, Moon, Sun, Loader2 } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { uploadAvatar } from '../lib/storage';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    
    // Validate phone if edited
    const phoneTrimmed = phone.trim();
    if (!/^[0-9]{10}$/.test(phoneTrimmed)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({
        name: name.trim(),
        phone_number: phoneTrimmed,
        dob: dob || null,
      }).eq('id', user.id);

      if (error) throw error;
      await refreshUser();
      setEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save profile changes');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      await uploadAvatar(user.id, file);
      await refreshUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>Profile</h1>
      </header>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <Avatar
              src={user?.dp_url}
              name={user?.name || user?.email}
              size={96}
              showOnlineIndicator={false}
            />
            <button
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={16} className="spinner" /> : <Camera size={16} />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>
          <h2 className="profile-name-display">{user?.name || 'Set your name'}</h2>
          <p className="profile-email-display">{user?.email}</p>
        </div>

        {/* Fields */}
        <div className="profile-fields">
          <div className="field-group">
            <label>Name</label>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="profile-input"
                placeholder="Your name"
              />
            ) : (
              <p className="field-value">{user?.name || 'Not set'}</p>
            )}
          </div>

          <div className="field-group">
            <label>Email</label>
            <p className="field-value disabled">{user?.email}</p>
          </div>

          <div className="field-group">
            <label>Phone Number</label>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="profile-input"
                placeholder="Your 10-digit phone number"
              />
            ) : (
              <p className="field-value">{user?.phone_number || 'Not set'}</p>
            )}
          </div>

          <div className="field-group">
            <label>Date of Birth</label>
            {editing ? (
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="profile-input"
                max={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <p className="field-value">{user?.dob || 'Not set'}</p>
            )}
          </div>

          <button
            className="edit-save-btn"
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="spinner" /> : null}
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Settings */}
        <div className="profile-settings">
          <div className="setting-item" onClick={toggleTheme}>
            <div className="setting-label">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>Dark Mode</span>
            </div>
            <div className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
