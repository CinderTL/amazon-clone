const IMAGE_PATH = /^\/uploads\/products\/[a-zA-Z0-9_-]{8,80}\.(jpg|jpeg|png|webp|gif)$/;

export function isUploadPath(value: string) {
  return IMAGE_PATH.test(value);
}
