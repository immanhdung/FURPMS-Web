import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api/auth.service";
import { ROUTES } from "@/constants/routes";

/**
 * Quên mật khẩu — bước 1: xin mã gửi vào hộp thư.
 *
 * Màn này **luôn báo thành công**, kể cả khi email không có trong hệ thống: nếu báo "email không
 * tồn tại" thì bất kỳ ai cũng dò được danh sách tài khoản của trường qua đúng màn này. Máy chủ
 * cũng trả 200 trong cả hai trường hợp, nên hai bên nhất quán.
 */
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      toast.error(t("auth.forgotFailed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("auth.forgotTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.forgotDesc")}</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-foreground">
              <MailCheck className="mt-0.5 size-4 shrink-0 text-success" />
              {t("auth.forgotSent")}
            </p>
            <Button asChild className="w-full">
              <Link to={ROUTES.RESET_PASSWORD}>{t("auth.haveCode")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.email")}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@fpt.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {t("auth.sendResetLink")}
            </Button>
          </form>
        )}

        <Link
          to={ROUTES.LOGIN}
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t("auth.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
