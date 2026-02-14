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

export async function seedDetailedIdeas() {
  const detailedIdeas = [
    {
      title: "Payment Links First Transaction Win-back",
      type: "reactive" as IdeaType,
      goal: "activation" as IdeaGoal,
      audience_logic: "PL users who created account 30+ days ago but never sent a link",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      effort: 2,
      expected_impact: 5,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Activation Team",
      reasoning:
        "Data shows 40% of PL signups never send their first link. Comparison of activated vs. dormant cohorts shows activated users have 3x higher 90-day retention. Low-hanging fruit to recover stalled signups.",
      hypothesis:
        "If we send a how-to email + push notification to dormant PL users with a simple 3-step guide and merchant success story, we'll activate 15%+ of recipients within 7 days.",
      what_to_send:
        "• Subject: 'Get your first Payment Link payment in 3 easy steps'\n• Hero: Real merchant quote + their first payment amount\n• 3-step visual guide: Create link → Share link → Get paid\n• CTA: 'Create my first link' (deeplink to creation flow)\n• Social proof: '10,000+ merchants got their first payment this month'",
      why_now_trigger:
        "Send 30 days after signup if no links created. This timing balances giving users time to activate organically vs. letting them go fully cold.",
      measurement_plan:
        "Primary KPI: % of recipients who create and send first link within 7 days (target: 15%)\nSecondary: Email open rate, CTR, deeplink click rate\nComparison: Historical organic activation rate for 30-day dormant cohort (~3%)",
      guardrails:
        "• Don't send if user already has a link created (even if not sent)\n• Exclude if user has had account suspended or fraud flag\n• Cap at 1 send per user lifetime",
      variants:
        "Test A: Success story focus (merchant testimonial)\nTest B: Urgency angle ('Don't miss out on easy payments')\nTest C: Educational angle (step-by-step guide focus)",
      prerequisites:
        "Fields: account_created_date, first_link_created_date, account_status\nEvents: payment_link_created, payment_link_sent",
      follow_ups:
        "If converts: Send congratulations message + next steps (tips for link 2-5)\nIf doesn't convert: Add to 60-day win-back campaign with different angle (focus on specific use case)",
    },
    {
      title: "TTP High-Value Transaction Celebration",
      type: "one_off" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "TTP users who process a transaction >$500 for the first time",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "push", "in_app"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 2,
      expected_impact: 4,
      confidence: 5,
      status: "ready" as IdeaStatus,
      owner: "Growth Team",
      reasoning:
        "Users who process high-value transactions have 5x higher LTV than those who only process small transactions. Celebrating this milestone reinforces positive behavior and positions us as a partner in their growth.",
      hypothesis:
        "If we celebrate high-value transactions with personalized recognition and unlock advanced features, users will increase transaction frequency by 20% over the next 30 days.",
      what_to_send:
        "• Push notification: 'You just processed your biggest payment yet! 🎉'\n• Email with transaction details (amount, customer name)\n• Unlock: Advanced reporting dashboard access\n• Educational content: Tips for handling high-value transactions securely\n• CTA: 'View your milestone dashboard'",
      why_now_trigger:
        "Trigger immediately after first >$500 transaction clears (within 1 hour). Timing is critical to associate the celebration with the achievement.",
      measurement_plan:
        "Primary KPI: Transaction frequency increase (# of transactions in 30 days post-milestone vs. 30 days pre-milestone)\nTarget: 20% increase\nSecondary: Feature adoption (% who access unlocked reporting), next high-value transaction timing\nControl group: High-value transaction processors who don't receive message",
      guardrails:
        "• Don't send if transaction was refunded\n• Monitor for abuse (users gaming system with fake transactions)\n• Ensure transaction was successful and legitimate",
      variants:
        "A: Focus on unlocked feature\nB: Focus on personal milestone celebration\nC: Focus on business growth narrative",
      prerequisites:
        "Events: ttp_transaction_completed (with amount field), transaction_status\nFields: user_highest_transaction_amount, total_transaction_count",
      follow_ups:
        "If user processes another high-value transaction within 7 days: Send pro tips for scaling\nIf no follow-up transaction in 14 days: Send reminder about unlocked features + case study",
    },
    {
      title: "Card Reader Inventory Management Upsell",
      type: "burst" as IdeaType,
      goal: "cross_sell" as IdeaGoal,
      audience_logic: "Card Reader users with >100 transactions/month but no inventory system",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 3,
      expected_impact: 4,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Cross-sell Team",
      reasoning:
        "High-transaction-volume card reader users are likely managing inventory manually or with separate tools. Our inventory management integration has 40% attach rate when proactively pitched to qualified users. This is a natural value-add at their scale.",
      hypothesis:
        "If we show high-volume card reader users how inventory management integrates seamlessly with their existing setup, 25% will start a trial and 10% will convert to paid within 30 days.",
      what_to_send:
        "• Subject: '[Business Name], save 10 hours/week with automated inventory'\n• Problem: Manual inventory tracking at your scale\n• Solution: Real-time inventory sync with every card reader transaction\n• Proof: Case study from similar business (retail/volume profile)\n• Offer: 30-day free trial + onboarding call\n• CTA: 'Start free trial'",
      why_now_trigger:
        "Send when user crosses 100 transactions in a calendar month. This is the inflection point where manual inventory becomes painful. Run as quarterly burst campaigns to capture growing businesses.",
      measurement_plan:
        "Primary KPI: Trial start rate (target: 25%) and paid conversion rate (target: 10% of trials)\nSecondary: Email CTR, demo booking rate, feature activation within trial\nROI: Average inventory subscriber LTV vs. campaign cost",
      guardrails:
        "• Exclude if user already has inventory management enabled\n• Don't send if <100 transactions in the current month\n• Limit to 1 send per 6 months per user",
      variants:
        "A: Time-saving angle (10 hours/week saved)\nB: Revenue angle (never miss a sale due to stockouts)\nC: Peace of mind angle (always know what you have)",
      prerequisites:
        "Fields: monthly_transaction_count, has_inventory_system, business_type\nIntegration: Inventory management system API",
      follow_ups:
        "If starts trial: Onboarding sequence with setup help\nIf doesn't start trial: Add to 90-day nurture with different angle\nIf completes trial without converting: Offer discount or extended trial",
    },
    {
      title: "NDS Dormant Feature Discovery Campaign",
      type: "seasonal" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "NDS users who haven't used reporting features in 60+ days",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 3,
      expected_impact: 3,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Product Marketing",
      reasoning:
        "Feature adoption correlates with retention. Users who use 3+ features have 60% lower churn than those who use 1-2. Many NDS users don't know reporting exists or forgot about it. Seasonal campaigns (quarterly) can re-activate dormant features.",
      hypothesis:
        "If we proactively show dormant NDS users their personalized insights and what they're missing in reporting, 30% will re-engage with reporting features within 14 days.",
      what_to_send:
        "• Subject: 'See what you've been missing: Your business insights'\n• Personalized preview: 3 insights generated from their data\n• Feature tour: Quick 2-minute video showing reporting capabilities\n• Value prop: Make better decisions with real-time data\n• CTA: 'View my full report'",
      why_now_trigger:
        "Run quarterly campaigns targeting users who haven't accessed reporting in 60+ days. Quarterly timing allows us to generate meaningful insights from accumulated data without over-messaging.",
      measurement_plan:
        "Primary KPI: % of recipients who access reporting features within 14 days (target: 30%)\nSecondary: Ongoing feature usage (DAU/MAU for reporting), churn rate comparison\nSegment analysis: Break down by user tenure, business size, industry",
      guardrails:
        "• Don't send if user accessed reporting in last 60 days\n• Exclude trial users (focus on paid)\n• Monitor for users who opt out of educational content",
      variants:
        "A: Personalized insights preview\nB: Competitive angle (what successful peers are doing)\nC: Problem/solution angle (blind spots you're missing)",
      prerequisites:
        "Fields: last_reporting_access_date, account_tier, business_metrics (for personalization)\nCapability: Generate personalized insights from user data",
      follow_ups:
        "If engages with reporting: Send advanced tips series (3-email sequence)\nIf doesn't engage: Add to next quarterly campaign with different angle\nIf heavy reporting user emerges: Qualify for upsell to premium tier",
    },
    {
      title: "Sell More Online Cart Abandonment Recovery",
      type: "reactive" as IdeaType,
      goal: "activation" as IdeaGoal,
      audience_logic:
        "SMO users who set up checkout but had 3+ abandoned carts in last 7 days",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      effort: 4,
      expected_impact: 5,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "SMO Team",
      reasoning:
        "Cart abandonment is the #1 revenue leak for SMO users. Users who implement our abandonment recovery tools see 15-20% recovery rate. Many users don't know this feature exists or how to set it up. Proactive outreach when we detect the problem can drive immediate value.",
      hypothesis:
        "If we alert SMO users when we detect high cart abandonment and guide them to set up automated recovery, 40% will implement the feature and recover 15% of abandoned carts.",
      what_to_send:
        "• Subject: 'We noticed 3 abandoned carts this week – here's how to recover them'\n• Problem visualization: Their cart abandonment rate vs. benchmark\n• Solution: Automated cart recovery emails\n• Setup guide: 3 steps to enable (with screenshots)\n• Proof: Case study showing 15% recovery rate\n• CTA: 'Set up cart recovery now'",
      why_now_trigger:
        "Trigger when user has 3+ abandoned carts in a 7-day period AND hasn't enabled cart recovery features. This threshold indicates a real problem worth addressing.",
      measurement_plan:
        "Primary KPI: % of recipients who enable cart recovery within 7 days (target: 40%)\nSecondary: Cart recovery rate for adopters, revenue recovered, time to setup\nROI: Recovered cart revenue vs. campaign cost",
      guardrails:
        "• Don't send if cart recovery is already enabled\n• Exclude if cart abandonment is below 3 in 7 days\n• Don't send if carts were abandoned due to technical issues on our side\n• Limit to 1 send per 30 days",
      variants:
        "A: Revenue loss angle (show $ amount left in abandoned carts)\nB: Competitive angle (your competitors are recovering carts)\nC: Easy setup angle (3 minutes to set up)",
      prerequisites:
        "Events: checkout_started, checkout_abandoned, cart_recovery_enabled\nFields: cart_abandonment_rate, cart_recovery_status, total_abandoned_cart_value",
      follow_ups:
        "If enables cart recovery: Monitor performance and send optimization tips after 14 days\nIf doesn't enable: Send reminder with different angle after 14 days\nIf cart abandonment rate drops: Send congratulations + upsell advanced features",
    },
    {
      title: "TIC Multi-Location Setup Win-back",
      type: "winback" as IdeaType,
      goal: "winback" as IdeaGoal,
      audience_logic: "TIC users who set up 1 location but showed intent for multi-location",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 3,
      expected_impact: 4,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "TIC Team",
      reasoning:
        "Users who set up multiple locations have 3x higher LTV and 50% lower churn. We see many users start multi-location setup but abandon. This indicates intent that we can re-activate with the right nudge.",
      hypothesis:
        "If we remind users who started but didn't complete multi-location setup about the benefits and make it easy to continue, 25% will complete setup within 14 days.",
      what_to_send:
        "• Subject: 'Finish setting up your locations – it'll take 2 minutes'\n• Reminder: They started multi-location setup\n• Benefits: Unified reporting, staff management across locations\n• New: We've made setup even easier (if applicable)\n• Merchant proof: Multi-location success story\n• CTA: 'Complete my setup' (deeplink to continue where they left off)",
      why_now_trigger:
        "Send 7 days after user started but didn't complete multi-location setup. This timing is after the initial urgency has passed but before they've completely forgotten.",
      measurement_plan:
        "Primary KPI: Multi-location setup completion rate (target: 25% within 14 days)\nSecondary: Long-term retention comparison, revenue per location\nControl: Users who started setup but didn't get reminder",
      guardrails:
        "• Only send if user has 1 location active and started setup for location 2+\n• Don't send if they've explicitly indicated single-location business\n• Exclude if multi-location setup was completed",
      variants:
        "A: Time-saving benefit angle\nB: Unified reporting angle\nC: Staff management angle",
      prerequisites:
        "Fields: number_of_locations, multi_location_setup_started_date, multi_location_setup_completed\nEvents: location_setup_started, location_setup_completed",
      follow_ups:
        "If completes setup: Send multi-location best practices guide\nIf doesn't complete: Add to 30-day nurture with success stories\nIf adds 3+ locations: Qualify for enterprise features pitch",
    },
    {
      title: "Cross-Product Power User Recognition",
      type: "one_off" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic: "Users actively using 3+ products simultaneously",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "proof" as MessageAngle,
      effort: 2,
      expected_impact: 4,
      confidence: 5,
      status: "ready" as IdeaStatus,
      owner: "Cross-Product Team",
      reasoning:
        "Multi-product users have 80% lower churn and 4x higher LTV. Recognition programs increase engagement and create emotional connection with brand. Power users are our best advocates and most valuable customers.",
      hypothesis:
        "If we recognize and celebrate multi-product users with exclusive perks and status, we'll increase their product usage by 15% and create brand advocates who refer 2+ new users.",
      what_to_send:
        "• Subject: 'You're one of our power users! Here's what that means'\n• Recognition: Their multi-product usage stats\n• Exclusive unlock: Priority support badge\n• Special perk: Early access to new features\n• Community: Invitation to power user advisory board\n• CTA: 'Activate my power user perks'",
      why_now_trigger:
        "Trigger when user has actively used 3+ products in the same 30-day period for the first time. This is when they've proven deep platform engagement.",
      measurement_plan:
        "Primary KPI: Product usage increase (target: 15% increase in sessions/transactions)\nSecondary: NPS score, referral rate, support satisfaction score\nQualitative: Advisory board participation, feature feedback quality",
      guardrails:
        "• Only send once per user (first time hitting threshold)\n• Verify all 3+ products have meaningful usage (not just trial)\n• Don't send during onboarding period (first 90 days)",
      variants:
        "A: Status/recognition focus\nB: Exclusive perks focus\nC: Community/influence focus",
      prerequisites:
        "Fields: products_used_count, usage_by_product, account_tenure\nCapability: Priority support flagging system",
      follow_ups:
        "Immediate: Welcome to power user program email series\nOngoing: Quarterly power user newsletter\nIf churns: High-touch save attempt from account team",
    },
    {
      title: "Payment Links API Integration Discovery",
      type: "burst" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic:
        "PL users sending 50+ links/month manually without API usage",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 4,
      expected_impact: 4,
      confidence: 3,
      status: "ready" as IdeaStatus,
      owner: "Developer Relations",
      reasoning:
        "High-volume manual users are prime candidates for API adoption. API users have 90% higher retention and process 3x more volume. Many users don't know API exists or think it's too technical. Proper positioning can unlock significant growth.",
      hypothesis:
        "If we show high-volume PL users how API integration can automate their workflow and provide code samples, 20% will begin API integration within 30 days.",
      what_to_send:
        "• Subject: 'You're creating 50+ payment links per month. Here's how to automate it.'\n• Problem: Time spent on manual link creation\n• Solution: API integration (non-technical explanation)\n• Proof: Case study of similar user who automated\n• Resources: Code samples, video tutorial, documentation link\n• Support: Offer of free developer consultation call\n• CTA: 'Get API keys and code samples'",
      why_now_trigger:
        "Target users who have sent 50+ links manually in the current month. Run monthly to capture users hitting this threshold. Volume indicates they've found product-market fit and are ready to scale.",
      measurement_plan:
        "Primary KPI: % who generate API keys and make first API call (target: 20% within 30 days)\nSecondary: Links created via API, total volume increase, time saved\nLong-term: Retention comparison API vs. non-API users",
      guardrails:
        "• Don't send if user already has API keys generated\n• Exclude if <50 links created in current month\n• Exclude if user is on trial or free tier\n• Limit to 1 send per quarter",
      variants:
        "A: Time-saving angle\nB: Scaling/growth angle\nC: Automation/efficiency angle",
      prerequisites:
        "Fields: monthly_links_created, api_keys_generated, account_tier\nResources: Code samples, video tutorial, API documentation\nCapability: Free developer consultation scheduling",
      follow_ups:
        "If generates API keys: Technical onboarding sequence (3 emails)\nIf makes first API call: Congratulations + advanced API features\nIf doesn't engage: Add to next quarter's campaign with different angle",
    },
    {
      title: "TTP Tax Season Preparation Campaign",
      type: "seasonal" as IdeaType,
      goal: "education" as IdeaGoal,
      audience_logic: "All active TTP users, 2 months before tax season",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      effort: 3,
      expected_impact: 4,
      confidence: 5,
      status: "ready" as IdeaStatus,
      owner: "Lifecycle Marketing",
      reasoning:
        "Tax season is stressful for merchants. Proactive tax preparation content positions us as a helpful partner and reduces support burden. Users who access tax reports in advance are 40% more likely to renew and have 30% lower support ticket volume.",
      hypothesis:
        "If we send tax preparation resources 2 months before tax season, 50% of users will download tax reports in advance and we'll reduce tax-related support tickets by 30%.",
      what_to_send:
        "• Subject: 'Get ready for tax season: Your 2024 transaction reports are ready'\n• Value: Everything you need for your taxes in one place\n• Resources: Downloadable transaction reports, tax guide PDF, FAQ\n• Timing: Why preparing now saves time later\n• New: Tax category breakdown feature (if applicable)\n• Support: CPA-approved checklist\n• CTA: 'Download my tax reports'",
      why_now_trigger:
        "Send 2 months before tax filing deadline (e.g., mid-February for April 15 deadline). This gives users time to prepare without being too early that they ignore it.",
      measurement_plan:
        "Primary KPI: % of users who download tax reports (target: 50%)\nSecondary: Support ticket volume reduction (target: 30% decrease), NPS during tax season\nQualitative: Support ticket sentiment analysis",
      guardrails:
        "• Only send to users with transaction history in the tax year\n• Don't send if user already downloaded tax reports\n• Exclude users outside tax jurisdictions we support",
      variants:
        "A: Stress-reduction angle ('Make tax season painless')\nB: Time-saving angle ('30 minutes to tax-ready')\nC: Expert-recommended angle (CPA-approved process)",
      prerequisites:
        "Fields: has_transactions_current_year, tax_reports_downloaded, business_location\nResources: Tax guide PDF, CPA checklist, video tutorial",
      follow_ups:
        "If downloads reports: Send tax tips email 2 weeks before deadline\nIf doesn't download: Send reminder 3 weeks before deadline with urgency\nAfter tax season: Survey about tax experience for product feedback",
    },
    {
      title: "Card Reader Battery Optimization Tips",
      type: "reactive" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic:
        "Card Reader users with frequent low-battery disconnections",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["email", "push"] as ChannelType[],
      message_angle: "how_to" as MessageAngle,
      effort: 2,
      expected_impact: 3,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Hardware Team",
      reasoning:
        "Battery issues are a top 5 support complaint and frustration driver. Users experiencing battery problems are 2x more likely to churn. Proactive education can prevent frustration and reduce support load. Most battery issues are fixable with proper usage guidance.",
      hypothesis:
        "If we proactively send battery optimization tips when we detect frequent low-battery events, we'll reduce battery-related support tickets by 40% and prevent 25% of at-risk users from churning.",
      what_to_send:
        "• Subject: 'Get more battery life from your card reader'\n• Problem acknowledgment: We noticed frequent battery alerts\n• Solution: 5 tips to extend battery life\n• Tips: Proper charging, when to replace, battery-saving settings, firmware updates\n• Replacement: Easy ordering process if battery is degraded\n• Support: Link to troubleshooting guide\n• CTA: 'View battery care guide'",
      why_now_trigger:
        "Trigger when card reader disconnects due to low battery 3+ times in a 7-day period. This indicates a pattern of poor battery performance that will lead to frustration.",
      measurement_plan:
        "Primary KPI: Reduction in battery-related support tickets (target: 40%)\nSecondary: Low-battery event frequency decrease, battery replacement orders, churn rate for affected users\nControl: Users with battery issues who don't receive tips",
      guardrails:
        "• Only send if battery issue is confirmed (not connectivity issues)\n• Don't send if battery was replaced in last 30 days\n• Limit to 1 send per 60 days",
      variants:
        "A: Educational tips focus\nB: Replacement offer focus\nC: Firmware update focus",
      prerequisites:
        "Events: device_disconnected (with reason: low_battery), battery_level_low\nFields: device_age, last_firmware_update, battery_replacement_history",
      follow_ups:
        "If battery issues continue: Proactive replacement offer with discount\nIf issues resolve: No follow-up needed\nIf user contacts support: Flag for expedited support",
    },
    {
      title: "NDS Reporting Dashboard Personalization",
      type: "one_off" as IdeaType,
      goal: "retention" as IdeaGoal,
      audience_logic:
        "NDS users who view default dashboard but haven't customized it",
      suggested_trigger_type: "event_based" as TriggerType,
      channels: ["in_app", "email"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 3,
      expected_impact: 4,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "Product Team",
      reasoning:
        "Users who customize their dashboard have 50% higher feature usage and 35% better retention. Many users don't realize customization is possible. In-app prompts at the right moment can drive this behavior change.",
      hypothesis:
        "If we prompt users to customize their dashboard after their 5th dashboard view, 40% will create a custom view and engagement will increase 30%.",
      what_to_send:
        "• In-app banner: 'Make this dashboard yours – add the metrics you care about'\n• Quick tutorial: 30-second video showing how to customize\n• Suggestions: Recommended widgets based on their business type\n• Examples: Screenshots of customized dashboards from similar businesses\n• Benefit: Faster access to the data you need\n• CTA: 'Customize my dashboard'",
      why_now_trigger:
        "Trigger after user's 5th dashboard view if they haven't customized anything. This shows engagement with reporting but also that they're stuck with defaults.",
      measurement_plan:
        "Primary KPI: % who customize dashboard (target: 40%)\nSecondary: Dashboard views per user increase, feature adoption rate, time spent in reporting\nLong-term: Retention comparison customized vs. default dashboard users",
      guardrails:
        "• Don't show if user has already customized dashboard\n• Don't show if user is within first 7 days (onboarding period)\n• Limit in-app banner to 3 views (don't be annoying)",
      variants:
        "A: In-app banner only\nB: In-app banner + follow-up email\nC: Video tutorial focus vs. template focus",
      prerequisites:
        "Fields: dashboard_views_count, dashboard_customized, business_type\nFeature: Dashboard customization functionality\nAssets: Tutorial video, example screenshots",
      follow_ups:
        "If customizes: Send advanced tips email (how to create custom reports)\nIf doesn't customize: Show different prompt after 10 more views\nIf heavy dashboard user: Qualify for advanced reporting tier upsell",
    },
    {
      title: "Sell More Online Shipping Integration Nudge",
      type: "burst" as IdeaType,
      goal: "activation" as IdeaGoal,
      audience_logic:
        "SMO users processing >20 orders/month without shipping integration",
      suggested_trigger_type: "scheduled" as TriggerType,
      channels: ["email", "in_app"] as ChannelType[],
      message_angle: "benefit" as MessageAngle,
      effort: 4,
      expected_impact: 5,
      confidence: 4,
      status: "ready" as IdeaStatus,
      owner: "SMO Team",
      reasoning:
        "Manual shipping label creation is a major pain point at scale. Users with shipping integration enabled process 50% more orders and have 40% better retention. Integration is a key inflection point for growing SMO businesses.",
      hypothesis:
        "If we show high-volume SMO users how shipping integration saves time and offer setup assistance, 35% will connect a shipping provider within 14 days.",
      what_to_send:
        "• Subject: '[Business Name], you could save 5 hours/week on shipping'\n• Problem: Time spent on manual shipping label creation\n• Solution: Automatic label printing with discounted rates\n• Math: Show their potential savings (time + shipping costs)\n• Partners: USPS, UPS, FedEx integration options\n• Setup: Step-by-step integration guide + video\n• Support: Free setup call offer\n• CTA: 'Connect my shipping provider'",
      why_now_trigger:
        "Target users processing 20+ orders per month without shipping integration. Run monthly to catch users hitting this threshold. Volume indicates manual shipping has become painful.",
      measurement_plan:
        "Primary KPI: Shipping integration connection rate (target: 35% within 14 days)\nSecondary: Labels printed, time to first label, total order volume increase\nROI: Increased retention + order volume vs. campaign cost",
      guardrails:
        "• Don't send if shipping integration is already connected\n• Exclude if <20 orders in current month\n• Don't send to digital goods only sellers\n• Limit to 1 send per quarter",
      variants:
        "A: Time-saving angle (5 hours/week)\nB: Cost-saving angle (discounted shipping rates)\nC: Customer experience angle (faster fulfillment)",
      prerequisites:
        "Fields: monthly_order_count, shipping_integration_connected, sells_physical_goods\nIntegration: USPS, UPS, FedEx APIs\nResources: Integration guide, video tutorial, setup call scheduling",
      follow_ups:
        "If connects shipping: Onboarding sequence for shipping best practices\nIf prints first label: Congratulations + tips for batch printing\nIf doesn't connect: Reminder after 2 weeks with customer testimonial",
    },
  ];

  // Get products to link ideas
  const { data: products } = await supabase.from("products").select("id, name");

  const productMap: Record<string, string> = {};
  products?.forEach((p: any) => {
    productMap[p.name.toLowerCase()] = p.id;
  });

  // Add product_id based on title keywords
  const ideasWithProducts = detailedIdeas.map((idea) => {
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

  const { data, error } = await (supabase as any)
    .from("idea_bank")
    .insert(ideasWithProducts);

  if (error) {
    console.error("Error seeding detailed ideas:", error);
    throw new Error(error.message);
  }

  revalidatePath("/idea-bank");
  return { success: true, count: ideasWithProducts.length };
}
