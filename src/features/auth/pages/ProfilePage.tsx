import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <PageLoader label={t("profile.loading")} />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Avatar size="lg" className="size-16">
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
                  {role}
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
            <span className="font-medium text-foreground">{user.status ?? t("common.active")}</span>
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
    </div>
  );
}
