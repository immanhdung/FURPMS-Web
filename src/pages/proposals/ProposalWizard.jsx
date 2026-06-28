/**
 * Proposal Wizard — Placeholder
 * Route: /proposals/new, /proposals/:id/edit
 * 5-step wizard: Basic Info → Team → Budget → Documents → Review & Submit
 * Will be implemented in Sprint 2
 */
export default function ProposalWizard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tạo đề xuất nghiên cứu</h1>
        <p className="text-muted-foreground mt-1">Biểu mẫu 01 — Đề cương nghiên cứu khoa học.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">🚧 Wizard đang được phát triển (Sprint 2)...</p>
      </div>
    </div>
  );
}
