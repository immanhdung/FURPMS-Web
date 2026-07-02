import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateFeedbackMutation } from "@/hooks/useProposalAi";

export function AiFeedbackCard({ proposalId }: { proposalId: string }) {
  const feedbackMutation = useGenerateFeedbackMutation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="text-sm">AI Feedback</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => feedbackMutation.mutate(proposalId)}
            disabled={feedbackMutation.isPending}
          >
            {feedbackMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {feedbackMutation.data ? "Regenerate" : "Get feedback"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!feedbackMutation.data && !feedbackMutation.isPending && (
          <p className="text-xs text-muted-foreground">Get AI suggestions to strengthen this proposal before submitting.</p>
        )}
        {feedbackMutation.isPending && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}
        {feedbackMutation.data && (
          <ul className="space-y-2.5">
            {feedbackMutation.data.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.05 }}
                className="rounded-lg bg-primary/[0.04] p-2.5"
              >
                <Badge variant="secondary" className="mb-1">
                  {item.category}
                </Badge>
                <p className="text-xs text-foreground">{item.suggestion}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
