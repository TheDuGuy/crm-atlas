import { getDashboardStats } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, Zap, Workflow, CheckCircle, Lightbulb } from "lucide-react";

const statConfig = [
  { key: "products", label: "Products", icon: Package, color: "text-blue-600" },
  { key: "fields", label: "Fields", icon: FileText, color: "text-purple-600" },
  { key: "events", label: "Events", icon: Zap, color: "text-amber-600" },
  { key: "flows", label: "Total Flows", icon: Workflow, color: "text-emerald-600" },
  { key: "liveFlows", label: "Live Flows", icon: CheckCircle, color: "text-green-600" },
  { key: "opportunities", label: "Opportunities", icon: Lightbulb, color: "text-orange-600" },
];

export async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statConfig.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {label}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats[key as keyof typeof stats]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
