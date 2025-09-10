import { useState } from 'react'
import Header from '../component/Header.jsx'

export default function Account() {
  const isSeller = (() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return false
      const u = JSON.parse(raw)
      return (u?.accountType || u?.role) === 'seller'
    } catch {
      return false
    }
  })()

  // Persist a simple draft shop in localStorage (client-only placeholder)
  const currentUserKey = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      return `shop:${u?.id || u?.email || 'current'}`
    } catch {
      return 'shop:current'
    }
  })()
  const existingShop = (() => {
    try {
      const raw = localStorage.getItem(currentUserKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()
  const [form, setForm] = useState({
    shopName: '',
    shopDescription: '',
    ownerDescription: '',
    coverImage: '',
    avatarImage: '',
    shopLogo: '',
    gallery: [],
  })
  const [editing, setEditing] = useState({
    branding: false,
    aboutShop: false,
    gallery: false,
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleFiles(e, key) {
    const files = Array.from(e.target.files || [])
    setForm(prev => ({ ...prev, [key]: key === 'gallery' ? files : files[0] }))
  }

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()
  const ownerDisplayName = currentUser?.name || currentUser?.email || (currentUser?.id ? `User ${currentUser.id}` : 'Owner')

  function handleSubmit(e) {
    e.preventDefault()
    try {
      const payload = {
        shopName: form.shopName,
        ownerName: ownerDisplayName,
        shopDescription: form.shopDescription,
        ownerDescription: form.ownerDescription,
        // images omitted in storage demo
        hasShop: true,
      }
      localStorage.setItem(currentUserKey, JSON.stringify(payload))
      alert('Shop saved locally. (Client-only)')
      window.location.reload()
    } catch {
      alert('Failed to save locally')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero like ShopPage */}
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

      {!isSeller && (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="border rounded-2xl bg-white p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Seller access required</h2>
            <p className="text-slate-600 text-sm">Sign in with a seller account to create or manage a shop.</p>
          </div>
        </div>
      )}

      {isSeller && existingShop && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="border rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your shop</h2>
                <p className="text-sm text-slate-600">You can edit or delete your shop below.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => window.location.assign('/account?edit=1')} className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800">Edit</button>
                <button type="button" onClick={() => { localStorage.removeItem(currentUserKey); window.location.reload(); }} className="px-4 py-2 rounded border hover:bg-slate-50">Delete shop</button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium">{existingShop.shopName}</h3>
                <p className="text-sm text-slate-600">Owner: {existingShop.ownerName}</p>
                <p className="mt-3 text-slate-700 whitespace-pre-wrap">{existingShop.shopDescription}</p>
              </div>
              <div>
                <div className="p-4 border rounded-lg text-sm text-slate-600">Logo/Images will appear here once uploaded.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSeller && !existingShop && (
      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section: Branding & About You */}
        <div className="border rounded-2xl bg-white">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Branding & about you</h2>
              <div className="text-xs text-slate-500">Update name, cover, avatar, and your bio</div>
            </div>
            {!editing.branding ? (
              <button type="button" onClick={() => setEditing(e => ({ ...e, branding: true }))} className="px-3 py-1.5 rounded-full text-xs text-white bg-gray-900 hover:bg-gray-800">Edit section</button>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditing(e => ({ ...e, branding: false }))} className="px-3 py-1.5 rounded border text-xs hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={() => setEditing(e => ({ ...e, branding: false }))} className="px-3 py-1.5 rounded text-xs text-white bg-gray-900 hover:bg-gray-800">Save section</button>
              </div>
            )}
          </div>
          {!editing.branding ? (
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-sm text-slate-600">Shop name</p>
                <p className="font-medium">{form.shopName || 'Untitled shop'}</p>
                <p className="text-sm text-slate-600 mt-3">Owner</p>
                <p className="font-medium">{ownerDisplayName}</p>
                <p className="text-sm text-slate-600 mt-3">About you</p>
                <p className="text-slate-700 whitespace-pre-wrap min-h-12">{form.ownerDescription || 'Share a short bio to connect with customers.'}</p>
              </div>
              <div className="flex items-center gap-4">
                {form.avatarImage ? (
                  <img src={URL.createObjectURL(form.avatarImage)} alt="avatar" className="h-16 w-16 rounded-full object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-100 border" />
                )}
                <div>
                  <p className="text-sm text-slate-600">Avatar</p>
                  <p className="text-xs text-slate-500">Shown in your shop header</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shop name</label>
                <input name="shopName" value={form.shopName} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white" placeholder="e.g. Luna's Ceramics" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">About you</label>
                <textarea name="ownerDescription" value={form.ownerDescription} onChange={handleChange} rows={4} className="w-full border rounded px-3 py-2 bg-white" placeholder="Tell customers about yourself" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFiles(e, 'coverImage')} className="block w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Avatar image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFiles(e, 'avatarImage')} className="block w-full text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Section: About shop + Logo upload */}
        <div className="border rounded-2xl bg-white">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">About the shop</h2>
              <span className="text-xs text-slate-500">Describe your shop and add a logo</span>
            </div>
            {!editing.aboutShop ? (
              <button type="button" onClick={() => setEditing(e => ({ ...e, aboutShop: true }))} className="px-3 py-1.5 rounded-full text-xs text-white bg-gray-900 hover:bg-gray-800">Edit section</button>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditing(e => ({ ...e, aboutShop: false }))} className="px-3 py-1.5 rounded border text-xs hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={() => setEditing(e => ({ ...e, aboutShop: false }))} className="px-3 py-1.5 rounded text-xs text-white bg-gray-900 hover:bg-gray-800">Save section</button>
              </div>
            )}
          </div>
          {!editing.aboutShop ? (
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 text-slate-700 whitespace-pre-wrap min-h-20">{form.shopDescription || 'Add a description for your shop.'}</div>
              <div className="flex items-center gap-3">
                {form.shopLogo ? (
                  <img src={URL.createObjectURL(form.shopLogo)} alt="shop-logo" className="h-16 w-16 rounded object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded bg-slate-100 border" />
                )}
                <div>
                  <p className="text-sm text-slate-600">Shop logo</p>
                  <p className="text-xs text-slate-500">Optional</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <textarea name="shopDescription" value={form.shopDescription} onChange={handleChange} rows={5} className="w-full border rounded px-3 py-2 bg-white" placeholder="Describe your products, style, and story" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shop logo</label>
                <input type="file" accept="image/*" onChange={(e) => handleFiles(e, 'shopLogo')} className="block w-full text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Section: Gallery */}
        <div className="border rounded-2xl bg-white">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Photos & gallery</h2>
              <span className="text-xs text-slate-500">Add images of your work</span>
            </div>
            {!editing.gallery ? (
              <button type="button" onClick={() => setEditing(e => ({ ...e, gallery: true }))} className="px-3 py-1.5 rounded-full text-xs text-white bg-gray-900 hover:bg-gray-800">Edit section</button>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditing(e => ({ ...e, gallery: false }))} className="px-3 py-1.5 rounded border text-xs hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={() => setEditing(e => ({ ...e, gallery: false }))} className="px-3 py-1.5 rounded text-xs text-white bg-gray-900 hover:bg-gray-800">Save section</button>
              </div>
            )}
          </div>
          {!editing.gallery ? (
            <div className="p-5">
              {form.gallery?.length ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {form.gallery.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt={`img-${i}`} className="h-28 w-full object-cover rounded-lg border" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No images yet. Add some to showcase your work.</p>
              )}
            </div>
          ) : (
            <div className="p-5">
              <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e, 'gallery')} className="block w-full text-sm" />
              {form.gallery?.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">{form.gallery.length} file(s) selected</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => window.history.back()} className="px-4 py-2 rounded border hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded bg-gray-900 text-white hover:bg-gray-800">Save</button>
        </div>
      </form>
      )}
    </div>
  )
}


