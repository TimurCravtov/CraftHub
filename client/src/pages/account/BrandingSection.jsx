import React from 'react'

export default function BrandingSection({ form, editing, setEditing, handleChange, handleFiles, ownerDisplayName }) {
  return (
    <div className="account-section branding-section">
      <div className="account-section-header">
        <div>
          <h2 className="account-section-title">Branding & about you</h2>
          <div className="account-section-subtitle">Update name, cover, avatar, and your bio</div>
        </div>
        {!editing.branding ? (
          <button type="button" onClick={() => setEditing(e => ({ ...e, branding: true }))} className="btn-primary account-section-edit-button">Edit section</button>
        ) : (
          <div className="account-section-actions">
            <button type="button" onClick={() => setEditing(e => ({ ...e, branding: false }))} className="btn-secondary account-section-cancel-button">Cancel</button>
            <button type="button" onClick={() => setEditing(e => ({ ...e, branding: false }))} className="btn-primary account-section-save-button">Save section</button>
          </div>
        )}
      </div>
      {!editing.branding ? (
        <div className="account-section-content branding-section-view">
          <div className="branding-section-main">
            <p className="account-section-label">Shop name</p>
            <p className="account-section-value">{form.shopName || 'Untitled shop'}</p>
            <p className="account-section-label branding-section-label-spaced">Owner</p>
            <p className="account-section-value">{ownerDisplayName}</p>
            <p className="account-section-label branding-section-label-spaced">About you</p>
            <p className="account-section-text">{form.ownerDescription || 'Share a short bio to connect with customers.'}</p>
          </div>
          <div className="branding-section-avatar">
            {form.avatarImage ? (
              <img src={URL.createObjectURL(form.avatarImage)} alt="avatar" className="branding-section-avatar-image" />
            ) : (
              <div className="branding-section-avatar-placeholder" />
            )}
            <div>
              <p className="account-section-label">Avatar</p>
              <p className="account-section-hint">Shown in your shop header</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-section-content branding-section-edit">
          <div>
            <label className="account-form-label">Shop name</label>
            <input name="shopName" value={form.shopName} onChange={handleChange} className="glass-input account-form-input" placeholder="e.g. Luna's Ceramics" required />
          </div>
          <div className="branding-section-edit-description">
            <label className="account-form-label">About you</label>
            <textarea name="ownerDescription" value={form.ownerDescription} onChange={handleChange} rows={4} className="glass-input account-form-textarea" placeholder="Tell customers about yourself" />
          </div>
          <div>
            <label className="account-form-label">Cover image</label>
            <input type="file" accept="image/*" onChange={(e) => handleFiles(e, 'coverImage')} className="account-form-file" />
          </div>
          <div>
            <label className="account-form-label">Avatar image</label>
            <input type="file" accept="image/*" onChange={(e) => handleFiles(e, 'avatarImage')} className="account-form-file" />
          </div>
        </div>
      )}
    </div>
  )
}
