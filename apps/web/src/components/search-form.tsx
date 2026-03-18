"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SymptomSuggestion } from "@/lib/api";
import { searchSymptoms } from "@/lib/api";

interface SearchFormProps {
  onSearch: (disease: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SymptomSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const result = await searchSymptoms(term);
      setSuggestions(result.suggestions);
      setShowSuggestions(result.suggestions.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  }

  function handleSuggestionClick(suggestion: SymptomSuggestion) {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Enter a disease or symptom (e.g., diabetes, headache, hypertension)"
            className={cn(
              "h-14 w-full rounded-xl border border-border bg-card pl-12 pr-24 text-base",
              "text-card-foreground placeholder:text-muted-foreground",
              "outline-none transition-all duration-200",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
            )}
            aria-label="Search for a disease or symptom"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="absolute right-20 cursor-pointer p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || query.trim().length < 2}
            className={cn(
              "absolute right-2 flex h-10 items-center gap-2 rounded-lg px-4",
              "bg-primary text-primary-foreground font-medium text-sm",
              "cursor-pointer transition-all duration-200",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {showSuggestions && (
          <ul
            role="listbox"
            className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-card p-2 shadow-lg"
          >
            {isFetchingSuggestions && (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching...
              </li>
            )}
            {suggestions.map((s) => (
              <li key={s.class_id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className={cn(
                    "w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm",
                    "text-card-foreground transition-colors duration-150",
                    "hover:bg-muted focus:bg-muted focus:outline-none",
                  )}
                  role="option"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
