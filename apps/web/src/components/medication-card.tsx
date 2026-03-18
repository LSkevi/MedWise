"use client";

import { useState } from "react";
import {
  Pill,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Info,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MedicationRecommendation } from "@/lib/api";

interface MedicationCardProps {
  medication: MedicationRecommendation;
  index: number;
}

export function MedicationCard({ medication, index }: MedicationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { drug, label, patient_info } = medication;

  const hasDetails =
    label?.adverse_reactions ||
    label?.contraindications ||
    label?.warnings ||
    label?.dosage_administration ||
    patient_info?.url;

  return (
    <article
      className="animate-fade-in-up rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-lg"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold capitalize text-card-foreground">
                {drug.name.toLowerCase()}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {drug.drug_class && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {drug.drug_class}
                  </span>
                )}
                <span className="font-mono text-[10px] text-muted-foreground">
                  RxCUI {drug.rxcui}
                </span>
              </div>
            </div>
          </div>
        </div>

        {label?.indications && (
          <div className="mt-4 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Info className="h-3.5 w-3.5" />
              Indications
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {truncate(label.indications, 350)}
            </p>
          </div>
        )}

        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "mt-4 flex w-full cursor-pointer items-center justify-center gap-2",
              "rounded-xl border border-border py-2.5 text-sm font-medium",
              "text-muted-foreground transition-all duration-200",
              "hover:border-primary/30 hover:bg-muted/50 hover:text-primary",
            )}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border px-6 pb-6 pt-4">
          <div className="space-y-3">
            {label?.adverse_reactions && (
              <DetailSection
                icon={<AlertCircle className="h-4 w-4 text-accent" />}
                title="Side Effects"
                content={label.adverse_reactions}
                bg="bg-accent/5"
              />
            )}

            {label?.contraindications && (
              <DetailSection
                icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
                title="Contraindications"
                content={label.contraindications}
                bg="bg-destructive/5"
              />
            )}

            {label?.warnings && (
              <DetailSection
                icon={<AlertCircle className="h-4 w-4 text-destructive" />}
                title="Warnings"
                content={label.warnings}
                bg="bg-destructive/5"
              />
            )}

            {label?.dosage_administration && (
              <DetailSection
                icon={<BookOpen className="h-4 w-4 text-secondary" />}
                title="Dosage & Administration"
                content={label.dosage_administration}
                bg="bg-secondary/5"
              />
            )}

            {patient_info?.url && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Learn more
                </p>
                {patient_info.snippet && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {truncate(patient_info.snippet, 200)}
                  </p>
                )}
                <a
                  href={patient_info.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-secondary"
                >
                  {patient_info.title ?? "MedlinePlus"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function DetailSection({
  icon,
  title,
  content,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-xl p-4", bg)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-card-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {truncate(content, 500)}
      </p>
    </div>
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}
