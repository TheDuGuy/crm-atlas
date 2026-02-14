"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";
import { ChannelType, FlowPurpose, TriggerType } from "@/lib/supabase/types";

export async function getFlows() {
  const { data, error } = await supabase
    .from("flows")
    .select(`
      *,
      products (name)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching flows:", error);
    return [];
  }

  return data;
}

export async function getFlow(id: string): Promise<any> {
  const { data, error } = await supabase
    .from("flows")
    .select(`
      *,
      products (name),
      flow_field_dependencies (
        fields (id, name, description)
      ),
      flow_event_dependencies (
        events (id, name, description)
      ),
      flow_deeplinks (
        deeplinks (id, channel, url, description)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching flow:", error);
    return null;
  }

  return data as any;
}

export async function createFlow(formData: {
  product_id: string;
  name: string;
  purpose: FlowPurpose;
  description?: string;
  trigger_type: TriggerType;
  trigger_logic?: string;
  frequency?: string;
  channels: ChannelType[];
  live?: boolean;
  sto?: boolean;
  iterable_id?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("flows")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating flow:", error);
    throw new Error(error.message);
  }

  revalidatePath("/flows");
  return data;
}

export async function updateFlow(
  id: string,
  formData: Partial<{
    product_id: string;
    name: string;
    purpose: FlowPurpose;
    description: string;
    trigger_type: TriggerType;
    trigger_logic: string;
    frequency: string;
    channels: ChannelType[];
    live: boolean;
    sto: boolean;
    iterable_id: string;
    priority: number;
    max_frequency_per_user_days: number;
    suppression_rules: string;
  }>
) {
  const { data, error } = await (supabase as any)
    .from("flows")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating flow:", error);
    throw new Error(error.message);
  }

  revalidatePath("/flows");
  revalidatePath(`/flows/${id}`);
  return data;
}

export async function deleteFlow(id: string) {
  const { error } = await supabase.from("flows").delete().eq("id", id);

  if (error) {
    console.error("Error deleting flow:", error);
    throw new Error(error.message);
  }

  revalidatePath("/flows");
}
