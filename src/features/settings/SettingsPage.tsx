import { Monitor, Moon, Settings2, Sparkles, Sun } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore, type Theme } from "@/store/ui.store";

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary shadow-soft-xs">
          <Settings2 className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Preferences for this browser. They are saved locally.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sun className="size-4.5" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose how FURPMS looks on this device.</CardDescription>
              </div>
            </div>
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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                <Sparkles className="size-4.5" />
              </div>
              <div>
                <CardTitle>Demo tools</CardTitle>
                <CardDescription>Helpers for demos and testing — turn them off for a clean experience.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
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
      </motion.div>
    </div>
  );
}
