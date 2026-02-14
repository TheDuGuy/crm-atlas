"use server";

import { supabase } from "@/lib/supabase/client";

export async function getDashboardStats() {
  const [
    { count: productsCount },
    { count: fieldsCount },
    { count: eventsCount },
    { count: flowsCount },
    { count: liveFlowsCount },
    { count: opportunitiesCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("fields").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("flows").select("*", { count: "exact", head: true }),
    supabase.from("flows").select("*", { count: "exact", head: true }).eq("live", true),
    supabase.from("opportunities").select("*", { count: "exact", head: true }),
  ]);

  return {
    products: productsCount ?? 0,
    fields: fieldsCount ?? 0,
    events: eventsCount ?? 0,
    flows: flowsCount ?? 0,
    liveFlows: liveFlowsCount ?? 0,
    opportunities: opportunitiesCount ?? 0,
  };
}

export async function getAllLiveFlows() {
  const { data, error } = await supabase
    .from("flows")
    .select(`
      *,
      products (name)
    `)
    .eq("live", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching live flows:", error);
    return [];
  }

  return data;
}

export async function getTopOpportunities() {
  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      products (name),
      flows:linked_flow_id (name)
    `)
    .not("impact", "is", null)
    .not("effort", "is", null)
    .order("impact", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching top opportunities:", error);
    return [];
  }

  if (!data) return [];

  return data.map((opp: any) => ({
    ...opp,
    ratio: opp.impact && opp.effort ? opp.impact / opp.effort : 0,
  }));
}
