import { apiRequest } from '../utils/apiClient.js'

export async function uploadImage(file, { isPublic = true, isTemp = true } = {}) {
  const formData = new FormData()
  formData.append('file', file)
  const qs = `?isPublic=${isPublic}&isTemp=${isTemp}`
  return apiRequest({
    url: `/api/images/upload${qs}`,
    method: 'POST',
    data: formData,
  })
}

export async function confirmUploads(tempObjectKeys = []) {
  return apiRequest({
    url: '/api/images/confirm_uploads',
    method: 'POST',
    data: { tempObjectKeys }
  })
}

export async function getSignedUrl(objectKey) {
  if (!objectKey) return null
  try {
    const res = await apiRequest({ url: `/api/images/signed?objectKey=${encodeURIComponent(objectKey)}`, method: 'GET' })
    return res?.url || res?.signedUrl || res?.link || null
  } catch (err) {
    console.warn('getSignedUrl failed for', objectKey, err)
    return null
  }
}

export function serveUrl(objectKey) {
  if (!objectKey) return null
  return `/api/images/serve?objectKey=${encodeURIComponent(objectKey)}`
}

export default {
  uploadImage,
  confirmUploads,
  getSignedUrl,
  serveUrl
}
