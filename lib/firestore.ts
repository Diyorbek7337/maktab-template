import {
  collection, addDoc, getDocs, deleteDoc, doc, setDoc, writeBatch,
  orderBy, query, serverTimestamp, updateDoc, Timestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import type { Teacher, OlympiadWinner, StaffMember, Club, Alumni, Major } from "@/school.config";

// Firestore yozuvi bilan birga undagi Storage rasmini ham o'chiradi.
// URL bo'lmasa yoki fayl allaqachon yo'q bo'lsa jim o'tkazib yuboriladi.
async function deleteStorageFile(url?: string): Promise<void> {
  if (!url || !url.includes("firebasestorage")) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // fayl topilmadi yoki allaqachon o'chirilgan — e'tiborsiz qoldiramiz
  }
}

// Firestore `undefined` qiymatni qabul qilmaydi — bo'sh maydonlar
// yuborilmasligi kerak.
function stripUndefined(data: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
}

/**
 * Yozuvni yangilaydi. Rasm almashtirilgan bo'lsa, eski rasm Storage'dan
 * o'chiriladi — aks holda u yetim bo'lib qolib, joyni egallab turaveradi.
 */
async function updateWithImage(
  col: string,
  id: string,
  data: object,
  prevImage?: string
): Promise<void> {
  const clean = stripUndefined(data);
  const nextImage = typeof clean.image === "string" ? clean.image : undefined;
  if (prevImage && prevImage !== nextImage) {
    await deleteStorageFile(prevImage);
  }
  // Rasm olib tashlangan bo'lsa, maydonni ham tozalaymiz (stripUndefined
  // uni tushirib qoldiradi, aks holda eski URL hujjatda qolib ketardi).
  if (!nextImage && prevImage) clean.image = "";
  await updateDoc(doc(db, col, id), clean);
}

/**
 * `school.config.ts` dagi namuna ma'lumotlarni Firestore'ga ko'chiradi.
 *
 * Nima uchun kerak: ilgari sayt Firestore bo'sh bo'lganda config'dan
 * o'qirdi, lekin admin BITTA yozuv qo'shishi bilan config'dagi qolgan
 * hammasi saytdan yo'qolardi (`if (data.length) setX(data)`). Bir marta
 * ko'chirilgandan keyin Firestore yagona manba bo'ladi va har bir yozuv
 * tahrirlanadigan/o'chiriladigan bo'ladi.
 */
export async function seedCollection(
  col: string,
  items: readonly object[]
): Promise<number> {
  if (!items.length) return 0;

  // Ustma-ust ko'chirib yubormaslik uchun avval bo'shligini tekshiramiz
  const existing = await getDocs(collection(db, col));
  if (!existing.empty) return 0;

  const batch = writeBatch(db);
  items.forEach((item, i) => {
    const docRef = doc(collection(db, col));
    batch.set(docRef, {
      ...stripUndefined(item),
      // Tartib config'dagidek saqlansin (createdAt desc bo'yicha o'qiladi)
      order: i,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return items.length;
}

// ── Xabarlar ──────────────────────────────────────────────────
export interface Message {
  id: string;
  name: string;
  phone: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt?: Timestamp;
}

export async function getMessages(): Promise<Message[]> {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }));
}

// Diqqat: xabar yozish client'dan olib tashlangan. Kontakt formasi
// `/api/contact` route orqali yozadi (rate limit + Zod validatsiyasi bilan),
// va Firestore qoidalari client yozuvini rad etadi.

export async function markMessageRead(id: string): Promise<void> {
  await updateDoc(doc(db, "messages", id), { read: true });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, "messages", id));
}

// ── Galereya ──────────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  category?: string;
  createdAt?: unknown;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">) }));
}

export async function addGalleryItem(data: Omit<GalleryItem, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "gallery"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteGalleryItem(id: string, url?: string): Promise<void> {
  await Promise.all([deleteStorageFile(url), deleteDoc(doc(db, "gallery", id))]);
}

// ── O'qituvchilar ─────────────────────────────────────────────
export type TeacherDoc = Teacher & { id: string };

export async function getTeachers(): Promise<TeacherDoc[]> {
  const q = query(collection(db, "teachers"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Teacher) }));
}

