import { useState } from "react";
import { BarChart3, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCyclesQuery } from "@/hooks/useCycles";
import { OverviewTab } from "@/features/analytics/tabs/OverviewTab";
import { FunnelTab } from "@/features/analytics/tabs/FunnelTab";
import { ResearchFieldTab } from "@/features/analytics/tabs/ResearchFieldTab";
import { ReviewAnalyticsTab } from "@/features/analytics/tabs/ReviewAnalyticsTab";
import { CouncilAnalyticsTab } from "@/features/analytics/tabs/CouncilAnalyticsTab";
import { BudgetAnalyticsTab } from "@/features/analytics/tabs/BudgetAnalyticsTab";

const ALL_CYCLES = "all";

export function AnalyticsPage() {
  const { data: cycles } = useCyclesQuery();
  const [cycleFilter, setCycleFilter] = useState<string>(ALL_CYCLES);
  const cycleId = cycleFilter === ALL_CYCLES ? undefined : Number(cycleFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">System-wide research proposal analytics.</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={cycleFilter} onValueChange={setCycleFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All cycles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CYCLES}>All cycles</SelectItem>
              {cycles?.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">
            <BarChart3 className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="funnel">Proposal Funnel</TabsTrigger>
          <TabsTrigger value="fields">Research Fields</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="councils">Councils</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="funnel">
          <FunnelTab cycleId={cycleId} />
        </TabsContent>
        <TabsContent value="fields">
          <ResearchFieldTab cycleId={cycleId} />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewAnalyticsTab />
        </TabsContent>
        <TabsContent value="councils">
          <CouncilAnalyticsTab />
        </TabsContent>
        <TabsContent value="budget">
          <BudgetAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
