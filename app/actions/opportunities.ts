"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

export async function getOpportunities() {
  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      products (name),
      flows:linked_flow_id (name)
    `)
    .order("impact", { ascending: false });

  if (error) {
    console.error("Error fetching opportunities:", error);
    return [];
  }

  if (!data) return [];

  return data.map((opp: any) => ({
    ...opp,
    ratio: opp.impact && opp.effort ? opp.impact / opp.effort : 0,
  }));
}

export async function createOpportunity(formData: {
  product_id?: string;
  linked_flow_id?: string;
  title: string;
  description?: string;
  impact?: number;
  effort?: number;
  confidence?: number;
  status?: string;
  problem?: string;
  insight?: string;
  hypothesis?: string;
  proposed_solution?: string;
  primary_kpi?: string;
  secondary_kpis?: string;
  guardrails?: string;
  audience_logic?: string;
  execution_notes?: string;
  data_requirements?: string;
  test_design?: string;
  success_criteria?: string;
  risks_mitigations?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("opportunities")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating opportunity:", error);
    throw new Error(error.message);
  }

  revalidatePath("/opportunities");
  return data;
}

export async function updateOpportunity(
  id: string,
  formData: Partial<{
    product_id: string;
    linked_flow_id: string;
    title: string;
    description: string;
    impact: number;
    effort: number;
    confidence: number;
    status: string;
    problem: string;
    insight: string;
    hypothesis: string;
    proposed_solution: string;
    primary_kpi: string;
    secondary_kpis: string;
    guardrails: string;
    audience_logic: string;
    execution_notes: string;
    data_requirements: string;
    test_design: string;
    success_criteria: string;
    risks_mitigations: string;
  }>
) {
  const { data, error } = await (supabase as any)
    .from("opportunities")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating opportunity:", error);
    throw new Error(error.message);
  }

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  return data;
}

// Helper: Get or create product by name
async function getOrCreateProduct(name: string, description?: string): Promise<any> {
  let { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("name", name)
    .single();

  if (!product) {
    const { data: newProduct } = await (supabase as any)
      .from("products")
      .insert([{ name, description }])
      .select()
      .single();
    product = newProduct;
  }

  return product as any;
}

// Helper: Find flow by keyword matching
async function findFlowByKeywords(keywords: string[]) {
  const { data: flows } = await supabase
    .from("flows")
    .select("id, name")
    .limit(100);

  if (!flows) return null;

  for (const flow of flows as any[]) {
    const flowNameLower = flow.name.toLowerCase();
    if (keywords.some(keyword => flowNameLower.includes(keyword.toLowerCase()))) {
      return flow;
    }
  }

  return null;
}

export async function seedOpportunitiesAndSignals() {
  const results = {
    opportunities: { created: 0, errors: [] as string[] },
    signals: { created: 0, errors: [] as string[] },
  };

  // Opportunities data
  const opportunitiesData = [
    {
      title: "Cross-Product Upgrade Engine",
      description: "Build automated upgrade pathways: TTP heavy users → Card Reader; High-value PL users → TIC; Dormant POS → TTP fallback. Increase ARPU through intelligent product recommendations.",
      productName: "Tools/Boosts",
      impact: 5,
      effort: 4,
      confidence: 4,
      status: "idea",
    },
    {
      title: "Unpaid Paylink Conversion Engine",
      description: "Automated nurture for paylinks unpaid 7-30 days. Multi-touch campaign with merchant education, customer reminder templates, and optimal timing analysis.",
      productName: "Payment Links",
      flowKeywords: ["unpaid", "paylink"],
      impact: 4,
      effort: 3,
      confidence: 5,
      status: "idea",
    },
    {
      title: "Dormancy Ladder (7/14/30-day)",
      description: "Differentiated retention based on inactivity period. 7-day: light nudge, 14-day: value reminder + incentive, 30-day: win-back offer. Reduce churn by 15-20%.",
      productName: "Card Reader",
      flowKeywords: ["lapsed", "dormant"],
      impact: 5,
      effort: 3,
      confidence: 5,
      status: "planned",
    },
    {
      title: "Mid-Funnel Intent Instrumentation",
      description: "Track: opened onboarding flow, clicked deeplink, viewed feature page, added product. Enable intent-based targeting vs. just activation/transaction events.",
      productName: null,
      impact: 5,
      effort: 2,
      confidence: 4,
      status: "idea",
    },
    {
      title: "Unified Acquiring Maturity Stage",
      description: "Single cross-product field: Onboarded → First Transaction → Regular User → Power User → Dormant. Enables consistent lifecycle messaging.",
      productName: null,
      impact: 4,
      effort: 3,
      confidence: 5,
      status: "idea",
    },
    {
      title: "Flow Conflict Governance",
      description: "Implement max touches/day cap and flow priority system. Prevent message fatigue and ensure high-priority flows always send.",
      productName: null,
      impact: 4,
      effort: 4,
      confidence: 5,
      status: "idea",
    },
    {
      title: "STO Expansion Audit",
      description: "12 flows currently STO=No. Audit each for STO eligibility. Target: Convert 6-8 flows to STO=Yes for improved deliverability and engagement.",
      productName: null,
      impact: 3,
      effort: 2,
      confidence: 5,
      status: "planned",
    },
    {
      title: "PL Creator - Low Paid Rate Play",
      description: "Target merchants with 5+ paylinks created but <30% paid rate. Provide education on payment methods, link placement, and follow-up best practices.",
      productName: "Payment Links",
      flowKeywords: ["payment", "link"],
      impact: 4,
      effort: 2,
      confidence: 4,
      status: "idea",
    },
    {
      title: "Card Reader Delivery-to-Transaction Gap",
      description: "50%+ of delivered Card Readers never transact. Build 3-touch onboarding: Setup guide, first transaction incentive, troubleshooting support.",
      productName: "Card Reader",
      flowKeywords: ["pos", "card reader", "activation"],
      impact: 5,
      effort: 3,
      confidence: 5,
      status: "idea",
    },
    {
      title: "Next Day Settlement for High TPV",
      description: "Targeted upgrade flow for users with >£10k monthly TPV. Emphasize cash flow benefits. Target 20% conversion of eligible users.",
      productName: "Tools/Boosts",
      flowKeywords: ["next day settlement", "acquisition"],
      impact: 4,
      effort: 2,
      confidence: 5,
      status: "planned",
    },
    {
      title: "Sell More Online Ladder Optimization",
      description: "Segment trial users by engagement. High-engaged: conversion offer at day 10. Low-engaged: education series. Non-starters: re-onboarding.",
      productName: "Tools/Boosts",
      flowKeywords: ["sell more online"],
      impact: 4,
      effort: 3,
      confidence: 4,
      status: "idea",
    },
    {
      title: "TIC Adoption Improvement",
      description: "Current TIC flows underperforming. Test: social proof messaging, video demo, ROI calculator. Goal: 2x onboarding rate.",
      productName: "TIC",
      flowKeywords: ["tic", "checkout"],
      impact: 4,
      effort: 3,
      confidence: 3,
      status: "idea",
    },
    {
      title: "TTP Transaction Momentum Builder",
      description: "After first TTP transaction, trigger 4-week momentum series: Transaction 2-3 incentive, use case ideas, peer success stories.",
      productName: "TTP",
      flowKeywords: ["tap to pay", "ttp"],
      impact: 4,
      effort: 2,
      confidence: 5,
      status: "idea",
    },
    {
      title: "Multi-Product User VIP Program",
      description: "Identify users with 3+ active products. Create VIP segment with priority support, beta access, and exclusive offers.",
      productName: null,
      impact: 3,
      effort: 3,
      confidence: 4,
      status: "idea",
    },
    {
      title: "Seasonal Campaign Framework",
      description: "Pre-built campaign templates for Q4, Valentine's, Summer. Product-specific hooks (e.g., mobile payments for festivals). Reduce campaign build time by 60%.",
      productName: null,
      impact: 3,
      effort: 4,
      confidence: 4,
      status: "idea",
    },
    {
      title: "Churn Prediction Model",
      description: "ML model predicting churn 30 days out based on transaction frequency decline, support tickets, and engagement drop. Enable proactive retention.",
      productName: null,
      impact: 5,
      effort: 5,
      confidence: 3,
      status: "idea",
    },
    {
      title: "In-App Message Optimization",
      description: "Currently limited in-app usage. Test persistent CTAs, contextual messages, and app-only offers. Target: 3x in-app engagement rate.",
      productName: null,
      impact: 4,
      effort: 3,
      confidence: 4,
      status: "idea",
    },
    {
      title: "Winback Campaign Overhaul",
      description: "Current winback flows have <5% reactivation. Rebuild with: incentive testing, channel mix optimization, and timing experiments.",
      productName: null,
      flowKeywords: ["winback"],
      impact: 4,
      effort: 3,
      confidence: 4,
      status: "idea",
    },
  ];

  // Missing Signals data
  const missingSignalsData = [
    {
      signal_name: "paylink_share_method",
      signal_type: "field",
      why_needed: "Know if paylink shared via SMS, email, WhatsApp, or in-person QR. Enables channel-specific optimization.",
      productName: "Payment Links",
    },
    {
      signal_name: "paylink_payment_method_used",
      signal_type: "field",
      why_needed: "Track card, bank transfer, Apple Pay usage. Informs payment method education and optimization.",
      productName: "Payment Links",
    },
    {
      signal_name: "card_reader_setup_completed",
      signal_type: "event",
      why_needed: "Distinguish delivered vs. successfully set up. Target setup abandoners with support.",
      productName: "Card Reader",
    },
    {
      signal_name: "ttp_location_type",
      signal_type: "field",
      why_needed: "Market stall, pop-up, delivery, etc. Enable use-case specific messaging.",
      productName: "TTP",
    },
    {
      signal_name: "feature_page_viewed",
      signal_type: "event",
      why_needed: "Mid-funnel intent signal. User browsed feature = warm lead for activation campaign.",
      productName: null,
    },
    {
      signal_name: "onboarding_step_completed",
      signal_type: "event",
      why_needed: "Track onboarding progress per product. Rescue stuck users with targeted help.",
      productName: null,
    },
    {
      signal_name: "deeplink_clicked",
      signal_type: "event",
      why_needed: "Measure deeplink effectiveness. Attribute conversions to specific campaigns.",
      productName: null,
    },
    {
      signal_name: "support_ticket_category",
      signal_type: "field",
      why_needed: "Identify common pain points. Proactively address with education flows.",
      productName: null,
    },
    {
      signal_name: "monthly_tpv_band",
      signal_type: "field",
      why_needed: "<£1k, £1-5k, £5-10k, £10k+. Essential for Next Day Settlement and Sell More Online targeting.",
      productName: null,
    },
    {
      signal_name: "product_adoption_stage",
      signal_type: "field",
      why_needed: "Unified lifecycle stage across products. Enables consistent journey orchestration.",
      productName: null,
    },
    {
      signal_name: "tic_cart_abandonment",
      signal_type: "event",
      why_needed: "Trigger cart abandonment recovery. Critical for TIC conversion optimization.",
      productName: "TIC",
    },
    {
      signal_name: "sell_more_online_feature_usage",
      signal_type: "field",
      why_needed: "Track which SMO features used (invoicing, bookings, etc.). Personalize upgrade messaging.",
      productName: "Tools/Boosts",
    },
    {
      signal_name: "message_fatigue_score",
      signal_type: "field",
      why_needed: "Track send frequency, open decline. Auto-suppress over-messaged users.",
      productName: null,
    },
    {
      signal_name: "peer_referral_source",
      signal_type: "field",
      why_needed: "Know if user joined via referral. Enable referrer rewards and social proof messaging.",
      productName: null,
    },
    {
      signal_name: "seasonal_business_type",
      signal_type: "field",
      why_needed: "Ice cream shop, Christmas markets, etc. Tailor campaigns to seasonal patterns.",
      productName: null,
    },
  ];

  // Insert opportunities
  for (const opp of opportunitiesData) {
    try {
      let product_id = null;
      let linked_flow_id = null;

      // Get or create product
      if (opp.productName) {
        const product = await getOrCreateProduct(opp.productName);
        product_id = product?.id || null;
      }

      // Find linked flow
      if (opp.flowKeywords) {
        const flow = await findFlowByKeywords(opp.flowKeywords);
        linked_flow_id = flow?.id || null;
      }

      const { error } = await (supabase as any).from("opportunities").insert([
        {
          title: opp.title,
          description: opp.description,
          product_id,
          linked_flow_id,
          impact: opp.impact,
          effort: opp.effort,
          confidence: opp.confidence,
          status: opp.status,
        },
      ]);

      if (error) {
        results.opportunities.errors.push(`${opp.title}: ${error.message}`);
      } else {
        results.opportunities.created++;
      }
    } catch (error: any) {
      results.opportunities.errors.push(`${opp.title}: ${error.message}`);
    }
  }

  // Insert missing signals
  for (const signal of missingSignalsData) {
    try {
      let product_id = null;

      if (signal.productName) {
        const product = await getOrCreateProduct(signal.productName);
        product_id = product?.id || null;
      }

      const { error } = await (supabase as any).from("missing_signals").insert([
        {
          name: signal.signal_name,
          signal_type: signal.signal_type,
          description: signal.why_needed,
          product_id,
        },
      ]);

      if (error) {
        results.signals.errors.push(`${signal.signal_name}: ${error.message}`);
      } else {
        results.signals.created++;
      }
    } catch (error: any) {
      results.signals.errors.push(`${signal.signal_name}: ${error.message}`);
    }
  }

  revalidatePath("/opportunities");
  revalidatePath("/admin");

  return results;
}
