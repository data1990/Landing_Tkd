import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, input, select, textarea, .cursor-pointer');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleHover);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          scale: isHovering ? 2 : 1,
          backgroundColor: isHovering ? 'rgba(13, 110, 253, 0.15)' : 'transparent',
          borderColor: isHovering ? '#ffc107' : '#0d6efd',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      />
      
      {/* Glow Effect */}
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none z-[9998] hidden md:block"
        style={{
          x: cursorX.get() - 48,
          y: cursorY.get() - 48,
        }}
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
        }}
      />

      {/* Main Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-primary rounded-full pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          scale: isHovering ? 0.5 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 500, mass: 0.5 }}
      />
    </>
  );
}
