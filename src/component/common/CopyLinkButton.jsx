// import React, { useState, useCallback, useRef } from 'react';

// const COPY_RESET_DELAY = 2000;


// const CopyLinkButton = ({ buttonText, copyPrefixText = 'https://meigames.netlify.app/', style = {} }) => {
//   const [copied, setCopied] = useState(false);
//   const timerRef = useRef(null);


//   const handleCopy = useCallback(async () => {
    
//     const textToCopy = `${copyPrefixText}${window.location.href}`;

//     if (navigator.clipboard && navigator.clipboard.writeText) {
//       try {
//         await navigator.clipboard.writeText(textToCopy);
//         setCopied(true);
//       } catch (err) {
//         console.error('Failed to copy with navigator API:', err);
//         fallbackCopy(textToCopy);
//       }
//     } else {
//       fallbackCopy(textToCopy);
//     }

//     clearTimeout(timerRef.current);
//     timerRef.current = setTimeout(() => setCopied(false), COPY_RESET_DELAY);
//   }, [copyPrefixText]); 

//   const fallbackCopy = (text) => {
//     const textarea = document.createElement('textarea');
//     textarea.value = text;
//     textarea.style.position = 'fixed';
//     textarea.style.top = '-9999px';
//     textarea.style.left = '-9999px';

//     document.body.appendChild(textarea);
//     textarea.focus();
//     textarea.select();

//     try {
//       document.execCommand('copy');
//       setCopied(true);
//     } catch (err) {
//       console.error('Fallback copy failed:', err);
//       setCopied(false);
//     }

//     document.body.removeChild(textarea);
//   };

//   return (
//     <button
//       onClick={handleCopy}
//        style={style}
//       type="button"
//       aria-label="Copy link to clipboard"
//     >
//       {copied ? 'Copied!' : buttonText}
//     </button>
//   );
// };

// export default CopyLinkButton;

import React, { useState, useCallback, useRef } from 'react';

// The delay in milliseconds before the "Copied!" text reverts back.
const COPY_RESET_DELAY = 2000;

// The static text that will always be copied to the clipboard.
const STATIC_TEXT_TO_COPY = 'https://meigames.netlify.app/';

/**
 * A reusable button component that copies a predefined, static text to the clipboard.
 * @param {object} props - The component props.
 * @param {string} props.buttonText - The text to display on the button.
 * @param {object} [props.style={}] - Optional inline styles to apply to the button.
 */
const CopyLinkButton = ({ buttonText, style = {} }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // This function handles the copy-to-clipboard logic.
  const handleCopy = useCallback(async () => {
    // We use the predefined static text directly.
    const textToCopy = STATIC_TEXT_TO_COPY;

    // Modern async clipboard API - preferred method.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
      } catch (err) {
        console.error('Failed to copy with navigator API:', err);
        fallbackCopy(textToCopy); // Attempt fallback if modern API fails.
      }
    } else {
      // Use the fallback for older browsers.
      fallbackCopy(textToCopy);
    }

    // Reset the "Copied!" message after a delay.
    // Clear any existing timer to prevent race conditions.
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPY_RESET_DELAY);
  }, []); // The dependency array is empty as the logic no longer depends on props.

  // Fallback method for older browsers that don't support the Clipboard API.
  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Keep it off-screen
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
      setCopied(false); // Ensure state is correct on failure.
    }

    document.body.removeChild(textarea);
  };

  return (
    <button
      onClick={handleCopy}
      style={style} // Apply any inline styles passed in props.
      type="button"
      aria-label="Copy link to clipboard"
    >
      {copied ? 'Copied!' : buttonText}
    </button>
  );
};

export default CopyLinkButton;
