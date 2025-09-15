import React from 'react'

export default function BrandingSection({ form, editing, setEditing, handleChange, handleFiles, ownerDisplayName }) {
  return (
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
  )
}
