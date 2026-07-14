import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({ value, duration = 0.8, formatter, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    previousValue.current = value;
    return () => controls.stop();
  }, [value, duration]);

  const text = formatter ? formatter(display) : Math.round(display).toLocaleString();

  return <span className={className}>{text}</span>;
}
