import { useEffect, useRef, useState } from "react";
import { councilRolesFor, roundLabel } from "@/utils/review-round";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ChevronDown, Plus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { FormSheet } from "@/components/shared/FormSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateStatusBadge } from "@/components/shared/CouncilCandidateRow";
import { CouncilCandidatePicker } from "@/components/shared/CouncilCandidatePicker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCreateCouncilPackageMutation, useReviewBoardQuery } from "@/hooks/useReviewBoard";
import { useCouncilCandidatesQuery } from "@/hooks/useCouncilCandidates";
import type { CouncilPackageMember } from "@/types/review-board";

interface CreateCouncilSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  trackId: number;
  roundId: string;
  roundNumber: number;
}

/** "PGS.TS. Lê Quang Minh" → "LM": bỏ học hàm/học vị, lấy chữ đầu của từ đầu và từ cuối. */
const initials = (name: string) => {
  const words = name
    .replace(/^((GS|PGS|TS|ThS|KS|CN)\.?\s*)+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
};

const emptyRow = (): CouncilPackageMember => ({ userId: "", memberRole: "Member", isExternal: false });

/**
 * Tạo hội đồng CHỈ với thành viên (không gán đề tài). Đề tài gán sau qua dropdown ở cột đề tài.
 * BE nhận projectIds rỗng (đã nới rule).
 */
/** Giá trị của lựa chọn "Không sao chép" trong ô hội đồng nguồn. */
const NO_COPY = "__none__";

export function CreateCouncilSheet({
  open,
  onOpenChange,
  cycleId,
  trackId,
  roundId,
  roundNumber,
}: CreateCouncilSheetProps) {
  const { t } = useTranslation();
  const { data: board } = useReviewBoardQuery(cycleId, trackId);
  const { data: candidateData } = useCouncilCandidatesQuery({ trackId }, open);
  const createMutation = useCreateCouncilPackageMutation(cycleId, trackId);

  // Danh sách chọn ủy viên: xếp hạng theo chuyên môn (QĐ543 Điều 8.2, `GET /api/councils/candidates`
  // đã tự lọc vai Giảng viên/Hội đồng), trừ chủ nhiệm những đề tài ĐANG NẰM TRONG VÒNG này — hội
  // đồng lập ra là để chấm đúng nhóm đề tài đó (COI, rule #5). Endpoint không biết trước nhóm đề
  // tài này (chưa có councilId lẫn projectId cụ thể lúc tạo mới), nên COI theo vòng vẫn lọc ở đây.
  const roundPiIds = new Set(
    (board?.rounds ?? [])
      .filter((r) => r.id === roundId)
      .flatMap((r) => r.projects.map((p) => p.piUserId))
      .filter(Boolean)
  );
  const candidates = (candidateData?.candidates ?? []).filter((c) => !roundPiIds.has(c.userId));
  // Chuỗi role KHỚP CHÍNH XÁC với BE ("Chair"/"Secretary"…). Phản biện chỉ có ở phiên nghiệm thu.
  const thisRoundType = (board?.rounds ?? []).find((r) => r.id === roundId)?.roundType;
  const ROLES = councilRolesFor(thisRoundType);
  const trackName = candidateData?.trackName ?? null;

  // Dòng đang mở ô chọn người (null = đóng hết).
  const [pickingRow, setPickingRow] = useState<number | null>(null);
  // Dòng đang mở lời giải thích "Vì sao phải ghi lý do".
  const [whyRow, setWhyRow] = useState<number | null>(null);
  // Mở danh sách ở thẻ gần đáy form thì danh sách bị khuất dưới nút "Tạo hội đồng" — cuộn tới cho
  // thấy trọn (03/10).
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pickingRow == null) return;
    const id = window.setTimeout(() => pickerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    return () => window.clearTimeout(id);
  }, [pickingRow]);
  // Người đã đứng ở dòng KHÁC thì không hiện lại — mỗi người một vị trí (khớp validate BE).
  const pickableFor = (index: number) =>
    candidates.filter((c) => !rows.some((r, i) => i !== index && r.userId === c.userId));

  const isAcceptance = thisRoundType === "ACCEPTANCE";
  // Khung mặc định theo loại phiên (03/10): nghiệm thu 5–7 người và BẮT BUỘC có phản biện (QĐ543
  // Điều 12.2, 12.3.b); xét duyệt 3–5 người (Điều 8.2).
  const defaultRows = (acceptance: boolean): CouncilPackageMember[] =>
    (acceptance ? ["Chair", "Secretary", "Opponent", "Member", "Member"] : ["Chair", "Secretary", "Member"]).map(
      (memberRole) => ({ userId: "", memberRole, isExternal: false })
    );
  const [rows, setRows] = useState<CouncilPackageMember[]>(() => defaultRows(isAcceptance));
  const [decisionNo, setDecisionNo] = useState("");
  // Hội đồng nguồn đang sao chép — có giá trị để chọn lại "Không sao chép" (03/10: trước đây chọn rồi là
  // không bỏ được, phải thoát form vào lại).
  const [copySource, setCopySource] = useState("");
  const [decisionDate, setDecisionDate] = useState("");
  // Mở form lần đầu khi bảng phiên chưa tải xong thì khung mặc định chưa biết là nghiệm thu — sửa
  // lại một lần khi biết, miễn là người dùng chưa chọn ai.
  const [shapedFor, setShapedFor] = useState<string | undefined>(thisRoundType);
  if (thisRoundType !== shapedFor) {
    setShapedFor(thisRoundType);
    if (rows.every((r) => !r.userId)) setRows(defaultRows(isAcceptance));
  }

  // Ngoài lĩnh vực (khác ngành hoặc chưa khai gì) cần Phòng QLKH ghi rõ lý do trước khi bấm tạo —
  // cùng luật với `AddCouncilMemberDialog` (thêm 1 người vào hội đồng có sẵn), chỉ khác đây phải
  // theo dõi lý do cho TỪNG dòng vì tạo cả gói nhiều người một lúc.
  const rowNeedsOverride = (row: CouncilPackageMember) => {
    const selected = candidates.find((c) => c.userId === row.userId);
    return Boolean(selected && !selected.matchesTrack && trackName != null);
  };
  const hasMissingNote = rows.some((r) => rowNeedsOverride(r) && !r.expertiseNote?.trim());

  // Sao chép thành viên: gom mọi hội đồng đã có (kèm thành viên) của lĩnh vực này — ví dụ hội đồng
  // vòng Xét duyệt → clone sang vòng Nghiệm thu khỏi gõ lại (rule #16: 2 hội đồng riêng nhưng đỡ nhập).
  const copySources = (board?.rounds ?? []).flatMap((r) =>
    r.councils
      .filter((c) => c.members.length > 0 && c.id !== roundId)
      .map((c, ci) => ({
        id: c.id,
        label: `${roundLabel(t, r, board?.rounds ?? [])}${r.councils.length > 1 ? ` (HĐ ${ci + 1})` : ""}`,
        members: c.members,
      }))
  );

  const copyFrom = (councilId: string) => {
    if (councilId === NO_COPY) {
      setCopySource("");
      setRows(defaultRows(isAcceptance));
      return;
    }
    const src = copySources.find((s) => s.id === councilId);
    if (!src) return;
    setCopySource(councilId);
    setRows(
      src.members.map((m) => ({
        userId: m.userId,
        memberRole: ROLES.includes(m.memberRole ?? "") ? (m.memberRole ?? "Member") : "Member",
        isExternal: m.isExternal,
      }))
    );
  };

  const updateRow = (index: number, patch: Partial<CouncilPackageMember>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const members = rows.filter((r) => r.userId);
    if (members.length === 0) return toast.error(t("reviewBoard.needMember"));
    const hasChair = members.some((m) => m.memberRole.toLowerCase() === "chair");
    const hasSecretary = members.some((m) => m.memberRole.toLowerCase() === "secretary");
    if (!hasChair || !hasSecretary) return toast.error(t("reviewBoard.needChairSecretary"));
    if (isAcceptance && !members.some((m) => m.memberRole === "Opponent"))
      return toast.error(t("reviewBoard.needOpponent"));
    // 1 người chỉ 1 vị trí (khớp validate BE) — báo sớm thay vì để BE trả 400.
    const ids = members.map((m) => m.userId);
    if (new Set(ids).size !== ids.length) return toast.error(t("reviewBoard.duplicateMember"));
    if (hasMissingNote) return toast.error(t("staff.expertiseNoteRequired"));

    const payloadMembers = members.map((m) => {
      const needsOverride = rowNeedsOverride(m);
      return {
        userId: m.userId,
        memberRole: m.memberRole,
        isExternal: m.isExternal,
        acceptWithoutExpertise: needsOverride,
        expertiseNote: needsOverride ? m.expertiseNote?.trim() : undefined,
      };
    });

    createMutation.mutate(
      {
        roundId,
        payload: {
          projectIds: [],
          members: payloadMembers,
          establishmentDecisionNo: decisionNo.trim() || undefined,
          establishedAt: decisionDate || undefined,
        },
      },
      {
        onSuccess: () => {
          setRows(defaultRows(isAcceptance));
          setCopySource("");
          setDecisionNo("");
          setDecisionDate("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reviewBoard.createCouncilTitle")}
      description={t("reviewBoard.createCouncilDesc", { num: roundNumber })}
      formId="create-council-form"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitLabel={t("reviewBoard.createCouncil")}
      width={640}
    >
      {copySources.length > 0 && (
        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.copyMembers")}</label>
          <Select value={copySource || NO_COPY} onValueChange={copyFrom}>
            <SelectTrigger>
              <SelectValue placeholder={t("reviewBoard.copyMembersPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_COPY}>{t("reviewBoard.copyNone")}</SelectItem>
              {copySources.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label} · {t("reviewBoard.copyMemberCount", { n: s.members.length })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">{t("reviewBoard.copyMembersHint")}</p>
        </div>
      )}

      {/* Số / ngày Quyết định thành lập (Hiệu trưởng ký — QĐ543 Điều 8.1 / 12.1). In vào biên bản
          BM04/BM12; chưa có thì để trống, nhập sau ở chi tiết hội đồng. */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label>
          <span className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.decision.no")}</span>
          <Input
            value={decisionNo}
            onChange={(e) => setDecisionNo(e.target.value)}
            placeholder={t("reviewBoard.decision.noPlaceholder")}
          />
        </label>
        <label className="w-44">
          <span className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.decision.date")}</span>
          <Input type="date" value={decisionDate} onChange={(e) => setDecisionDate(e.target.value)} />
        </label>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">{t("reviewBoard.councilMembers")}</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => {
              setPickingRow(rows.length);
              setRows((prev) => [...prev, emptyRow()]);
            }}
          >
            <Plus className="size-3.5" />
            {t("reviewBoard.addMemberRow")}
          </Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          {isAcceptance ? t("reviewBoard.needOpponentHint") : t("reviewBoard.needChairSecretaryHint")}
        </p>

        <div className="space-y-2">
          {rows.map((row, index) => {
            const selected = candidates.find((c) => c.userId === row.userId);
            const needsOverride = rowNeedsOverride(row);
            const picking = pickingRow === index;

            return (
              <div
                key={index}
                className={cn(
                  "rounded-xl border bg-card/60 transition-colors",
                  picking ? "border-primary/50 shadow-soft-xs" : "border-border"
                )}
              >
                {/* 03/10 (lần 2): dropdown/ô nổi cũ dài, và ô nổi nằm NGOÀI khung form nên con lăn
                    chuột không cuộn được. Nay mỗi thành viên là một thẻ; bấm chọn người thì danh sách
                    mở NGAY dưới thẻ, trong form, cao cố định và tự cuộn — nhiều người mấy cũng không
                    đổ dài. */}
                <div className="flex items-center gap-2 p-2">
                  <Select value={row.memberRole} onValueChange={(v) => updateRow(index, { memberRole: v })}>
                    <SelectTrigger className="h-9 w-30 shrink-0 border-transparent bg-muted/60 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {t(`reviewBoard.role.${r}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    type="button"
                    onClick={() => setPickingRow(picking ? null : index)}
                    aria-expanded={picking}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    {selected ? (
                      <>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(selected.fullName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">{selected.fullName}</span>
                            <CandidateStatusBadge candidate={selected} showTrack={trackName != null} />
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {[
                              selected.unitName,
                              selected.tracks.length > 0
                                ? t("staff.trackLine", { tracks: selected.tracks.join(", ") })
                                : t("staff.noTracksDeclared"),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-medium text-primary">
                          {t("reviewBoard.changePerson")}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground">
                          <UserPlus className="size-4" />
                        </span>
                        <span className="flex-1 text-sm text-muted-foreground">
                          {t("reviewBoard.pickPersonFor", { role: t(`reviewBoard.role.${row.memberRole}`) })}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            picking && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("common.remove")}
                    onClick={() => {
                      setRows((prev) => prev.filter((_, i) => i !== index));
                      setPickingRow(null);
                    }}
                  >
                    <X />
                  </Button>
                </div>

                {/* Ngoài lĩnh vực: một dòng gọn + ô lý do (vẫn BẮT BUỘC — QĐ543 Điều 8.2). Lời giải
                    thích dài chỉ mở khi bấm "Vì sao?" (03/10: khối cảnh báo cũ chiếm nửa form). */}
                {needsOverride && selected && !picking && (
                  <div className="space-y-1.5 border-t border-dashed border-warning/40 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-3.5 shrink-0 text-warning" />
                      <Input
                        value={row.expertiseNote ?? ""}
                        onChange={(e) => updateRow(index, { expertiseNote: e.target.value })}
                        placeholder={t("reviewBoard.expertiseReasonShort")}
                        aria-invalid={!row.expertiseNote?.trim()}
                        className="h-8 flex-1 text-xs"
                      />
                      <button
                        type="button"
                        className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:underline"
                        onClick={() => setWhyRow(whyRow === index ? null : index)}
                      >
                        {t("reviewBoard.why")}
                      </button>
                    </div>
                    {whyRow === index && (
                      <p className="pl-5.5 text-xs text-muted-foreground">
                        {selected.expertiseUnknown
                          ? t("staff.expertiseUnknownWarn", { name: selected.fullName })
                          : t("staff.expertiseMismatchWarn", { name: selected.fullName, track: trackName ?? "" })}{" "}
                        {t("staff.expertiseHint")}
                      </p>
                    )}
                  </div>
                )}

                {picking && (
                  <div ref={pickerRef} className="scroll-mb-4 border-t border-border p-2.5">
                    {candidates.length === 0 ? (
                      <p className="px-1 py-3 text-xs text-muted-foreground">{t("reviewBoard.noEligibleReviewer")}</p>
                    ) : (
                      <CouncilCandidatePicker
                        compact
                        autoFocus
                        candidates={pickableFor(index)}
                        value={row.userId || undefined}
                        showTrack={trackName != null}
                        onChange={(id) => {
                          updateRow(index, { userId: id, expertiseNote: "" });
                          setPickingRow(null);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FormSheet>
  );
}
