import { useEffect, useState } from 'react';

interface UseImagePreSetupProps {
  imageFiles: File[] | null;
  convertToWebP?: boolean;
}

interface UseImagePreSetupReturns {
  previewUrls: (string | null)[];
  isLoading: boolean;
  error: string | null;
  webpImages: (Blob | null)[];
  originalImages: File[] | null;
}

const imageToWebP = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject('Canvas Context가 존재하지 않습니다');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        blob
          ? resolve(blob)
          : reject('이미지를 WebP형태로 변환하는데 실패했습니다.');
      }, 'image/webp');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject('이미지를 불러오지 못했습니다.');
    };

    img.src = url;
  });
};

const useImagePreSetup = ({
  imageFiles = [],
  convertToWebP = false,
}: UseImagePreSetupProps): UseImagePreSetupReturns => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);
  const [webpImages, setWebpImages] = useState<(Blob | null)[]>([]);

  useEffect(() => {
    if (!imageFiles || imageFiles.length === 0) return;

    const processImages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await Promise.allSettled(
          imageFiles.map(async (file) => {
            try {
              if (convertToWebP) {
                const webpBlob = await imageToWebP(file);
                const webpUrl = URL.createObjectURL(webpBlob);
                return { webpBlob, previewUrl: webpUrl };
              } else {
                const url = URL.createObjectURL(file);
                return { webpBlob: null, previewUrl: url };
              }
            } catch (error) {
              return { webpBlob: null, previewUrl: null };
            }
          })
        );

        const previewUrlsArray: (string | null)[] = [];
        const webpImagesArray: (Blob | null)[] = [];

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { webpBlob, previewUrl } = result.value;
            webpImagesArray.push(webpBlob);
            previewUrlsArray.push(previewUrl);
          } else {
            webpImagesArray.push(null);
            previewUrlsArray.push(null);
          }
        });

        setPreviewUrls(previewUrlsArray);
        setWebpImages(webpImagesArray);
      } catch (error) {
        setError('파일 처리 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    processImages();

    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles, convertToWebP]);

  return {
    previewUrls,
    isLoading,
    error,
    webpImages,
    originalImages: imageFiles,
  };
};

export default useImagePreSetup;
