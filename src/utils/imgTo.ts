export const imgTo =
  (path: string) =>
  (type: string, quality?: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        URL.revokeObjectURL(path);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            blob
              ? resolve(blob)
              : reject(new Error('Failed to convert image to blob'));
          },
          type,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(path);
        reject(new Error('...'));
      };

      img.src = path;
    });
  };
