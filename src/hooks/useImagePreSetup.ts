import { useEffect, useState } from 'react';

interface UseImagePreSetupProps {
  imageFile: File | null;
  convertToWebP?: boolean;
}

interface UseImagePreSetupReturns {
  previewUrl: string | null;
  isLoading: boolean;
  isError: string | null;
  webpImage: Blob | null;
  originalImage: File | null;
}

const imageToWebP = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = function () {
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
  imageFile,
  convertToWebP = false,
}: UseImagePreSetupProps): UseImagePreSetupReturns => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [webpImage, setWebpImage] = useState<Blob | null>(null);

  useEffect(() => {
    if (!imageFile) return;

    const processeImage = async () => {
      setIsLoading(true);
      setIsError(null);

      try {
        if (convertToWebP) {
          const webpBlob = await imageToWebP(imageFile);
          const webpUrl = URL.createObjectURL(webpBlob);
          setWebpImage(webpBlob);
          setPreviewUrl(webpUrl);
        } else {
          const url = URL.createObjectURL(imageFile);
          setWebpImage(null);
          setPreviewUrl(url);
        }
      } catch (error) {
        setIsError(error as string);
      } finally {
        setIsLoading(false);
      }
    };

    processeImage();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, convertToWebP]);

  return {
    previewUrl,
    isLoading,
    isError,
    webpImage,
    originalImage: imageFile,
  };
};

export default useImagePreSetup;
