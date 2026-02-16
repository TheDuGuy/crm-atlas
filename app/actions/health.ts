// @ts-nocheck
"use client";

import { supabase } from "@/lib/supabase/client";

export type MetricSnapshot = {
  id: string;
  workflow_id: string;
  flow_id: string | null;
  period_start_date: string;
  period_type: 'week' | 'month';
  channel: string;
  sends: number;
  opens: number;
  clicks: number;
  open_rate: number | null;
  click_rate: number | null;
  ctor: number | null;
  unsubs: number | null;
  unsub_rate: number | null;
  bounces: number | null;
  bounce_rate: number | null;
  complaints: number | null;
  complaint_rate: number | null;
  delivered: number | null;
  import_batch_id: string;
  source: string;
  created_at: string;
};

export type CSVRow = {
  workflow_id: string;
  period_start_date: string;
  period_type: 'week' | 'month';
  channel: string;
  sends: number;
  opens: number;
  clicks: number;
  open_rate?: number;
  click_rate?: number;
  unsubs?: number;
  unsub_rate?: number;
  bounces?: number;
  bounce_rate?: number;
  complaints?: number;
  complaint_rate?: number;
  delivered?: number;
};

export async function importMetrics(
  rows: CSVRow[],
  batchId: string
): Promise<{ success: boolean; imported: number; skipped: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      // Check if this exact metric already exists
      const { data: existing } = await supabase
        .from('metric_snapshots')
        .select('id')
        .eq('workflow_id', row.workflow_id)
        .eq('period_start_date', row.period_start_date)
        .eq('period_type', row.period_type)
        .eq('channel', row.channel)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Try to link to our flows table by iterable_id
      const { data: flow } = await supabase
        .from('flows')
        .select('id')
        .eq('iterable_id', row.workflow_id)
        .maybeSingle();

      // Calculate rates if not provided
      const open_rate = row.open_rate ?? (row.sends > 0 ? (row.opens / row.sends) * 100 : null);
      const click_rate = row.click_rate ?? (row.sends > 0 ? (row.clicks / row.sends) * 100 : null);
      const ctor = row.opens > 0 ? (row.clicks / row.opens) * 100 : null;

      // Calculate deliverability rates if not provided
      const delivered = row.delivered ?? (row.bounces ? row.sends - row.bounces : null);
      const denominator = delivered || row.sends;

      const unsub_rate = row.unsub_rate ?? (row.unsubs && row.sends > 0 ? (row.unsubs / row.sends) * 100 : null);
      const bounce_rate = row.bounce_rate ?? (row.bounces && denominator > 0 ? (row.bounces / denominator) * 100 : null);
      const complaint_rate = row.complaint_rate ?? (row.complaints && denominator > 0 ? (row.complaints / denominator) * 100 : null);

      const { error } = await supabase
        .from('metric_snapshots')
        .insert({
          workflow_id: row.workflow_id,
          flow_id: flow?.id || null,
          period_start_date: row.period_start_date,
          period_type: row.period_type,
          channel: row.channel,
          sends: row.sends,
          opens: row.opens,
          clicks: row.clicks,
          open_rate: open_rate,
          click_rate: click_rate,
          ctor: ctor,
          unsubs: row.unsubs || null,
          unsub_rate: unsub_rate,
          bounces: row.bounces || null,
          bounce_rate: bounce_rate,
          complaints: row.complaints || null,
          complaint_rate: complaint_rate,
          delivered: delivered,
          import_batch_id: batchId,
          source: 'looker_csv',
        });

      if (error) {
        errors.push(`Row ${row.workflow_id}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (err) {
      errors.push(`Row ${row.workflow_id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { success: errors.length === 0, imported, skipped, errors, importedRows: rows.filter((_, i) => i < imported) };
}

export async function getHealthMetrics(filters: {
  period_type?: 'week' | 'month';
  start_date?: string;
  end_date?: string;
  product_id?: string;
  channel?: string;
  live_only?: boolean;
}) {
  let query = supabase
    .from('metric_snapshots')
    .select(`
      *,
      flows (
        id,
        name,
        purpose,
        live,
        product_id,
        products (name)
      )
    `)
    .order('period_start_date', { ascending: false });

  if (filters.period_type) {
    query = query.eq('period_type', filters.period_type);
  }

  if (filters.start_date) {
    query = query.gte('period_start_date', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('period_start_date', filters.end_date);
  }

  if (filters.channel) {
    query = query.eq('channel', filters.channel);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Filter by product and live status (can't do in query due to join)
  let filtered = data || [];

  if (filters.product_id) {
    filtered = filtered.filter(m => (m as any).flows?.product_id === filters.product_id);
  }

  if (filters.live_only) {
    filtered = filtered.filter(m => (m as any).flows?.live === true);
  }

  return filtered;
}

export async function getWorkflowHealthDetail(workflowId: string) {
  const { data, error } = await supabase
    .from('metric_snapshots')
    .select(`
      *,
      flows (
        id,
        name,
        purpose,
        description,
        trigger_type,
        frequency,
        channels,
        live,
        sto,
        products (name)
      )
    `)
    .eq('workflow_id', workflowId)
    .order('period_start_date', { ascending: true });

  if (error) throw error;

  return data;
}

export type RAGStatus = 'green' | 'amber' | 'red' | 'unknown';

export function calculateRAG(
  current: MetricSnapshot,
  previous: MetricSnapshot | null,
  targets: {
    open_rate?: number;
    click_rate?: number;
    unsub_rate?: number;
    bounce_rate?: number;
    complaint_rate?: number;
  }
): { status: RAGStatus; reasons: string[] } {
  const reasons: string[] = [];

  // Default deliverability thresholds
  const unsubRedThreshold = targets.unsub_rate || 0.35;
  const unsubAmberThreshold = 0.20;
  const bounceRedThreshold = targets.bounce_rate || 3.0;
  const bounceAmberThreshold = 1.5;
  const complaintRedThreshold = targets.complaint_rate || 0.05;
  const complaintAmberThreshold = 0.02;

  // CRITICAL RED FLAGS - Deliverability issues take priority
  if (current.complaint_rate !== null && current.complaint_rate > complaintRedThreshold) {
    reasons.push(`Complaint rate ${current.complaint_rate.toFixed(2)}% exceeds ${complaintRedThreshold}% threshold`);
    return { status: 'red', reasons };
  }

  if (current.bounce_rate !== null && current.bounce_rate > bounceRedThreshold) {
    reasons.push(`Bounce rate ${current.bounce_rate.toFixed(1)}% exceeds ${bounceRedThreshold}% threshold`);
    return { status: 'red', reasons };
  }

  if (current.unsub_rate !== null && current.unsub_rate > unsubRedThreshold) {
    reasons.push(`Unsubscribe rate ${current.unsub_rate.toFixed(2)}% exceeds ${unsubRedThreshold}% threshold`);
    return { status: 'red', reasons };
  }

  // Calculate deltas
  const woWOpenDelta = previous && previous.open_rate && current.open_rate
    ? ((current.open_rate - previous.open_rate) / previous.open_rate) * 100
    : 0;

  const woWSendsDelta = previous && previous.sends > 0
    ? ((current.sends - previous.sends) / previous.sends) * 100
    : 0;

  // Red flags - Engagement
  if (woWOpenDelta <= -25) {
    reasons.push(`Open rate dropped ${Math.abs(woWOpenDelta).toFixed(1)}% WoW`);
    return { status: 'red', reasons };
  }

  if (woWSendsDelta >= 60 && woWOpenDelta < -10) {
    reasons.push(`Sends spiked ${woWSendsDelta.toFixed(1)}% with engagement drop`);
    return { status: 'red', reasons };
  }

  if (current.open_rate && targets.open_rate && current.open_rate < (targets.open_rate * 0.7)) {
    reasons.push(`Open rate ${current.open_rate.toFixed(1)}% below red threshold`);
    return { status: 'red', reasons };
  }

  // Amber flags - Deliverability warnings
  if (current.complaint_rate !== null && current.complaint_rate > complaintAmberThreshold) {
    reasons.push(`Complaint rate ${current.complaint_rate.toFixed(2)}% above ${complaintAmberThreshold}% threshold`);
    return { status: 'amber', reasons };
  }

  if (current.bounce_rate !== null && current.bounce_rate > bounceAmberThreshold) {
    reasons.push(`Bounce rate ${current.bounce_rate.toFixed(1)}% above ${bounceAmberThreshold}% threshold`);
    return { status: 'amber', reasons };
  }

  if (current.unsub_rate !== null && current.unsub_rate > unsubAmberThreshold) {
    reasons.push(`Unsubscribe rate ${current.unsub_rate.toFixed(2)}% above ${unsubAmberThreshold}% threshold`);
    return { status: 'amber', reasons };
  }

  // Amber flags - Engagement
  if (woWOpenDelta <= -15 && woWOpenDelta > -25) {
    reasons.push(`Open rate dropped ${Math.abs(woWOpenDelta).toFixed(1)}% WoW`);
    return { status: 'amber', reasons };
  }

  if (current.open_rate && targets.open_rate && current.open_rate < targets.open_rate && current.open_rate >= (targets.open_rate * 0.7)) {
    reasons.push(`Open rate ${current.open_rate.toFixed(1)}% below target ${targets.open_rate.toFixed(1)}%`);
    return { status: 'amber', reasons };
  }

  // Green - meeting targets
  if (current.open_rate && targets.open_rate && current.open_rate >= targets.open_rate) {
    return { status: 'green', reasons: ['Meeting targets'] };
  }

  return { status: 'unknown', reasons: ['Insufficient data'] };
}
