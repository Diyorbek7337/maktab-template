import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Bu modul HAM middleware'da (Edge runtime), HAM API route'larda (Node runtime)
// ishlatiladi. Shu sababli faqat Web Crypto va `jose` ishlatiladi —
// `node:crypto` Edge runtime'da mavjud emas va build'ni buzadi.

const COOKIE_NAME = "admin_session";
const SESSION_HOURS = 8;
const ISSUER = "texnikum-site";
const AUDIENCE = "texnikum-admin";

export const ADMIN_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_HOURS * 60 * 60; // sekundlarda

export interface AdminSession extends JWTPayload {
  role: "admin";
  jti: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "ADMIN_SECRET sozlanmagan yoki juda qisqa (kamida 16 belgi bo'lishi kerak)"
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Admin uchun muddati cheklangan, imzolangan JWT sessiya tokeni yaratadi.
 * Cookie'ga endi ADMIN_SECRET'ning o'zi emas, shu token yoziladi.
 */
export async function createSessionToken(): Promise<string> {
  const jti = crypto.randomUUID();
  return new SignJWT({ role: "admin", jti })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_HOURS}h`)
    .setJti(jti)
    .sign(getSecretKey());
}

/**
 * Sessiya tokenini tekshiradi. Imzo, muddat, issuer va audience mos
 * kelmasa `null` qaytaradi — chaqiruvchi tomon login'ga yo'naltiradi.
 */
export async function verifySessionToken(
  token: string | undefined
): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin") return null;
    return payload as AdminSession;
  } catch {
    // muddati o'tgan, imzosi noto'g'ri yoki buzilgan token
    return null;
  }
}

/**
 * Timing-attack'ga chidamli satr solishtirish.
 *
 * `node:crypto.timingSafeEqual` Edge runtime'da mavjud emas, shuning uchun
 * ikkala qiymat avval SHA-256 bilan hash qilinadi (natijada uzunliklar doim
 * teng — 32 bayt) va baytlar XOR orqali, erta chiqishsiz solishtiriladi.
 * Bu `timingSafeEqual(sha256(a), sha256(b))` bilan kriptografik jihatdan
 * ekvivalent va uzunliklar farq qilganda ham sizib chiqish bermaydi.
 */
export async function safeCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);

  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}
