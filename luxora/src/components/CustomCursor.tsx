import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'image' | 'drag'>('default');
  const [cursorText, setCursorText] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if touch device
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"]');
      const imageEl = target.closest('[data-cursor="view"], [data-product-card]');
      const dragEl = target.closest('[data-cursor="drag"]');

      if (imageEl) {
        setCursorType('image');
        setCursorText('VIEW');
      } else if (dragEl) {
        setCursorType('drag');
        setCursorText('DRAG');
      } else if (interactiveEl) {
        setCursorType('pointer');
        setCursorText('');
      } else {
        setCursorType('default');
        setCursorText('');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer Follower Ring */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full flex items-center justify-center transition-colors duration-200 ${
          cursorType === 'image'
            ? 'w-16 h-16 bg-[#c9a86a]/90 text-[#0c0c0d] font-accent text-[11px] font-bold tracking-widest'
            : cursorType === 'drag'
            ? 'w-16 h-16 bg-white/90 text-black font-accent text-[11px] font-bold tracking-widest'
            : cursorType === 'pointer'
            ? 'w-10 h-10 border border-[#c9a86a] bg-[#c9a86a]/15 backdrop-blur-[2px]'
            : 'w-7 h-7 border border-white/40 bg-white/5'
        }`}
        animate={{
          x: mousePosition.x - (cursorType === 'image' || cursorType === 'drag' ? 32 : cursorType === 'pointer' ? 20 : 14),
          y: mousePosition.y - (cursorType === 'image' || cursorType === 'drag' ? 32 : cursorType === 'pointer' ? 20 : 14),
          scale: cursorType === 'pointer' ? 1.25 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 350,
          mass: 0.5,
        }}
      >
        {cursorText && (
          <span className="select-none tracking-widest">{cursorText}</span>
        )}
      </motion.div>

      {/* Tiny Core Dot */}
      {cursorType === 'default' && (
        <motion.div
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#c9a86a] rounded-full"
          animate={{
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
          }}
          transition={{
            type: 'spring',
            damping: 40,
            stiffness: 700,
            mass: 0.1,
          }}
        />
      )}
    </div>
  );
};
