"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { importFields, importFlows } from "@/app/actions/import";
import { toast } from "sonner";
import { Upload, FileText, Workflow } from "lucide-react";

type FieldRow = {
  product: string;
  field_name: string;
  description: string;
  format: string;
  live: boolean;
};

type FlowRow = {
  product: string;
  flow_name: string;
  purpose: string;
  description: string;
  trigger_type: string;
  frequency: string;
  channels: string;
  live: boolean;
  sto: boolean;
  iterable_id: string;
};

export function BulkImport() {
  const [fieldsCSV, setFieldsCSV] = useState("");
  const [flowsCSV, setFlowsCSV] = useState("");
  const [fieldsParsed, setFieldsParsed] = useState<FieldRow[]>([]);
  const [flowsParsed, setFlowsParsed] = useState<FlowRow[]>([]);
  const [fieldsImporting, setFieldsImporting] = useState(false);
  const [flowsImporting, setFlowsImporting] = useState(false);

  const parseCSV = (csv: string): string[][] => {
    const lines = csv.trim().split("\n");
    return lines.map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const parseFields = () => {
    try {
      const rows = parseCSV(fieldsCSV);
      if (rows.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }

      const parsed: FieldRow[] = [];
      for (let i = 1; i < rows.length; i++) {
        const [product, field_name, description, format, live] = rows[i];
        if (!product || !field_name) continue;
        parsed.push({
          product: product.trim(),
          field_name: field_name.trim(),
          description: description?.trim() || "",
          format: format?.trim() || "",
          live: live?.toLowerCase().trim() === "true" || live?.toLowerCase().trim() === "yes",
        });
      }

      setFieldsParsed(parsed);
      toast.success(`Parsed ${parsed.length} fields`);
    } catch (error) {
      toast.error("Error parsing CSV. Please check the format.");
      console.error(error);
    }
  };

  const parseFlows = () => {
    try {
      const rows = parseCSV(flowsCSV);
      if (rows.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }

      const parsed: FlowRow[] = [];
      for (let i = 1; i < rows.length; i++) {
        const [
          product,
          flow_name,
          purpose,
          description,
          trigger_type,
          frequency,
          channels,
          live,
          sto,
          iterable_id,
        ] = rows[i];
        if (!product || !flow_name) continue;
        parsed.push({
          product: product.trim(),
          flow_name: flow_name.trim(),
          purpose: purpose?.trim().toLowerCase() || "activation",
          description: description?.trim() || "",
          trigger_type: trigger_type?.trim().toLowerCase().replace(" ", "_") || "event_based",
          frequency: frequency?.trim() || "",
          channels: channels?.trim() || "email",
          live: live?.toLowerCase().trim() === "true" || live?.toLowerCase().trim() === "yes",
          sto: sto?.toLowerCase().trim() === "true" || sto?.toLowerCase().trim() === "yes",
          iterable_id: iterable_id?.trim() || "",
        });
      }

      setFlowsParsed(parsed);
      toast.success(`Parsed ${parsed.length} flows`);
    } catch (error) {
      toast.error("Error parsing CSV. Please check the format.");
      console.error(error);
    }
  };

  const handleImportFields = async () => {
    setFieldsImporting(true);
    try {
      const result = await importFields(fieldsParsed);
      toast.success(`Successfully imported ${result.success} fields`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} fields failed to import`);
      }
      setFieldsCSV("");
      setFieldsParsed([]);
    } catch (error) {
      toast.error("Error importing fields");
      console.error(error);
    } finally {
      setFieldsImporting(false);
    }
  };

  const handleImportFlows = async () => {
    setFlowsImporting(true);
    try {
      const result = await importFlows(flowsParsed);
      toast.success(`Successfully imported ${result.success} flows`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} flows failed to import`);
      }
      setFlowsCSV("");
      setFlowsParsed([]);
    } catch (error) {
      toast.error("Error importing flows");
      console.error(error);
    } finally {
      setFlowsImporting(false);
    }
  };

  return (
    <Tabs defaultValue="fields" className="space-y-6">
      <TabsList>
        <TabsTrigger value="fields" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Import Fields
        </TabsTrigger>
        <TabsTrigger value="flows" className="flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          Import Flows
        </TabsTrigger>
      </TabsList>

      <TabsContent value="fields" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Fields CSV</CardTitle>
            <CardDescription>
              Paste CSV with columns: product, field_name, description, format, live
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="product,field_name,description,format,live&#10;Payment Links,TapToPayEnabled,Has member enabled T2P,BOOLEAN,true"
              value={fieldsCSV}
              onChange={(e) => setFieldsCSV(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <Button onClick={parseFields} disabled={!fieldsCSV.trim()}>
              Parse CSV
            </Button>
          </CardContent>
        </Card>

        {fieldsParsed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview ({fieldsParsed.length} fields)</span>
                <Button
                  onClick={handleImportFields}
                  disabled={fieldsImporting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {fieldsImporting ? "Importing..." : "Import Fields"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Live</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldsParsed.map((field, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{field.product}</TableCell>
                        <TableCell>{field.field_name}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {field.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{field.format}</Badge>
                        </TableCell>
                        <TableCell>
                          {field.live ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="flows" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Flows CSV</CardTitle>
            <CardDescription>
              Paste CSV with columns: product, flow_name, purpose, description, trigger_type,
              frequency, channels, live, sto, iterable_id
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="product,flow_name,purpose,description,trigger_type,frequency,channels,live,sto,iterable_id&#10;Payment Links,Welcome Email,activation,Welcome new users,event_based,Daily,email,true,true,12345"
              value={flowsCSV}
              onChange={(e) => setFlowsCSV(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <Button onClick={parseFlows} disabled={!flowsCSV.trim()}>
              Parse CSV
            </Button>
          </CardContent>
        </Card>

        {flowsParsed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview ({flowsParsed.length} flows)</span>
                <Button
                  onClick={handleImportFlows}
                  disabled={flowsImporting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {flowsImporting ? "Importing..." : "Import Flows"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Flow Name</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead>Live</TableHead>
                      <TableHead>STO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flowsParsed.map((flow, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{flow.product}</TableCell>
                        <TableCell>{flow.flow_name}</TableCell>
                        <TableCell>
                          <Badge>{flow.purpose}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{flow.trigger_type}</TableCell>
                        <TableCell className="text-sm">{flow.channels}</TableCell>
                        <TableCell>
                          {flow.live ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {flow.sto ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
