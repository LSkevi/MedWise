"use client";

import { useState, useCallback } from "react";
import {
  Activity,
  Heart,
  Shield,
  Sparkles,
  Pill,
  Search,
  Loader2,
} from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { MedicationCard } from "@/components/medication-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { SourcesSection } from "@/components/sources-section";
import { AIResults } from "@/components/ai-results";
import type { MedicationResponse, AIInterpretation } from "@/lib/api";
import { searchMedications, interpretSymptoms } from "@/lib/api";

export default function HomePage() {
  const [result, setResult] = useState<MedicationResponse | null>(null);
  const [aiInterpretation, setAiInterpretation] =
    useState<AIInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  const handleSearch = useCallback(async (disease: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedDisease(disease);
    try {
      const data = await searchMedications(disease, 8);
      setResult(data);
    } catch {
      setError(
        "Failed to fetch medication recommendations. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAIInterpret = useCallback(async (text: string) => {
    setIsAILoading(true);
    setError(null);
    setAiInterpretation(null);
    setResult(null);
    setSelectedDisease(null);
    try {
      const data = await interpretSymptoms(text);
      setAiInterpretation(data);
    } catch {
      setError(
        "AI interpretation is not available. Please use Direct Search instead.",
      );
    } finally {
      setIsAILoading(false);
    }
  }, []);

  const handleSelectDisease = useCallback(
    (disease: string) => {
      setAiInterpretation(null);
      handleSearch(disease);
    },
    [handleSearch],
  );

  const showHero = !result && !isLoading && !error && !aiInterpretation && !isAILoading;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">MedWise</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              BETA
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find the right
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {" "}
              medication
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Describe your symptoms in natural language or search by disease name.
            Powered by AI and backed by FDA, NIH, and NLM databases.
          </p>
        </section>

        {/* Search */}
        <section className="mx-auto mt-8 max-w-2xl">
          <SearchForm
            onSearch={handleSearch}
            onAIInterpret={handleAIInterpret}
            isLoading={isLoading}
            isAILoading={isAILoading}
          />
        </section>

        {/* Disclaimer */}
        <div className="mx-auto mt-6 max-w-2xl">
          <DisclaimerBanner />
        </div>

        {/* Feature cards (hero state) */}
        {showHero && (
          <section className="mt-16 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              title="AI-Powered"
              description="Describe symptoms in your own words — our AI maps them to medical terms automatically."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5 text-primary" />}
              title="FDA-Backed Data"
              description="Drug labels, warnings, and side effects sourced directly from the FDA and NIH."
            />
            <FeatureCard
              icon={<Heart className="h-5 w-5 text-primary" />}
              title="Patient Resources"
              description="Clear descriptions and links to authoritative medical resources for every medication."
            />
          </section>
        )}

        {/* AI Loading */}
        {isAILoading && (
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-8">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Analyzing your symptoms...
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our AI is mapping your description to medical conditions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Interpretation Results */}
        {aiInterpretation && !isAILoading && (
          <div className="mx-auto mt-8 max-w-2xl">
            <AIResults
              interpretation={aiInterpretation}
              onSelectDisease={handleSelectDisease}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Medication Loading */}
        {isLoading && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Searching medical databases...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Querying RxClass, OpenFDA, RxNorm, and MedlinePlus
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto mt-12 max-w-2xl animate-fade-in-up rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Try using Direct Search mode or a different query.
            </p>
          </div>
        )}

        {/* Medication Results */}
        {result && !isLoading && (
          <section className="mt-10 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Results for
                  </span>
                </div>
                <h2 className="mt-1 text-2xl font-bold text-foreground">
                  {result.disease}
                </h2>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {result.medications.length} medication
                {result.medications.length !== 1 ? "s" : ""}
              </div>
            </div>

            {result.medications.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
                <Pill className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No medications found for &ldquo;{result.query}&rdquo;.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search term or use the AI interpreter.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {result.medications.map((med, i) => (
                  <MedicationCard
                    key={med.drug.rxcui}
                    medication={med}
                    index={i}
                  />
                ))}
              </div>
            )}

            <SourcesSection sources={result.sources} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border bg-muted/30 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                MedWise
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
              For educational purposes only. Always consult a healthcare
              professional before taking any medication. Data sourced from
              RxClass (NIH/NLM), OpenFDA, RxNorm, and MedlinePlus.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-card-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
