"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  formats: string[];
}

interface BookLanguageSelectorProps {
  productSlug: string;
  selectedLanguage?: string;
  onLanguageSelect: (language: string) => void;
  className?: string;
  compact?: boolean;
}

export function BookLanguageSelector({
  productSlug,
  selectedLanguage,
  onLanguageSelect,
  className = "",
  compact = false,
}: BookLanguageSelectorProps) {
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/books/${productSlug}/languages`);
        if (!response.ok) {
          throw new Error("Failed to fetch languages");
        }

        const data = await response.json();
        setAvailableLanguages(data.availableLanguages || []);

        // Auto-select first language if none selected
        if (!selectedLanguage && data.availableLanguages.length > 0) {
          onLanguageSelect(data.availableLanguages[0].code);
        }
      } catch (error) {
        console.error("Error fetching book languages:", error);
        setError("Failed to load language options");
      } finally {
        setIsLoading(false);
      }
    };

    if (productSlug) {
      fetchLanguages();
    }
  }, [productSlug, selectedLanguage, onLanguageSelect]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 py-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Loading formats...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-sm text-red-500 py-2", className)}>{error}</div>
    );
  }

  if (availableLanguages.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground py-2", className)}>
        No digital formats available
      </div>
    );
  }

  // If only one language available, show it as info without selection
  if (availableLanguages.length === 1) {
    const language = availableLanguages[0];
    return (
      <div className={cn("py-2", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Available in {language.name}</span>
          <Badge
            variant="secondary"
            className="text-xs">
            {language.formats.join(", ").toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Choose Language:
        </div>
        <div className="grid grid-cols-1 gap-2">
          {availableLanguages.map((language) => (
            <label
              key={language.code}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                selectedLanguage === language.code
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}>
              <input
                type="radio"
                name={`language-${productSlug}`}
                value={language.code}
                checked={selectedLanguage === language.code}
                onChange={() => onLanguageSelect(language.code)}
                className="sr-only"
              />
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  selectedLanguage === language.code
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                )}>
                {selectedLanguage === language.code && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {language.name}
                  </span>
                  <Badge
                    variant={
                      selectedLanguage === language.code
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs">
                    {language.formats.join(", ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Full version for product detail pages
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-gray-900">
          Choose Your Language
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Select your preferred language for this digital book:
      </p>

      <div className="grid gap-3">
        {availableLanguages.map((language) => (
          <label
            key={language.code}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedLanguage === language.code
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}>
            <input
              type="radio"
              name={`language-${productSlug}`}
              value={language.code}
              checked={selectedLanguage === language.code}
              onChange={() => onLanguageSelect(language.code)}
              className="sr-only"
            />
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                selectedLanguage === language.code
                  ? "border-primary bg-primary"
                  : "border-gray-300"
              )}>
              {selectedLanguage === language.code && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {language.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Digital download
                  </div>
                </div>
                <Badge
                  variant={
                    selectedLanguage === language.code ? "default" : "secondary"
                  }
                  className="text-sm px-3 py-1">
                  {language.formats.join(", ").toUpperCase()}
                </Badge>
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedLanguage && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">
              Selected:{" "}
              {
                availableLanguages.find((l) => l.code === selectedLanguage)
                  ?.name
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
