const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, options = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000)

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            credentials: 'include',
            signal: controller.signal,
            ...options,
        })

        if (!response.ok) {
            const text = await response.text().catch(() => '')
            const error = new Error(text || `Request failed with ${response.status}`)
            error.status = response.status
            throw error
        }

        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            return response.json()
        }
        return response.text()
    } finally {
        clearTimeout(timeoutId)
    }
}


