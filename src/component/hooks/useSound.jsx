import { useRef, useCallback } from 'react';

const useSound = (soundMap) => {
  const audioRefs = useRef({});

  // Initialize Audio objects once
  Object.entries(soundMap).forEach(([key, src]) => {
    if (!audioRefs.current[key]) {
      audioRefs.current[key] = new Audio(src);
    }
  });

  // Play sound by key
  const play = useCallback((key) => {
    const sound = audioRefs.current[key];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }, []);

  return play;
};

export default useSound;