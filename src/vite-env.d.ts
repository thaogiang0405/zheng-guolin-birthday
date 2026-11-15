// These client-side Firebase settings are injected by Vite at build time.
// Intentionally do not import vite/client here: birthdayConfig.ts already
// declares BASE_URL as readonly in the project's ImportMetaEnv shape.
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
}
