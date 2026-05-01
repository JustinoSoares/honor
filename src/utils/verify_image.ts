const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'ico'
])

export function isImageByExtension(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false

  const ext = filename.split('.').pop()?.toLowerCase()

  return ext ? IMAGE_EXTENSIONS.has(ext) : false
}