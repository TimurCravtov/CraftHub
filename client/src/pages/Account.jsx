import { useState, useEffect } from 'react'
import Header from '../component/Header.jsx'
import AccountHeader from './account/AccountHeader.jsx'
import BrandingSection from './account/BrandingSection.jsx'
import AboutShopSection from './account/AboutShopSection.jsx'
import GallerySection from './account/GallerySection.jsx'

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

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const formData = new FormData()
      
      // Shop details
      formData.append('shopName', form.shopName)
      formData.append('description', form.shopDescription)
      formData.append('ownerDescription', form.ownerDescription)
      
      // Shop images - sending as array of files
      if (form.coverImage) {
        formData.append('coverImage', form.coverImage)
      }
      if (form.avatarImage) {
        formData.append('avatarImage', form.avatarImage)
      }
      if (form.shopLogo) {
        formData.append('logo', form.shopLogo)
      }
      
      // Items with their images
      form.items.forEach((item, index) => {
        formData.append(`items[${index}].name`, item.name)
        formData.append(`items[${index}].price`, item.price)
        formData.append(`items[${index}].description`, item.description)
        
        // Each item can have multiple images
        item.images.forEach((image, imageIndex) => {
          // This creates an array-like structure in FormData for Spring to parse
          formData.append(`items[${index}].images`, image)
        })
      })

      // Log FormData entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const response = await fetch('http://localhost:8080/api/shops', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create shop')
      }

      const shop = await response.json()
      
      // Clear local storage shop data if it exists
      localStorage.removeItem(currentUserKey)
      
      // Redirect to manage shops page
      window.location.href = '/account/shops'

    } catch (error) {
      console.error('Failed to save shop:', error)
      alert('Failed to save shop. Please try again.')
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

      <AccountHeader form={form} ownerDisplayName={ownerDisplayName} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BrandingSection form={form} editing={editing} setEditing={setEditing} handleChange={handleChange} handleFiles={handleFiles} ownerDisplayName={ownerDisplayName} />

        <AboutShopSection form={form} editing={editing} setEditing={setEditing} handleChange={handleChange} handleFiles={handleFiles} />

        <GallerySection form={form} editing={editing} setEditing={setEditing} handleItemChange={handleItemChange} handleItemImageChange={handleItemImageChange} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => window.history.back()} className="px-4 py-2 rounded border hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded bg-gray-900 text-white hover:bg-gray-800">Save</button>
        </div>
      </form>
    </div>
  )
}


