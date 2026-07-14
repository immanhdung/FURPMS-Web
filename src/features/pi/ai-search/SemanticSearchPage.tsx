import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, Lightbulb, Loader2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSemanticSearchMutation } from "@/hooks/useProposalAi";

const SUGGESTIONS = ["plagiarism detection", "IoT smart campus", "student retention prediction", "alumni engagement"];

function relevanceColor(score: number) {
  if (score >= 85) return "bg-success";
  if (score >= 65) return "bg-warning";
  return "bg-muted-foreground";
}

export function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const searchMutation = useSemanticSearchMutation();

  const runSearch = (value: string) => {
    if (!value.trim()) return;
    setQuery(value);
    searchMutation.mutate(value);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">AI Semantic Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search across proposals and imported research topics by meaning, not just keywords.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're looking for..."
            className="h-11 pl-9"
          />
        </div>
        <Button type="submit" size="lg" disabled={!query.trim() || searchMutation.isPending}>
          {searchMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Search
        </Button>
      </form>

      {!searchMutation.data && !searchMutation.isPending && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => runSearch(suggestion)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {searchMutation.isPending && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {searchMutation.data && !searchMutation.isPending && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {searchMutation.data.length === 0 ? (
              <EmptyState icon={Search} title="No matches found" description="Try a different search query." />
            ) : (
              searchMutation.data.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {result.type === "topic" ? <Lightbulb className="size-4" /> : <FileText className="size-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{result.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{result.snippet}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 capitalize">
                          {result.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pl-10.5">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className={`h-full rounded-full ${relevanceColor(result.relevance)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.relevance}%` }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{result.relevance}% match</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
