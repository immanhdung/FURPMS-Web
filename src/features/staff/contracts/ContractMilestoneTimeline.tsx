import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, ExternalLink, FileBarChart, FileSignature, Flag, Milestone } from "lucide-react";
import { useDisbursementsQuery } from "@/hooks/useDisbursements";
import { useProgressReportsQuery } from "@/hooks/useProgressReports";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Contract } from "@/types/contract";

/**
 * Trực quan hóa vòng đời hợp đồng theo MỐC (thầy Đức tuần 10): ngày ký HĐ → từng đợt giải ngân
 * (điều kiện + ngày) → kết thúc. Bấm mốc có minh chứng (file HĐ/chứng từ) để mở ngay.
 * KHÔNG nhấn số tiền — chỉ mốc/tiến độ/minh chứng (rule tuần 10: hệ thống không quản tiền).
 */
export function ContractMilestoneTimeline({ contract }: { contract: Contract }) {
  const { t } = useTranslation();
  const { data: disbursements } = useDisbursementsQuery(contract.id);
  const { data: reports } = useProgressReportsQuery(contract.id);

  interface Node {
    key: string;
    icon: typeof Milestone;
    title: string;
    date?: string | null;
    stage?: string; // dòng phụ (đủ điều kiện / đã chi / đã nộp)
    badge?: string | null;
    href?: string | null;
    done: boolean;
  }

  // Các mốc GIỮA (giải ngân + báo cáo tiến độ) trộn lại, sắp theo THỜI GIAN để đọc đúng dòng chảy;
  // mốc chưa có ngày (đang chờ) đẩy về cuối nhóm giữa. Ký HĐ luôn đầu, Kết thúc luôn cuối.
  const ts = (d?: string | null) => (d ? new Date(d).getTime() : Number.POSITIVE_INFINITY);

  const disbNodes: Node[] = [...(disbursements ?? [])].map((d) => ({
    key: `d${d.id}`,
    icon: Milestone,
    title: `${t("contract.timelineDisb", { n: d.roundNumber })}${d.conditionDescription ? ` — ${d.conditionDescription}` : ""}`,
    date: d.disbursedAt ?? d.conditionMetAt,
    stage: d.disbursedAt ? t("contract.mDisbursed") : d.conditionMetAt ? t("contract.mReady") : t("contract.mWaiting"),
    badge: d.status,
    done: Boolean(d.disbursedAt),
  }));

  const reportNodes: Node[] = [...(reports ?? [])].map((r) => ({
    key: `p${r.id}`,
    icon: FileBarChart,
    title: t("contract.timelineReport", { n: r.reportRound ?? "" }),
    date: r.submittedAt ?? r.dueDate,
    stage: r.submittedAt ? t("contract.mReportSubmitted") : t("contract.mReportPending"),
    badge: r.evaluationResult ?? r.status,
    done: Boolean(r.submittedAt),
  }));

  const middle = [...disbNodes, ...reportNodes].sort((a, b) => ts(a.date) - ts(b.date));

  const nodes: Node[] = [
    {
      key: "sign",
      icon: FileSignature,
      title: t("contract.timelineSign"),
      date: contract.startDate,
      // Chỉ linkify khi là URL thật — tránh mốc bấm được nhưng nhảy tới giá trị rác (vd id "12") → không ra gì.
      href: /^https?:\/\//i.test(contract.econtractUrl ?? "") ? contract.econtractUrl : null,
      badge: contract.status,
      done: Boolean(contract.startDate),
    },
    ...middle,
    {
      key: "end",
      icon: Flag,
      title: t("contract.timelineEnd"),
      date: contract.endDate,
      done: false,
    },
  ];

  return (
    <ul className="space-y-0 py-2">
      {nodes.map((n, i) => {
        const RowTag = n.href ? "a" : "div";
        return (
          <li key={n.key} className="flex gap-3">
            {/* Cột trục: chấm + đường nối */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  n.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {n.done ? <CheckCircle2 className="size-4" /> : <n.icon className="size-4" />}
              </span>
              {i < nodes.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
            </div>

            {/* Nội dung mốc */}
            <RowTag
              {...(n.href ? { href: n.href, target: "_blank", rel: "noreferrer" } : {})}
              className={cn(
                "mb-3 flex-1 rounded-lg border border-border p-3",
                n.href && "transition-colors hover:border-primary hover:bg-muted/40"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {n.href && <ExternalLink className="size-3.5 text-primary" />}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {n.date ? formatDate(n.date) : t("contract.mNoDate")}
                </span>
                {n.stage && <span>{n.stage}</span>}
                {n.badge && <span className="font-medium text-foreground">{n.badge}</span>}
              </div>
            </RowTag>
          </li>
        );
      })}
    </ul>
  );
}
