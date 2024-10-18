import { useState, useEffect } from 'react';
import { imgToBlob } from '@/utils';
import { UseClipboardProps, UseClipboardReturns } from './type';

/**
 * 클립보드에 텍스트나 이미지를 복사할 수 있도록 도와주는 훅
 *
 * @param {number} [resetTime=5000] - 복사 성공 후, 복사 상태에 대한 플래그(copied)가 리셋되는 시간(ms)
 *
 * @returns
 * - `copied`: 클립보드 복사가 성공했는지를 나타내는 플래그
 * - `copyText`: 텍스트를 클립보드에 복사하는 비동기 함수
 * - `copyImg`: 이미지를 클립보드에 복사하는 함수
 *
 * @description
 * - 이미지는 URL을 입력해 복사할 수 있습니다.
 * - 클립보드 API가 지원되지 않는 환경에선 에러가 발생합니다.
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
