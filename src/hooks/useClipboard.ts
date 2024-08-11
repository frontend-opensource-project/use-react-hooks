import { useState, useEffect } from 'react';
import { imgToBlob } from '../utils';

/**
 * 클립보드에 텍스트나 이미지를 복사하는 커스텀 훅
 *
 * @returns {boolean} `copied`: 복사 작업의 성공 여부를 나타내는 플래그
 * @returns {(string) => Promise<void>} `copyText`: 텍스트를 클립보드에 복사하는 비동기 함수
 * @returns {(string) => void} `copyImg`: 주어진 경로의 이미지를 클립보드에 복사하는 함수
 *
 * @description
 * 클립보드 API가 지원되지 않는 경우 에러를 발생시킵니다.
 */
const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported.');
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to save text to clipboard.`);
    }
  };

  const copyImg = (path: string) => {
    imgToBlob(path, async (imgBlob) => {
      if (!imgBlob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': imgBlob }),
        ]);
        setCopied(true);
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to save image to clipboard.`);
      }
    });
  };

  useEffect(() => {
    return () => {
      setCopied(false);
    };
  }, []);

  return { copied, copyText, copyImg };
};

export default useClipboard;
