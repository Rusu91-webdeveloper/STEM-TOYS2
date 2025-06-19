"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Globe } from "lucide-react";

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
}

export function BookLanguageSelector({
  productSlug,
  selectedLanguage,
  onLanguageSelect,
  className = "",
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
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          Loading languages...
        </span>
      </div>
    );
  }

  if (error) {
    return <div className={`text-sm text-red-500 ${className}`}>{error}</div>;
  }

  if (availableLanguages.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No digital formats available
      </div>
    );
  }

  // If only one language available, show it as info
  if (availableLanguages.length === 1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          Available in: <strong>{availableLanguages[0].name}</strong>
        </span>
        <Badge
          variant="outline"
          className="text-xs">
          {availableLanguages[0].formats.join(", ").toUpperCase()}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Choose Language:</span>
      </div>

      <div className="flex gap-2">
        {availableLanguages.map((language) => (
          <Button
            key={language.code}
            variant={selectedLanguage === language.code ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageSelect(language.code)}
            className="flex items-center gap-2">
            <span>{language.name}</span>
            <Badge
              variant="secondary"
              className="text-xs">
              {language.formats.join(", ").toUpperCase()}
            </Badge>
          </Button>
        ))}
      </div>

      {selectedLanguage && (
        <div className="text-xs text-muted-foreground">
          Selected:{" "}
          {availableLanguages.find((l) => l.code === selectedLanguage)?.name}
        </div>
      )}
    </div>
  );
}
