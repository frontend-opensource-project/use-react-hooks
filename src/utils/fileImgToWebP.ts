export const fileImgToWebP = async (
  file: File,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas Context가 존재하지 않습니다'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          blob
            ? resolve(blob)
            : reject(new Error('이미지를 WebP형태로 변환하는데 실패했습니다.'));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          '이미지 로드 중 오류가 발생했습니다. 이미지를 불러올 수 없습니다.'
        )
      );
    };

    img.src = url;
  });
};
