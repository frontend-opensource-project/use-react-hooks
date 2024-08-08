import { useState } from 'react';

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

  return { copied, copyText };
};

export default useClipboard;
