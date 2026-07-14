import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FastForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/store/auth.store";
import { ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";
import {
  useAdjustSystemClockMutation,
  useResetSystemClockMutation,
  useSystemClockQuery,
} from "@/hooks/useSystemClock";

const FORMAT = "DD MMM YYYY, HH:mm:ss";

export function DevClockWidget() {
  const isAdmin = useAuthStore((state) => state.user?.roles.includes(ROLES.ADMIN) ?? false);
  const { data: clock } = useSystemClockQuery();
  const adjustClock = useAdjustSystemClockMutation();
  const resetClock = useResetSystemClockMutation();
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) return null;

  const offsetDays = clock?.offsetDays ?? 0;
  const simulatedNow = now.add(offsetDays, "day");
  const isOffset = offsetDays !== 0;
  const isBusy = adjustClock.isPending || resetClock.isPending;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Demo time travel"
            className={cn(
              "relative rounded-full bg-background shadow-lg",
              isOffset && "border-brand-accent text-brand-accent"
            )}
          >
            <FastForward />
            {isOffset && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-semibold text-white">
                +{offsetDays}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" align="start" className="w-72 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Demo time travel</p>
            <p className="text-[11px] text-muted-foreground/80">Fast-forward the system clock for demos.</p>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-2.5">
            <div>
              <p className="text-[11px] text-muted-foreground">Real time</p>
              <p className="font-mono text-sm text-foreground">{now.format(FORMAT)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">System time {isOffset && `(+${offsetDays}d)`}</p>
              <p className={cn("font-mono text-sm", isOffset ? "font-semibold text-brand-accent" : "text-foreground")}>
                {simulatedNow.format(FORMAT)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={isBusy}
              onClick={() => adjustClock.mutate(1)}
            >
              +1 day
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={isBusy}
              onClick={() => adjustClock.mutate(7)}
            >
              +7 days
            </Button>
          </div>

          {isOffset && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full gap-1.5 text-muted-foreground"
              disabled={isBusy}
              onClick={() => resetClock.mutate()}
            >
              <RotateCcw className="size-3.5" />
              Reset to real time
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
