const PRODUCT_UPLOAD = /^\/uploads\/products\/[a-zA-Z0-9_-]{8,80}\.(jpg|jpeg|png|webp|gif)$/;
const STORE_UPLOAD = /^\/uploads\/stores\/[a-zA-Z0-9_-]{8,80}\.(jpg|jpeg|png|webp|gif)$/;

export function isUploadPath(value: string) {
  return PRODUCT_UPLOAD.test(value);
}

export function isStoreUploadPath(value: string) {
  return STORE_UPLOAD.test(value);
}

export function isRemoteImageUrl(value: string) {
  if (!value || value.length > 2000) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function isProductImageSource(value: string) {
  return isUploadPath(value) || isRemoteImageUrl(value);
}

export function isStoreImageSource(value: string) {
  return isStoreUploadPath(value) || isRemoteImageUrl(value);
}
