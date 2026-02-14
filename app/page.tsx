import { DashboardStats } from "@/components/dashboard-stats";
import { AllLiveFlows } from "@/components/all-live-flows";
import { TopOpportunities } from "@/components/top-opportunities";
import { ConflictsSummary } from "@/components/conflicts-summary";
import { ExperimentsWidget } from "@/components/experiments-widget";
import { TopIdeasWidget } from "@/components/top-ideas-widget";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CRM Atlas
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Your comprehensive view of CRM capabilities and opportunities
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <ExperimentsWidget />
        <TopIdeasWidget />
      </div>

      <ConflictsSummary />

      <TopOpportunities />

      <AllLiveFlows />
    </div>
  );
}
