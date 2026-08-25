import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Faqat serverda, so'rov kelganda chaqiriladi (build vaqtida emas) —
// aks holda Next.js "collect page data" bosqichida env yo'qligida qulab tushadi.
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin SDK sozlanmagan (.env.local ga FIREBASE_ADMIN_* qiymatlarini qo'shing)");
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

// Admin SDK Firestore xavfsizlik qoidalarini chetlab o'tadi — shuning uchun
// faqat serverda tekshirilgan (validatsiyadan o'tgan) yozuvlar uchun ishlating.
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
