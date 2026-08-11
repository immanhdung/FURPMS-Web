import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProposalMember } from "@/types/proposal-member";

interface ProposalSummaryData {
  titleEN?: string | null;
  titleVI?: string | null;
  abstractEN?: string | null;
  objectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  urgency?: string | null;
  novelty?: string | null;
  applicationPotential?: string | null;
  transferPotential?: string | null;
  facilities?: string | null;
  fundingMethod?: string | null;
  durationMonths?: number | null;
  totalBudget?: number | null;
  members?: ProposalMember[] | null;
}

interface ProposalSummaryViewProps {
  data: ProposalSummaryData;
  cycleName?: string;
  trackName?: string;
  researchTypeName?: string;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{value}</p>
    </div>
  );
}

export function ProposalSummaryView({ data, cycleName, trackName, researchTypeName }: ProposalSummaryViewProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-1.5">
            {cycleName && <Badge variant="secondary">{cycleName}</Badge>}
            {trackName && <Badge variant="secondary">{trackName}</Badge>}
            {researchTypeName && <Badge variant="secondary">{researchTypeName}</Badge>}
            {data.durationMonths ? (
              <Badge variant="outline">{t("common.monthsCount", { n: data.durationMonths })}</Badge>
            ) : null}
            {/* Kinh phí là con số hội đồng soi đầu tiên — trước đây bản xem lại không hề hiện. */}
            {data.totalBudget ? (
              <Badge variant="outline">
                {t("common.budgetTotal", { amount: formatCurrency(data.totalBudget) })}
              </Badge>
            ) : null}
          </div>

          {/* Ghi rõ nhãn Tên tiếng Việt / tiếng Anh (như các mục Mục tiêu, Tóm tắt) để khỏi nhầm. */}
          <div className="space-y-2">
            {data.titleVI && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("wizard.step3.titleVI")}</p>
                <p className="mt-0.5 text-base font-semibold text-foreground">{data.titleVI}</p>
              </div>
            )}
            {data.titleEN && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("wizard.step3.titleEN")}</p>
                <p className="mt-0.5 text-sm text-foreground">{data.titleEN}</p>
              </div>
            )}
            {!data.titleVI && !data.titleEN && (
              <p className="text-lg font-semibold text-foreground">{t("proposal.untitled")}</p>
            )}
          </div>

          {data.abstractEN && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("wizard.step3.abstract")}</p>
              <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{data.abstractEN}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <Field label={t("wizard.step3.objectives")} value={data.objectives} />
          <Field label={t("wizard.step3.methodology")} value={data.methodology} />
          <Field label={t("wizard.step3.expectedOutput")} value={data.expectedOutput} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t("wizard.step3.urgency")} value={data.urgency} />
            <Field label={t("wizard.step3.novelty")} value={data.novelty} />
            <Field label={t("wizard.step3.applicationPotential")} value={data.applicationPotential} />
            <Field label={t("wizard.step3.transferPotential")} value={data.transferPotential} />
          </div>
          <Field label={t("wizard.step3.facilities")} value={data.facilities} />
          <Field label={t("proposal.fundingMethod")} value={data.fundingMethod} />
        </CardContent>
      </Card>

      {data.members && data.members.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("wizard.step4.title")}</p>
            <ul className="space-y-2">
              {data.members.map((member, index) => (
                <li key={index}>
                  {index > 0 && <Separator className="mb-2" />}
                  <p className="text-sm font-medium text-foreground">
                    {member.fullName}
                    {member.isSecretary && (
                      <Badge variant="secondary" className="ml-1.5">
                        {t("wizard.step4.secretary")}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                    {member.role && ` · ${member.role}`}
                    {member.department && ` · ${member.department}`}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