export async function addTeacher(data: Teacher): Promise<string> {
  const ref = await addDoc(collection(db, "teachers"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTeacher(id: string, data: Teacher, prevImage?: string): Promise<void> {
  await updateWithImage("teachers", id, data, prevImage);
}

export async function deleteTeacher(id: string, image?: string): Promise<void> {
  await Promise.all([deleteStorageFile(image), deleteDoc(doc(db, "teachers", id))]);
}

// ── Rahbariyat ────────────────────────────────────────────────
export type StaffDoc = StaffMember & { id: string; order?: number };

export async function getStaff(): Promise<StaffDoc[]> {
  const q = query(collection(db, "administration"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as StaffMember & { order?: number }) }));
}

export async function addStaff(data: StaffMember, order: number): Promise<string> {
  const ref = await addDoc(collection(db, "administration"), {
    ...data,
    order,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStaffOrder(id: string, order: number): Promise<void> {
  await updateDoc(doc(db, "administration", id), { order });
}

export async function updateStaff(id: string, data: StaffMember, prevImage?: string): Promise<void> {
  await updateWithImage("administration", id, data, prevImage);
}

export async function deleteStaff(id: string, image?: string): Promise<void> {
  await Promise.all([deleteStorageFile(image), deleteDoc(doc(db, "administration", id))]);
}

// ── To'garaklar ───────────────────────────────────────────────
export type ClubDoc = Club & { id: string };

export async function getClubs(): Promise<ClubDoc[]> {
  const q = query(collection(db, "clubs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Club) }));
}

export async function addClub(data: Club): Promise<string> {
  const ref = await addDoc(collection(db, "clubs"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateClub(id: string, data: Club, prevImage?: string): Promise<void> {
  await updateWithImage("clubs", id, data, prevImage);
}

export async function deleteClub(id: string, image?: string): Promise<void> {
  await Promise.all([deleteStorageFile(image), deleteDoc(doc(db, "clubs", id))]);
}

// ── Kasb-hunar yo'nalishlari ────────────────────────────────────
export type MajorDoc = Major & { id: string };

export async function getMajors(): Promise<MajorDoc[]> {
  const q = query(collection(db, "majors"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Major) }));
}

export async function addMajor(data: Major): Promise<string> {
  const ref = await addDoc(collection(db, "majors"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateMajor(id: string, data: Major, prevImage?: string): Promise<void> {
  await updateWithImage("majors", id, data, prevImage);
}

export async function deleteMajor(id: string, image?: string): Promise<void> {
  await Promise.all([deleteStorageFile(image), deleteDoc(doc(db, "majors", id))]);
}

// ── Olimpiada g'oliblari ──────────────────────────────────────
export type WinnerDoc = OlympiadWinner & { id: string };

export async function getWinners(): Promise<WinnerDoc[]> {
  const q = query(collection(db, "olympiadWinners"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OlympiadWinner) }));
}

export async function addWinner(data: OlympiadWinner): Promise<string> {
  const ref = await addDoc(collection(db, "olympiadWinners"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWinner(id: string, data: OlympiadWinner, prevImage?: string): Promise<void> {
  await updateWithImage("olympiadWinners", id, data, prevImage);
}

export async function deleteWinner(id: string, image?: string): Promise<void> {
  await Promise.all([deleteStorageFile(image), deleteDoc(doc(db, "olympiadWinners", id))]);
}

// ── Bitiruvchilar ─────────────────────────────────────────────
export type AlumniDoc = Alumni & { id: string };

export async function getAlumni(): Promise<AlumniDoc[]> {
  const q = query(collection(db, "alumni"), orderBy("graduationYear", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Alumni) }));
}

export async function addAlumni(data: Alumni): Promise<string> {
  const ref = await addDoc(collection(db, "alumni"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateAlumni(id: string, data: Alumni, prevImage?: string): Promise<void> {
  await updateWithImage("alumni", id, data, prevImage);
}

export async function deleteAlumni(id: string, image?: string): Promise<void> {
  await Promise.all([deleteStorageFile(image), deleteDoc(doc(db, "alumni", id))]);
}

// ── Yangiliklar ───────────────────────────────────────────────
export interface NewsDoc {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content?: string;
  image?: string;    // eski yozuvlar uchun (bitta rasm) — moslik saqlanadi
  images?: string[];  // yangi: bir nechta rasm, [0] — asosiy (muqova)
  date: string;
  createdAt?: Timestamp;
}

export async function getNews(): Promise<NewsDoc[]> {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsDoc, "id">) }));
}

export async function addNews(data: Omit<NewsDoc, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "news"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

/**
 * Yangilikni yangilaydi. Tahrirlash paytida ro'yxatdan olib tashlangan
 * rasmlar Storage'dan ham o'chiriladi.
 */
export async function updateNews(
  id: string,
  data: Omit<NewsDoc, "id" | "createdAt" | "slug">,
  prevImages: string[] = []
): Promise<void> {
  const nextImages = data.images ?? [];
  const removed = prevImages.filter((url) => !nextImages.includes(url));
  await Promise.all(removed.map((url) => deleteStorageFile(url)));
  await updateDoc(doc(db, "news", id), stripUndefined(data));
}

export async function deleteNews(id: string, images?: string[]): Promise<void> {
  await Promise.all([
    ...(images ?? []).map((url) => deleteStorageFile(url)),
    deleteDoc(doc(db, "news", id)),
  ]);
}

// ── Dars jadvali ──────────────────────────────────────────────
import type { Weekday, ScheduleEntry } from "./data";

export async function getSchedule(): Promise<Record<Weekday, ScheduleEntry[]> | null> {
  const snap = await getDocs(collection(db, "schedule"));
  if (snap.empty) return null;
  const result: Record<string, ScheduleEntry[]> = {};
  snap.docs.forEach((d) => { result[d.id] = d.data().entries as ScheduleEntry[]; });
  return result as Record<Weekday, ScheduleEntry[]>;
}

export async function saveFullSchedule(schedule: Record<Weekday, ScheduleEntry[]>): Promise<void> {
  const promises = (Object.entries(schedule) as [Weekday, ScheduleEntry[]][]).map(
    ([day, entries]) => setDoc(doc(db, "schedule", day), { entries })
  );
  await Promise.all(promises);
}
