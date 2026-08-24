"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

// next/image "fill" rejimida ishlaydigan, rasm yuklanguncha
// pulsatsiyalanuvchi skelet ko'rsatadigan va keyin yumshoq
// paydo bo'ladigan wrapper. Ota element "relative" bo'lishi kerak.
export default function ImageWithSkeleton({ className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
      <Image
        {...props}
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
        className={`${className ?? ""} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
