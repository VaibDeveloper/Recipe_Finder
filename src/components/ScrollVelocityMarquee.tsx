import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, useState, useEffect } from "react";

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface MarqueeRowProps {
  words: string[];
  baseVelocity?: number;
  direction?: 1 | -1;
}

function MarqueeRow({ words, baseVelocity = 4, direction = 1 }: MarqueeRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [numCopies, setNumCopies] = useState(3);

  const baseX = useMotionValue(0);
  const unitWidth = useMotionValue(0);
  const currentDirectionRef = useRef<number>(direction);
  const isInViewRef = useRef(true);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, (v) => {
    const sign = v < 0 ? -1 : 1;
    const magnitude = Math.min(5, (Math.abs(v) / 1000) * 5);
    return sign * magnitude;
  });

  useEffect(() => {
    const container = containerRef.current;
    const block = blockRef.current;
    if (!container || !block) return;

    const updateSizes = () => {
      const cw = container.offsetWidth || 0;
      const bw = block.scrollWidth || 0;
      unitWidth.set(bw);
      const copies = bw > 0 ? Math.max(3, Math.ceil(cw / bw) + 2) : 3;
      setNumCopies(copies);
    };

    updateSizes();
    const ro = new ResizeObserver(updateSizes);
    ro.observe(container);
    ro.observe(block);

    const io = new IntersectionObserver(([entry]) => {
      if (entry) isInViewRef.current = entry.isIntersecting;
    });
    io.observe(container);

    return () => { ro.disconnect(); io.disconnect(); };
  }, [unitWidth]);

  const x = useTransform([baseX, unitWidth], ([v, bw]) => {
    const width = Number(bw) || 1;
    const offset = Number(v) || 0;
    return `${-wrap(0, width, offset)}px`;
  });

  useAnimationFrame((_, delta) => {
    if (!isInViewRef.current) return;
    const dt = delta / 1000;
    const vf = velocityFactor.get();
    const absVf = Math.min(5, Math.abs(vf));
    const speedMultiplier = 1 + absVf;

    if (absVf > 0.1) {
      currentDirectionRef.current = direction * (vf >= 0 ? 1 : -1);
    }

    const bw = unitWidth.get() || 0;
    if (bw <= 0) return;
    const pixelsPerSecond = (bw * baseVelocity) / 100;
    baseX.set(baseX.get() + currentDirectionRef.current * pixelsPerSecond * speedMultiplier * dt);
  });

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", overflow: "hidden", whiteSpace: "nowrap" }}
    >
      <motion.div
        style={{
          x,
          display: "inline-flex",
          alignItems: "center",
          willChange: "transform",
          userSelect: "none",
        }}
      >
        {Array.from({ length: numCopies }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? blockRef : null}
            aria-hidden={i !== 0}
            style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
          >
            {words.map((word) => (
              <span key={word} className="marquee-word">
                {word}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface ScrollVelocityMarqueeProps {
  row1: string[];
  row2: string[];
}

export default function ScrollVelocityMarquee({ row1, row2 }: ScrollVelocityMarqueeProps) {
  return (
    <div className="velocity-marquee-wrapper">
      <MarqueeRow words={row1} baseVelocity={4} direction={1} />
      <MarqueeRow words={row2} baseVelocity={4} direction={-1} />
    </div>
  );
}