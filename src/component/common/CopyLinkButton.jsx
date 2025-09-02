import React, { useState, useCallback, useRef } from 'react';

const COPY_RESET_DELAY = 2000;


const CopyLinkButton = ({ buttonText, copyPrefixText = 'Check out this link: ', style = {} }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);


  const handleCopy = useCallback(async () => {
    
    const textToCopy = `${copyPrefixText}${window.location.href}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
      } catch (err) {
        console.error('Failed to copy with navigator API:', err);
        fallbackCopy(textToCopy);
      }
    } else {
      fallbackCopy(textToCopy);
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPY_RESET_DELAY);
  }, [copyPrefixText]); 

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      setCopied(false);
    }

    document.body.removeChild(textarea);
  };

  return (
    <button
      onClick={handleCopy}
       style={style}
      type="button"
      aria-label="Copy link to clipboard"
    >
      {copied ? 'Copied!' : buttonText}
    </button>
  );
};

export default CopyLinkButton;