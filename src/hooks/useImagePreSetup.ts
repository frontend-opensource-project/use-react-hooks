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

export interface ProcessedFileResult {
  webpBlob: Blob | null;
  previewUrl: string | null;
}

export const convertFile = async (
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

export const urlFromFileHandler = async (
  file: File
): Promise<ProcessedFileResult> => {
  const url = URL.createObjectURL(file);
  return { webpBlob: null, previewUrl: url };
};

export const convertToWebPHandler = async (
  file: File,
  quality: number
): Promise<ProcessedFileResult> => {
  const webpBlob = await fileImgToWebP(file, quality);
  const webpUrl = URL.createObjectURL(webpBlob);
  return { webpBlob, previewUrl: webpUrl };
};

export const DEFAULT_WEBP_QUALITY = 0.8;

export const validateWebPQuality = (
  convertToWebP: boolean,
  webPQuality: number
) => {
  if (!convertToWebP) {
    if (webPQuality !== DEFAULT_WEBP_QUALITY) {
      console.warn(
        'webPQuality`는 WebP로의 변환 품질을 설정하는 옵션입니다. `convertToWebP`를 true로 설정해야만 `webPQuality`가 적용됩니다.'
      );
    }
    return DEFAULT_WEBP_QUALITY;
  }
  if (webPQuality < 0 || webPQuality > 1) {
    console.warn(
      `webPQuality 값이 유효 범위(0 ~ 1)를 벗어나 기본값(${DEFAULT_WEBP_QUALITY})이 사용됩니다.`
    );
    return DEFAULT_WEBP_QUALITY;
  }
  return webPQuality;
};

/**
 * 이미지 파일을 처리하고 WebP 변환 또는 URL 생성을 수행하는 커스텀 훅.
 * @param {File[] | null} [props.imageFiles=null] - 처리할 이미지 파일의 배열.
 * @param {boolean} [props.convertToWebP=false] - WebP 형식으로 변환할지 여부. 기본값=false.
 * @param {number} [props.webPQuality=0.8] - WebP 변환 품질. 기본값=0.8. 유효 범위는 0에서 1 사이입니다.
 *
 * @returns {string[] | null[]} previewUrls - 처리된 이미지의 미리보기 URL 배열. 오류가 발생한 경우 null이 포함될 수 있음.
 * @returns {boolean} isLoading - 이미지 처리 진행 여부를 나타내는 상태.
 * @returns {boolean} isError - 이미지 처리 중 오류 발생 여부를 나타내는 상태.
 * @returns {Blob[] | null[]} webpImages - WebP 형식으로 변환된 이미지 Blob 배열. 변환되지 않았거나 오류가 발생한 경우 null이 포함될 수 있음.
 * @returns {File[] | null} originalImages - 원본 이미지 파일의 배열.
 *
 * @description
 * 주어진 이미지 파일을 처리하여 미리보기 URL을 생성하거나 WebP 형식으로 변환합니다.
 * 처리 상태를 나타내는 로딩과 오류 상태를 관리하며, 변환된 WebP 이미지와 원본 이미지 파일을 반환합니다.
 */
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

  const processImages = async (imageFiles: File[]) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const convertHandler = convertToWebP
        ? (file: File) => convertToWebPHandler(file, validatedWebPQuality)
        : urlFromFileHandler;

      const convertResults = await Promise.all(
        imageFiles.map((file, idx) => convertFile(file, convertHandler, idx))
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
