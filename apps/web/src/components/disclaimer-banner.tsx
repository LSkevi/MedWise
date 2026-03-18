import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ text }: { text?: string }) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {text ??
            "This information is for educational purposes only and is NOT medical advice. Always consult a qualified healthcare professional before taking any medication."}
        </p>
      </div>
    </div>
  );
}
