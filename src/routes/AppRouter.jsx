import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../components/layout/AppLayout";

// ─── Eager-loaded pages (always needed) ─────────────────────────────
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/Dashboard";

// ─── Lazy-loaded pages (code-split per vercel-react-best-practices) ─
// Existing pages
const ProposalsPage = lazy(() => import("../pages/Proposals"));
const CouncilsPage = lazy(() => import("../pages/Councils"));
const ContractsPage = lazy(() => import("../pages/Contracts"));

// Auth flow pages
const SSOCallbackPage = lazy(() => import("../pages/auth/SSOCallback"));
const ProfileSettingsPage = lazy(() => import("../pages/auth/ProfileSettings"));
const ExpertAuthPage = lazy(() => import("../pages/auth/ExpertAuth"));

// Proposal sub-pages
const ProposalWizardPage = lazy(() => import("../pages/proposals/ProposalWizard"));
const ProposalDetailPage = lazy(() => import("../pages/proposals/ProposalDetail"));

// User management pages (Admin)
const UserManagementPage = lazy(() => import("../pages/users/UserManagement"));
const UserFormPage = lazy(() => import("../pages/users/UserForm"));
const ScientificProfilePage = lazy(() => import("../pages/users/ScientificProfile"));

// Settings pages (Admin/Staff)
const CycleManagementPage = lazy(() => import("../pages/settings/CycleManagement"));
const CycleFormPage = lazy(() => import("../pages/settings/CycleForm"));
const LookupSettingsPage = lazy(() => import("../pages/settings/LookupSettings"));

// Council sub-pages
const CouncilSetupPage = lazy(() => import("../pages/councils/CouncilSetup"));
const InvitationDetailPage = lazy(() => import("../pages/councils/InvitationDetail"));
const ScoringWorkspacePage = lazy(() => import("../pages/councils/ScoringWorkspace"));
const MeetingSchedulerPage = lazy(() => import("../pages/councils/MeetingScheduler"));

// Contract sub-pages
const ContractFormPage = lazy(() => import("../pages/contracts/ContractForm"));
const DisbursementManagerPage = lazy(() => import("../pages/contracts/DisbursementManager"));
const AmendmentFormPage = lazy(() => import("../pages/contracts/AmendmentForm"));
const ProgressReportFormPage = lazy(() => import("../pages/contracts/ProgressReportForm"));
const SeminarRegistrationPage = lazy(() => import("../pages/contracts/SeminarRegistration"));
const FinalReportPage = lazy(() => import("../pages/contracts/FinalReportPage"));

// AI & Analytics
const SemanticSearchPage = lazy(() => import("../pages/ai/SemanticSearch"));
const AnalyticsDashboardPage = lazy(() => import("../pages/analytics/AnalyticsDashboard"));

// Notifications
const NotificationCenterPage = lazy(() => import("../pages/notifications/NotificationCenter"));

// ─── Suspense fallback ──────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label="Đang tải trang">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Đang tải...</span>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ─── Public Routes ──────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<SSOCallbackPage />} />
          <Route path="/expert-login" element={<ExpertAuthPage />} />

          {/* ─── Protected Routes (wrapped by AppLayout with auth guard) ── */}
          <Route element={<AppLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* ── Proposals ─────────────────────────────────── */}
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/proposals/new" element={<ProposalWizardPage />} />
            <Route path="/proposals/:id" element={<ProposalDetailPage />} />
            <Route path="/proposals/:id/edit" element={<ProposalWizardPage />} />

            {/* ── Councils / Reviews ────────────────────────── */}
            <Route path="/meetings" element={<CouncilsPage />} />
            <Route path="/councils/:id/setup" element={<CouncilSetupPage />} />
            <Route path="/councils/:id/scoring" element={<ScoringWorkspacePage />} />
            <Route path="/councils/:id/meeting" element={<MeetingSchedulerPage />} />
            <Route path="/invitations/:id" element={<InvitationDetailPage />} />

            {/* ── Contracts & Post-contract ──────────────────── */}
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/new" element={<ContractFormPage />} />
            <Route path="/contracts/:id/disbursements" element={<DisbursementManagerPage />} />
            <Route path="/contracts/:id/amendments" element={<AmendmentFormPage />} />
            <Route path="/contracts/:id/reports" element={<ProgressReportFormPage />} />
            <Route path="/contracts/:id/seminars" element={<SeminarRegistrationPage />} />
            <Route path="/contracts/:id/final-report" element={<FinalReportPage />} />

            {/* ── Users (Admin) ──────────────────────────────── */}
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />
            <Route path="/users/:id/profile" element={<ScientificProfilePage />} />

            {/* ── Profile (self) ─────────────────────────────── */}
            <Route path="/profile" element={<ProfileSettingsPage />} />

            {/* ── Settings (Admin/Staff) ─────────────────────── */}
            <Route path="/settings/cycles" element={<CycleManagementPage />} />
            <Route path="/settings/cycles/new" element={<CycleFormPage />} />
            <Route path="/settings/cycles/:id/edit" element={<CycleFormPage />} />
            <Route path="/settings/lookups" element={<LookupSettingsPage />} />

            {/* ── AI & Search ────────────────────────────────── */}
            <Route path="/search" element={<SemanticSearchPage />} />

            {/* ── Analytics (Admin/Staff) ────────────────────── */}
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />

            {/* ── Notifications ──────────────────────────────── */}
            <Route path="/notifications" element={<NotificationCenterPage />} />
          </Route>

          {/* ─── Fallback ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}