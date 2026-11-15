/**
 * Birthday wishes use Firebase REALTIME DATABASE (not Cloud Firestore).
 *
 * Anonymous visitors may CREATE their own name + greeting at /fanLetters.
 * Firebase database rules must deny them READ permission.
 *
 * Reading is performed by an optional private gateway that verifies the
 * birthday letter code on the SERVER; the recipient never signs in to Firebase.
 * Do not turn on public RTDB reads: hiding HTML does not protect any data.
 */

export type PrivateFanLetter = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type AuthResponse = { idToken: string; localId: string };
type SavedWish = { name?: unknown; message?: unknown; createdAt?: unknown };

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || "";
const DATABASE_URL = (import.meta.env.VITE_FIREBASE_DATABASE_URL?.trim() || "").replace(/\/+$/, "");
const READER_API_URL = import.meta.env.VITE_LETTER_READER_API_URL?.trim() || "";
const WISH_PATH = "fanLetters";

export const privateLettersConfigured = Boolean(API_KEY && DATABASE_URL);
export const privateReaderConfigured = Boolean(READER_API_URL);

function endpoint(path: string): string {
  if (!privateLettersConfigured) throw new Error("firebase-not-configured");
  const database = new URL(DATABASE_URL);
  if (database.protocol !== "https:" ||
      !(database.hostname.endsWith(".firebasedatabase.app") || database.hostname.endsWith(".firebaseio.com"))) {
    throw new Error("invalid-database-url");
  }
  return DATABASE_URL + "/" + path.replace(/^\/+/, "") + ".json";
}

async function checkedJson<T>(input: string, options: RequestInit): Promise<T> {
  const res = await fetch(input, options);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("permission-denied");
    if (res.status === 429) throw new Error("rate-limited");
    throw new Error("request-failed");
  }
  return await res.json() as T;
}

export async function sendPrivateFanLetter(input: { name: string; message: string }): Promise<void> {
  const name = Array.from(input.name.trim()).slice(0, 40).join("");
  const message = input.message.trim();
  if (!message || Array.from(message).length > 500) throw new Error("invalid-message");
  const sender = await checkedJson<AuthResponse>(
    "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + encodeURIComponent(API_KEY),
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) },
  );
  await checkedJson<{ name: string }>(
    endpoint(WISH_PATH) + "?auth=" + encodeURIComponent(sender.idToken),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        message,
        senderUid: sender.localId,
        createdAt: { ".sv": "timestamp" },
      }),
    },
  );
}

export async function getRecipientLetters(passcode: string): Promise<PrivateFanLetter[]> {
  if (!privateReaderConfigured) throw new Error("private-reader-not-configured");
  const api = new URL(READER_API_URL);
  if (api.protocol !== "https:" && !(api.protocol === "http:" && api.hostname === "localhost")) {
    throw new Error("invalid-reader-url");
  }
  const data = await checkedJson<{ letters: Array<{ id: string; name: string; message: string; createdAt: number }> }>(
    READER_API_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
      cache: "no-store",
    },
  );
  if (!Array.isArray(data.letters)) throw new Error("invalid-response");
  return data.letters
    .filter(item => typeof item.id === "string" && typeof item.message === "string")
    .map(item => {
      const raw: SavedWish = item;
      return {
        id: item.id,
        name: typeof raw.name === "string" ? raw.name : "",
        message: item.message,
        createdAt: Number.isFinite(raw.createdAt) ? new Date(raw.createdAt as number).toISOString() : new Date(0).toISOString(),
      };
    });
}
