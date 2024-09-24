import { useState, useEffect } from 'react';
import { imgToBlob } from '@/utils';
import { UseClipboardProps, UseClipboardReturns } from './type';

/**
 * 클립보드에 텍스트나 이미지를 복사합니다.
 *
 * @param {UseClipboardProps} [resetTime=5000] 복사 작업이 완료된 후 플래그를 리셋할 시간(ms)
 *
 * @returns {UseClipboardReturns}
 * - `copied`: 복사 작업의 성공 여부를 나타내는 플래그
 * - `copyText`: 텍스트를 클립보드에 복사하는 비동기 함수
 * - `copyImg`: 주어진 경로의 이미지를 클립보드에 복사하는 함수
 *
 * @description
 * 클립보드 API가 지원되지 않는 경우 에러를 발생시킵니다.
 */
const useClipboard = ({
  resetTime = 5000,
}: UseClipboardProps = {}): UseClipboardReturns => {
  const [copied, setCopied] = useState(false);

  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported.');
  }

  const handleCopy = async (copy: () => Promise<void>) => {
    setCopied(false);
    try {
      await copy();
      setCopied(true);
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to save to clipboard.`);
    }
  };

  const copyText = async (text: string) => {
    await handleCopy(() => navigator.clipboard.writeText(text));
  };

  const copyImg = async (path: string) => {
    const imgBlob = await imgToBlob(path);
    await handleCopy(() =>
      navigator.clipboard.write([new ClipboardItem({ 'image/png': imgBlob })])
    );
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, resetTime);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copied]);

  return { copied, copyText, copyImg };
};

export default useClipboard;
