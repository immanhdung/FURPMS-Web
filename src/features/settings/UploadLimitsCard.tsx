import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemSettingsQuery, useUpdateSystemSettingMutation } from "@/hooks/useSystemSettings";
import { SYSTEM_SETTING_KEYS } from "@/types/system-setting";

/**
 * Cấu hình dung lượng tối đa của tài liệu đính kèm (Admin).
 * BE chặn cứng trong khoảng 1–100 MB và khuyến cáo 10 MB — hồ sơ QĐ 543 là văn bản, không phải file nặng.
 */
export function UploadLimitsCard() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useSystemSettingsQuery();
  const updateMutation = useUpdateSystemSettingMutation();

  const sizeSetting = settings?.find((s) => s.key === SYSTEM_SETTING_KEYS.UPLOAD_MAX_FILE_SIZE_MB);
  const extSetting = settings?.find((s) => s.key === SYSTEM_SETTING_KEYS.UPLOAD_ALLOWED_EXTENSIONS);

  const [sizeMb, setSizeMb] = useState("");
  useEffect(() => {
    if (sizeSetting) setSizeMb(sizeSetting.value);
  }, [sizeSetting]);

  if (isLoading) return <Skeleton className="h-52 w-full rounded-xl" />;
  if (!sizeSetting) return null;

  const recommended = sizeSetting.recommendedValue;
  const isRecommended = sizeMb === recommended;
  const isDirty = sizeMb !== sizeSetting.value;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.uploadTitle")}</CardTitle>
        <CardDescription>{t("settings.uploadDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="upload-max-size" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("settings.maxFileSize")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="upload-max-size"
              type="number"
              min={1}
              max={100}
              className="w-32"
              value={sizeMb}
              onChange={(e) => setSizeMb(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={!isDirty || updateMutation.isPending}
              onClick={() =>
                updateMutation.mutate({ key: SYSTEM_SETTING_KEYS.UPLOAD_MAX_FILE_SIZE_MB, value: sizeMb.trim() })
              }
            >
              {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {t("common.save")}
            </Button>
            {!isRecommended && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setSizeMb(recommended)}>
                <RotateCcw />
                {t("settings.useRecommended", { value: recommended })}
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("settings.allowedRange")} <span className="font-medium text-foreground">{t("settings.recommended", { value: recommended })}</span>
            {t("settings.recommendedHint")}
            {isRecommended && t("settings.onRecommended")}
          </p>
        </div>

        {extSetting && (
          <div>
            <p className="text-sm font-medium text-foreground">{t("settings.allowedFileTypes")}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {extSetting.value.split(",").map((ext) => (
                <span key={ext} className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {ext}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
