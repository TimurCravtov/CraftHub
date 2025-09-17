import React from 'react'

export default function AboutShopSection({ form, editing, setEditing, handleChange, handleFiles }) {
  return (
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
  )
}
