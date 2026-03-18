import { ExternalLink, Database } from "lucide-react";

interface Source {
  name: string;
  url: string;
  description: string;
}

export function SourcesSection({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Database className="h-4 w-4 text-primary" />
        Data Sources
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {sources.map((source) => (
          <a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium text-card-foreground group-hover:text-primary">
                {source.name}
              </span>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {source.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
