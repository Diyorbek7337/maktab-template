/**
 * YouTube havolasidan video ID ajratib oladi.
 *
 * Kontent yuklovchi xodim brauzerdagi manzilni yoki "Ulashish" tugmasi
 * bergan havolani shundoq nusxalab qo'yishi kifoya — quyidagi barcha
 * ko'rinishlar tushuniladi:
 *
 *   https://www.youtube.com/watch?v=ABC123xyz_-
 *   https://youtu.be/ABC123xyz_-
 *   https://www.youtube.com/embed/ABC123xyz_-
 *   https://www.youtube.com/shorts/ABC123xyz_-
 *   https://www.youtube.com/live/ABC123xyz_-
 *   ABC123xyz_-            (faqat ID)
 *
 * Havola noto'g'ri bo'lsa `null` qaytaradi.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // Video ID — 11 belgi: harf, raqam, tire va pastki chiziq
  const ID = /^[A-Za-z0-9_-]{11}$/;

  // Foydalanuvchi faqat ID yozgan bo'lsa
  if (ID.test(value)) return value;

  let url: URL;
  try {
    // Protokolsiz yozilgan bo'lsa ham ishlasin ("youtu.be/xxx")
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && ID.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && ID.test(v)) return v;

    const [section, id] = url.pathname.split("/").filter(Boolean);
    if (["embed", "shorts", "live", "v"].includes(section) && id && ID.test(id)) {
      return id;
    }
  }

  return null;
}

/** Video ko'rinishi uchun muqova rasmi (YouTube tomonidan beriladi). */
export function youTubeThumbnail(id: string): string {
  // hqdefault har doim mavjud; maxresdefault ba'zi videolarda yo'q
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Ko'mib qo'yish (embed) manzili.
 * `youtube-nocookie.com` — foydalanuvchi videoni ochmaguncha kuzatuv
 * cookie'lari qo'yilmaydi.
 */
export function youTubeEmbedUrl(id: string, autoplay = false): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** Odam ko'radigan oddiy havola (yangi oynada ochish uchun). */
export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
