import { useTranslation } from "react-i18next";
import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore, type Theme } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { ROLES } from "@/constants/roles";
import { UploadLimitsCard } from "@/features/settings/UploadLimitsCard";
import { SystemSettingsCard } from "@/features/settings/SystemSettingsCard";
import { useSystemSettingsQuery } from "@/hooks/useSystemSettings";

const THEME_OPTIONS: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
  { value: "light", labelKey: "settings.themeLight", icon: Sun },
  { value: "dark", labelKey: "settings.themeDark", icon: Moon },
  { value: "system", labelKey: "settings.themeSystem", icon: Monitor },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const sampleFillEnabled = useUiStore((state) => state.sampleFillEnabled);
  const setSampleFillEnabled = useUiStore((state) => state.setSampleFillEnabled);
  const isAdmin = useAuthStore((state) => state.user?.roles.includes(ROLES.ADMIN) ?? false);
  const { data: systemSettings } = useSystemSettingsQuery(isAdmin);

  // Upload có card riêng (kèm danh sách đuôi file) nên tách ra khỏi nhóm chung.
  const byKeys = (keys: string[]) => (systemSettings ?? []).filter((s) => keys.includes(s.key));
  const councilSettings = byKeys(["COUNCIL_INVITE_DEADLINE_DAYS"]);
  const notificationSettings = byKeys(["DEADLINE_REMINDER_DAYS", "EMAIL_ENABLED"]);
  const financeSettings = byKeys(["DISBURSEMENT_WHOLE_TRANCHES", "CONTRACT_SIDE_A_REPRESENTATIVE"]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.subtitleBase")}
          {isAdmin && t("settings.subtitleAdmin")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
          <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant={theme === value ? "default" : "outline"}
                size="sm"
                className={cn("flex-1", theme === value && "pointer-events-none")}
                onClick={() => setTheme(value)}
              >
                <Icon />
                {t(labelKey)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.demoTools")}</CardTitle>
          <CardDescription>{t("settings.demoToolsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-medium text-foreground">{t("settings.sampleFill")}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t("settings.sampleFillDesc")}
              </span>
            </span>
            <Switch
              checked={sampleFillEnabled}
              onCheckedChange={setSampleFillEnabled}
              aria-label={t("settings.toggleSampleFill")}
            />
          </label>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <SystemSettingsCard
            title={t("settings.grpNotifications")}
            description={t("settings.grpNotificationsDesc")}
            settings={notificationSettings}
          />
          <SystemSettingsCard
            title={t("settings.grpCouncils")}
            description={t("settings.grpCouncilsDesc")}
            settings={councilSettings}
          />
          <SystemSettingsCard
            title={t("settings.grpContracts")}
            description={t("settings.grpContractsDesc")}
            settings={financeSettings}
          />
          <UploadLimitsCard />
        </>
      )}
    </div>
  );
}
