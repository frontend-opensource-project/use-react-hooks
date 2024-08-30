import { useEffect, useState } from 'react';

interface UseImagePreSetupProps {
  imageFiles: File[] | null;
  convertToWebP?: boolean;
  webPQuality?: number;
}

interface UseImagePreSetupReturns {
  previewUrls: (string | null)[];
  isLoading: boolean;
  isError: boolean;
  webpImages: (Blob | null)[];
  originalImages: File[] | null;
}

interface ProcessedFileResult {
  webpBlob: Blob | null;
  previewUrl: string | null;
}

const imageToWebP = async (file: File, quality: number): Promise<Blob> => {
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

const convertFile = async (
  file: File,
  convertToWebP: boolean,
  quality: number
): Promise<ProcessedFileResult> => {
  try {
    if (convertToWebP) {
      const webpBlob = await imageToWebP(file, quality);
      const webpUrl = URL.createObjectURL(webpBlob);
      return { webpBlob, previewUrl: webpUrl };
    } else {
      const url = URL.createObjectURL(file);
      return { webpBlob: null, previewUrl: url };
    }
  } catch (error) {
    console.error('파일 처리 중 오류 발생:', error);
    return { webpBlob: null, previewUrl: null };
  }
};

const getProcessResults = (
  results: PromiseSettledResult<ProcessedFileResult>[]
) => {
  const previewUrlsList: (string | null)[] = [];
  const webpImagesList: (Blob | null)[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { webpBlob, previewUrl } = result.value;
      webpImagesList.push(webpBlob);
      previewUrlsList.push(previewUrl);
    } else {
      webpImagesList.push(null);
      previewUrlsList.push(null);
    }
  });

  return { previewUrlsList, webpImagesList };
};

const DEFAULT_WEBP_QUALITY = 0.8;

const useImagePreSetup = ({
  imageFiles = [],
  convertToWebP = false,
  webPQuality = DEFAULT_WEBP_QUALITY,
}: UseImagePreSetupProps): UseImagePreSetupReturns => {
  if (!convertToWebP && webPQuality !== DEFAULT_WEBP_QUALITY) {
    console.warn(
      'webPQuality`는 WebP로의 변환 품질을 설정하는 옵션입니다. `convertToWebP`를 true로 설정해야만 `webPQuality`가 적용됩니다.'
    );
  }

  if (webPQuality < 0 || webPQuality > 1) {
    console.warn(
      `webPQuality 값이 유효 범위(0 ~ 1)를 벗어나 기본값(${DEFAULT_WEBP_QUALITY})이 사용됩니다.`
    );
    webPQuality = DEFAULT_WEBP_QUALITY;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);
  const [webpImages, setWebpImages] = useState<(Blob | null)[]>([]);

  useEffect(() => {
    if (!imageFiles || imageFiles.length === 0) return;

    const processImages = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const results = await Promise.allSettled(
          imageFiles.map((file) =>
            convertFile(file, convertToWebP, webPQuality)
          )
        );
        const { previewUrlsList, webpImagesList } = getProcessResults(results);

        setPreviewUrls(previewUrlsList);
        setWebpImages(webpImagesList);
      } catch (error) {
        setIsError(true);
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
    isError,
    webpImages,
    originalImages: imageFiles,
  };
};

export default useImagePreSetup;
