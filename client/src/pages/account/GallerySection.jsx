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
        <div className="account-section gallery-section">
            <div className="account-section-header">
                <div>
                    <h2 className="account-section-title">Photos & gallery</h2>
                    <span className="account-section-subtitle">Add images and items for sale</span>
                </div>
                {!editing?.gallery ? (
                    <button
                        type="button"
                        onClick={() => setEditing(e => ({ ...e, gallery: true }))}
                        className="btn-primary account-section-edit-button"
                    >
                        Edit section
                    </button>
                ) : (
                    <div className="account-section-actions">
                        <button
                            type="button"
                            onClick={() => setEditing(e => ({ ...e, gallery: false }))}
                            className="btn-secondary account-section-cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveSection}
                            className="btn-primary account-section-save-button"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Save section"}
                        </button>
                    </div>
                )}
            </div>

            {!editing?.gallery ? (
                <div className="account-section-content gallery-section-view">
                    {form?.items?.length ? (
                        <div className="gallery-section-grid">
                            {form.items.map((item, i) => (
                                <div key={i} className="gallery-section-item">
                                    {item?.images?.[0]?.url ? (
                                        <img
                                            src={item.images[0].url}
                                            alt={`item-${i}`}
                                            className={`gallery-section-item-image ${item.images[0].uploading ? "gallery-section-item-image--uploading" : ""}`}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="gallery-section-item-placeholder">
                                            <span className="gallery-section-item-placeholder-text">No image</span>
                                        </div>
                                    )}
                                    <div className="gallery-section-item-overlay">
                                        <p className="gallery-section-item-name">{item?.name || 'Unnamed item'}</p>
                                        <p className="gallery-section-item-price">${item?.price || '0.00'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="gallery-section-empty">No items yet. Add some to your shop.</p>
                    )}
                </div>
            ) : (
                <div className="account-section-content gallery-section-edit">
                    <div className="gallery-section-form">
                        <div>
                            <label className="account-form-label">
                                Item Name <span className="gallery-section-required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form?.currentItem?.name || ''}
                                onChange={handleItemChange}
                                className="glass-input account-form-input"
                                placeholder="What are you selling?"
                            />
                        </div>

                        <div>
                            <label className="account-form-label">
                                Price
                            </label>
                            <div className="gallery-section-price-input-wrapper">
                                <span className="gallery-section-price-symbol">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={form?.currentItem?.price || ''}
                                    onChange={handleItemChange}
                                    className="glass-input account-form-input gallery-section-price-input"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="account-form-label">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form?.currentItem?.description || ''}
                                onChange={handleItemChange}
                                rows={3}
                                className="glass-input account-form-textarea"
                                placeholder="Tell buyers about your item..."
                            />
                        </div>

                        <div>
                            <label className="account-form-label">
                                Photos
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="account-form-file gallery-section-file-input"
                                disabled={uploading}
                            />
                            <p className="gallery-section-file-hint">
                                Add up to 5 photos to show your item's details (max 5MB each)
                            </p>

                            {form?.currentItem?.images?.length > 0 && (
                                <div className="gallery-section-preview-grid">
                                    {form.currentItem.images.map((img, idx) => {
                                        const src = getImageSrc(img)
                                        return (
                                            <div key={idx} className="gallery-section-preview-item">
                                                {src ? (
                                                    <img
                                                        src={src}
                                                        alt={`preview-${idx}`}
                                                        className={`gallery-section-preview-image ${img.uploading ? "gallery-section-preview-image--uploading" : ""}`}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="gallery-section-preview-placeholder">
                                                        <span className="gallery-section-preview-placeholder-text">No preview</span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => removeCurrentImage(idx)}
                                                    className="gallery-section-remove-button"
                                                    title="Remove image"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    ×
                                                </button>

                                                {img.uploading && (
                                                    <div className="gallery-section-uploading-overlay">Uploading...</div>
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
                            className="btn-primary btn-primary--full gallery-section-add-button"
                            disabled={uploading || !form?.currentItem?.name}
                        >
                            {uploading ? "Uploading..." : "Add Item"}
                        </button>
                    </div>

                    {form?.items?.length > 0 && (
                        <div className="gallery-section-added">
                            <h3 className="gallery-section-added-title">Added Items</h3>
                            <div className="gallery-section-grid">
                                {form.items.map((item, index) => (
                                    <div key={index} className="gallery-section-item">
                                        {item?.images?.[0]?.url ? (
                                            <img
                                                src={item.images[0].url}
                                                alt={`item-${index}`}
                                                className={`gallery-section-item-image ${item.images[0].uploading ? "gallery-section-item-image--uploading" : ""}`}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="gallery-section-item-placeholder">
                                                <span className="gallery-section-item-placeholder-text">No image</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="gallery-section-remove-button"
                                            title="Remove item"
                                        >
                                            <span className="sr-only">Remove</span>
                                            ×
                                        </button>
                                        <div className="gallery-section-item-overlay">
                                            <p className="gallery-section-item-name">{item?.name || 'Unnamed item'}</p>
                                            <p className="gallery-section-item-price">${item?.price || '0.00'}</p>
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
