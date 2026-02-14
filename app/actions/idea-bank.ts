"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";
import {
  IdeaType,
  IdeaGoal,
  IdeaStatus,
  MessageAngle,
  TriggerType,
  ChannelType,
} from "@/lib/supabase/types";
import { createOpportunity } from "./opportunities";

export async function getIdeas() {
  const { data, error } = await supabase
    .from("idea_bank")
    .select(`
      *,
      products (name),
      flows (name),
      deeplinks (channel, url)
    `)
    .order("expected_impact", { ascending: false });

  if (error) {
    console.error("Error fetching ideas:", error);
    return [];
  }

  return data;
}

export async function getIdea(id: string) {
  const { data, error } = await supabase
    .from("idea_bank")
    .select(`
      *,
      products (name),
      flows (name),
      deeplinks (channel, url, description)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching idea:", error);
    return null;
  }

  return data;
}

export async function createIdea(formData: {
  title: string;
  type: IdeaType;
  goal: IdeaGoal;
  product_id?: string;
  audience_logic?: string;
  suggested_trigger_type?: TriggerType;
  channels?: ChannelType[];
  message_angle?: MessageAngle;
  deeplink_id?: string;
  copy_notes?: string;
  effort?: number;
  expected_impact?: number;
  confidence?: number;
  status?: IdeaStatus;
  owner?: string;
  related_flow_id?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("idea_bank")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating idea:", error);
    throw new Error(error.message);
  }

  revalidatePath("/idea-bank");
  return data;
}

export async function updateIdea(
  id: string,
  formData: Partial<{
    title: string;
    type: IdeaType;
    goal: IdeaGoal;
    product_id: string;
    audience_logic: string;
    suggested_trigger_type: TriggerType;
    channels: ChannelType[];
    message_angle: MessageAngle;
    deeplink_id: string;
    copy_notes: string;
    effort: number;
    expected_impact: number;
    confidence: number;
    status: IdeaStatus;
    last_used_at: string;
    owner: string;
    related_flow_id: string;
  }>
) {
  const { data, error } = await (supabase as any)
    .from("idea_bank")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating idea:", error);
    throw new Error(error.message);
  }

  revalidatePath("/idea-bank");
  revalidatePath(`/idea-bank/${id}`);
  return data;
}

export async function deleteIdea(id: string) {
  const { error } = await supabase.from("idea_bank").delete().eq("id", id);

  if (error) {
    console.error("Error deleting idea:", error);
    throw new Error(error.message);
  }

  revalidatePath("/idea-bank");
}

export async function getTopIdeas(limit: number = 5) {
  const { data, error } = await supabase
    .from("idea_bank")
    .select(`
      *,
      products (name)
    `)
    .eq("status", "ready")
    .not("expected_impact", "is", null)
    .not("effort", "is", null)
    .order("expected_impact", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top ideas:", error);
    return [];
  }

  // Calculate impact/effort ratio and sort
  return data
    .map((idea) => ({
      ...idea,
      ratio: idea.expected_impact && idea.effort ? idea.expected_impact / idea.effort : 0,
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, limit);
}

export async function seedStarterIdeas() {
  const starterIdeas = [
    {
      title: "Payment Links Welcome Series",
      type: "one_off" as IdeaType,
      goal: "activation" as IdeaGoal,
      audience_logic: "New PL users who created account but haven't sent first link",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      copy_notes: "Show real merchant success story + 3 simple steps to create first link",
      effort: 2,
      expected_impact: 4,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Growth Team",
    },
    {
      title: "TTP Transaction Drop Recovery",
      type: "reactive" as IdeaType,
      goal: "recovery" as IdeaGoal,
      audience_logic: "Merchants with 50%+ drop in TTP volume week-over-week",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "urgency" as MessageAngle,
      copy_notes:
        "Alert about volume drop + offer support call. Include quick tips to drive transactions",
      effort: 3,
      expected_impact: 5,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Retention Team",
    },
    {
      title: "Card Reader Upsell for High-Volume PL Users",
      type: "burst" as IdeaType,
      goal: "cross_sell" as IdeaGoal,
      audience_logic: "PL users with >$10k monthly volume, no card reader purchased",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      copy_notes:
        "Position as natural next step. Highlight in-person payment benefits + limited-time discount",
      effort: 2,
      expected_impact: 3,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Cross-sell Team",
    },
    {
      title: "NDS Feature Announcement Blast",
      type: "one_off" as IdeaType,
      goal: "education" as IdeaGoal,
      audience_logic: "All NDS merchants who haven't used feature X",
      suggested_trigger_type: "manual_send" as TriggerType,
      channels: ["email", "push", "in_app"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      copy_notes: "Focus on time saved and new capability unlocked. Include video demo",
      effort: 2,
      expected_impact: 3,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Product Marketing",
    },
    {
      title: "Sell More Online Quick Win Tips",
      type: "seasonal" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "SMO users approaching peak season (Q4)",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      copy_notes:
        "Seasonal prep checklist: inventory, promotions, shipping settings. Use urgency for timing",
      effort: 3,
      expected_impact: 4,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Lifecycle Marketing",
    },
    {
      title: "TIC Dormant User Re-engagement",
      type: "winback" as IdeaType,
      goal: "winback" as IdeaGoal,
      audience_logic: "TIC users with no activity in 60+ days",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "urgency" as MessageAngle,
      copy_notes:
        "What's new since they left + exclusive offer to come back. Keep it short and personal",
      effort: 2,
      expected_impact: 3,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Retention Team",
    },
    {
      title: "Sell in Person First Transaction Celebration",
      type: "one_off" as IdeaType,
      goal: "activation" as IdeaGoal,
      audience_logic: "SIP merchants who completed first in-person transaction",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      copy_notes:
        "Celebrate milestone + next steps: tip settings, reporting, additional hardware",
      effort: 2,
      expected_impact: 4,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Onboarding Team",
    },
    {
      title: "Payment Links Volume Milestone Rewards",
      type: "burst" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "PL users hitting $5k, $25k, $100k total volume milestones",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "proof" as MessageAngle,
      copy_notes: "Celebrate achievement with stats + unlock advanced features or perks",
      effort: 3,
      expected_impact: 3,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Growth Team",
    },
    {
      title: "TTP Setup Abandonment Recovery",
      type: "reactive" as IdeaType,
      goal: "activation" as IdeaGoal,
      audience_logic: "Started TTP setup flow but didn't complete within 24h",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      copy_notes: "Identify common drop-off point and address objection. Offer setup support",
      effort: 3,
      expected_impact: 5,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Activation Team",
    },
    {
      title: "Card Reader Accessories Cross-sell",
      type: "one_off" as IdeaType,
      goal: "cross_sell" as IdeaGoal,
      audience_logic: "Card Reader owners without stands/cases purchased",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      copy_notes: "Professional setup positioning + bundle discount",
      effort: 1,
      expected_impact: 2,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Hardware Team",
    },
    {
      title: "NDS Feature Usage Leaderboard",
      type: "seasonal" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "Active NDS merchants (monthly campaign)",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "proof" as MessageAngle,
      copy_notes:
        "Monthly power user spotlight + tips from top merchants. Gamification element",
      effort: 3,
      expected_impact: 3,
      confidence: 3,
      status: "needs_review" as IdeaStatus,
      owner: "Community Team",
    },
    {
      title: "SMO Holiday Promotion Templates",
      type: "seasonal" as IdeaType,
      goal: "education" as IdeaGoal,
      audience_logic: "SMO users 2 weeks before major holidays",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      copy_notes: "Pre-built promotion templates + timing best practices + merchant examples",
      effort: 4,
      expected_impact: 4,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Product Marketing",
    },
    {
      title: "TIC Integration Feature Discovery",
      type: "burst" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "TIC users not using any integrations",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      copy_notes: "Top 3 integrations for their business type + easy setup guide",
      effort: 3,
      expected_impact: 4,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Integrations Team",
    },
    {
      title: "Multi-Product Bundle Offer",
      type: "burst" as IdeaType,
      goal: "cross_sell" as IdeaGoal,
      audience_logic: "Single-product users with high engagement scores",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      copy_notes:
        "Show how combining products creates complete solution. Limited-time bundle pricing",
      effort: 4,
      expected_impact: 5,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Cross-sell Team",
    },
    {
      title: "Low-Activity Warning + Support Offer",
      type: "reactive" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "Users with declining activity (50%+ drop over 2 weeks)",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "urgency" as MessageAngle,
      copy_notes:
        "Proactive reach out: 'Noticed you've been less active' + offer help + quick wins",
      effort: 3,
      expected_impact: 4,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Retention Team",
    },
  ];

  // Get products to link ideas
  const { data: products } = await supabase.from("products").select("id, name");

  const productMap: Record<string, string> = {};
  products?.forEach((p: any) => {
    productMap[p.name.toLowerCase()] = p.id;
  });

  // Add product_id based on title keywords
  const ideasWithProducts = starterIdeas.map((idea) => {
    const title = idea.title.toLowerCase();
    let product_id = null;

    if (title.includes("payment link") || title.includes(" pl ")) {
      product_id = productMap["payment links"] || productMap["pl"];
    } else if (title.includes("ttp") || title.includes("tap to pay")) {
      product_id = productMap["tap to pay"] || productMap["ttp"];
    } else if (title.includes("card reader")) {
      product_id = productMap["card reader"];
    } else if (title.includes("nds")) {
      product_id = productMap["nds"];
    } else if (title.includes("sell more online") || title.includes("smo")) {
      product_id = productMap["sell more online"] || productMap["smo"];
    } else if (title.includes("tic")) {
      product_id = productMap["tic"] || productMap["terminal"];
    } else if (title.includes("sell in person") || title.includes("sip")) {
      product_id = productMap["sell in person"] || productMap["sip"];
    }

    return { ...idea, product_id };
  });

  const { data, error } = await (supabase as any).from("idea_bank").insert(ideasWithProducts);

  if (error) {
    console.error("Error seeding starter ideas:", error);
    throw new Error(error.message);
  }

  revalidatePath("/idea-bank");
  return data;
}

export async function convertIdeaToOpportunity(ideaId: string) {
  // Get the idea
  const { data: idea, error: ideaError } = await supabase
    .from("idea_bank")
    .select("*")
    .eq("id", ideaId)
    .single();

  if (ideaError || !idea) {
    throw new Error("Idea not found");
  }

  // Create opportunity from idea
  const opportunity = await createOpportunity({
    title: idea.title,
    description: idea.copy_notes || undefined,
    product_id: idea.product_id || undefined,
    impact: idea.expected_impact || undefined,
    effort: idea.effort || undefined,
    confidence: idea.confidence || undefined,
    status: "idea",
    hypothesis: idea.hypothesis || undefined,
    audience_logic: idea.audience_logic || undefined,
    proposed_solution: idea.what_to_send || undefined,
    primary_kpi: idea.measurement_plan || undefined,
    guardrails: idea.guardrails || undefined,
    data_requirements: idea.prerequisites || undefined,
    execution_notes: idea.follow_ups || undefined,
  });

  // Update idea to link to the new opportunity
  await (supabase as any)
    .from("idea_bank")
    .update({ converted_opportunity_id: opportunity.id })
    .eq("id", ideaId);

  revalidatePath("/idea-bank");
  revalidatePath(`/idea-bank/${ideaId}`);
  revalidatePath("/opportunities");

  return opportunity;
}
