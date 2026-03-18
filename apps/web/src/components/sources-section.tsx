import { ExternalLink, Database } from "lucide-react";

interface Source {
  name: string;
  url: string;
  description: string;
}

export function SourcesSection({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Database className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Data Sources
          </h3>
          <p className="text-xs text-muted-foreground">
            All data comes from U.S. government medical databases
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sources.map((source) => (
          <a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            <div>
              <span className="text-sm font-medium text-card-foreground transition-colors group-hover:text-primary">
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
