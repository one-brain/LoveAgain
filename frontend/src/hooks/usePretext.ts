import { useEffect, useRef, useState } from 'react';
import { prepare, layout, type PreparedHandle } from '../utils/pretext';

/**
 * Pretext-native height computation hook.
 * Computes exact text layout height dynamically on resize using @chenglou/pretext.
 * Eliminates Cumulative Layout Shift (CLS) and ensures uniform card sizing across viewports.
 */
export function usePretextHeight(text: string, font: string, lineHeight: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const preparedRef = useRef<PreparedHandle | null>(null);

  useEffect(() => {
    let active = true;

    async function init() {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      if (!active) return;
      preparedRef.current = prepare(text, font);
      relayout();
    }

    function relayout() {
      if (!containerRef.current || !preparedRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width <= 0) return;
      const res = layout(preparedRef.current, width, lineHeight);
      setHeight(res.height);
    }

    init();

    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      relayout();
    });
    observer.observe(el);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [text, font, lineHeight]);

  return { containerRef, height };
}
