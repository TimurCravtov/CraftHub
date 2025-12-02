import React from 'react'

export default function AboutShopSection({ form, editing, setEditing, handleChange, handleFiles }) {
  return (
    <div className="account-section about-shop-section">
      <div className="account-section-header">
        <div>
          <h2 className="account-section-title">About the shop</h2>
          <span className="account-section-subtitle">Describe your shop and add a logo</span>
        </div>
        {!editing.aboutShop ? (
          <button type="button" onClick={() => setEditing(e => ({ ...e, aboutShop: true }))} className="btn-primary account-section-edit-button">Edit section</button>
        ) : (
          <div className="account-section-actions">
            <button type="button" onClick={() => setEditing(e => ({ ...e, aboutShop: false }))} className="btn-secondary account-section-cancel-button">Cancel</button>
            <button type="button" onClick={() => setEditing(e => ({ ...e, aboutShop: false }))} className="btn-primary account-section-save-button">Save section</button>
          </div>
        )}
      </div>
      {!editing.aboutShop ? (
        <div className="account-section-content about-shop-section-view">
          <div className="about-shop-section-description">{form.shopDescription || 'Add a description for your shop.'}</div>
          <div className="about-shop-section-logo">
            {form.shopLogo ? (
              <img src={URL.createObjectURL(form.shopLogo)} alt="shop-logo" className="about-shop-section-logo-image" />
            ) : (
              <div className="about-shop-section-logo-placeholder" />
            )}
            <div>
              <p className="account-section-label">Shop logo</p>
              <p className="account-section-hint">Optional</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-section-content about-shop-section-edit">
          <div className="about-shop-section-edit-description">
            <textarea name="shopDescription" value={form.shopDescription} onChange={handleChange} rows={5} className="glass-input account-form-textarea" placeholder="Describe your products, style, and story" />
          </div>
          <div>
            <label className="account-form-label">Shop logo</label>
            <input type="file" accept="image/*" onChange={(e) => handleFiles(e, 'shopLogo')} className="account-form-file" />
          </div>
        </div>
      )}
    </div>
  )
}
