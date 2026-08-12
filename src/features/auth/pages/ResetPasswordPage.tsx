import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api/auth.service";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/common";

/**
 * Quên mật khẩu — bước 2: đổi mật khẩu bằng mã trong thư.
 *
 * Mã lấy từ đường dẫn (`?token=…`) nếu người dùng bấm thẳng liên kết trong thư; không thì gõ tay,
 * vì thư có thể bị máy khách thư biến liên kết thành chữ.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tooShort || mismatch || !token.trim()) return;
    setSaving(true);
    try {
      await authService.resetPassword(token.trim(), password);
      toast.success(t("auth.resetDone"));
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error((error as ApiError)?.message || t("auth.resetFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("auth.resetTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.resetDesc")}</p>
        </div>

        <div>
          <label htmlFor="token" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("auth.resetCode")}
          </label>
          <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("auth.newPassword")}
          </label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={tooShort}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {tooShort && <p className="mt-1 text-xs text-destructive">{t("auth.passwordTooShort")}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("auth.confirmPassword")}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={mismatch}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {mismatch && <p className="mt-1 text-xs text-destructive">{t("auth.passwordMismatch")}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={saving || tooShort || mismatch}>
          {t("auth.resetSubmit")}
        </Button>

        <Link
          to={ROUTES.LOGIN}
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t("auth.backToLogin")}
        </Link>
      </form>
    </div>
  );
}
