export type Locale = "vi" | "zh";

export type LocalizedText = Record<Locale, string>;

export interface GalleryItem {
  id: string;
  src: string;
  alt: LocalizedText;
  caption: LocalizedText;
  rotation: string;
  featured?: boolean;
}

export interface Wish {
  id: string;
  message: string;
  createdAt: number;
}
