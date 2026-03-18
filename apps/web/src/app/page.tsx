"use client";

import { useState, useCallback } from "react";
import { Activity, Heart, Shield } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { MedicationCard } from "@/components/medication-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { SourcesSection } from "@/components/sources-section";
import type { MedicationResponse } from "@/lib/api";
import { searchMedications } from "@/lib/api";

export default function HomePage() {
  const [result, setResult] = useState<MedicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (disease: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MedWise</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find the right medication
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Search by disease or symptoms to get medication recommendations
            backed by FDA, NIH, and NLM medical databases.
          </p>
        </section>

        <section className="mx-auto mt-8 max-w-2xl">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        <div className="mx-auto mt-6 max-w-2xl">
          <DisclaimerBanner />
        </div>

        {!result && !isLoading && !error && (
          <section className="mt-16 grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<Activity className="h-6 w-6 text-primary" />}
              title="Symptom-Based Search"
              description="Enter any disease or symptom to find indicated medications from trusted databases."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="FDA-Backed Data"
              description="Drug labels, warnings, and side effects sourced directly from the FDA and NIH."
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6 text-primary" />}
              title="Patient Information"
              description="Clear, patient-friendly descriptions and links to authoritative medical resources."
            />
          </section>
        )}

        {isLoading && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Searching medical databases...
            </p>
          </div>
        )}

        {error && (
          <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && !isLoading && (
          <section className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Medications for{" "}
                <span className="text-primary">{result.disease}</span>
              </h2>
              <span className="text-sm text-muted-foreground">
                {result.medications.length} result
                {result.medications.length !== 1 ? "s" : ""}
              </span>
            </div>

            {result.medications.length === 0 ? (
              <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No medications found for &ldquo;{result.query}&rdquo;. Try a
                  different search term.
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

      <footer className="mt-16 border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground">
          MedWise is for educational purposes only. Always consult a healthcare
          professional.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Data from RxClass (NIH/NLM), OpenFDA, RxNorm, and MedlinePlus.
        </p>
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
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
