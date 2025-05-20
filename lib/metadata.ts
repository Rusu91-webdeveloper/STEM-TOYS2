import { Metadata } from "next";
import { en } from "@/lib/i18n/translations/en";
import { ro } from "@/lib/i18n/translations/ro";

// Define available languages directly rather than importing from i18n (which is client-only)
export const metadataLanguages = [
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

// Helper to get translations based on language code
function getTranslation(key: keyof typeof en, language: string = "ro") {
  if (language === "ro" && key in ro) {
    return ro[key as keyof typeof ro];
  }
  return en[key];
}

type MetadataOptions = {
  title?: keyof typeof en;
  description?: keyof typeof en;
  ogTitle?: keyof typeof en;
  ogDescription?: keyof typeof en;
};

// Create metadata with alternates for each language
export function createMetadata({
  title = "metaTitle",
  description = "metaDescription",
  ogTitle,
  ogDescription,
}: MetadataOptions = {}): Metadata {
  // Generate alternates for each supported language
  const alternates = {
    languages: Object.fromEntries(
      metadataLanguages.map((lang) => [lang.code, `/${lang.code}`])
    ),
  };

  return {
    title: getTranslation(title),
    description: getTranslation(description),
    alternates,
    openGraph: {
      title: getTranslation(ogTitle || title),
      description: getTranslation(ogDescription || description),
      locale: "ro_RO",
      alternateLocale: ["en_US"],
    },
  };
}
