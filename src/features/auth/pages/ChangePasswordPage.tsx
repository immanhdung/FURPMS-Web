import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChangePasswordMutation } from "@/hooks/useAuth";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/change-password.schema";
import { ROUTES } from "@/constants/routes";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() }
    );
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("auth.changePassword")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.changePasswordSubtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-4.5" />
            </div>
            <div>
              <CardTitle>{t("auth.security")}</CardTitle>
              <CardDescription>{t("auth.securityDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.currentPassword")}
              </label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.currentPassword)}
                disabled={changePasswordMutation.isPending}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="mt-1.5 text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.newPassword")}
              </label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                disabled={changePasswordMutation.isPending}
                {...register("newPassword")}
              />
              {errors.newPassword && <p className="mt-1.5 text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.confirmPassword")}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                disabled={changePasswordMutation.isPending}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PROFILE)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending && <Loader2 className="animate-spin" />}
                {t("auth.updatePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
