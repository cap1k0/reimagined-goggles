// جلسه‌ی مهمان کاملاً local هست - هیچ اکانتی تو Supabase ساخته نمیشه.
// فقط یه شناسه‌ی موقت + زمان شروع، تو localStorage مرورگر خودش.

const GUEST_KEY = "guest_session";
const GUEST_LIMIT_MS = 15 * 60 * 1000; // ۱۵ دقیقه

type GuestSession = {
  guestId: string;
  startedAt: number;
};

export function startGuestSession(): GuestSession {
  const session: GuestSession = {
    guestId: `guest_${crypto.randomUUID()}`,
    startedAt: Date.now(),
  };
  localStorage.setItem(GUEST_KEY, JSON.stringify(session));
  return session;
}

export function getGuestSession(): GuestSession | null {
  const raw = localStorage.getItem(GUEST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function clearGuestSession() {
  localStorage.removeItem(GUEST_KEY);
}

/** میلی‌ثانیه‌ی باقی‌مونده تا انقضا؛ اگه منفی/صفر شد یعنی وقت تموم شده. */
export function getGuestTimeRemaining(session: GuestSession): number {
  return GUEST_LIMIT_MS - (Date.now() - session.startedAt);
}

export function isGuestExpired(session: GuestSession): boolean {
  return getGuestTimeRemaining(session) <= 0;
}
