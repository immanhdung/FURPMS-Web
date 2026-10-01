import type * as React from "react";
import { Input } from "@/components/ui/input";

type MoneyInputProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  /** Số tiền (đồng) — số hoặc chuỗi chữ số. Rỗng/0 hiện ô trống. */
  value: number | string | null | undefined;
  /** Nhận lại CHUỖI CHỮ SỐ trần ("120000000"), "" khi xoá hết — nơi gọi tự đổi sang số. */
  onValueChange: (digits: string) => void;
};

/**
 * Ô nhập tiền có dấu chấm ngăn hàng nghìn ("120.000.000").
 *
 * <p>Trước 01/10 các ô thành phần dự toán là `type="number"` nên hiện "120000000" — đếm số 0 bằng
 * mắt, dễ gõ thừa/thiếu một chữ số, trong khi dòng tổng ngay dưới lại có dấu chấm. Hiển thị định
 * dạng, nhưng giá trị trả ra vẫn là chữ số trần nên logic tính tổng/tỷ lệ không đổi.</p>
 */
export function MoneyInput({ value, onValueChange, className, ...props }: MoneyInputProps) {
  const digits = String(value ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const display = digits && digits !== "0" ? Number(digits).toLocaleString("vi-VN") : "";

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={className}
      value={display}
      onChange={(e) => onValueChange(e.target.value.replace(/\D/g, ""))}
    />
  );
}
