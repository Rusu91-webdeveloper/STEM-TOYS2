"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { languages, useTranslation } from "@/lib/i18n";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useTranslation();

  const switchLanguage = (langCode: string) => {
    // Update the language in the i18n context
    setLanguage(langCode);

    // Force a refresh to update all components
    router.refresh();
  };

  // Find current language details
  const currentLanguage =
    languages.find((l) => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 h-8 px-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block text-xs">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="inline-block md:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? "font-bold bg-accent" : ""}`}>
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
