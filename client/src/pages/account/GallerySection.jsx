import React, { useState } from 'react'
import { apiRequest } from '../../utils/apiClient.js' // Adjust path if needed
import imageService from '../../services/imageService.js'

export default function GallerySection({
                                           form,
                                           editing,
                                           setEditing,
                                           handleItemChange,
                                           handleItemImageChange,
                                           handleAddItem,
                                           handleRemoveItem,
                                           handleRemoveCurrentImage
                                       }) {
    const [uploading, setUploading] = useState(false);

    const removeCurrentImage = (index) => {
        if (typeof handleRemoveCurrentImage === 'function') {
            handleRemoveCurrentImage(index)
        }
    }

    const uploadImageToBackend = async (file) => {
        return imageService.uploadImage(file, { isPublic: true, isTemp: true })
    }

    // extracted so it's safe to call with files
    const processFiles = async (fileList) => {
        setUploading(true);
        try {
            for (const file of fileList) {
                try {
                    // Validate type
                    if (!file.type.startsWith('image/')) {
                        console.warn(`Skipping ${file.name}: not an image file`);
                        continue;
                    }

                    // Validate size
                    if (file.size > 5 * 1024 * 1024) {
                        console.warn(`Skipping ${file.name}: file too large`);
                        continue;
                    }

                    // Temporary preview with unique id so it can be matched and replaced
                    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                    const tempPreview = {
                        id: tempId,
                        objectKey: null,
                        url: URL.createObjectURL(file),
                        uploading: true,
                    };
                    handleItemImageChange(tempPreview);

                    // Upload
                    const uploadResponse = await uploadImageToBackend(file);

                    if (!uploadResponse) {
                        console.error(`Failed to upload ${file.name}`);
                        continue;
                    }

                    const newImage = {
                        id: tempId,
                        objectKey: uploadResponse.objectKey,
                        url: uploadResponse.link || uploadResponse.url,
                        uploading: false,
                    };

                    // Replace preview (matched by id)
                    handleItemImageChange(newImage);

                    // Clean up
                    URL.revokeObjectURL(tempPreview.url);
                } catch (err) {
                    console.error(`Image upload failed for ${file.name}:`, err);
                }
            }
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = (eOrFiles) => {
        // Accept either an input event or a FileList/array of files
        let files = null;
        if (eOrFiles?.target?.files) {
            files = eOrFiles.target.files;
        } else if (Array.isArray(eOrFiles)) {
            files = eOrFiles;
        } else if (eOrFiles instanceof FileList) {
            files = Array.from(eOrFiles);
        }

        if (!files || files.length === 0) return;
        const fileList = Array.isArray(files) ? files : Array.from(files);
        processFiles(fileList);

        // reset input if it was an event
        if (eOrFiles?.target) {
            try { eOrFiles.target.value = "" } catch {}
        }
    };

    const getImageSrc = (img) => {
        if (!img) return null
        if (typeof img === 'string') return img

        // If URL is present and looks usable, return it
        if (img.url) {
            try {
                const parsed = new URL(img.url)
                if (parsed.search && parsed.search.length > 1) return img.url
            } catch {
                return img.url
            }
        }

        // If server returned an objectKey, prefer a signed URL or proxy route
        if (img.objectKey) {
            // try cached signed url via imageService (non-blocking if not available)
            // imageService.getSignedUrl may be async; use serveUrl as immediate fallback
            const served = imageService.serveUrl(img.objectKey)
            return served
        }

        try {
            if (img instanceof File) return URL.createObjectURL(img)
        } catch {}
        return null
    }

    const handleSaveSection = async () => {
        if (!form?.items) {
            setEditing(e => ({ ...e, gallery: false }));
            return;
        }

        const tempObjectKeys = form.items
            .flatMap(item => item.images || [])
            .map(img => img?.objectKey)
            .filter(Boolean);

        if (tempObjectKeys.length === 0) {
            setEditing(e => ({ ...e, gallery: false }));
            return;
        }

        try {
            await imageService.confirmUploads(tempObjectKeys)
            setEditing(e => ({ ...e, gallery: false }));
        } catch (error) {
            console.error('Error confirming uploads:', error);
        }
    };

    return (
        <div className="border rounded-2xl bg-white">
            <div className="p-5 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Photos & gallery</h2>
                    <span className="text-xs text-slate-500">Add images and items for sale</span>
                </div>
                {!editing?.gallery ? (
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
                            onClick={handleSaveSection}
                            className="px-3 py-1.5 rounded text-xs text-white bg-gray-900 hover:bg-gray-800"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Save section"}
                        </button>
                    </div>
                )}
            </div>

            {!editing?.gallery ? (
                <div className="p-5">
                    {form?.items?.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {form.items.map((item, i) => (
                                <div key={i} className="relative group">
                                    {item?.images?.[0]?.url ? (
                                        <img
                                            src={item.images[0].url}
                                            alt={`item-${i}`}
                                            className={`h-28 w-full object-cover rounded-lg border ${item.images[0].uploading ? "opacity-50" : ""}`}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="h-28 w-full bg-gray-200 rounded-lg border flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">No image</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                                        <p className="text-sm font-medium">{item?.name || 'Unnamed item'}</p>
                                        <p className="text-xs">${item?.price || '0.00'}</p>
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
                                value={form?.currentItem?.name || ''}
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
                                    value={form?.currentItem?.price || ''}
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
                                value={form?.currentItem?.description || ''}
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
                                onChange={handleImageChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                                disabled={uploading}
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Add up to 5 photos to show your item's details (max 5MB each)
                            </p>

                            {form?.currentItem?.images?.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {form.currentItem.images.map((img, idx) => {
                                        const src = getImageSrc(img)
                                        return (
                                            <div key={idx} className="relative group">
                                                {src ? (
                                                    <img
                                                        src={src}
                                                        alt={`preview-${idx}`}
                                                        className={`h-28 w-full object-cover rounded-lg border ${img.uploading ? "opacity-50" : ""}`}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="h-28 w-full bg-gray-200 rounded-lg border flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">No preview</span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => removeCurrentImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                                    title="Remove image"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    ×
                                                </button>

                                                {img.uploading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm rounded-lg">Uploading...</div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={uploading || !form?.currentItem?.name}
                        >
                            {uploading ? "Uploading..." : "Add Item"}
                        </button>
                    </div>

                    {form?.items?.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-slate-700 mb-2">Added Items</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {form.items.map((item, index) => (
                                    <div key={index} className="relative group">
                                        {item?.images?.[0]?.url ? (
                                            <img
                                                src={item.images[0].url}
                                                alt={`item-${index}`}
                                                className={`h-28 w-full object-cover rounded-lg border ${item.images[0].uploading ? "opacity-50" : ""}`}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="h-28 w-full bg-gray-200 rounded-lg border flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No image</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                            title="Remove item"
                                        >
                                            <span className="sr-only">Remove</span>
                                            ×
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                                            <p className="text-sm font-medium">{item?.name || 'Unnamed item'}</p>
                                            <p className="text-xs">${item?.price || '0.00'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
