import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap gap-1.5">
            {cycleName && <Badge variant="secondary">{cycleName}</Badge>}
            {trackName && <Badge variant="secondary">{trackName}</Badge>}
            {researchTypeName && <Badge variant="secondary">{researchTypeName}</Badge>}
            {data.durationMonths ? <Badge variant="outline">{data.durationMonths} months</Badge> : null}
          </div>

          <div>
            <p className="text-lg font-semibold text-foreground">{data.titleEN || "Untitled proposal"}</p>
            {data.titleVI && <p className="mt-0.5 text-sm text-muted-foreground">{data.titleVI}</p>}
          </div>

          {data.abstractEN && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground">Abstract</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-foreground">{data.abstractEN}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Research Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Objectives" value={data.objectives} />
          <Field label="Methodology" value={data.methodology} />
          <Field label="Expected Output" value={data.expectedOutput} />
          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <Field label="Urgency" value={data.urgency} />
            <Field label="Novelty" value={data.novelty} />
            <Field label="Application Potential" value={data.applicationPotential} />
            <Field label="Transfer Potential" value={data.transferPotential} />
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <Field label="Facilities & Resources" value={data.facilities} />
            <Field label="Funding Method" value={data.fundingMethod} />
          </div>
        </CardContent>
      </Card>

      {data.members && data.members.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm">Team Members</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.members.map((member, index) => (
                <li key={index}>
                  {index > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {member.fullName?.trim()?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.fullName}
                        {member.isSecretary && (
                          <Badge variant="secondary" className="ml-1.5">
                            Secretary
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                        {member.role && ` · ${member.role}`}
                        {member.department && ` · ${member.department}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
