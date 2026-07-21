import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useFeedbackListQuery, useSubmitFeedbackMutation } from "@/hooks/useFeedback";
import type { FeedbackPayload } from "@/types/feedback";

const SCORE_FIELDS: { key: keyof FeedbackPayload; label: string }[] = [
  { key: "urgencyScore", label: "review.urgency" },
  { key: "scientificContributionScore", label: "review.scientific" },
  { key: "practicalSignificanceScore", label: "review.practical" },
  { key: "actualVsExpectedScore", label: "review.actualVsExpected" },
];

export function FeedbackForm({ councilId }: { councilId: string }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data: feedbackList, isLoading } = useFeedbackListQuery(councilId);
  const submitMutation = useSubmitFeedbackMutation(councilId);

  const myFeedback = feedbackList?.find((f) => f.reviewerId === user?.id);

  const [form, setForm] = useState<FeedbackPayload>({});
  const [seededFor, setSeededFor] = useState<string | null>(null);

  if (myFeedback && myFeedback.id !== seededFor) {
    setSeededFor(myFeedback.id);
    setForm({
      urgencyScore: myFeedback.urgencyScore,
      scientificContributionScore: myFeedback.scientificContributionScore,
      practicalSignificanceScore: myFeedback.practicalSignificanceScore,
      actualVsExpectedScore: myFeedback.actualVsExpectedScore,
      otherComments: myFeedback.otherComments ?? "",
      overallAssessment: myFeedback.overallAssessment ?? "",
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SCORE_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t(label)}</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={(form[key] as number | undefined) ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("review.overallAssessment")}</label>
        <Textarea
          rows={3}
          value={form.overallAssessment ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, overallAssessment: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("review.otherComments")}</label>
        <Textarea
          rows={3}
          value={form.otherComments ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, otherComments: e.target.value }))}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => submitMutation.mutate(form)} disabled={submitMutation.isPending}>
          {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {myFeedback ? "Update feedback" : "Submit feedback"}
        </Button>
      </div>
    </div>
  );
}
