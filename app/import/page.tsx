import { BulkImport } from "@/components/bulk-import";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Import</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Import fields and flows in bulk using CSV format
        </p>
      </div>
      <BulkImport />
    </div>
  );
}
