/**
 * Cloudflare Worker: private, server-side Realtime Database reader.
 *
 * The recipient never logs into Firebase. They only enter the code on the
 * birthday website. This worker keeps the Firebase reader login off the web.
 *
 * Configure secrets with Wrangler before deployment:
 *   LETTER_PASSCODE, FIREBASE_WEB_API_KEY, FIREBASE_DATABASE_URL,
 *   FIREBASE_READER_EMAIL, FIREBASE_READER_PASSWORD
 *
 * See README_REALTIME_DATABASE.md. Use rate-limiting/WAF on this endpoint
 * before sharing widely. The 7-digit PIN is not high-entropy authentication.
 */

function cors(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": origin === allowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function codeMatches(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://thaogiang0405.github.io";
    const headers = cors(origin, allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: origin === allowedOrigin ? 204 : 403, headers });
    }
    if (requestUrl.pathname !== "/letters" || request.method !== "POST") {
      return json({ error: "not-found" }, 404, headers);
    }
    if (origin !== allowedOrigin) return json({ error: "not-allowed" }, 403, headers);
    if (!env.LETTER_PASSCODE || !env.FIREBASE_WEB_API_KEY || !env.FIREBASE_DATABASE_URL ||
        !env.FIREBASE_READER_EMAIL || !env.FIREBASE_READER_PASSWORD) {
      return json({ error: "not-configured" }, 503, headers);
    }

    let data;
    try {
      const raw = await request.text();
      if (raw.length > 200) return json({ error: "bad-request" }, 400, headers);
      data = JSON.parse(raw);
    } catch {
      return json({ error: "bad-request" }, 400, headers);
    }

    if (!codeMatches(data?.passcode, env.LETTER_PASSCODE)) {
      return json({ error: "invalid-code" }, 403, headers);
    }

    try {
      const dbUrl = new URL(env.FIREBASE_DATABASE_URL);
      if (dbUrl.protocol !== "https:" ||
          !(dbUrl.hostname.endsWith(".firebaseio.com") || dbUrl.hostname.endsWith(".firebasedatabase.app"))) {
        return json({ error: "invalid-db-config" }, 503, headers);
      }
      const login = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
          encodeURIComponent(env.FIREBASE_WEB_API_KEY),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: env.FIREBASE_READER_EMAIL,
            password: env.FIREBASE_READER_PASSWORD,
            returnSecureToken: true,
          }),
        },
      );
      if (!login.ok) return json({ error: "reader-auth-failed" }, 502, headers);
      const account = await login.json();
      if (typeof account.idToken !== "string") return json({ error: "reader-auth-failed" }, 502, headers);

      const path = "fanLetters";
      const url = new URL(dbUrl.toString().replace(/\/+$/, "") + "/" + path + ".json");
      url.searchParams.set("auth", account.idToken);
      url.searchParams.set("orderBy", '"$key"');
      url.searchParams.set("limitToLast", "500");
      const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) return json({ error: "reader-permission-denied" }, 502, headers);
      const records = await response.json();
      const letters = Object.entries(records || {})
        .filter(([, item]) => item && typeof item === "object" && typeof item.message === "string")
        .map(([id, item]) => ({
          id,
          name: typeof item.name === "string" ? item.name.slice(0, 40) : "",
          message: String(item.message).slice(0, 500),
          createdAt: Number(item.createdAt) || 0,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
      return json({ letters }, 200, headers);
    } catch {
      return json({ error: "reader-unavailable" }, 502, headers);
    }
  },
};
