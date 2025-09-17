import React from 'react'

export default function AccountHeader({ form, ownerDisplayName }) {
  return (
    <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${form.coverImage ? URL.createObjectURL(form.coverImage) : '/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg'})` }}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-bold text-white mb-3">{form.shopName || 'Your Shop'}</h1>
        <div className="flex items-center space-x-2 text-white/80">
          <a href="/" className="hover:text-white">Home</a>
          <span>&gt;</span>
          <span>Account</span>
        </div>
      </div>
    </div>
  )
}
