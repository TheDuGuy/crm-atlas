// @ts-nocheck
"use server";

import { supabase } from "@/lib/supabase/client";

export type HealthFlag = {
  id: string;
  workflow_id: string;
  product_id: string | null;
  channel: string;
  period_type: 'week' | 'month';
  period_start_date: string;
  metric_name: string;
  value: number | null;
  target: number | null;
  status: 'green' | 'amber' | 'red' | 'unknown';
  reason: string;
  delta_wow: number | null;
  delta_mom: number | null;
  computed_at: string;
};

export type HealthConfig = {
  amber_floor: number;
  wow_amber_drop: number;
  wow_red_drop: number;
  rollup_strategy: 'worst_of' | 'weighted';
};

export type Target = {
  target_value: number;
  amber_floor: number;
  red_floor: number | null;
};

/**
 * Resolve product_id for a workflow_id
 * Priority: workflow_product_map > flows.product_id > null
 */
export async function resolveProductId(workflowId: string): Promise<string | null> {
  // Try workflow_product_map first
  const { data: mapping } = await supabase
    .from('workflow_product_map')
    .select('product_id')
    .eq('workflow_id', workflowId)
    .maybeSingle();

  if (mapping?.product_id) {
    return mapping.product_id;
  }

  // Fallback to flows table via iterable_id
  const { data: flow } = await supabase
    .from('flows')
    .select('product_id')
    .eq('iterable_id', workflowId)
    .maybeSingle();

  return flow?.product_id || null;
}

/**
 * Get global health config
 */
export async function getHealthConfig(): Promise<HealthConfig> {
  const { data } = await supabase
    .from('health_config')
    .select('*')
    .limit(1)
    .maybeSingle();

  return data || {
    amber_floor: 0.7,
    wow_amber_drop: 0.15,
    wow_red_drop: 0.25,
    rollup_strategy: 'worst_of',
  };
}

/**
 * Get applicable target for a metric using the Postgres function
 */
