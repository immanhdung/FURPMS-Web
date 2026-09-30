import { useState } from "react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Ô mật khẩu có nút hiện/ẩn. Dùng chung cho form tạo người dùng và màn đổi mật khẩu — gõ mật khẩu
 * mới mà không xem được thì sai một ký tự là tự khoá mình ngoài cửa.
 *
 * <p>Nhận mọi prop của `Input` (kể cả `ref` từ `register(...)` — React 19 truyền ref như prop).
 * Màn đăng nhập KHÔNG dùng component này vì có nền tối riêng.</p>
 */
export function PasswordInput({ className, disabled, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const label = visible ? t("users.hidePassword") : t("users.showPassword");

  return (
    <div className="relative">
      <Input {...props} disabled={disabled} type={visible ? "text" : "password"} className={cn("pr-9", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-label={label}
        title={label}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
