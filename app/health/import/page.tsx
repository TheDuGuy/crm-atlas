"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { importMetrics, CSVRow } from "@/app/actions/health";
import { recomputeHealthFlagsForPeriod } from "@/app/actions/health-v2";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

export default function HealthImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Parse CSV for preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.slice(0, 5).map((row: any) => ({
          workflow_id: row.workflow_id || row.WorkflowID || row['Workflow ID'] || '',
          period_start_date: row.period_start_date || row.Period || row.Date || '',
          period_type: (row.period_type || row.PeriodType || 'week').toLowerCase() as 'week' | 'month',
          channel: row.channel || row.Channel || 'email',
          sends: parseInt(row.sends || row.Sends || '0'),
          opens: parseInt(row.opens || row.Opens || '0'),
          clicks: parseInt(row.clicks || row.Clicks || '0'),
          open_rate: row.open_rate ? parseFloat(row.open_rate) : undefined,
          click_rate: row.click_rate ? parseFloat(row.click_rate) : undefined,
          unsubs: row.unsubs || row.unsubscribes || row.Unsubs || row.Unsubscribes ? parseInt(row.unsubs || row.unsubscribes || row.Unsubs || row.Unsubscribes) : undefined,
          unsub_rate: row.unsub_rate || row['Unsub Rate'] ? parseFloat(row.unsub_rate || row['Unsub Rate']) : undefined,
          bounces: row.bounces || row.Bounces ? parseInt(row.bounces || row.Bounces) : undefined,
          bounce_rate: row.bounce_rate || row['Bounce Rate'] ? parseFloat(row.bounce_rate || row['Bounce Rate']) : undefined,
          complaints: row.complaints || row.spam_complaints || row.Complaints ? parseInt(row.complaints || row.spam_complaints || row.Complaints) : undefined,
          complaint_rate: row.complaint_rate || row['Complaint Rate'] ? parseFloat(row.complaint_rate || row['Complaint Rate']) : undefined,
          delivered: row.delivered || row.Delivered ? parseInt(row.delivered || row.Delivered) : undefined,
        }));
        setPreview(rows);
      },
      error: (error) => {
        alert(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows: CSVRow[] = results.data.map((row: any) => ({
          workflow_id: row.workflow_id || row.WorkflowID || row['Workflow ID'] || '',
          period_start_date: row.period_start_date || row.Period || row.Date || '',
          period_type: (row.period_type || row.PeriodType || 'week').toLowerCase() as 'week' | 'month',
          channel: (row.channel || row.Channel || 'email').toLowerCase(),
          sends: parseInt(row.sends || row.Sends || '0'),
          opens: parseInt(row.opens || row.Opens || '0'),
          clicks: parseInt(row.clicks || row.Clicks || '0'),
          open_rate: row.open_rate ? parseFloat(row.open_rate) : undefined,
          click_rate: row.click_rate ? parseFloat(row.click_rate) : undefined,
          unsubs: row.unsubs || row.unsubscribes || row.Unsubs || row.Unsubscribes ? parseInt(row.unsubs || row.unsubscribes || row.Unsubs || row.Unsubscribes) : undefined,
          unsub_rate: row.unsub_rate || row['Unsub Rate'] ? parseFloat(row.unsub_rate || row['Unsub Rate']) : undefined,
          bounces: row.bounces || row.Bounces ? parseInt(row.bounces || row.Bounces) : undefined,
          bounce_rate: row.bounce_rate || row['Bounce Rate'] ? parseFloat(row.bounce_rate || row['Bounce Rate']) : undefined,
          complaints: row.complaints || row.spam_complaints || row.Complaints ? parseInt(row.complaints || row.spam_complaints || row.Complaints) : undefined,
          complaint_rate: row.complaint_rate || row['Complaint Rate'] ? parseFloat(row.complaint_rate || row['Complaint Rate']) : undefined,
          delivered: row.delivered || row.Delivered ? parseInt(row.delivered || row.Delivered) : undefined,
        }));

        const batchId = crypto.randomUUID();
        const importResult = await importMetrics(rows, batchId);

        // Trigger RAG recomputation for imported data
        if (importResult.imported > 0 && rows.length > 0) {
          const dates = rows.map(r => r.period_start_date).sort();
          const minDate = dates[0];
          const maxDate = dates[dates.length - 1];

          // Recompute in background (don't await - it can take a while)
          recomputeHealthFlagsForPeriod(minDate, maxDate).catch(err => {
            console.error('Error recomputing health flags:', err);
          });
        }

        setResult(importResult);
        setIsImporting(false);

        if (importResult.success || importResult.imported > 0) {
          setTimeout(() => {
            router.push('/health');
          }, 2000);
        }
      },
      error: (error) => {
        alert(`Failed to parse CSV: ${error.message}`);
        setIsImporting(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Channel Health Data</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Upload CSV export from Looker (Iterable Performance Explore)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Upload</CardTitle>
          <CardDescription>
            Required: workflow_id, period_start_date, period_type (week/month), channel, sends, opens, clicks<br/>
            Optional: unsubs, bounces, complaints, delivered (rates calculated if not provided)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isImporting}
            />
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Workflow ID</th>
                      <th className="px-4 py-2 text-left">Period</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Channel</th>
                      <th className="px-4 py-2 text-right">Sends</th>
                      <th className="px-4 py-2 text-right">Opens</th>
                      <th className="px-4 py-2 text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{row.workflow_id}</td>
                        <td className="px-4 py-2">{row.period_start_date}</td>
                        <td className="px-4 py-2">{row.period_type}</td>
                        <td className="px-4 py-2">{row.channel}</td>
                        <td className="px-4 py-2 text-right">{row.sends.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{row.opens.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{row.clicks.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Metrics
              </>
            )}
          </Button>

          {result && (
            <Alert className={result.errors.length > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}>
              {result.errors.length > 0 ? (
                <XCircle className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>
                <strong>Import Complete:</strong> {result.imported} imported, {result.skipped} skipped
                {result.errors.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-semibold">Errors:</p>
                    {result.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx} className="text-red-600">• {err}</div>
                    ))}
                    {result.errors.length > 5 && <div>...and {result.errors.length - 5} more</div>}
                  </div>
                )}
                {result.imported > 0 && (
                  <p className="mt-2 text-green-700">Redirecting to Health dashboard...</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
