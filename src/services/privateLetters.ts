/**
 * Private fan letters for Cloud Firestore using official Firebase REST endpoints.
 *
 * No letters are ever loaded for visitors. Sender gets only a write result.
 * Firebase Security Rules—not the UI passcode—control recipient-only reads.
 * No service-account credentials or recipient passwords are bundled in the site.
 */

export type FanLetterKind = "letter" | "wish";

export type PrivateFanLetter = {
  id: string;
  kind: FanLetterKind;
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
    // Keep server details out of the UI, but distinguish access/config failures.
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
  kind: FanLetterKind;
  name: string;
  message: string;
}): Promise<void> {
  if (!privateLettersConfigured) throw new Error("firebase-not-configured");
  const name = entry.name.trim().slice(0, 40);
  const message = entry.message.trim();
  const limit = entry.kind === "letter" ? 1500 : 180;
  if (!message || Array.from(message).length > limit || !["letter", "wish"].includes(entry.kind)) {
    throw new Error("invalid-message");
  }

  // Anonymous Firebase Auth: allows private create-only Firestore security rule.
  // The sender receives no query/list/read capability.
  const session = await auth("signUp", {});
  await requestJson<FirestoreDocument>(collectionUrl(), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + session.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        kind: { stringValue: entry.kind },
        name: { stringValue: name },
        message: { stringValue: message },
        senderUid: { stringValue: session.localId },
      },
    }),
  });
}

export async function signInLetterRecipient(email: string, password: string): Promise<FirebaseSession> {
  const account = await auth("signInWithPassword", { email: email.trim(), password });
  return { idToken: account.idToken, localId: account.localId };
}

function parseLetter(document: FirestoreDocument): PrivateFanLetter | null {
  const fields = document.fields || {};
  const kind = fields.kind?.stringValue;
  const message = fields.message?.stringValue;
  if ((kind !== "letter" && kind !== "wish") || !message) return null;
  return {
    id: document.name.split("/").pop() || document.name,
    kind,
    name: fields.name?.stringValue || "",
    message,
    createdAt: document.createTime || new Date(0).toISOString(),
  };
}

export async function getRecipientLetters(session: FirebaseSession): Promise<PrivateFanLetter[]> {
  if (!privateLettersConfigured) throw new Error("firebase-not-configured");
  const all: PrivateFanLetter[] = [];
  let pageToken = "";
  for (let page = 0; page < 5; page++) {
    const url = collectionUrl() + "?pageSize=100" +
      (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const result = await requestJson<FirestoreListResponse>(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + session.idToken },
      cache: "no-store",
    });
    for (const document of result.documents || []) {
      const parsed = parseLetter(document);
      if (parsed) all.push(parsed);
    }
    pageToken = result.nextPageToken || "";
    if (!pageToken) break;
  }
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
