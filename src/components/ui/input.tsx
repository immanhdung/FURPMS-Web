import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ô số (type="number") — thầy góp ý 01/10: "sao ghi cái số mà lại có số 0 đằng trước?".
 * Form mặc định 0 (thứ tự, số tháng, gia hạn tối đa…), bấm vào gõ "5" thì trình duyệt ra "05"
 * vì con trỏ đứng SAU số 0. Sửa chung ở đây cho cả ~20 form thay vì vá từng form:
 * - focus vào ô đang là "0" → bôi đen sẵn, gõ là thay luôn;
 * - rời ô → bỏ số 0 thừa ở đầu ("05" → "5"; "0.5" giữ nguyên). Giá trị số không đổi
 *   (05 == 5) nên react-hook-form/state không cần biết, chỉ là phần hiển thị.
 */
function Input({ className, type, onFocus, onBlur, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base shadow-soft-xs transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      onFocus={(e) => {
        if (type === "number" && e.currentTarget.value === "0") e.currentTarget.select();
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (type === "number" && /^-?0\d/.test(e.currentTarget.value)) {
          e.currentTarget.value = String(Number(e.currentTarget.value));
        }
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

export { Input };
