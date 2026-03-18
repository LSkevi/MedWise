"use client";

import { Sparkles, ArrowRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIInterpretation } from "@/lib/api";

interface AIResultsProps {
  interpretation: AIInterpretation;
  onSelectDisease: (disease: string) => void;
  isLoading: boolean;
}

export function AIResults({
  interpretation,
  onSelectDisease,
  isLoading,
}: AIResultsProps) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Brain className="h-4 w-4" />
        AI Symptom Analysis
      </div>

      <p className="mt-3 text-sm leading-relaxed text-card-foreground">
        {interpretation.summary}
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Possible conditions — click to find medications
        </p>
        {interpretation.diseases.map((disease, i) => (
          <button
            key={disease.name}
            type="button"
            onClick={() => onSelectDisease(disease.name)}
            disabled={isLoading}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border bg-card p-4",
              "cursor-pointer transition-all duration-200",
              "hover:border-primary/40 hover:shadow-md",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "group",
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                  disease.confidence >= 0.7
                    ? "bg-primary/10 text-primary"
                    : disease.confidence >= 0.4
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-card-foreground">
                  {disease.name}
                </span>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        disease.confidence >= 0.7
                          ? "bg-primary"
                          : disease.confidence >= 0.4
                            ? "bg-accent"
                            : "bg-muted-foreground",
                      )}
                      style={{ width: `${disease.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(disease.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          AI analysis is approximate and for educational purposes only. Always
          consult a healthcare professional for diagnosis.
        </p>
      </div>
    </div>
  );
}
