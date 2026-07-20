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

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsPage() {
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Appearance and demo helpers are saved in this browser only.
          {isAdmin && " System settings below apply to everyone."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how FURPMS looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant={theme === value ? "default" : "outline"}
                size="sm"
                className={cn("flex-1", theme === value && "pointer-events-none")}
                onClick={() => setTheme(value)}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo tools</CardTitle>
          <CardDescription>Helpers for demos and testing — turn them off for a clean experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-medium text-foreground">Sample-fill button on the proposal form</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Shows a "Fill with sample data" button so you can complete the wizard quickly during a demo.
              </span>
            </span>
            <Switch
              checked={sampleFillEnabled}
              onCheckedChange={setSampleFillEnabled}
              aria-label="Toggle the sample-fill button"
            />
          </label>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <SystemSettingsCard
            title="Notifications"
            description="When people get reminded, and whether email actually goes out."
            settings={notificationSettings}
          />
          <SystemSettingsCard
            title="Review councils"
            description="Rules that apply when inviting reviewers."
            settings={councilSettings}
          />
          <SystemSettingsCard
            title="Contracts & funding"
            description="Defaults applied when contracts and disbursement schedules are created."
            settings={financeSettings}
          />
          <UploadLimitsCard />
        </>
      )}
    </div>
  );
}
