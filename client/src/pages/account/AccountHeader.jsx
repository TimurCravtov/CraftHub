import React from 'react'

export default function AccountHeader({ form, ownerDisplayName }) {
  return (
    <div className="page-hero account-header-hero" style={{ backgroundImage: `url(${form.coverImage ? URL.createObjectURL(form.coverImage) : '/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg'})` }}>
      <div className="page-hero-overlay account-header-hero-overlay" />
      <div className="page-hero-content account-header-hero-content">
        <h1 className="page-hero-title account-header-hero-title">{form.shopName || 'Your Shop'}</h1>
        <div className="page-breadcrumb account-header-breadcrumb">
          <a href="/" className="page-breadcrumb-link">Home</a>
          <span>&gt;</span>
          <span className="page-breadcrumb-link">Account</span>
        </div>
      </div>
    </div>
  )
}
