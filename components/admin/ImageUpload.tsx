"use client";

import { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { compressImage } from "@/lib/imageCompress";

// Firebase Storage sukut bo'yicha "no-cache" yuboradi — bu esa har safar
// rasmni to'liq qayta yuklashga majbur qiladi. Fayl nomi vaqt tamg'asi bilan
// noyob bo'lgani uchun uzoq muddatli keshlash butunlay xavfsiz.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: string; // "teachers" | "olympiad"
  label?: string;
}

export default function ImageUpload({ value, onChange, folder, label = "Rasm (ixtiyoriy)" }: Props) {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { alert("JPEG, PNG yoki WebP rasm tanlang"); return; }
    if (file.size > 3 * 1024 * 1024) { alert("Fayl 3 MB dan kichik bo'lsin"); return; }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const compressed = await compressImage(file);
      const storageRef = ref(storage, `${folder}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, compressed, { cacheControl: CACHE_CONTROL });
      const url = await getDownloadURL(storageRef);
      onChange(url);
      setPreview(url);
    } catch {
      alert("Yuklashda xatolik. Firebase config ni tekshiring.");
      setPreview(value);
      onChange(value);
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setPreview("");
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>

      {preview ? (
        <div className="relative w-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="h-28 w-28 rounded-full object-cover ring-2 ring-primary/20" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 text-xs text-primary">
              Yukl…
            </div>
          )}
          <button
            type="button"
            onClick={clear}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-500 hover:text-red-500 text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-center text-xs text-gray-400 hover:border-primary hover:text-primary transition-colors">
          <svg className="mb-1 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          Rasm
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
    </div>
  );
}
