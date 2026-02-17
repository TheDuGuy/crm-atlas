// @ts-nocheck
"use server";

import { supabase } from "@/lib/supabase/client";

export type MissingSignal = {
  id: string;
  product_id: string;
  signal_name: string;
  signal_type: 'field' | 'event';
  description: string;
  why_missing: string;
  unlocks: string | null;
  estimated_impact: 'High' | 'Medium' | 'Low' | null;
  effort_type: 'CRM' | 'Data' | 'Backend' | 'Mixed' | null;
  status: 'idea' | 'requested' | 'in_progress' | 'live' | 'dropped';
  linked_opportunity_id: string | null;
  created_at: string;
  updated_at: string;
  opportunities?: {
    id: string;
    title: string;
  };
};

export type MissingSignalInput = {
  product_id: string;
  signal_name: string;
  signal_type: 'field' | 'event';
  description: string;
  why_missing: string;
  unlocks?: string;
  estimated_impact?: 'High' | 'Medium' | 'Low';
  effort_type?: 'CRM' | 'Data' | 'Backend' | 'Mixed';
  status?: 'idea' | 'requested' | 'in_progress' | 'live' | 'dropped';
  linked_opportunity_id?: string;
};

/**
 * Get all missing signals for a product
 */
export async function getMissingSignals(productId: string) {
  const { data, error } = await supabase
    .from('missing_signals')
    .select(`
      *,
      opportunities (
        id,
        title
      )
    `)
    .eq('product_id', productId)
    .order('estimated_impact', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a single missing signal by ID
 */
export async function getMissingSignal(id: string) {
  const { data, error } = await supabase
    .from('missing_signals')
    .select(`
      *,
      opportunities (
        id,
        title
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new missing signal
 */
export async function createMissingSignal(input: MissingSignalInput) {
  const { data, error } = await supabase
    .from('missing_signals')
    .insert({
      product_id: input.product_id,
      signal_name: input.signal_name,
      signal_type: input.signal_type,
      description: input.description,
      why_missing: input.why_missing,
      unlocks: input.unlocks || null,
      estimated_impact: input.estimated_impact || null,
      effort_type: input.effort_type || null,
      status: input.status || 'idea',
      linked_opportunity_id: input.linked_opportunity_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing missing signal
 */
export async function updateMissingSignal(id: string, updates: Partial<MissingSignalInput>) {
  const { data, error } = await supabase
    .from('missing_signals')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a missing signal
 */
export async function deleteMissingSignal(id: string) {
  const { error } = await supabase
    .from('missing_signals')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get count of missing signals per product
 */
export async function getMissingSignalsCount(productId: string): Promise<number> {
  const { count, error } = await supabase
    .from('missing_signals')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId);

  if (error) throw error;
  return count || 0;
}

/**
 * Get missing signals grouped by status
 */
export async function getMissingSignalsByStatus(productId: string) {
  const { data, error } = await supabase
    .from('missing_signals')
    .select('*')
    .eq('product_id', productId)
    .order('status');

  if (error) throw error;

  // Group by status
  const grouped: Record<string, MissingSignal[]> = {};
  for (const signal of data || []) {
    if (!grouped[signal.status]) {
      grouped[signal.status] = [];
    }
    grouped[signal.status].push(signal);
  }

  return grouped;
}
