import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationalUnitsQuery } from "@/hooks/useOrganizationalUnits";

interface UnitSelectProps {
  id?: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

/**
 * Chọn đơn vị từ danh mục Đơn vị tổ chức.
 *
 * <p>Trước 29/09 đây là ô gõ tự do, nhưng máy chủ chỉ lưu khi chữ gõ vào TRÙNG tên/mã một đơn vị
 * có sẵn — gõ "fptU" thì bấm Lưu vẫn báo thành công mà đơn vị trống trơn. Cho chọn từ danh sách
 * thì không thể gõ sai. Giá trị gửi đi vẫn là TÊN đơn vị, nên API không phải đổi.</p>
 */
export function UnitSelect({ id, value, onChange }: UnitSelectProps) {
  const { t } = useTranslation();
  const { data: units, isLoading } = useOrganizationalUnitsQuery();

  if (!isLoading && (units?.length ?? 0) === 0) {
    return <p className="text-sm text-muted-foreground">{t("users.noUnits")}</p>;
  }

  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={t("users.selectUnit")} />
      </SelectTrigger>
      <SelectContent>
        {units?.map((unit) => (
          <SelectItem key={unit.id} value={unit.name}>
            {unit.name}
            <span className="ml-2 text-xs text-muted-foreground">{unit.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
