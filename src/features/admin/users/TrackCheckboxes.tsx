import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { useTracksQuery } from "@/hooks/useTracks";

interface TrackCheckboxesProps {
  value: number[] | undefined;
  onChange: (value: number[]) => void;
}

/**
 * Chọn lĩnh vực chuyên môn của một người — dữ liệu hệ thống dùng để xét "đúng chuyên môn" khi lập
 * hội đồng (QĐ543 Điều 8.2).
 *
 * <p>Trước 30/09 không màn hình nào nhập được thứ này (chỉ seeder điền cho tài khoản demo), nên trên
 * bản deploy mọi người chấm thật đều "Chưa khai chuyên môn". Để ở form tạo/sửa người dùng, không bắt
 * buộc — bỏ trống thì người đó vẫn được mời, chỉ là phải ghi lý do.</p>
 */
export function TrackCheckboxes({ value, onChange }: TrackCheckboxesProps) {
  const { t } = useTranslation();
  const { data: tracks, isLoading } = useTracksQuery();
  const selected = value ?? [];

  if (isLoading) return <p className="text-sm text-muted-foreground">…</p>;
  if (!tracks || tracks.length === 0) return <p className="text-sm text-muted-foreground">{t("users.noTracks")}</p>;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tracks.map((track) => {
        // BE trả id dạng CHUỖI ("3") dù type khai number — ép về số để so cho đúng.
        const id = Number(track.id);
        return (
          <label key={id} className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={selected.includes(id)}
              onCheckedChange={(checked) =>
                onChange(checked ? [...selected, id] : selected.filter((x) => x !== id))
              }
            />
            {track.name}
          </label>
        );
      })}
    </div>
  );
}
