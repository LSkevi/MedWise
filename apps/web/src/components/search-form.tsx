"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SymptomSuggestion } from "@/lib/api";
import { searchSymptoms } from "@/lib/api";

interface SearchFormProps {
  onSearch: (disease: string) => void;
  onAIInterpret: (text: string) => void;
  isLoading: boolean;
  isAILoading: boolean;
}

export function SearchForm({
  onSearch,
  onAIInterpret,
  isLoading,
  isAILoading,
}: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SymptomSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [mode, setMode] = useState<"search" | "ai">("ai");
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
    if (mode !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions, mode]);

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
    if (query.trim().length < 2) return;
    setShowSuggestions(false);
    if (mode === "ai") {
      onAIInterpret(query.trim());
    } else {
      onSearch(query.trim());
    }
  }

  function handleSuggestionClick(suggestion: SymptomSuggestion) {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name);
  }

  const loading = isLoading || isAILoading;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-center gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
            "cursor-pointer",
            mode === "ai"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="h-4 w-4" />
          AI Interpreter
        </button>
        <button
          type="button"
          onClick={() => setMode("search")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
            "cursor-pointer",
            mode === "search"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Search className="h-4 w-4" />
          Direct Search
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div ref={containerRef} className="relative">
          <div className="relative flex items-center">
            {mode === "ai" ? (
              <Sparkles className="absolute left-4 h-5 w-5 text-primary" />
            ) : (
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (mode === "search" && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={
                mode === "ai"
                  ? "Describe your symptoms in natural language..."
                  : "Search for a disease (e.g., diabetes, hypertension)"
              }
              className={cn(
                "h-14 w-full rounded-xl border bg-card pl-12 pr-24 text-base",
                "text-card-foreground placeholder:text-muted-foreground",
                "outline-none transition-all duration-200",
                "focus:ring-2 focus:ring-primary/30",
                mode === "ai"
                  ? "border-primary/30 focus:border-primary"
                  : "border-border focus:border-primary",
              )}
              aria-label={
                mode === "ai"
                  ? "Describe your symptoms"
                  : "Search for a disease"
              }
              aria-autocomplete={mode === "search" ? "list" : "none"}
              aria-expanded={showSuggestions}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                }}
                className="absolute right-20 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className={cn(
                "absolute right-2 flex h-10 items-center gap-2 rounded-lg px-4",
                "font-medium text-sm cursor-pointer",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                mode === "ai"
                  ? "bg-gradient-to-r from-primary to-secondary text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {mode === "search" && showSuggestions && (
            <ul
              role="listbox"
              className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-card p-2 shadow-xl"
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

      {mode === "ai" && (
        <p className="text-center text-xs text-muted-foreground">
          Powered by AI — describe symptoms in any language and we&apos;ll map
          them to medical terms
        </p>
      )}
    </div>
  );
}
