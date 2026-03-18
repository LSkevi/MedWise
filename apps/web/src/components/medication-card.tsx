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

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-6 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold capitalize text-card-foreground">
              {drug.name.toLowerCase()}
            </h3>
            {drug.drug_class && (
              <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {drug.drug_class}
              </span>
            )}
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          RxCUI: {drug.rxcui}
        </span>
      </div>

      {label?.indications && (
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <Info className="h-4 w-4 text-primary" />
            Indications
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {truncate(label.indications, 300)}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5",
          "rounded-lg py-2 text-sm font-medium text-primary",
          "transition-colors duration-150 hover:bg-primary/5",
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

      {expanded && (
        <div className="mt-3 space-y-4 border-t border-border pt-4">
          {label?.adverse_reactions && (
            <DetailSection
              icon={<AlertCircle className="h-4 w-4 text-accent" />}
              title="Side Effects"
              content={label.adverse_reactions}
            />
          )}

          {label?.contraindications && (
            <DetailSection
              icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
              title="Contraindications"
              content={label.contraindications}
              variant="danger"
            />
          )}

          {label?.warnings && (
            <DetailSection
              icon={<AlertCircle className="h-4 w-4 text-destructive" />}
              title="Warnings"
              content={label.warnings}
              variant="danger"
            />
          )}

          {label?.dosage_administration && (
            <DetailSection
              icon={<Info className="h-4 w-4 text-secondary" />}
              title="Dosage & Administration"
              content={label.dosage_administration}
            />
          )}

          {patient_info?.url && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-medium text-card-foreground">
                Learn more
              </p>
              {patient_info.snippet && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {truncate(patient_info.snippet, 200)}
                </p>
              )}
              <a
                href={patient_info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {patient_info.title ?? "MedlinePlus"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DetailSection({
  icon,
  title,
  content,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  variant?: "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-3",
        variant === "danger" ? "bg-destructive/5" : "bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {truncate(content, 500)}
      </p>
    </div>
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}
