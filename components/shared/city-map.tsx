"use client";

import { useEffect, useRef } from "react";

import { getCategoryColor } from "@/lib/category-colors";

type CityMapProps = {
  categories: string[];
  /** 5 characters per place: x (2), y (2), category (1). See getMapDots. */
  data: string;
  /** Width divided by height of the area */
  aspect: number;
  label: string;
};

type Dot = { x: number; y: number; color: string };

function decode(data: string, categories: string[]): Dot[] {
  const dots: Dot[] = [];

  for (let i = 0; i + 4 < data.length; i += 5) {
    const x = Number.parseInt(data.slice(i, i + 2), 36);
    const y = Number.parseInt(data.slice(i + 2, i + 4), 36);
    const category = categories[Number.parseInt(data[i + 4], 36)];

    if (Number.isFinite(x) && Number.isFinite(y)) {
      dots.push({ x: x / 1023, y: y / 1023, color: getCategoryColor(category ?? "") });
    }
  }

  return dots;
}

/**
 * Every place in the data as a dot, in the color of its category. Together
 * they draw the shape of the city. The dots appear from south to north.
 */
export function CityMap({ categories, data, aspect, label }: CityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const dots = decode(data, categories);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let progress = reduceMotion ? 1 : 0; // 0 = nothing drawn, 1 = everything
    let started = 0;

    function draw() {
      if (!canvas || !context) return;

      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();

      if (canvas.width !== Math.round(width * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const size = Math.max(1.8, width / 120);
      const pad = size;

      // the dots at the south (large y) appear first
      const shown = 1 - progress;

      for (const dot of dots) {
        if (dot.y < shown) continue;

        context.fillStyle = dot.color;
        context.globalAlpha = 0.92;
        context.fillRect(
          pad + dot.x * (width - pad * 2) - size / 2,
          pad + dot.y * (height - pad * 2) - size / 2,
          size,
          size,
        );
      }

      context.globalAlpha = 1;
    }

    function tick(now: number) {
      if (!started) started = now;

      const t = Math.min(1, (now - started) / 1600);

      progress = 1 - Math.pow(1 - t, 3); // eases out
      draw();

      if (t < 1) frame = requestAnimationFrame(tick);
    }

    if (reduceMotion) draw();
    else frame = requestAnimationFrame(tick);

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [categories, data]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="block h-full w-auto max-w-full"
      style={{ aspectRatio: String(aspect) }}
    />
  );
}
