import { useEffect, useState } from 'react';
import { fileImgToWebP } from '../utils';

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

const convertFile = async (
  file: File,
  convertHandler: (file: File) => Promise<ProcessedFileResult>,
  idx: number
): Promise<ProcessedFileResult> => {
  try {
    return await convertHandler(file);
  } catch (error) {
    console.error(`${idx + 1}번째 파일 처리 중 오류 발생:`, error);
    return { webpBlob: null, previewUrl: null };
  }
};

const validateWebPQuality = (convertToWebP: boolean, webPQuality: number) => {
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

  return webPQuality;
};

const DEFAULT_WEBP_QUALITY = 0.8;

const useImagePreSetup = ({
  imageFiles = [],
  convertToWebP = false,
  webPQuality = DEFAULT_WEBP_QUALITY,
}: UseImagePreSetupProps): UseImagePreSetupReturns => {
  const validatedWebPQuality = validateWebPQuality(convertToWebP, webPQuality);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);
  const [webpImages, setWebpImages] = useState<(Blob | null)[]>([]);

  const convertToWebPHandler = async (
    file: File
  ): Promise<ProcessedFileResult> => {
    const webpBlob = await fileImgToWebP(file, validatedWebPQuality);
    const webpUrl = URL.createObjectURL(webpBlob);
    return { webpBlob, previewUrl: webpUrl };
  };

  const urlFromFileHandler = async (
    file: File
  ): Promise<ProcessedFileResult> => {
    const url = URL.createObjectURL(file);
    return { webpBlob: null, previewUrl: url };
  };

  const processImages = async (imageFiles: File[]) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const fileHandler = convertToWebP
        ? convertToWebPHandler
        : urlFromFileHandler;

      const convertResults = await Promise.all(
        imageFiles.map((file, idx) => convertFile(file, fileHandler, idx))
      );

      const previewUrlsList = convertResults.map((result) => result.previewUrl);
      const webpImagesList = convertResults.map((result) => result.webpBlob);

      setPreviewUrls(previewUrlsList);
      setWebpImages(webpImagesList);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!imageFiles || imageFiles.length === 0) return;

    processImages(imageFiles);

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
