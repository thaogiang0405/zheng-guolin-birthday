/**
 * Private birthday wishes stored in Cloud Firestore.
 *
 * Visitors submit only a sender name and a birthday message. An anonymous
 * Firebase Authentication identity is used exclusively for the create-only
 * security rule; it is not a user-entered form field.
 *
 * The master letter passcode is a visual gate, NOT Firebase authorization.
 * Only a separately authorized Firebase Auth UID can read the collection.
 */
export type PrivateFanLetter = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type FirebaseSession = {
  idToken: string;
  localId: string;
};

type AuthResponse = FirebaseSession & { refreshToken?: string; expiresIn?: string };
type FirestoreValue = { stringValue?: string };
type FirestoreDocument = {
  name: string;
  createTime?: string;
  fields?: Record<string, FirestoreValue>;
};
type FirestoreListResponse = {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
};

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? "";
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "";
const FIRESTORE_COLLECTION = "fanLetters";

export const privateLettersConfigured = Boolean(FIREBASE_API_KEY && FIREBASE_PROJECT_ID);

const authUrl = (action: string) =>
  "https://identitytoolkit.googleapis.com/v1/accounts:" + action + "?key=" + encodeURIComponent(FIREBASE_API_KEY);
const collectionUrl = () =>
  "https://firestore.googleapis.com/v1/projects/" + encodeURIComponent(FIREBASE_PROJECT_ID) +
  "/databases/(default)/documents/" + FIRESTORE_COLLECTION;

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init.headers || {}) },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("permission-denied");
    if (response.status === 429) throw new Error("rate-limited");
    throw new Error("request-failed-" + response.status);
  }
  return (await response.json()) as T;
}

async function auth(action: string, payload: Record<string, unknown>): Promise<AuthResponse> {
  if (!privateLettersConfigured) throw new Error("firebase-not-configured");
  return requestJson<AuthResponse>(authUrl(action), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, returnSecureToken: true }),
  });
}

export async function sendPrivateFanLetter(entry: {
  name: string;
  message: string;
}): Promise<void> {
  if (!privateLettersConfigured) throw new Error("firebase-not-configured");
  const name = Array.from(entry.name.trim()).slice(0, 40).join("");
  const message = entry.message.trim();
  if (!message || Array.from(message).length > 500) throw new Error("invalid-message");

  // Sign in anonymously only for this write. Never expose a document read token.
  const sender = await auth("signUp", {});
  await requestJson<FirestoreDocument>(collectionUrl(), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sender.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        name: { stringValue: name },
        message: { stringValue: message },
        senderUid: { stringValue: sender.localId },
      },
    }),
  });
}

export async function signInLetterRecipient(email: string, password: string): Promise<FirebaseSession> {
  const user = await auth("signInWithPassword", { email: email.trim(), password });
  return { idToken: user.idToken, localId: user.localId };
}

function parseLetter(document: FirestoreDocument): PrivateFanLetter | null {
  const fields = document.fields || {};
  const message = fields.message?.stringValue;
  if (typeof message !== "string" || !message) return null;
  return {
    id: document.name.split("/").pop() || document.name,
    name: fields.name?.stringValue || "",
    message,
    createdAt: document.createTime || new Date(0).toISOString(),
  };
}

export async function getRecipientLetters(session: FirebaseSession): Promise<PrivateFanLetter[]> {
  if (!privateLettersConfigured) throw new Error("firebase-not-configured");
  const result: PrivateFanLetter[] = [];
  let pageToken = "";
  // Fetch up to 500 birthday wishes, newest-first in the UI.
  for (let page = 0; page < 5; page++) {
    const url = collectionUrl() + "?pageSize=100" +
      (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const pageData = await requestJson<FirestoreListResponse>(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + session.idToken },
      cache: "no-store",
    });
    for (const document of pageData.documents || []) {
      const parsed = parseLetter(document);
      if (parsed) result.push(parsed);
    }
    pageToken = pageData.nextPageToken || "";
    if (!pageToken) break;
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
