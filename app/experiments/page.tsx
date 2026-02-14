import { ExperimentsList } from "@/components/experiments-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experiments</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Track measurement plans and experiment results
          </p>
        </div>
        <Link href="/experiments/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            New Experiment
          </Button>
        </Link>
      </div>
      <ExperimentsList />
    </div>
  );
}
