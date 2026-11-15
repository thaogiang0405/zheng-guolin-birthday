// These client-side Firebase web settings are provided by Vite at build time.
// birthdayConfig.ts already declares BASE_URL, so do not re-declare it here.
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_DATABASE_URL?: string;
  readonly VITE_LETTER_READER_API_URL?: string;
}
