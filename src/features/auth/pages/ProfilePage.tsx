import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <PageLoader label={t("profile.loading")} />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </motion.div>

      <Card className="overflow-hidden pt-0">
        <div className="h-16 bg-linear-to-r from-primary via-brand-secondary to-brand-accent-2" />
        <CardContent className="-mt-8 flex flex-col items-center gap-4 p-6 pt-0 text-center sm:flex-row sm:text-left">
          <Avatar size="lg" className="size-16 border-4 border-card shadow-soft-md">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
            <AvatarFallback className="text-base">{initials(user.fullName)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-foreground">{user.fullName}</p>
            <p className="flex items-center justify-center gap-1.5 truncate text-sm text-muted-foreground sm:justify-start">
              <Mail className="size-3.5 shrink-0" />
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {user.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {t(`roleName.${role}`, { defaultValue: role })}
                </Badge>
              ))}
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={ROUTES.CHANGE_PASSWORD}>
              <KeyRound />
              {t("auth.changePassword")}
            </Link>
          </Button>
        </CardContent>
      </Card>

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

      {/* Academic Profile — all users can fill their scientific CV */}
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <AcademicProfileCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <ContractIdentityCard />
      </Suspense>
    </div>
  );
}
