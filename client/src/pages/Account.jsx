import { useState, useEffect } from 'react'
import Header from '../component/Header.jsx'
import AccountHeader from './account/AccountHeader.jsx'
import BrandingSection from './account/BrandingSection.jsx'
import AboutShopSection from './account/AboutShopSection.jsx'
import GallerySection from './account/GallerySection.jsx'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function Account() {
  const { api } = useAuthApi()
  function isSellerFromJwt() {
    try {
      const authRaw = localStorage.getItem('auth')
      if (!authRaw) return false
      const auth = JSON.parse(authRaw)
      const token = auth?.accessToken || auth?.token
      if (!token || token.split('.').length !== 3) return false
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.accountType === 'SELLER' || payload?.role === 'SELLER' || payload?.role === 'SELLER'
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
    shopName: '',
    shopDescription: '',
    ownerDescription: '',
    shopLogo: null,
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

  // Load shop data when editing existing shop
  useEffect(() => {
    const loadShopData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shopId = urlParams.get('shopId');
      
      if (shopId) {
        try {
          const response = await api.get(`/api/shops/${shopId}`)

          if (response.data) {
            const shopData = response.data;
            setForm(prev => ({
              ...prev,
              shopId: shopData.id || shopData.shopId,
              shopName: shopData.shopName || shopData.name || '',
              shopDescription: shopData.shopDescription || shopData.description || '',
              ownerDescription: shopData.ownerDescription || '',
              shopLogo: shopData.logo || null
            }));
          } else {
            console.error('Failed to load shop data');
          }
        } catch (error) {
          console.error('Error loading shop data:', error);
        }
      } else if (existingShop) {
        // Load from localStorage if no shopId but we have existing data
        setForm(prev => ({
          ...prev,
          shopId: existingShop.id || null,
          shopName: existingShop.shopName || '',
          shopDescription: existingShop.shopDescription || '',
          ownerDescription: existingShop.ownerDescription || '',
          shopLogo: existingShop.logo || null
        }));
      }
    };

    loadShopData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleFiles(eOrFiles, key) {
    // Accept either an event from an <input type="file"> or a FileList/array of files.
    let files = []
    if (eOrFiles?.target?.files) {
      files = Array.from(eOrFiles.target.files || [])
    } else if (Array.isArray(eOrFiles)) {
      files = eOrFiles
    } else if (eOrFiles instanceof FileList) {
      files = Array.from(eOrFiles)
    } else {
      // Nothing to do
      return
    }

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
      const payload = {
        shopName: form.shopName,
        ownerName: ownerDisplayName,
        shopDescription: form.shopDescription,
        ownerDescription: form.ownerDescription,
        logo: form.shopLogo || null,
        // images omitted for now
        hasShop: true,
      }

      // Determine if this is a create or update operation
      const isUpdate = form.shopId !== null;
      const endpoint = `/api/shops${isUpdate ? `/${form.shopId}` : ''}`;
      
      const method = isUpdate ? 'put' : 'post';

      const response = await api[method](endpoint, payload);
      const result = response.data;
      
      // Update local state with the returned shop data
      setForm(prev => ({
        ...prev,
        shopId: result.id || result.shopId
      }));

      // Also save to localStorage as backup
      localStorage.setItem(currentUserKey, JSON.stringify({
        ...payload,
        id: result.id || result.shopId
      }));

      alert(`Shop ${isUpdate ? 'updated' : 'created'} successfully!`);
      window.location.reload();
    } catch (error) {
      console.error('Error saving shop:', error);
      alert(`Failed to save shop: ${error.message}`);
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

  const handleItemImageChange = (input) => {
    // Accept either a DOM input event (from a file input) or an image-like object
    // (used by GallerySection to add previews and replace them after upload).
    if (input?.target?.files) {
      const files = Array.from(input.target.files || [])
      setForm(prev => ({
        ...prev,
        currentItem: {
          ...prev.currentItem,
          images: files
        }
      }))
      return
    }

    const image = input
    if (!image) return

    setForm(prev => {
      const images = Array.isArray(prev.currentItem?.images) ? prev.currentItem.images.slice() : []

      // If this is a temporary preview (uploading) with an id, append it.
      if (image.uploading && image.id) {
        // prevent duplicates
        if (!images.some(img => img.id === image.id)) images.push(image)
        return {
          ...prev,
          currentItem: {
            ...prev.currentItem,
            images
          }
        }
      }

      // If image has id, try to replace the preview with same id.
      if (image.id) {
        const idxById = images.findIndex(img => img.id === image.id)
        if (idxById !== -1) {
          images[idxById] = image
          return {
            ...prev,
            currentItem: {
              ...prev.currentItem,
              images
            }
          }
        }
      }

      // Otherwise try to find a matching uploading preview by url and replace it.
      const idx = images.findIndex(img => img.uploading && img.url === image.url)
      if (idx !== -1) {
        images[idx] = image
      } else {
        // prevent duplicates when same url already present
        if (!images.some(img => img.url === image.url)) images.push(image)
      }

      return {
        ...prev,
        currentItem: {
          ...prev.currentItem,
          images
        }
      }
    })
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
        ? `/api/shops/${shopId}/products`
        : '/api/products';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newProduct = response.data;

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

  const handleRemoveCurrentImage = (index) => {
    setForm(prev => {
      const images = Array.isArray(prev.currentItem?.images) ? prev.currentItem.images.slice() : []
      images.splice(index, 1)
      return {
        ...prev,
        currentItem: {
          ...prev.currentItem,
          images
        }
      }
    })
  }

  useEffect(() => {
    const loadExistingItems = async () => {
      const shopId = new URLSearchParams(location.search).get('shopId');
      
      if (shopId) {
        try {
          const response = await api.get(`/api/shops/${shopId}/products`);
          
          const items = response.data;
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
    <div className="account-page futuristic-page-base">
      <Header />

      <AccountHeader form={form} ownerDisplayName={ownerDisplayName} />

      <form onSubmit={handleSubmit} className="container-2xl account-form">
        <BrandingSection form={form} editing={editing} setEditing={setEditing} handleChange={handleChange} handleFiles={handleFiles} ownerDisplayName={ownerDisplayName} />

        <AboutShopSection form={form} editing={editing} setEditing={setEditing} handleChange={handleChange} handleFiles={handleFiles} />

  <GallerySection form={form} editing={editing} setEditing={setEditing} handleItemChange={handleItemChange} handleItemImageChange={handleItemImageChange} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} handleRemoveCurrentImage={handleRemoveCurrentImage} />

        {/* Actions */}
        <div className="account-actions">
          <button type="button" onClick={() => window.history.back()} className="btn-secondary account-cancel-button">Cancel</button>
          <button type="submit" className="btn-primary account-save-button">Save</button>
        </div>
      </form>
    </div>
  )
}


