import type { CSSProperties } from "react";

// Negative start offsets distribute the banks across the sky on the first paint.
const banks = [
  { art: 1, top: -6, width: 64, seconds: 93, phase: 0.38 },
  { art: 2, top: 22, width: 52, seconds: 118, phase: 0.78 },
  { art: 3, top: 59, width: 75, seconds: 108, phase: 0.49 },
  { art: 2, top: 8, width: 37, seconds: 141, phase: 0.88 },
  { art: 3, top: 42, width: 46, seconds: 130, phase: 0.24 },
  { art: 1, top: 73, width: 51, seconds: 159, phase: 0.69 },
];

interface CloudLayersProps {
  count: number;
  speed: number;
  color: string;
}

export function CloudLayers({ count, speed, color }: CloudLayersProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {banks.slice(0, count).map((bank) => {
        const duration = bank.seconds / speed;
        const style = {
          "--cloud-art": `url("/atmosphere/cloud-${bank.art}.webp")`,
          "--cloud-tint": color,
          width: `max(${bank.width}vw, ${bank.width * 5}px)`,
          top: `${bank.top}%`,
          "--drift-duration": `${duration}s`,
          animationDelay: `${-duration * bank.phase}s`,
        } as CSSProperties;
        return <div key={bank.top} className="atmosphere-cloud" style={style} />;
      })}
    </div>
  );
}
