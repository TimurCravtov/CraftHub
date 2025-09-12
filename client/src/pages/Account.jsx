import { useState, useEffect } from 'react'
import Header from '../component/Header.jsx'

export default function Account() {
  function isSellerFromJwt() {
    try {
      const authRaw = localStorage.getItem('auth')
      if (!authRaw) return false
      const auth = JSON.parse(authRaw)
      const token = auth?.accessToken || auth?.token
      if (!token || token.split('.').length !== 3) return false
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.accountType === 'seller' || payload?.role === 'SELLER' || payload?.role === 'seller'
    } catch {
      return false
    }
  }
  const isSeller = isSellerFromJwt()

  // Persist a simple draft shop in localStorage (client-only placeholder)
  const currentUserKey = (() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      return `shop:${auth?.userId || 'current'}`
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
    shopId: null,  // Will be populated when editing existing shop
    items: [],
    currentItem: {
      name: '',
      price: '',
      description: '',
      images: []
    }
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

  const ownerDisplayName = (() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      return auth?.name || auth?.email || (auth?.userId ? `User ${auth.userId}` : 'Owner')
    } catch {
      return 'Owner'
    }
  })()

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

  const handleItemChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      currentItem: {
        ...prev.currentItem,
        [name]: value
      }
    }))
  }

  const handleItemImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    setForm(prev => ({
      ...prev,
      currentItem: {
        ...prev.currentItem,
        images: files
      }
    }))
  }

  const handleAddItem = async () => {
    const { name, price, description, images } = form.currentItem;
    const shopId = form.shopId; // Will be null for new shops, populated for existing ones
    
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('price', price ? price.toString() : '0');
      formData.append('description', description?.trim() || '');
      
      if (images?.length) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      // Different endpoints for new shop vs existing shop
      const endpoint = shopId 
        ? `http://localhost:8080/api/shops/${shopId}/products`
        : 'http://localhost:8080/api/products';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const newProduct = await response.json();

      // Update local state
      setForm(prev => ({
        ...prev,
        items: [...prev.items, newProduct],
        currentItem: {
          name: '',
          price: '',
          description: '',
          images: []
        }
      }));

    } catch (error) {
      console.error('Error creating product:', error);
    }
  }

  const handleRemoveItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  useEffect(() => {
    const loadExistingItems = async () => {
      const shopId = new URLSearchParams(location.search).get('shopId');
      
      if (shopId) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/shops/${shopId}/products`,
            {
              headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token}`
              }
            }
          );
          
          if (!response.ok) throw new Error('Failed to fetch shop items');
          
          const items = await response.json();
          setForm(prev => ({
            ...prev,
            shopId,
            items
          }));
          
        } catch (error) {
          console.error('Error loading shop items:', error);
        }
      }
    };

    loadExistingItems();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

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

        {/* Photos & gallery section */}
        <div className="border rounded-2xl bg-white">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Photos & gallery</h2>
              <span className="text-xs text-slate-500">Add images and items for sale</span>
            </div>
            {!editing.gallery ? (
              <button 
                type="button" 
                onClick={() => setEditing(e => ({ ...e, gallery: true }))} 
                className="px-3 py-1.5 rounded-full text-xs text-white bg-gray-900 hover:bg-gray-800"
              >
                Edit section
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setEditing(e => ({ ...e, gallery: false }))} 
                  className="px-3 py-1.5 rounded border text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditing(e => ({ ...e, gallery: false }))} 
                  className="px-3 py-1.5 rounded text-xs text-white bg-gray-900 hover:bg-gray-800"
                >
                  Save section
                </button>
              </div>
            )}
          </div>
          
          {!editing.gallery ? (
            <div className="p-5">
              {form.items?.length ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {form.items.map((item, i) => (
                    <div key={i} className="relative group">
                      <img 
                        src={URL.createObjectURL(item.images[0])} 
                        alt={`item-${i}`} 
                        className="h-28 w-full object-cover rounded-lg border"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No items yet. Add some to your shop.</p>
              )}
            </div>
          ) : (
            <div className="p-5 space-y-6">
              <div className="border rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.currentItem.name}
                    onChange={handleItemChange}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What are you selling?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                    <input
                      type="number"
                      name="price"
                      value={form.currentItem.price}
                      onChange={handleItemChange}
                      className="w-full border rounded px-3 py-2 pl-7 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.currentItem.description}
                    onChange={handleItemChange}
                    rows={3}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell buyers about your item..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleItemImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Add up to 5 photos to show your item's details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Add Item
                </button>
              </div>

              {/* Preview of added items */}
              {form.items?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Added Items</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.items.map((item, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(item.images[0])}
                          alt={`item-${index}`}
                          className="h-28 w-full object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
    </div>
  )
}


