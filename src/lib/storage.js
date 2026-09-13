// Simple localStorage-backed persistence, used as a fast cache/offline
// fallback. Once signed in, Supabase (see useCloudState.js) is the source
// of truth - this stays in sync with it but also works if you're offline.

const PREFIX = 'closet-organizer:'

export function loadList(key, fallback = []) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.error('Failed to load', key, e)
    return fallback
  }
}

export function saveList(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save', key, e)
    if (e.name === 'QuotaExceededError') {
      alert("Storage is full — your browser's local storage has a limit (usually 5-10MB). Try removing a few photos, or compressing images further.")
    }
  }
}

// Resize + compress an uploaded image file to a JPEG data URL so we don't
// blow through localStorage's quota (or bloat the Supabase row) with
// full-resolution photos.
export function fileToCompressedDataURL(file, maxDim = 700, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        if (w > h && w > maxDim) { h = (h * maxDim) / w; w = maxDim }
        else if (h > maxDim) { w = (w * maxDim) / h; h = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
