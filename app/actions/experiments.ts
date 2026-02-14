"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";
import { ExperimentStatus, ExperimentDesignType } from "@/lib/supabase/types";

export async function getExperiments() {
  const { data, error } = await supabase
    .from("experiments")
    .select(`
      *,
      opportunities (title, product_id, products (name)),
      flows (name)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching experiments:", error);
    return [];
  }

  return data;
}

export async function getExperiment(id: string) {
  const { data, error } = await supabase
    .from("experiments")
    .select(`
      *,
      opportunities (title, product_id, products (name)),
      flows (name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching experiment:", error);
    return null;
  }

  return data;
}

export async function getExperimentsByOpportunity(opportunityId: string) {
  const { data, error } = await supabase
    .from("experiments")
    .select(`
      *,
      flows (name)
    `)
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching experiments:", error);
    return [];
  }

  return data;
}

export async function createExperiment(formData: {
  title: string;
  opportunity_id: string;
  status?: ExperimentStatus;
  linked_flow_id?: string;
  hypothesis?: string;
  primary_kpi?: string;
  secondary_kpis?: string;
  guardrails?: string;
  design_type?: ExperimentDesignType;
  eligibility?: string;
  exposure_definition?: string;
  success_criteria?: string;
  start_date?: string;
  end_date?: string;
  analysis_link?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("experiments")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating experiment:", error);
    throw new Error(error.message);
  }

  revalidatePath("/experiments");
  revalidatePath(`/opportunities/${formData.opportunity_id}`);
  return data;
}

export async function updateExperiment(
  id: string,
  formData: Partial<{
    title: string;
    status: ExperimentStatus;
    opportunity_id: string;
    linked_flow_id: string;
    hypothesis: string;
    primary_kpi: string;
    secondary_kpis: string;
    guardrails: string;
    design_type: ExperimentDesignType;
    eligibility: string;
    exposure_definition: string;
    success_criteria: string;
    start_date: string;
    end_date: string;
    analysis_link: string;
  }>
) {
  const { data, error } = await (supabase as any)
    .from("experiments")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating experiment:", error);
    throw new Error(error.message);
  }

  revalidatePath("/experiments");
  revalidatePath(`/experiments/${id}`);
  return data;
}

export async function deleteExperiment(id: string) {
  const { error } = await supabase.from("experiments").delete().eq("id", id);

  if (error) {
    console.error("Error deleting experiment:", error);
    throw new Error(error.message);
  }

  revalidatePath("/experiments");
}

export async function getExperimentStats() {
  const { data, error } = await supabase.from("experiments").select("status");

  if (error) {
    console.error("Error fetching experiment stats:", error);
    return {
      draft: 0,
      ready: 0,
      running: 0,
      readout: 0,
      shipped: 0,
      killed: 0,
    };
  }

  const stats = {
    draft: 0,
    ready: 0,
    running: 0,
    readout: 0,
    shipped: 0,
    killed: 0,
  };

  data.forEach((exp: any) => {
    if (exp.status in stats) {
      stats[exp.status as keyof typeof stats]++;
    }
  });

  return stats;
}
