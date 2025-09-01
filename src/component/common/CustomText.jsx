import React, { useEffect, useRef, useCallback } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

/**
 * CustomText React Component
 * Displays animated scramble text effect cycling through given phrases.
 *
 * Props:
 * - phrases: array of strings to cycle through
 * - delay: milliseconds delay between phrase changes
 * - fontSize: font size for text
 * - fontFamily: font family for text
 */
const CustomText = ({
  phrases = ['Welcome to ', 'Mei Games'],
  delay = 800,
  fontSize = '28px',
  fontFamily = 'monospace',
}) => {
  const elRef = useRef(null);             // ref to DOM element showing text
  const frameRef = useRef(0);             // current animation frame count
  const queueRef = useRef([]);            // scrambling queue state
  const resolveRef = useRef(null);        // Promise resolver for scramble completion
  const counterRef = useRef(0);           // phrase index counter
  const animationIdRef = useRef(null);    // RAF id for cleanup

  // Get random character from the scramble chars
  const getRandomChar = useCallback(() => {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }, []);

  // Initialize scrambling queue and return a Promise that resolves when scramble finishes
  const setText = useCallback((newText) => {
    const el = elRef.current;
    if (!el) return Promise.resolve();

    const oldText = el.innerText || '';
    const length = Math.max(oldText.length, newText.length);
    const queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      queue.push({ from, to, start, end });
    }

    queueRef.current = queue;
    frameRef.current = 0;

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      update();
    });
  }, []);

  // Animation update loop
  const update = useCallback(() => {
    const queue = queueRef.current;
    let output = '';
    let complete = 0;
    const frame = frameRef.current;

    for (let i = 0; i < queue.length; i++) {
      const { from, to, start, end, char } = queue[i];
      if (frame >= end) {
        complete++;
        output += to;
      } else if (frame >= start) {
        let newChar = char;
        if (!char || Math.random() < 0.28) {
          newChar = getRandomChar();
          queue[i].char = newChar;
        }
        output += `<span class="dud">${newChar}</span>`;
      } else {
        output += from;
      }
    }

    if (elRef.current) {
      elRef.current.innerHTML = output;
    }

    if (complete === queue.length) {
      if (resolveRef.current) resolveRef.current();
    } else {
      frameRef.current++;
      animationIdRef.current = requestAnimationFrame(update);
    }
  }, [getRandomChar]);

  // Effect to start cycling through phrases
  useEffect(() => {
    let isMounted = true;

    const next = () => {
      if (!isMounted) return;
      const phrase = phrases[counterRef.current];
      setText(phrase).then(() => {
        if (!isMounted) return;
        setTimeout(() => {
          if (!isMounted) return;
          counterRef.current = (counterRef.current + 1) % phrases.length;
          next();
        }, delay);
      });
    };

    next();

    return () => {
      isMounted = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [phrases, delay, setText]);

  return (
    <>
      <style>{`
        .text {
          font-weight: 100;
          font-size: ${fontSize};
          font-family: ${fontFamily};
          color: black;
          user-select: none;
          white-space: nowrap;
          background: transparent;
        }
        .dud {
          color: grey;
        }
      `}</style>

      <div
        className="text"
        ref={elRef}
        aria-live="polite"
        aria-atomic="true"
        role="text"
      />
    </>
  );
};

// Wrap with React.memo to avoid unnecessary re-renders if props don't change
export default React.memo(CustomText);
