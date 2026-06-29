import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useUserProfile } from "../../hooks/useUsers";
import { useAuthStore } from "../../store/authStore";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  Briefcase,
  BookOpen,
  FlaskConical,
  User,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// PI Eligibility Logic (Điều 7.1 QĐ 543)
// ────────────────────────────────────────────────────────────────────────
const PI_ELIGIBLE_DEGREES = ["Thạc sĩ", "Tiến sĩ", "Phó Giáo sư", "Giáo sư"];

function PiEligibilityBadge({ academicDegree }) {
  const isEligible = PI_ELIGIBLE_DEGREES.includes(academicDegree);

  if (isEligible) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 size={14} aria-hidden="true" />
        Đủ điều kiện làm Chủ nhiệm đề tài
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <XCircle size={14} aria-hidden="true" />
      Chưa đủ điều kiện PI
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Section Components
// ────────────────────────────────────────────────────────────────────────

function PersonalInfoSection({ profile }) {
  const infoItems = [
    { label: "Họ và tên", value: profile.fullName },
    { label: "Năm sinh", value: profile.birthYear },
    { label: "Giới tính", value: profile.gender },
    { label: "Chức danh", value: profile.academicTitle || "—" },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <User size={18} className="text-primary" /> Thông tin cá nhân
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Academic Degree + PI Eligibility */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Học vị</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg bg-primary/10 text-primary">
              <GraduationCap size={16} aria-hidden="true" />
              {profile.academicDegree || "—"}
            </span>
            <PiEligibilityBadge academicDegree={profile.academicDegree} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EducationSection({ education }) {
  if (!education?.length) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-primary" /> Quá trình đào tạo
          </h2>
          <EmptyState title="Chưa có thông tin đào tạo" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-5 pb-0">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <GraduationCap size={18} className="text-primary" /> Quá trình đào tạo
        </h2>
      </CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface/50">
              <TableHead className="font-semibold">Năm tốt nghiệp</TableHead>
              <TableHead className="font-semibold">Bậc đào tạo</TableHead>
              <TableHead className="font-semibold">Chuyên ngành</TableHead>
              <TableHead className="font-semibold">Nơi đào tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {education.map((e, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{e.year}</TableCell>
                <TableCell>{e.level}</TableCell>
                <TableCell>{e.major}</TableCell>
                <TableCell>{e.institution}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function WorkHistorySection({ workHistory }) {
  if (!workHistory?.length) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-primary" /> Quá trình công tác
          </h2>
          <EmptyState title="Chưa có thông tin công tác" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-5 pb-0">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Briefcase size={18} className="text-primary" /> Quá trình công tác
        </h2>
      </CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface/50">
              <TableHead className="font-semibold">Thời gian</TableHead>
              <TableHead className="font-semibold">Vị trí</TableHead>
              <TableHead className="font-semibold">Cơ quan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workHistory.map((w, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium whitespace-nowrap">{w.period}</TableCell>
                <TableCell>{w.position}</TableCell>
                <TableCell>{w.organization}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function PublicationsSection({ publications }) {
  if (!publications?.length) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-primary" /> Công trình khoa học
          </h2>
          <EmptyState title="Chưa có công trình khoa học" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Công trình khoa học
          </h2>
          <span className="text-xs text-muted-foreground font-medium">{publications.length} công trình</span>
        </div>

        <div className="space-y-3">
          {publications.map((pub, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-surface-container-low hover:bg-surface-container transition-colors">
              <p className="text-sm font-medium text-foreground">{pub.title}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{pub.year}</span>
                <span className="text-xs font-medium text-primary">{pub.venue}</span>
                {pub.impactFactor && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full" style={{ fontVariantNumeric: "tabular-nums" }}>
                    IF: {pub.impactFactor}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsSection({ projects }) {
  if (!projects?.length) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <FlaskConical size={18} className="text-primary" /> Đề tài đã tham gia
          </h2>
          <EmptyState title="Chưa có đề tài nghiên cứu" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-5 pb-0">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <FlaskConical size={18} className="text-primary" /> Đề tài đã tham gia
        </h2>
      </CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface/50">
              <TableHead className="font-semibold">Tên đề tài</TableHead>
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="font-semibold">Năm</TableHead>
              <TableHead className="font-semibold">Cấp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium min-w-[200px]">{p.title}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                    p.role === "Chủ nhiệm" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.role}
                  </span>
                </TableCell>
                <TableCell style={{ fontVariantNumeric: "tabular-nums" }}>{p.year}</TableCell>
                <TableCell>{p.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ────────────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-40 w-full bg-muted rounded-xl" />
      <div className="h-32 w-full bg-muted rounded-xl" />
      <div className="h-32 w-full bg-muted rounded-xl" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function ScientificProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const { data: profile, isLoading, isError } = useUserProfile(id);

  const isOwnProfile = currentUser?.id === id;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <EmptyState
          icon={User}
          title="Không tìm thấy hồ sơ"
          description="Hồ sơ khoa học không tồn tại hoặc bạn không có quyền truy cập."
          actionLabel="Quay lại"
          onAction={() => navigate("/users")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>
              Hồ sơ Khoa học
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Biểu mẫu 02 — Lý lịch khoa học của {profile.fullName || "người dùng"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwnProfile && (
            <Button variant="outline" className="text-foreground">
              <Pencil size={14} className="mr-2" /> Chỉnh sửa
            </Button>
          )}
          <Button variant="outline" className="text-foreground" onClick={() => alert("Chức năng xuất BM02 sẽ được kết nối API.")}>
            <Download size={14} className="mr-2" /> Xuất BM02
          </Button>
        </div>
      </div>

      {/* Profile Sections */}
      <PersonalInfoSection profile={profile} />
      <EducationSection education={profile.education} />
      <WorkHistorySection workHistory={profile.workHistory} />
      <PublicationsSection publications={profile.publications} />
      <ProjectsSection projects={profile.projects} />
    </div>
  );
}
