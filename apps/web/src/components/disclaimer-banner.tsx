import { ShieldCheck } from "lucide-react";

export function DisclaimerBanner({ text }: { text?: string }) {
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Medical Disclaimer
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {text ??
              "This information is for educational purposes only and is NOT medical advice. Always consult a qualified healthcare professional before taking any medication."}
          </p>
        </div>
      </div>
    </div>
  );
}
