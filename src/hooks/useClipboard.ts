import { useState, useEffect } from 'react';
import { imgToBlob } from '../utils';

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
