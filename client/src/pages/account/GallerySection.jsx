import React from 'react'
import { apiRequest } from '../../utils/apiClient.js' // Adjust path based on your project structure

export default function GallerySection({ form, editing, setEditing, handleItemChange, handleItemImageChange, handleAddItem, handleRemoveItem }) {
    // Helper function to upload a single image to the backend
    const uploadImageToBackend = async (file) => {
        const formData = new FormData();
        formData.append('file', file); // Only include file in FormData

        try {
            const response = await apiRequest({
                url: '/api/images/upload?isPublic=true&isTemp=true', // Pass isPublic and isTemp as query params
                method: 'POST',
                data: formData,
            });
            return response; // Expecting ImageUploadResponse with link and objectKey
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    // Modified handleItemImageChange to upload images to backend
    const handleImageChange = async (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error('Invalid event object or no files selected:', e);
            // Optionally, notify the user
            // toast.error('No files selected or invalid input');
            return;
        }

        const files = Array.from(e.target.files);
        if (files.length === 0) {
            console.warn('No files selected');
            // Optionally, notify the user
            // toast.warn('Please select at least one file');
            return;
        }

        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const uploadResponse = await uploadImageToBackend(file);
                if (!uploadResponse) return null;
                return {
                    objectKey: uploadResponse.objectKey, // Store objectKey for later submission
                    url: uploadResponse.link, // Use backend-provided URL for rendering
                };
            })
        );

        // Filter out any failed uploads
        const validImages = uploadedImages.filter(img => img !== null);
        if (validImages.length > 0) {
            handleItemImageChange(validImages);
        }
    };

    // Handle saving the section, including confirming uploads
    const handleSaveSection = async () => {
        const tempObjectKeys = form.items.flatMap(item => item.images.map(img => img.objectKey));
        if (tempObjectKeys.length === 0) {
            setEditing(e => ({ ...e, gallery: false }));
            return;
        }

        try {
            await apiRequest({
                url: '/api/images/confirm_uploads',
                method: 'POST',
                data: { tempObjectKeys }
            });
            setEditing(e => ({ ...e, gallery: false }));
        } catch (error) {
            console.error('Error confirming uploads:', error);
            // Optionally, notify the user
            // toast.error('Failed to confirm uploads');
        }
    };

    return (
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
                            onClick={handleSaveSection}
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
                                        src={item.images[0].url}
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
                                onChange={(e) => handleImageChange(e)} // Explicitly pass event
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
                                            src={item.images[0].url}
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
    )
}