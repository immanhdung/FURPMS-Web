import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateSystemSettingMutation } from "@/hooks/useSystemSettings";
import type { SystemSetting } from "@/types/system-setting";

/** Một dòng cấu hình: nhập số/chuỗi, có nút trả về mức khuyến cáo. */
function SettingRow({ setting }: { setting: SystemSetting }) {
  const { t } = useTranslation();
  const updateMutation = useUpdateSystemSettingMutation();
  const [value, setValue] = useState(setting.value);

  useEffect(() => setValue(setting.value), [setting.value]);

  const isDirty = value !== setting.value;
  const isRecommended = value === setting.recommendedValue;

  return (
    <div className="space-y-1.5 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <label htmlFor={setting.key} className="block text-sm font-medium text-foreground">
        {setting.description ?? setting.key}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={setting.key}
          className="w-48"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          disabled={!isDirty || updateMutation.isPending}
          onClick={() => updateMutation.mutate({ key: setting.key, value: value.trim() })}
        >
          {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {t("common.save")}
        </Button>
        {!isRecommended && (
          <Button type="button" size="sm" variant="ghost" onClick={() => setValue(setting.recommendedValue)}>
            <RotateCcw />
            {t("settings.recommendedPrefix", { value: setting.recommendedValue })}
          </Button>
        )}
      </div>
      <p className="font-mono text-xs text-muted-foreground">{setting.key}</p>
    </div>
  );
}

/** Cấu hình dạng bật/tắt. */
function ToggleRow({ setting }: { setting: SystemSetting }) {
  const updateMutation = useUpdateSystemSettingMutation();
  const checked = setting.value.toLowerCase() === "true";

  return (
    <div className="flex items-start justify-between gap-4 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <div>
        <p className="text-sm font-medium text-foreground">{setting.description ?? setting.key}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{setting.key}</p>
      </div>
      <Switch
        checked={checked}
        disabled={updateMutation.isPending}
        onCheckedChange={(next) => updateMutation.mutate({ key: setting.key, value: String(next) })}
        aria-label={setting.key}
      />
    </div>
  );
}

const BOOLEAN_KEYS = ["EMAIL_ENABLED"];

/** Nhóm cấu hình vận hành (trừ phần upload đã có card riêng). */
export function SystemSettingsCard({
  title,
  description,
  settings,
}: {
  title: string;
  description: string;
  settings: SystemSetting[];
}) {
  if (settings.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {settings.map((s) =>
          BOOLEAN_KEYS.includes(s.key) ? (
            <ToggleRow key={s.key} setting={s} />
          ) : (
            <SettingRow key={s.key} setting={s} />
          )
        )}
      </CardContent>
    </Card>
  );
}
