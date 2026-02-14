"use server";

import { supabase } from "@/lib/supabase/client";

export type FlowConflict = {
  flowA: {
    id: string;
    name: string;
    product_name: string;
    trigger_type: string;
    frequency: string | null;
    channels: string[];
    priority: number | null;
    suppression_rules: string | null;
  };
  flowB: {
    id: string;
    name: string;
    product_name: string;
    trigger_type: string;
    frequency: string | null;
    channels: string[];
    priority: number | null;
    suppression_rules: string | null;
  };
  sharedChannels: string[];
  riskScore: number;
  riskFactors: string[];
};

export async function detectFlowConflicts() {
  // Get all live flows with product info
  const { data: flows, error } = await supabase
    .from("flows")
    .select(`
      id,
      name,
      product_id,
      products (name),
      trigger_type,
      frequency,
      channels,
      priority,
      suppression_rules,
      max_frequency_per_user_days
    `)
    .eq("live", true);

  if (error || !flows) {
    console.error("Error fetching flows:", error);
    return [];
  }

  const conflicts: FlowConflict[] = [];

  // Compare each pair of flows
  for (let i = 0; i < flows.length; i++) {
    for (let j = i + 1; j < flows.length; j++) {
      const flowA = flows[i] as any;
      const flowB = flows[j] as any;

      // Check if they share at least one channel
      const sharedChannels = flowA.channels.filter((ch: string) =>
        flowB.channels.includes(ch)
      );

      if (sharedChannels.length === 0) continue;

      // Check trigger type conflicts
      const isDailyConflict = isLikelyTriggerConflict(
        flowA.trigger_type,
        flowA.frequency,
        flowB.trigger_type,
        flowB.frequency
      );

      if (!isDailyConflict) continue;

      // Check priority difference
      const priorityA = flowA.priority || 50;
      const priorityB = flowB.priority || 50;
      const priorityDiff = Math.abs(priorityA - priorityB);

      // If priorities are very different (>10), less of a conflict
      if (priorityDiff > 10) continue;

      // Calculate risk score
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Both Daily frequency = high risk
      if (
        flowA.frequency?.toLowerCase().includes("daily") &&
        flowB.frequency?.toLowerCase().includes("daily")
      ) {
        riskScore += 2;
        riskFactors.push("Both Daily frequency");
      }

      // Same product = higher risk
      if (flowA.product_id === flowB.product_id) {
        riskScore += 1;
        riskFactors.push("Same product");
      }

      // Shared channel count
      riskScore += sharedChannels.length;
      riskFactors.push(`${sharedChannels.length} shared channel(s)`);

      // Missing suppression rules
      if (!flowA.suppression_rules) {
        riskScore += 1;
        riskFactors.push(`${flowA.name} missing suppression rules`);
      }
      if (!flowB.suppression_rules) {
        riskScore += 1;
        riskFactors.push(`${flowB.name} missing suppression rules`);
      }

      // Missing priorities
      if (!flowA.priority) {
        riskScore += 0.5;
        riskFactors.push(`${flowA.name} missing priority`);
      }
      if (!flowB.priority) {
        riskScore += 0.5;
        riskFactors.push(`${flowB.name} missing priority`);
      }

      // Similar priorities = conflict risk
      if (priorityDiff <= 5) {
        riskScore += 1;
        riskFactors.push("Similar priorities");
      }

      conflicts.push({
        flowA: {
          id: flowA.id,
          name: flowA.name,
          product_name: (flowA.products as any)?.name || "Unknown",
          trigger_type: flowA.trigger_type,
          frequency: flowA.frequency,
          channels: flowA.channels,
          priority: flowA.priority,
          suppression_rules: flowA.suppression_rules,
        },
        flowB: {
          id: flowB.id,
          name: flowB.name,
          product_name: (flowB.products as any)?.name || "Unknown",
          trigger_type: flowB.trigger_type,
          frequency: flowB.frequency,
          channels: flowB.channels,
          priority: flowB.priority,
          suppression_rules: flowB.suppression_rules,
        },
        sharedChannels,
        riskScore: Math.round(riskScore * 10) / 10,
        riskFactors,
      });
    }
  }

  // Sort by risk score descending
  return conflicts.sort((a, b) => b.riskScore - a.riskScore);
}

function isLikelyTriggerConflict(
  triggerA: string,
  frequencyA: string | null,
  triggerB: string,
  frequencyB: string | null
): boolean {
  const freqA = (frequencyA || "").toLowerCase();
  const freqB = (frequencyB || "").toLowerCase();

  // Both Daily = conflict
  if (freqA.includes("daily") && freqB.includes("daily")) {
    return true;
  }

  // One Daily + one Event/Profile = potential conflict
  if (
    freqA.includes("daily") &&
    (triggerB === "event_based" || freqB.includes("profile"))
  ) {
    return true;
  }

  if (
    freqB.includes("daily") &&
    (triggerA === "event_based" || freqA.includes("profile"))
  ) {
    return true;
  }

  // Both event_based = potential conflict
  if (triggerA === "event_based" && triggerB === "event_based") {
    return true;
  }

  return false;
}

export async function getConflictSummary() {
  const conflicts = await detectFlowConflicts();

  return {
    totalConflicts: conflicts.length,
    topConflicts: conflicts.slice(0, 5),
    highRiskCount: conflicts.filter((c) => c.riskScore >= 5).length,
    mediumRiskCount: conflicts.filter((c) => c.riskScore >= 3 && c.riskScore < 5)
      .length,
    lowRiskCount: conflicts.filter((c) => c.riskScore < 3).length,
  };
}
