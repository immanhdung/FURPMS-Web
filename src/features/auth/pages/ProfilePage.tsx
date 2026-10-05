import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { BookMarked, FileSignature, GraduationCap, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader } from "@/components/shared/PageLoader";
import { useAuthStore } from "@/store/auth.store";
import { formatDateTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import { lazy, Suspense } from "react";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Lazy-loaded to keep form code out of the main bundle for users who never open Profile
const AcademicProfileCard = lazy(() =>
  import("@/features/auth/pages/AcademicProfileCard").then((m) => ({ default: m.AcademicProfileCard }))
);

// C3 — thông tin định danh để điền hợp đồng. Chỉ chính chủ khai được (endpoint chỉ có "/me"),
// nên đặt ở trang hồ sơ cá nhân chứ không phải màn lập hợp đồng của Staff.
const ContractIdentityCard = lazy(() =>
  import("@/features/auth/pages/ContractIdentityCard").then((m) => ({ default: m.ContractIdentityCard }))
);

// Công trình khoa học theo QĐ543 BM02 — danh sách chi tiết, không phải ô đếm số.
const AcademicWorksCard = lazy(() =>
  import("@/features/auth/pages/AcademicWorksCard").then((m) => ({ default: m.AcademicWorksCard }))
);

function CardSkeleton() {
  return <Skeleton className="h-48 w-full rounded-xl" />;
}

/**
 * Trang Hồ sơ cá nhân.
 *
 * **Chia tab thay vì một cột dài.** Góp ý của thầy buổi demo 14/08: *"chia phần ra, chứ đừng có
 * lướt lướt xuống cuối thế"*. Trang này gộp bốn nhóm rất khác nhau — tài khoản, lý lịch khoa học,
 * danh sách công trình, thông tin lập hợp đồng — mà trước đây xếp nối đuôi nhau, muốn xem mục
 * cuối phải cuộn qua toàn bộ mấy chục ô nhập ở trên.
 */
export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <PageLoader label={t("profile.loading")} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </motion.div>

      <Card className="overflow-hidden pt-0">
        <div className="h-24 bg-linear-to-r from-primary via-brand-secondary to-brand-accent-2" />
        {/*
          CHỈ avatar mới đè lên dải màu. Trước đây `-mt-8` đặt trên cả hàng nên khối chữ bị kéo
          lên nằm TRONG nền gradient — chữ tối trên nền tối, lại lệch hẳn so với avatar. Nay khối
          chữ nằm hẳn dưới nền thẻ nên luôn đọc được, bất kể tên dài hay ngắn.
        */}
        <CardContent className="p-6 pt-0">
          <Avatar size="lg" className="-mt-10 size-20 border-4 border-card shadow-soft-md">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
            <AvatarFallback className="text-lg">{initials(user.fullName)}</AvatarFallback>
          </Avatar>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-foreground">{user.fullName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                {user.email}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {t(`roleName.${role}`, { defaultValue: role })}
                  </Badge>
                ))}
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="shrink-0 self-start">
              <Link to={ROUTES.CHANGE_PASSWORD}>
                <KeyRound />
                {t("auth.changePassword")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="account">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="account">
            <ShieldCheck className="size-4" />
            {t("profile.tabAccount")}
          </TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="size-4" />
            {t("profile.tabAcademic")}
          </TabsTrigger>
          <TabsTrigger value="works">
            <BookMarked className="size-4" />
            {t("profile.tabWorks")}
          </TabsTrigger>
          <TabsTrigger value="contract">
            <FileSignature className="size-4" />
            {t("profile.tabContract")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div>
                  <CardTitle>{t("profile.accountDetails")}</CardTitle>
                  <CardDescription>{t("profile.accountDetailsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("profile.status")}</span>
                {/* `status` là mã của máy chủ (ACTIVE/INACTIVE…) — đổi sang chữ Việt như mọi nơi khác. */}
                <span className="font-medium text-foreground">
                  {user.status ? t(`status.${user.status}`, { defaultValue: user.status }) : t("common.active")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("profile.lastLogin")}</span>
                <span className="font-medium text-foreground">{formatDateTime(user.lastLoginAt)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          <Suspense fallback={<CardSkeleton />}>
            <AcademicProfileCard userId={user.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="works" className="mt-4">
          <Suspense fallback={<CardSkeleton />}>
            <AcademicWorksCard userId={user.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="contract" className="mt-4">
          <Suspense fallback={<CardSkeleton />}>
            <ContractIdentityCard />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
