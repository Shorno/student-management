import { Button } from "@student-management/ui/components/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

// Ambiguous characters (0/O, 1/I/L) are left out so the code is readable.
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCaptcha(length = 6) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

const WIDTH = 180;
const HEIGHT = 50;

export function Captcha({ code, onRefresh }: { code: string; onRefresh: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const randomColor = (min: number, max: number) =>
      `rgb(${random(min, max)},${random(min, max)},${random(min, max)})`;

    ctx.fillStyle = "#f4f4f5";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = randomColor(120, 200);
      ctx.beginPath();
      ctx.moveTo(random(0, WIDTH), random(0, HEIGHT));
      ctx.lineTo(random(0, WIDTH), random(0, HEIGHT));
      ctx.stroke();
    }

    ctx.textBaseline = "middle";
    [...code].forEach((char, i) => {
      ctx.save();
      ctx.font = `bold ${Math.round(random(22, 28))}px monospace`;
      ctx.fillStyle = randomColor(20, 100);
      ctx.translate(18 + i * 26, HEIGHT / 2);
      ctx.rotate(random(-0.4, 0.4));
      ctx.fillText(char, -8, 0);
      ctx.restore();
    });

    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = randomColor(100, 200);
      ctx.fillRect(random(0, WIDTH), random(0, HEIGHT), 2, 2);
    }
  }, [code]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="border border-input"
        role="img"
        aria-label="Captcha image"
      />
      <Button type="button" variant="outline" size="icon" onClick={onRefresh} aria-label="New captcha">
        <RefreshCw />
      </Button>
    </div>
  );
}
