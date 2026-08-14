import type { CSSProperties } from "react";
import { schoolConfig } from "@/school.config";

// "#2563eb" -> "37 99 235" (Tailwind rgb(var(--x) / <alpha>) uchun)
function hexToRgbChannels(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// layout.tsx ichida <html> ga beriladi.
// :root dagi standart qiymatlarni ustidan yozadi -> butun sayt va admin bir xil bo'yaladi.
export function getThemeStyle(): CSSProperties {
  return {
    "--primary-color": hexToRgbChannels(schoolConfig.theme.primary),
    "--primary-hover": hexToRgbChannels(schoolConfig.theme.primaryHover),
  } as CSSProperties;
}
