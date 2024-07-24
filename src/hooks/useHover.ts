import { RefObject, useEffect, useRef, useState } from 'react';

const useHover = (): [RefObject<HTMLDivElement>, boolean] => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    const node = targetRef.current;

    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        node.removeEventListener('mouseenter', handleMouseEnter);
        node.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [targetRef]);

  return [targetRef, isHovered];
};

export default useHover;
