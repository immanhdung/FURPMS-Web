import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProposalsTable } from "@/features/staff/proposal-reviews/ProposalsTable";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksByCycleQuery } from "@/hooks/useTracks";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import type { ProposalListParams, ProposalSummary } from "@/types/proposal-summary";

const ALL_VALUE = "all";

/**
 * Danh sách ĐỀ CƯƠNG toàn hệ thống — chỗ Phòng QLKH mở ra xem đã có những đề cương nào và trong
 * mỗi bản ghi những gì.
 *
 * <p>Bộ lọc giữ trên URL (`?cycle=&track=&status=`) như màn Hội đồng & Chấm: tải lại trang hay bấm
 * back không mất lựa chọn, và gửi link cho đồng nghiệp thì người kia mở ra thấy đúng cái đang xem.</p>
 */
export function ProposalReviewsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const cycle = searchParams.get("cycle") ?? ALL_VALUE;
  const track = searchParams.get("track") ?? ALL_VALUE;
  const status = searchParams.get("status") ?? ALL_VALUE;

  const { data: cycles } = useCyclesQuery();
  // Lĩnh vực phụ thuộc đợt: mỗi đợt mở một bộ lĩnh vực riêng. Chưa chọn đợt thì chưa lọc được
  // lĩnh vực — bày hết mọi lĩnh vực của mọi đợt ra chỉ khiến chọn nhầm.
  const cycleId = cycle === ALL_VALUE ? undefined : Number(cycle);
  const { data: tracks } = useTracksByCycleQuery(cycleId);

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === ALL_VALUE) next.delete(key);
      else next.set(key, value);
      // Đổi đợt thì lĩnh vực cũ gần như chắc chắn không thuộc đợt mới ⇒ bỏ, tránh ra bảng rỗng
      // mà không hiểu vì sao.
      if (key === "cycle") next.delete("track");
      return next;
    });
  };

  const params: ProposalListParams | undefined =
    cycle === ALL_VALUE && track === ALL_VALUE && status === ALL_VALUE
      ? undefined
      : {
          ...(cycleId !== undefined && { cycleId }),
          ...(track !== ALL_VALUE && { trackId: track }),
          ...(status !== ALL_VALUE && { status }),
        };

  const handleOpen = (proposal: ProposalSummary) => {
    navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposal.id}`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.reviewsTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("staff.reviewsSubtitle")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={cycle} onValueChange={(v) => setFilter("cycle", v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("staff.allCycles")}</SelectItem>
              {(cycles ?? []).map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={track}
            onValueChange={(v) => setFilter("track", v)}
            disabled={cycle === ALL_VALUE || (tracks ?? []).length === 0}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("staff.allTracks")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("staff.allTracks")}</SelectItem>
              {(tracks ?? []).map((tr) => (
                <SelectItem key={tr.id} value={String(tr.id)}>
                  {tr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setFilter("status", v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("staff.allStatuses")}</SelectItem>
              {/* Trước đây in `value.replace("_", " ")` ⇒ menu hiện "UNDER REVIEW", "REVISION REQUIRED"…
                  giữa giao diện tiếng Việt. Bảng `status.*` đã có sẵn nhãn cho từng mã. */}
              {Object.values(PROPOSAL_STATUS).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`status.${value}`, { defaultValue: value })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <ProposalsTable params={params} onOpen={handleOpen} />
    </div>
  );
}
