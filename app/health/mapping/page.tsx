// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { resolveProductId } from "@/app/actions/health-v2";

type WorkflowMapping = {
  workflow_id: string;
  workflow_name: string | null;
  inferred_product_id: string | null;
  inferred_product_name: string | null;
  mapped_product_id: string | null;
  mapped_product_name: string | null;
};

export default function MappingPage() {
  const [mappings, setMappings] = useState<WorkflowMapping[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadMappings();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .order('name');

    setProducts(data || []);
  };

  const loadMappings = async () => {
    setLoading(true);

    // Get all unique workflow_ids from metric_snapshots
    const { data: snapshots } = await supabase
      .from('metric_snapshots')
      .select('workflow_id')
      .order('workflow_id');

    if (!snapshots) {
      setLoading(false);
      return;
    }

    const uniqueWorkflows = Array.from(new Set(snapshots.map(s => s.workflow_id)));

    // Get existing mappings
    const { data: existingMappings } = await supabase
      .from('workflow_product_map')
      .select('workflow_id, product_id, products(name)');

    // Get flows for inference
    const { data: flows } = await supabase
      .from('flows')
      .select('iterable_id, name, product_id, products(name)');

    // Build mapping list
    const mappingList: WorkflowMapping[] = uniqueWorkflows.map(workflowId => {
      const existingMap = existingMappings?.find(m => m.workflow_id === workflowId);
      const flow = flows?.find(f => f.iterable_id === workflowId);

      return {
        workflow_id: workflowId,
        workflow_name: flow?.name || null,
        inferred_product_id: flow?.product_id || null,
        inferred_product_name: flow?.products?.name || null,
        mapped_product_id: existingMap?.product_id || null,
        mapped_product_name: existingMap?.products?.name || null,
      };
    });

    setMappings(mappingList);
    setLoading(false);
  };

  const handleUpdateMapping = async (workflowId: string, productId: string) => {
    if (!productId) return;

    setSaving(workflowId);

    const { error } = await supabase
      .from('workflow_product_map')
      .upsert({
        workflow_id: workflowId,
        product_id: productId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workflow_id',
      });

    if (error) {
      console.error('Error updating mapping:', error);
      alert('Failed to update mapping');
    } else {
      // Reload to get updated product name
      await loadMappings();
    }

    setSaving(null);
  };

  const handleRemoveMapping = async (workflowId: string) => {
    if (!confirm('Remove this mapping? The workflow will fall back to inferred product.')) return;

    await supabase
      .from('workflow_product_map')
      .delete()
      .eq('workflow_id', workflowId);

    loadMappings();
  };

  const handleBulkInfer = async () => {
    if (!confirm('Apply inferred product mappings for all workflows that have flow data?')) return;

    const toInsert = mappings
      .filter(m => !m.mapped_product_id && m.inferred_product_id)
      .map(m => ({
        workflow_id: m.workflow_id,
        product_id: m.inferred_product_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    if (toInsert.length > 0) {
      await supabase.from('workflow_product_map').insert(toInsert);
      loadMappings();
    }
  };

  const getEffectiveProduct = (mapping: WorkflowMapping) => {
    return {
      id: mapping.mapped_product_id || mapping.inferred_product_id,
      name: mapping.mapped_product_name || mapping.inferred_product_name,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow → Product Mapping</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Map Iterable workflow IDs to products for rollup reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMappings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleBulkInfer}>
            Apply Inferred Mappings
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Workflow Mappings
          </CardTitle>
          <CardDescription>
            {mappings.length} workflows • {mappings.filter(m => m.mapped_product_id).length} mapped • {mappings.filter(m => m.inferred_product_id && !m.mapped_product_id).length} inferred
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : mappings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500">No workflows found. Import health metrics to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Workflow ID</th>
                    <th className="px-4 py-3 text-left">Workflow Name</th>
                    <th className="px-4 py-3 text-left">Inferred Product</th>
                    <th className="px-4 py-3 text-left">Mapped Product</th>
                    <th className="px-4 py-3 text-left">Effective Product</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping) => {
                    const effective = getEffectiveProduct(mapping);
                    return (
                      <tr key={mapping.workflow_id} className="border-t">
                        <td className="px-4 py-3 font-mono text-xs">{mapping.workflow_id}</td>
                        <td className="px-4 py-3">{mapping.workflow_name || '-'}</td>
                        <td className="px-4 py-3">
                          {mapping.inferred_product_name ? (
                            <Badge variant="outline">{mapping.inferred_product_name}</Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {mapping.mapped_product_id ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800">{mapping.mapped_product_name}</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMapping(mapping.workflow_id)}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value={mapping.mapped_product_id || ''}
                              onValueChange={(v) => handleUpdateMapping(mapping.workflow_id, v)}
                              disabled={saving === mapping.workflow_id}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Assign product..." />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {effective.name ? (
                            <Badge variant={mapping.mapped_product_id ? 'default' : 'secondary'}>
                              {effective.name}
                            </Badge>
                          ) : (
                            <span className="text-amber-600">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {saving === mapping.workflow_id && (
                            <span className="text-xs text-slate-500">Saving...</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
