const img = new Image();
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

export const imgToBlob = (path: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      if (this instanceof HTMLImageElement) {
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;
        ctx?.drawImage(this, 0, 0);
        canvas.toBlob((blob) => {
          blob
            ? resolve(blob)
            : reject(new Error('Failed to convert image to blob'));
        }, 'image/png');
      }
    };
    img.src = path;
  });
};