export async function getApplicableTarget(
  metricName: string,
  workflowId: string,
  productId: string | null,
  channel: string,
  periodType: 'week' | 'month',
  periodDate: string
): Promise<Target | null> {
  const { data, error } = await supabase.rpc('get_applicable_target', {
    p_metric_name: metricName,
    p_workflow_id: workflowId,
    p_product_id: productId,
    p_channel: channel,
    p_period_type: periodType,
    p_period_date: periodDate,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

/**
 * Calculate delta for a metric between current and previous period
 */
async function calculateDelta(
  workflowId: string,
  channel: string,
  periodType: 'week' | 'month',
  currentDate: string,
  metricField: string
): Promise<{ delta_wow: number | null; delta_mom: number | null }> {
  // Get current value
  const { data: current } = await supabase
    .from('metric_snapshots')
    .select(metricField)
    .eq('workflow_id', workflowId)
    .eq('channel', channel)
    .eq('period_type', periodType)
    .eq('period_start_date', currentDate)
    .maybeSingle();

  if (!current || current[metricField] === null) {
    return { delta_wow: null, delta_mom: null };
  }

  const currentValue = parseFloat(current[metricField]);

  // Calculate previous period date
  const currentDateObj = new Date(currentDate);
  const prevDateWow = new Date(currentDateObj);
  prevDateWow.setDate(prevDateWow.getDate() - (periodType === 'week' ? 7 : 30));

  const prevDateMom = new Date(currentDateObj);
  prevDateMom.setMonth(prevDateMom.getMonth() - 1);

  // Get WoW previous
  const { data: prevWow } = await supabase
    .from('metric_snapshots')
    .select(metricField)
    .eq('workflow_id', workflowId)
    .eq('channel', channel)
    .eq('period_type', periodType)
    .eq('period_start_date', prevDateWow.toISOString().split('T')[0])
    .maybeSingle();

  // Get MoM previous (only for monthly)
  let delta_mom = null;
  if (periodType === 'month') {
    const { data: prevMom } = await supabase
      .from('metric_snapshots')
      .select(metricField)
      .eq('workflow_id', workflowId)
      .eq('channel', channel)
      .eq('period_type', periodType)
      .eq('period_start_date', prevDateMom.toISOString().split('T')[0])
      .maybeSingle();

    if (prevMom && prevMom[metricField] !== null) {
      const prevValue = parseFloat(prevMom[metricField]);
      delta_mom = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : null;
    }
  }

  let delta_wow = null;
  if (prevWow && prevWow[metricField] !== null) {
    const prevValue = parseFloat(prevWow[metricField]);
    delta_wow = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : null;
  }

  return { delta_wow, delta_mom };
}

/**
 * Evaluate RAG status for a metric
 */
function evaluateRAG(
  metricName: string,
  value: number | null,
  target: Target | null,
  deltaWow: number | null,
  config: HealthConfig
): { status: 'green' | 'amber' | 'red' | 'unknown'; reason: string } {
  if (value === null) {
    return { status: 'unknown', reason: 'No data available' };
  }

  if (!target) {
    // No target configured - use delta-only evaluation
    if (deltaWow !== null) {
      if (deltaWow <= -config.wow_red_drop * 100) {
        return { status: 'red', reason: `${metricName} dropped ${Math.abs(deltaWow).toFixed(1)}% WoW (no target)` };
      }
      if (deltaWow <= -config.wow_amber_drop * 100) {
        return { status: 'amber', reason: `${metricName} dropped ${Math.abs(deltaWow).toFixed(1)}% WoW (no target)` };
      }
    }
    return { status: 'unknown', reason: 'No target configured' };
  }

  const targetValue = target.target_value;
  const amberFloor = target.amber_floor;
  const redFloor = target.red_floor || (amberFloor * 0.7); // Default red floor

  // Guardrail metrics (lower is better)
  if (['unsub_rate', 'bounce_rate', 'complaint_rate'].includes(metricName)) {
    // Red: value > target / amber_floor OR spike > red threshold
    if (value > targetValue / amberFloor || (deltaWow !== null && deltaWow >= config.wow_red_drop * 100)) {
      return {
        status: 'red',
        reason: `${metricName} ${value.toFixed(2)}% exceeds critical threshold${deltaWow ? ` (${deltaWow > 0 ? '+' : ''}${deltaWow.toFixed(1)}% WoW)` : ''}`,
      };
    }

    // Amber: value > target OR spike > amber threshold
    if (value > targetValue || (deltaWow !== null && deltaWow >= config.wow_amber_drop * 100)) {
      return {
        status: 'amber',
        reason: `${metricName} ${value.toFixed(2)}% above target ${targetValue.toFixed(2)}%${deltaWow ? ` (${deltaWow > 0 ? '+' : ''}${deltaWow.toFixed(1)}% WoW)` : ''}`,
      };
    }

    // Green
    return { status: 'green', reason: 'Meeting target' };
  }

  // Engagement metrics (higher is better: open_rate, click_rate)
  if (['open_rate', 'click_rate'].includes(metricName)) {
    // Red: value < target * red_floor OR WoW drop >= red threshold
    if (value < targetValue * redFloor || (deltaWow !== null && deltaWow <= -config.wow_red_drop * 100)) {
      return {
        status: 'red',
        reason: `${metricName} ${value.toFixed(1)}% critically low${deltaWow ? ` (${deltaWow.toFixed(1)}% WoW)` : ''}`,
      };
    }

    // Amber: value < target * amber_floor OR WoW drop >= amber threshold
    if (value < targetValue * amberFloor || (deltaWow !== null && deltaWow <= -config.wow_amber_drop * 100)) {
      return {
        status: 'amber',
        reason: `${metricName} ${value.toFixed(1)}% below target ${targetValue.toFixed(1)}%${deltaWow ? ` (${deltaWow.toFixed(1)}% WoW)` : ''}`,
      };
    }

    // Green
    return { status: 'green', reason: 'Meeting target' };
  }

  // Default unknown for other metrics
  return { status: 'unknown', reason: `Metric ${metricName} evaluation not configured` };
}

/**
 * Compute and persist health flags for a specific metric snapshot
 */
export async function computeHealthFlags(
  workflowId: string,
  channel: string,
  periodType: 'week' | 'month',
  periodDate: string
): Promise<void> {
  // Get product mapping
  const productId = await resolveProductId(workflowId);

  // Get config
  const config = await getHealthConfig();

  // Get metric snapshot
  const { data: snapshot } = await supabase
    .from('metric_snapshots')
    .select('*')
    .eq('workflow_id', workflowId)
    .eq('channel', channel)
    .eq('period_type', periodType)
    .eq('period_start_date', periodDate)
    .maybeSingle();

  if (!snapshot) {
    console.warn(`No snapshot found for ${workflowId} ${channel} ${periodType} ${periodDate}`);
    return;
  }

  // Metrics to evaluate
  const metrics = [
    { name: 'open_rate', field: 'open_rate' },
    { name: 'click_rate', field: 'click_rate' },
    { name: 'unsub_rate', field: 'unsub_rate' },
    { name: 'bounce_rate', field: 'bounce_rate' },
    { name: 'complaint_rate', field: 'complaint_rate' },
  ];

  const flags = [];

  for (const metric of metrics) {
    const value = snapshot[metric.field];

    if (value === null || value === undefined) {
      continue; // Skip metrics without data
    }

    // Get applicable target
    const target = await getApplicableTarget(
      metric.name,
      workflowId,
      productId,
      channel,
      periodType,
      periodDate
    );

    // Calculate deltas
    const { delta_wow, delta_mom } = await calculateDelta(
      workflowId,
      channel,
      periodType,
      periodDate,
      metric.field
    );

    // Evaluate RAG
    const rag = evaluateRAG(metric.name, value, target, delta_wow, config);

    // Prepare flag
    flags.push({
      workflow_id: workflowId,
      product_id: productId,
      channel: channel,
      period_type: periodType,
      period_start_date: periodDate,
      metric_name: metric.name,
      value: value,
      target: target?.target_value || null,
      status: rag.status,
      reason: rag.reason,
      delta_wow: delta_wow,
      delta_mom: delta_mom,
    });
  }

  // Upsert flags
  if (flags.length > 0) {
    const { error } = await supabase
      .from('health_flags')
      .upsert(flags, {
        onConflict: 'workflow_id,channel,period_type,period_start_date,metric_name',
      });

    if (error) {
      console.error('Error upserting health flags:', error);
    }
  }
}

/**
 * Recompute health flags for all snapshots in a given period range
 */
export async function recomputeHealthFlagsForPeriod(
  startDate: string,
  endDate: string
): Promise<{ processed: number; errors: number }> {
  // Get all unique workflow/channel/period combinations in date range
  const { data: snapshots } = await supabase
    .from('metric_snapshots')
    .select('workflow_id, channel, period_type, period_start_date')
    .gte('period_start_date', startDate)
    .lte('period_start_date', endDate);

  if (!snapshots) {
    return { processed: 0, errors: 0 };
  }

  let processed = 0;
  let errors = 0;

  // Process each unique combination
  const unique = Array.from(
    new Set(snapshots.map(s => `${s.workflow_id}|${s.channel}|${s.period_type}|${s.period_start_date}`))
  );

  for (const key of unique) {
    const [workflowId, channel, periodType, periodDate] = key.split('|');
    try {
      await computeHealthFlags(workflowId, channel, periodType as 'week' | 'month', periodDate);
      processed++;
    } catch (error) {
      console.error(`Error computing flags for ${key}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}

/**
 * Get pulse scorecard data grouped by product
 */
export async function getPulseScorecard(filters: {
  period_type: 'week' | 'month';
  period_date: string;
  channels?: string[];
  live_only?: boolean;
}) {
  let query = supabase
    .from('v_latest_health_metrics')
    .select('*')
    .eq('period_type', filters.period_type)
    .eq('period_start_date', filters.period_date);

  if (filters.channels && filters.channels.length > 0) {
    query = query.in('channel', filters.channels);
  }

  const { data: metrics } = await query;

  if (!metrics) return [];

  // Get health flags for this period
  const { data: flags } = await supabase
    .from('health_flags')
    .select('*')
    .eq('period_type', filters.period_type)
    .eq('period_start_date', filters.period_date);

  // Group by product
  const grouped = new Map();

  for (const metric of metrics) {
    if (filters.live_only && !metric.flow_live) {
      continue;
    }

    const productId = metric.product_id || 'unassigned';
    const productName = metric.product_name || 'Unassigned';

    if (!grouped.has(productId)) {
      grouped.set(productId, {
        product_id: productId,
        product_name: productName,
        workflows: [],
        sends: 0,
        opens: 0,
        clicks: 0,
        unsubs: 0,
        bounces: 0,
        complaints: 0,
        flags: [],
      });
    }

    const product = grouped.get(productId);
    product.workflows.push(metric);
    product.sends += metric.sends || 0;
    product.opens += metric.opens || 0;
    product.clicks += metric.clicks || 0;
    product.unsubs += metric.unsubs || 0;
    product.bounces += metric.bounces || 0;
    product.complaints += metric.complaints || 0;

    // Collect flags for this workflow
    const workflowFlags = flags?.filter(
      f => f.workflow_id === metric.workflow_id && f.channel === metric.channel
    ) || [];
    product.flags.push(...workflowFlags);
  }

  // Calculate aggregated rates and overall status
  return Array.from(grouped.values()).map(product => {
    const open_rate = product.sends > 0 ? (product.opens / product.sends) * 100 : null;
    const click_rate = product.sends > 0 ? (product.clicks / product.sends) * 100 : null;
    const unsub_rate = product.sends > 0 ? (product.unsubs / product.sends) * 100 : null;
    const bounce_rate = product.sends > 0 ? (product.bounces / product.sends) * 100 : null;
    const complaint_rate = product.sends > 0 ? (product.complaints / product.sends) * 100 : null;

    // Overall status: worst of key metrics
    const keyMetrics = ['open_rate', 'click_rate', 'unsub_rate', 'bounce_rate', 'complaint_rate'];
    const statusPriority = { red: 3, amber: 2, green: 1, unknown: 0 };
    let overallStatus = 'unknown';
    let worstPriority = 0;

    for (const flag of product.flags) {
      if (keyMetrics.includes(flag.metric_name)) {
        const priority = statusPriority[flag.status] || 0;
        if (priority > worstPriority) {
          worstPriority = priority;
          overallStatus = flag.status;
        }
      }
    }

    // Generate watchouts
    const watchouts = [];
    const redWorkflows = product.flags.filter(f => f.status === 'red').length;
    if (redWorkflows > 0) {
      watchouts.push(`${redWorkflows} workflow(s) in red status`);
    }

    const complaintFlags = product.flags.filter(f => f.metric_name === 'complaint_rate' && f.status !== 'green');
    if (complaintFlags.length > 0) {
      watchouts.push('Deliverability risk detected');
    }

    // Biggest WoW drop
    const openRateFlags = product.flags.filter(f => f.metric_name === 'open_rate' && f.delta_wow !== null);
    if (openRateFlags.length > 0) {
      const biggestDrop = Math.min(...openRateFlags.map(f => f.delta_wow));
      if (biggestDrop < -10) {
        watchouts.push(`Open rate dropped ${Math.abs(biggestDrop).toFixed(1)}% WoW`);
      }
    }

    return {
      ...product,
      open_rate,
      click_rate,
      unsub_rate,
      bounce_rate,
      complaint_rate,
      overall_status: overallStatus,
      watchouts: watchouts.slice(0, 3), // Top 3
    };
  });
}
