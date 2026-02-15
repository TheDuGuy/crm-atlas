// @ts-nocheck
"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

type OpportunityDetails = {
  title: string;
  problem: string;
  insight: string;
  hypothesis: string;
  proposed_solution: string;
  audience_logic: string;
  primary_kpi: string;
  secondary_kpis: string;
  guardrails: string;
  test_design: "ab_test" | "holdout" | "pre_post" | "staged_rollout";
  success_criteria: string;
  data_requirements: string;
  execution_notes: string;
  risks_mitigations: string;
};

type ExperimentDetails = {
  title: string;
  design_type: "ab_test" | "holdout" | "pre_post" | "staged_rollout";
  eligibility: string;
  treatment: string;
  control: string;
  exposure_definition: string;
  primary_kpi: string;
  secondary_kpis: string;
  guardrails: string;
  duration: string;
  success_criteria: string;
  notes: string;
};

type OpportunityWithExperiment = {
  opportunity: OpportunityDetails;
  experiment: ExperimentDetails;
};

const OPPORTUNITIES_DATA: OpportunityWithExperiment[] = [
  // 1) Churn Prediction Model
  {
    opportunity: {
      title: "Churn Prediction Model",
      problem: "We react to churn late (after inactivity/TPV drop), missing the window to intervene.",
      insight: "You already have partial risk signals (e.g., CardReader.potentialChurn, daysSinceLastTransaction). A unified model can outperform single-rule triggers.",
      hypothesis: "If we predict churn risk earlier and tailor interventions by risk band, we'll reduce churn and recover TPV.",
      proposed_solution: "Build a simple churn score (v1 rules; v2 model) using recency, frequency, value trends, and product engagement. Trigger graduated interventions: education → nudge → support escalation.",
      audience_logic: "Initially: Card Reader users + Payment Links users with declining usage. Risk bands: Low / Medium / High",
      primary_kpi: "30-day retention of 'active' users (per product) OR TPV retention vs baseline.",
      secondary_kpis: "Reactivation rate, transactions per user, average value, adoption of 'save' actions.",
      guardrails: "Unsub/complaints, support tickets, refunds/chargebacks, BNPL arrears.",
      test_design: "holdout",
      success_criteria: "High-risk segment: +X% reactivation OR improved TPV trend vs holdout in 30 days.",
      data_requirements: "Recency/frequency/value fields per product; ideally trend deltas (last 7/30d vs prior).",
      execution_notes: "Start with v1 heuristic score in CRM Atlas + Iterable; partner with Data for v2 model.",
      risks_mitigations: "Model false positives → use conservative interventions first; don't discount; add guardrails.",
    },
    experiment: {
      title: "Churn Risk Save Program (Rules-based v1)",
      design_type: "holdout",
      eligibility: "Users with prior activity in Card Reader or Payment Links + 'at risk' segment (start with Card Reader potentialChurn = yes OR daysSinceLastTransaction >= 14)",
      treatment: "Risk-tiered comms (High/Med) with tailored content + cadence",
      control: "Existing BAU flows only (or no additional comms beyond BAU)",
      exposure_definition: "Received at least 1 'risk save' message within 7 days of entering risk tier",
      primary_kpi: "30-day reactivation rate (any transaction / paid paylink / TTP transaction depending on product)",
      secondary_kpis: "TPV recovery proxy (txn count/value where available), 30-day retained active, time-to-next-transaction",
      guardrails: "Unsub/complaints, support contacts, refund/chargeback rate, deliverability",
      duration: "4 weeks (minimum), with weekly read",
      success_criteria: "+X pp reactivation vs holdout and no >Y% increase in complaints; stratify by product + baseline activity band",
      notes: "Add Looker link placeholder; stratify by product + baseline activity band",
    },
  },

  // 2) Mid-Funnel Intent Instrumentation
  {
    opportunity: {
      title: "Mid-Funnel Intent Instrumentation",
      problem: "We can see eligibility and outcomes (enabled/transactions) but miss intent steps (viewed onboarding, clicked deep link, started setup).",
      insight: "Current flows rely on end-state fields/events; missing mid-funnel signals makes optimisation blunt.",
      hypothesis: "If we instrument intent steps, we'll improve activation by targeting the exact step where users drop off.",
      proposed_solution: "Add events: 'feature page viewed', 'activation started', 'deeplink clicked', 'setup completed', 'failed reason'.",
      audience_logic: "Users who: eligible OR clicked/visited but didn't complete enablement/first txn.",
      primary_kpi: "Activation rate (enabled→first txn) and time-to-first-transaction.",
      secondary_kpis: "Drop-off by step, conversion from each step, reduced support contacts.",
      guardrails: "Event volume/cost, tracking correctness, privacy review.",
      test_design: "pre_post",
      success_criteria: "≥80% funnel visibility + measurable uplift from step-targeted comms.",
      data_requirements: "Product analytics instrumentation + event piping to Iterable.",
      execution_notes: "Start with 3–5 'highest leverage' events per product (TTP, Card Reader, PL).",
      risks_mitigations: "Instrumentation delay → do staged rollout; validate with small QA cohort.",
    },
    experiment: {
      title: "Intent Events Enable Step-Based Retargeting (Pilot)",
      design_type: "pre_post",
      eligibility: "TTP eligible users OR PL eligible users entering onboarding funnels",
      treatment: "Instrument + consume events; send step-targeted nudge (e.g., 'started onboarding but didn't finish')",
      control: "BAU lifecycle triggers only (no step-based nudge)",
      exposure_definition: "Fired 'start onboarding' event + received targeted message within 24h of drop-off",
      primary_kpi: "Step conversion uplift (start→complete) and activation (enabled→first transaction)",
      secondary_kpis: "Time-to-first-transaction, drop-off rate by step",
      guardrails: "Event accuracy (false positives), support tickets, unsubscribe",
      duration: "2 weeks instrumentation QA + 4 weeks impact read",
      success_criteria: "Clear drop-off visibility + measurable uplift in conversion rate",
      notes: "Start with 1 product (TTP recommended), add deep link click tracking first",
    },
  },

  // 3) Card Reader Delivery-to-Transaction Gap
  {
    opportunity: {
      title: "Card Reader Delivery-to-Transaction Gap",
      problem: "Devices get delivered but never used (lost activation and wasted acquisition cost).",
      insight: "You have delivery status + recency (order_status_delivered, daysSinceLastTransaction) = perfect activation trigger.",
      hypothesis: "If we trigger a tight post-delivery activation sequence (setup + troubleshooting), we'll increase first transaction rate.",
      proposed_solution: "Create a 'Delivered → First Transaction' activation ladder: Day 0 (setup), Day 2 (PIN + tips), Day 5 (troubleshoot), Day 10 (support escalation).",
      audience_logic: "CardReader.order_status_delivered = 1 AND (daysSinceLastTransaction is null OR daysSinceLastTransaction >= 7)",
      primary_kpi: "% with first transaction within 7 days of delivery.",
      secondary_kpis: "Time-to-first-transaction, support tickets, returns/cancellations.",
      guardrails: "Complaint/unsub, support ticket spike.",
      test_design: "ab_test",
      success_criteria: "+X pp increase in first-txn-within-7-days; no increase in returns.",
      data_requirements: "Delivered flag, transaction recency/value, support contact proxy (if available).",
      execution_notes: "Include 1 deep link to 'take payment' and 1 to help/FAQ.",
      risks_mitigations: "Wrong targeting → add exclusion for already active users; cap frequency.",
    },
    experiment: {
      title: "Post-Delivery Activation Ladder (Delivered → First Tx)",
      design_type: "ab_test",
      eligibility: "order_status_delivered = 1 AND (no transactions OR daysSinceLastTransaction null/very high) within 0–7 days post delivery",
      treatment: "New ladder sequence (setup checklist + troubleshooting + test payment)",
      control: "Current activation + PIN reminder only",
      exposure_definition: "Received Day 0 setup message within 24h of delivery",
      primary_kpi: "First transaction within 7 days of delivery",
      secondary_kpis: "First transaction within 14 days, time-to-first-transaction, support contacts, returns/cancellations",
      guardrails: "Unsub/complaints; support ticket spike >Y%",
      duration: "4 weeks or until N delivered cohort size reached",
      success_criteria: "+X pp first-tx-within-7-days uplift; stable returns/support",
      notes: "Stratify by device type (device1 vs device2) if meaningful",
    },
  },

  // 4) Cross-Product Upgrade Engine
  {
    opportunity: {
      title: "Cross-Product Upgrade Engine",
      problem: "We treat products in silos; we miss 'next best product' moments.",
      insight: "You already have strong signals: TTP transaction count, PL paid values, Card Reader activity; plus deeplinks for upgrades.",
      hypothesis: "If we cross-sell based on proven behaviour, conversion and long-term TPV increase.",
      proposed_solution: "Define 3–5 'upgrade rules' (behaviour → next product) with clear offers and deep links: PL high value → NDS, TTP heavy → Card Reader, Card Reader declining → TTP as backup or PL use case.",
      audience_logic: "Rule-based segments using existing fields (counts, values, recency).",
      primary_kpi: "Upgrade conversion rate (enable/order) + incremental TPV.",
      secondary_kpis: "Retention, product mix, repeat usage after upgrade.",
      guardrails: "Message fatigue, cannibalisation (shifting volume not growing), unsub.",
      test_design: "holdout",
      success_criteria: "Rule conversion ≥ baseline + incremental TPV lift.",
      data_requirements: "Cross-product join keys, core usage metrics per product.",
      execution_notes: "Start with 1 rule (PL → NDS) to prove value, then expand.",
      risks_mitigations: "Conflicts across flows → integrate with priority/suppression governance.",
    },
    experiment: {
      title: "Behavioural Cross-Sell vs Generic Upsell",
      design_type: "ab_test",
      eligibility: "Start with ONE rule (recommended: PL high value → NDS)",
      treatment: "Behaviour-triggered cross-sell with 'why now' framing + deep link",
      control: "Generic NDS acquisition comms (or no NDS comms if none exists)",
      exposure_definition: "Entered rule segment + received targeted message within 48h",
      primary_kpi: "Upgrade conversion (NDS subscribe / enable)",
      secondary_kpis: "Post-upgrade retention, incremental usage metrics (paid links / transactions), click→start funnel rate",
      guardrails: "Unsub/complaints; downgrade/refund/chargeback; support contacts",
      duration: "4–6 weeks",
      success_criteria: "Higher conversion rate + incremental usage not cannibalisation only",
      notes: "Once proven, replicate for TTP→Card Reader and POS→TTP",
    },
  },

  // 5) Dormancy Ladder (7/14/30-day)
  {
    opportunity: {
      title: "Dormancy Ladder (7/14/30-day)",
      problem: "Dormancy is treated as one bucket; we miss earlier intervention windows.",
      insight: "You have recency fields (daysSinceLastTransaction, ttpLatestTransactionAt, paylink last created). Laddering improves relevance.",
      hypothesis: "If we tailor messaging by dormancy stage, we increase reactivation and reduce churn.",
      proposed_solution: "Create staged comms: 7d (gentle reminder + use case), 14d ('quick win' + friction removal), 30d (stronger reactivation + alternate product path).",
      audience_logic: "Per product: 'had activity before' AND 'last activity ≥ X days'.",
      primary_kpi: "Reactivation within 7 days of message.",
      secondary_kpis: "30-day retention, txn frequency post-reactivation, TPV.",
      guardrails: "Unsub/complaints, over-messaging conflicts.",
      test_design: "ab_test",
      success_criteria: "+X% reactivation; reduced long-term dormant pool.",
      data_requirements: "Accurate last activity fields per product.",
      execution_notes: "Pair with global 'max touches' governance.",
      risks_mitigations: "Too many triggers → use priority + channel rules.",
    },
    experiment: {
      title: "Dormancy Ladder (7/14/30-day)",
      design_type: "ab_test",
      eligibility: "Users with prior activity + entering dormancy (start with one product first: TTP or Card Reader)",
      treatment: "Ladder messaging at 7/14/30 with escalating angles",
      control: "Existing single dormancy trigger (e.g., 14-day lapsed)",
      exposure_definition: "First dormancy message delivered at day 7 threshold",
      primary_kpi: "Reactivation within 7 days of first ladder touch",
      secondary_kpis: "30-day retained active, transactions in next 30 days",
      guardrails: "Unsub/complaints; message volume per user",
      duration: "6 weeks (to cover full ladder cycle)",
      success_criteria: "+X pp reactivation and/or reduced 30-day dormant pool",
      notes: "Add strict suppressions so users don't get multiple rungs too close",
    },
  },

  // 6) Winback Campaign Overhaul
  {
    opportunity: {
      title: "Winback Campaign Overhaul",
      problem: "Winback flows exist but may be generic / low learning / not step-based.",
      insight: "Your data supports more nuanced winback (reason-based, behaviour-based, value-based).",
      hypothesis: "If we personalise winback by prior usage pattern and friction points, we'll increase return rate.",
      proposed_solution: "Refactor winback into 3 archetypes: 'Tried once' (confidence building), 'Used a lot then stopped' (value reminder + new feature), 'Creates but not paid' (conversion help).",
      audience_logic: "Segment by transaction count/recency/value.",
      primary_kpi: "Winback conversion (return to activity within 30 days).",
      secondary_kpis: "Sustained activity after 30 days, TPV.",
      guardrails: "Unsub/complaints, deliverability.",
      test_design: "ab_test",
      success_criteria: "+X pp uplift vs current winback conversion.",
      data_requirements: "Counts + recency + simple value bands.",
      execution_notes: "Keep copy benefit-led; add deep links.",
      risks_mitigations: "Complexity → start with 2 segments, expand.",
    },
    experiment: {
      title: "Segmented Winback (Reason-Based) vs Generic Winback",
      design_type: "ab_test",
      eligibility: "Lapsed users by product (start with Payment Links lapsed)",
      treatment: "3 segment winbacks (tried once / heavy then stopped / creates but not paid / previously active)",
      control: "Current generic winback",
      exposure_definition: "Entered lapsed segment + received winback within 24–48h",
      primary_kpi: "Reactivation (create paid link / transaction) within 14 days",
      secondary_kpis: "Repeat activity in 30 days, time-to-next-activity",
      guardrails: "Unsub/complaints, support contacts",
      duration: "6 weeks",
      success_criteria: "Meaningful uplift vs generic + stable guardrails",
      notes: "Ensure segments are mutually exclusive to avoid messy attribution",
    },
  },

  // 7) Unpaid Paylink Conversion Engine
  {
    opportunity: {
      title: "Unpaid Paylink Conversion Engine",
      problem: "Users create paylinks that remain unpaid; revenue sits stuck.",
      insight: "You already have explicit signal: unpaidPaylinks_created_7to30days_ago and last unpaid timestamps.",
      hypothesis: "If we intervene with 'get it paid' guidance + templates, paid conversion increases.",
      proposed_solution: "Trigger sequence when unpaid exists: Step 1 (resend + reminder), Step 2 (template text + invoice tips), Step 3 (suggest alternate method - TIC / card payment if relevant).",
      audience_logic: "paymentLink.unpaidPaylinks_created_7to30days_ago > 0",
      primary_kpi: "Paid conversion within 14 days.",
      secondary_kpis: "Avg days to receive payment, total paid links in 30 days.",
      guardrails: "Complaints, unsub, support tickets.",
      test_design: "holdout",
      success_criteria: "Paid conversion uplift + improved time-to-payment.",
      data_requirements: "Unpaid count + last unpaid date + deep link to paylinks list.",
      execution_notes: "Best delivered in-app + push; email as backup.",
      risks_mitigations: "Annoying users → cap frequency; exclude recent payers.",
    },
    experiment: {
      title: "Unpaid Paylinks Conversion Nudges (7–30d)",
      design_type: "holdout",
      eligibility: "unpaidPaylinks_created_7to30days_ago > 0",
      treatment: "Conversion engine (template + resend link + reminder guidance)",
      control: "BAU (no targeted unpaid conversion comms)",
      exposure_definition: "Received unpaid nudge within 48h of becoming eligible",
      primary_kpi: "Paid conversion within 7 days",
      secondary_kpis: "Time-to-payment, paid link count in 30 days",
      guardrails: "Unsub/complaints; support tickets; 'spam' negative feedback",
      duration: "4 weeks",
      success_criteria: "+X pp paid conversion uplift and improved time-to-pay",
      notes: "Add a frequency cap (max 1 unpaid campaign per 30d unless new unpaid batch)",
    },
  },

  // 8) Unified Acquiring Maturity Stage
  {
    opportunity: {
      title: "Unified Acquiring Maturity Stage",
      problem: "No shared 'where is this member in acquiring maturity' → orchestration conflicts and missed next steps.",
      insight: "Signals exist across products, but there's no unified stage field used for prioritisation.",
      hypothesis: "If we create a unified maturity stage, messaging becomes simpler, more consistent, and higher converting.",
      proposed_solution: "Define stages: 0 Eligible/Not enabled, 1 Enabled/No usage, 2 First success, 3 Active, 4 Power user, 5 At risk. Apply per product, then roll into a single 'acquiring stage'.",
      audience_logic: "All acquiring users; stage computed daily.",
      primary_kpi: "Activation and retention improvements; reduced conflicting sends.",
      secondary_kpis: "Cross-sell conversion; message fatigue indicators.",
      guardrails: "Complexity risk; wrong stage logic.",
      test_design: "pre_post",
      success_criteria: "Clear reduction in conflicts + measurable uplift in stage progression.",
      data_requirements: "Cross-product join + stage logic derived from existing fields.",
      execution_notes: "Implement in Data layer if possible; fallback to Iterable computed fields if needed.",
      risks_mitigations: "Disagreement on definitions → align in workshop and lock v1.",
    },
    experiment: {
      title: "Stage-Gated Messaging vs Product-Silo Messaging",
      design_type: "pre_post",
      eligibility: "Users in acquiring ecosystem (start with PL + TTP only)",
      treatment: "Apply stage-based gating rules to determine which lifecycle messages fire",
      control: "Existing product-level triggers without unified stage gating",
      exposure_definition: "Entered a defined stage and received only stage-appropriate comms",
      primary_kpi: "Stage progression (Eligible→Enabled, Enabled→First use, First use→Active)",
      secondary_kpis: "Conflict rate reduction, message volume per user, conversion per send",
      guardrails: "Accidental conversion drop in any stage",
      duration: "6–8 weeks",
      success_criteria: "Improved progression and reduced conflicts without harming activation",
      notes: "This is partly an operating model change—track governance metrics too",
    },
  },

  // 9) Flow Conflict Governance
  {
    opportunity: {
      title: "Flow Conflict Governance",
      problem: "Per-flow suppressions don't prevent cross-product over-messaging.",
      insight: "You have many live daily/profile flows across products; conflict risk is structural.",
      hypothesis: "If we add global priorities + caps, engagement improves and unsub decreases.",
      proposed_solution: "Define rules + implement in orchestration: Priority per flow, Max touches/day and per channel, Product-level priority rules, 'If eligible for multiple, pick top one'.",
      audience_logic: "System rule (applies to all members).",
      primary_kpi: "Unsub/complaint reduction + sustained CTR/CTOR.",
      secondary_kpis: "Downstream activation not harmed; fewer support complaints 'too many messages'.",
      guardrails: "Short-term send volume drop.",
      test_design: "staged_rollout",
      success_criteria: "Lower fatigue with stable or improved conversion.",
      data_requirements: "Centralised priority metadata; conflict detection (Atlas module).",
      execution_notes: "Start with email+push caps and a simple top-priority winner.",
      risks_mitigations: "Teams resist losing slots → use data; show conflict report from Atlas.",
    },
    experiment: {
      title: "Global Priority + Touch Caps Pilot",
      design_type: "staged_rollout",
      eligibility: "All users eligible for ≥2 live flows in a week (or start with one channel: email)",
      treatment: "Apply priority resolution + daily cap (e.g., max 1 email/day)",
      control: "Current per-flow suppressions only",
      exposure_definition: "A user would have received >1 message/day but was capped to 1 by governance",
      primary_kpi: "Unsub rate and complaint rate",
      secondary_kpis: "CTR/CTOR stability, conversions per send, deliverability (spam rate)",
      guardrails: "Total conversions (don't tank), critical comms delivery",
      duration: "4 weeks minimum",
      success_criteria: "Lower fatigue metrics while maintaining conversions",
      notes: "Track 'messages suppressed' count and 'missed conversion' proxies",
    },
  },

  // 10) PL Creator - Low Paid Rate Play
  {
    opportunity: {
      title: "PL Creator - Low Paid Rate Play",
      problem: "Users create links but few get paid → poor value realisation → churn risk.",
      insight: "You have created vs paid ratio signals.",
      hypothesis: "If we teach best practices and provide templates, paid rate increases.",
      proposed_solution: "'Improve your paid rate' play: 5 best practices, reminder cadence suggestion, 'due date + message clarity' examples, deep link to create.",
      audience_logic: "count_created_total >= 3 AND (count_paid_total / count_created_total) < threshold",
      primary_kpi: "Paid rate improvement (paid/created) next 30 days.",
      secondary_kpis: "Total paid links, avg days to paid, avg paid value.",
      guardrails: "Unsub/complaints, support tickets.",
      test_design: "ab_test",
      success_criteria: "Paid rate uplift + reduced time-to-payment.",
      data_requirements: "Created/paid totals, created/paid last 1–3 months, avg days.",
      execution_notes: "Make it a short 'checklist' format; use in-app first.",
      risks_mitigations: "Wrong threshold → start conservative and iterate.",
    },
    experiment: {
      title: "Low Paid-Rate Coaching vs No Coaching",
      design_type: "ab_test",
      eligibility: "created_total >= 3 AND paid_total/created_total < threshold",
      treatment: "Best-practice coaching + templates + resend/edit deep link",
      control: "BAU PL comms only",
      exposure_definition: "Received coaching message within 48h of qualification",
      primary_kpi: "Paid-rate uplift over next 30 days",
      secondary_kpis: "# paid links, time-to-pay, repeat creation",
      guardrails: "Unsub/complaints; support tickets",
      duration: "6 weeks",
      success_criteria: "Paid-rate improvement without negative guardrails",
      notes: "Keep tone 'help you get paid faster' (avoid blame)",
    },
  },

  // 11) Next Day Settlement for High TPV
  {
    opportunity: {
      title: "Next Day Settlement for High TPV",
      problem: "High-value users have cashflow needs but aren't adopting NDS.",
      insight: "You can identify PL values / paid amounts (and likely via acquiring usage).",
      hypothesis: "Value-based targeting will convert better than broad acquisition messaging.",
      proposed_solution: "Target users with high payment volumes/values with a cashflow-led pitch + clear deep link to upgrade.",
      audience_logic: "paymentLink.paid_paylink_with_highest_value >= X OR paymentLink.average_value_of_paid_paylinks >= Y (or product-specific TPV field when available)",
      primary_kpi: "NDS upgrade conversion rate.",
      secondary_kpis: "Incremental revenue, retention, satisfaction (complaints).",
      guardrails: "Affordability concerns, complaint rate.",
      test_design: "holdout",
      success_criteria: "Conversion uplift vs baseline NDS acquisition + incremental revenue.",
      data_requirements: "High value signals + NDS eligibility/upgrade tracking.",
      execution_notes: "Avoid discounts; focus on certainty/cashflow.",
      risks_mitigations: "Wrong value proxy → validate with Data, adjust thresholds.",
    },
    experiment: {
      title: "NDS Targeted High-Value Segment vs Broad Targeting",
      design_type: "ab_test",
      eligibility: "Proxy high value (e.g., highest paid link OR high paid count last 30d)",
      treatment: "Cashflow-led NDS pitch with deep link",
      control: "Existing NDS acquisition (or generic membership upsell)",
      exposure_definition: "Entered high-value cohort + received targeted NDS message",
      primary_kpi: "NDS conversion rate (subscription/enable)",
      secondary_kpis: "Incremental revenue, post-upgrade usage/retention",
      guardrails: "Complaints, downgrades, support contacts",
      duration: "4–6 weeks",
      success_criteria: "Better conversion efficiency and net incremental revenue",
      notes: "Add threshold sensitivity analysis after first readout",
    },
  },

  // 12) Sell More Online Ladder Optimization
  {
    opportunity: {
      title: "Sell More Online Ladder Optimization",
      problem: "Laddered triggers may be inconsistent across thresholds; risk of over/under-messaging and missed progression.",
      insight: "Multiple 'Sell More Online' flows exist with different thresholds; needs consolidation + sequencing.",
      hypothesis: "If we standardise a ladder (first success → habit → power user), retention and upsell increase.",
      proposed_solution: "Define ladder: First paid link → 'next best use case', 5 paid links → habit reinforcement, High value → NDS pitch, Lapse → winback.",
      audience_logic: "Based on paylink created/paid counts over 1/3/6 months.",
      primary_kpi: "Repeat paid links (2nd paid within 14 days; paid links/month).",
      secondary_kpis: "Avg paid value, time-to-payment, NDS upgrades.",
      guardrails: "Fatigue, unsub.",
      test_design: "pre_post",
      success_criteria: "More users progressing to higher bands + increased paid links per user.",
      data_requirements: "Counts by time window + last created/paid.",
      execution_notes: "Remove overlaps; ensure each step can trigger per week.",
      risks_mitigations: "Overlap persists → enforce governance rules.",
    },
    experiment: {
      title: "SMO Ladder Rebuild vs Current Threshold Flows",
      design_type: "ab_test",
      eligibility: "Users with PL activity (created/paid) entering SMO funnel bands",
      treatment: "Clean ladder (first success → habit → power user) with sequencing + suppressions",
      control: "Current set of SMO flows",
      exposure_definition: "First ladder step delivered",
      primary_kpi: "SMO adoption (whatever 'adoption' means: subscription/plan change, feature use)",
      secondary_kpis: "Paid links per user, repeat usage, NDS upgrades",
      guardrails: "Unsub/complaints; overlap/conflict counts",
      duration: "6 weeks",
      success_criteria: "Higher adoption with improved downstream PL usage",
      notes: "You may need to confirm exact SMO success metric with product/BI",
    },
  },

  // 13) TIC Adoption Improvement
  {
    opportunity: {
      title: "TIC Adoption Improvement",
      problem: "TIC signal set looks weaker; adoption likely under-driven or poorly targeted.",
      insight: "You have TIC enabled/onboarded/links created signals — but may lack mid-funnel intent.",
      hypothesis: "Improving onboarding + positioning for the right segment increases adoption and usage.",
      proposed_solution: "Two tracks: 'Why TIC' education (benefit + use cases), Behavioural triggers (created X links but not active). Plus add missing intent events (ties to instrumentation opportunity).",
      audience_logic: "ticEnabled = 1 AND ticCountOfLinksCreated = 0 (onboard gap) OR ticCountOfLinksCreated > 0 AND no recent activity (retention)",
      primary_kpi: "TIC links created per active user (7/30 days) OR activation to first link.",
      secondary_kpis: "Retention, conversion to paid outcomes (if measurable).",
      guardrails: "Unsub/complaints, support tickets.",
      test_design: "ab_test",
      success_criteria: "Uplift in first link created + sustained activity.",
      data_requirements: "TIC recency; ideally 'link paid' outcomes if exist.",
      execution_notes: "Keep it simple: 1–2 flows first.",
      risks_mitigations: "If product not ready → focus on education + instrumentation first.",
    },
    experiment: {
      title: "TIC Activation Journey (Enabled→First Link)",
      design_type: "ab_test",
      eligibility: "ticEnabled = 1 AND ticCountOfLinksCreated = 0",
      treatment: "2–3 step activation comms (use-cases + create link deep link)",
      control: "Current TIC acquisition comms only",
      exposure_definition: "Received 'create first link' message within 24h of enable/onboard",
      primary_kpi: "First link created within 7 days",
      secondary_kpis: "Links created in 30 days, repeat usage, latest transaction activity (if exists)",
      guardrails: "Unsub/complaints; support tickets",
      duration: "4–6 weeks",
      success_criteria: "+X pp uplift in first-link creation",
      notes: "If TIC is early, keep messaging education-heavy",
    },
  },

  // 14) TTP Transaction Momentum Builder
  {
    opportunity: {
      title: "TTP Transaction Momentum Builder",
      problem: "Users who transact once don't always build a habit.",
      insight: "You already trigger post 1st–5th transactions; can tighten into momentum ladder.",
      hypothesis: "If we reinforce 'repeat use' immediately after early success, we increase 30-day active rate.",
      proposed_solution: "After 1st transaction: reassurance + 'next best scenario', After 3rd/5th: tips + cross-sell (optional), After lapse: reactivation prompt.",
      audience_logic: "ttpTransactionCount in [1..5] with timing windows.",
      primary_kpi: "% reaching 5 transactions within 30 days of first.",
      secondary_kpis: "30-day active rate, txn frequency, avg value.",
      guardrails: "Unsub, complaints, fraud/chargebacks.",
      test_design: "ab_test",
      success_criteria: "Higher progression to 5 txns + higher 30-day retention.",
      data_requirements: "Transaction count + latest transaction timestamp.",
      execution_notes: "Use in-app/push for speed; email summary.",
      risks_mitigations: "Noise from low intent → add exclusions based on recency.",
    },
    experiment: {
      title: "TTP Momentum Ladder (1→5 tx)",
      design_type: "ab_test",
      eligibility: "ttpTransactionCount in {1,2,3,4,5} and recent activity",
      treatment: "Momentum ladder messages after 1st, 3rd, 5th transaction",
      control: "Current single 'encouragement' message",
      exposure_definition: "Received ladder message within 24h of qualifying transaction count",
      primary_kpi: "% reaching 5 transactions within 30 days of first",
      secondary_kpis: "30-day active rate, txn frequency, lapse rate at 14 days",
      guardrails: "Complaints/unsub; chargeback/refund",
      duration: "6 weeks",
      success_criteria: "Higher progression to 5 tx and higher 30-day active",
      notes: "Add suppression to avoid overlap with NDS upsell at same time",
    },
  },

  // 15) In-App Message Optimization
  {
    opportunity: {
      title: "In-App Message Optimization",
      problem: "In-app can be high intent but is often under-personalised / poorly timed.",
      insight: "You have deeplinks + product triggers; in-app can deliver 'do it now' guidance.",
      hypothesis: "If we align in-app timing with intent moments (install, delivered, created unpaid), conversion increases.",
      proposed_solution: "Create templates by stage: 'You're 1 step away' (activation), 'Finish setup', 'Try a test payment', 'Resend paylink'. Add guardrails + frequency caps.",
      audience_logic: "Driven by product triggers + intent events (once available).",
      primary_kpi: "Click→completion rate (in-app CTR to activation outcome).",
      secondary_kpis: "Downstream activation vs email.",
      guardrails: "User annoyance, app session disruption.",
      test_design: "ab_test",
      success_criteria: "Higher completion per exposure + lower unsub (since in-app).",
      data_requirements: "In-app exposure tracking; deep link tracking.",
      execution_notes: "Start with 2–3 highest-intent use cases (unpaid PL, delivered POS, installed TTP).",
      risks_mitigations: "Overuse → add caps + priority rules.",
    },
    experiment: {
      title: "In-App 'Do it now' Prompts vs Email/Push",
      design_type: "ab_test",
      eligibility: "High-intent moments (choose one: TTP install success + 0 tx, or unpaid PL cohort)",
      treatment: "In-app message with deep link + single action CTA",
      control: "Same content via email/push (or no in-app)",
      exposure_definition: "In-app impression occurred within an active session + click on CTA",
      primary_kpi: "Completion rate (activation action completed within 24–72h)",
      secondary_kpis: "Time-to-completion, CTR, reduced email unsub",
      guardrails: "App annoyance proxy (dismiss rate), support contacts",
      duration: "4 weeks",
      success_criteria: "Higher completion per exposed user with stable UX signals",
      notes: "You'll want impression tracking; otherwise measure on delivered-to-action",
    },
  },

  // 16) Add payment link usage tracking
  {
    opportunity: {
      title: "Add payment link usage tracking",
      problem: "We track creation/paid counts, but may not capture link lifecycle behaviours (views, resend, edits, reminders).",
      insight: "Better behavioural tracking improves conversion messaging and product feedback loops.",
      hypothesis: "If we track usage events, we can target interventions that increase paid conversion.",
      proposed_solution: "Add events: paylink viewed, resent, edited, reminder sent, opened link page, payer started/abandoned.",
      audience_logic: "PL users with stalled payments or low paid rate.",
      primary_kpi: "Paid conversion, time-to-payment.",
      secondary_kpis: "Drop-off rate by step, repeat usage, support contacts.",
      guardrails: "Tracking correctness; privacy.",
      test_design: "pre_post",
      success_criteria: "Actionable funnel insights + uplift from step-targeting.",
      data_requirements: "Event instrumentation to Iterable/warehouse.",
      execution_notes: "Prioritise 'resent' + 'viewed' + 'abandoned payer' if available.",
      risks_mitigations: "Engineering bandwidth → start with minimal set.",
    },
    experiment: {
      title: "PL Event Tracking Enables Step-Based Optimisation (Pilot)",
      design_type: "pre_post",
      eligibility: "All PL eligible/active users (start with a subset market if needed)",
      treatment: "Implement events (viewed/create/resend/edit/paid), then use to nudge drop-offs (e.g., created but not shared)",
      control: "BAU without step-based nudge",
      exposure_definition: "Fired 'created' event + no 'shared/resend' within 24h triggers nudge",
      primary_kpi: "Created→Paid conversion uplift (or created→shared if paid is too slow)",
      secondary_kpis: "Time-to-pay, paid count, repeat usage",
      guardrails: "Tracking accuracy, message fatigue",
      duration: "2 weeks QA + 4 weeks read",
      success_criteria: "Clear funnel + measurable uplift from drop-off nudge",
      notes: "Define 'share' proxy if direct share event not available",
    },
  },

  // 17) Seasonal Campaign Framework
  {
    opportunity: {
      title: "Seasonal Campaign Framework",
      problem: "Seasonal spikes are handled ad hoc; we lose speed and consistency.",
      insight: "You have an increasing set of products + audiences; a reusable framework reduces time-to-launch.",
      hypothesis: "If we standardise seasonal playbooks (segments + templates + measurement), we launch faster and learn more.",
      proposed_solution: "Create a 'Seasonal pack' per product: audience definitions, message angles, channels, KPI/guardrails, reusable templates + deep links.",
      audience_logic: "Seasonal priority cohorts (high intent, recently activated, high value) per product.",
      primary_kpi: "Incremental activation/usage during seasonal window.",
      secondary_kpis: "Longer-term retention; adoption of upgrades.",
      guardrails: "Fatigue/unsub.",
      test_design: "pre_post",
      success_criteria: "Faster launch time + measurable incremental uplift.",
      data_requirements: "Calendar tagging, consistent KPI definitions.",
      execution_notes: "Store these as 'Idea Bank' templates + link to opportunities.",
      risks_mitigations: "Becoming too generic → require product-specific versions.",
    },
    experiment: {
      title: "Seasonal Playbook Pack vs Ad-hoc Campaign",
      design_type: "pre_post",
      eligibility: "A defined seasonal cohort (e.g., lapsed PL users or new eligible TTP users during a peak window)",
      treatment: "Playbook-driven campaign (segmentation + template + KPIs pre-defined)",
      control: "Ad hoc BAU comms (or last season baseline)",
      exposure_definition: "Received seasonal campaign with defined timing/cadence",
      primary_kpi: "Incremental activation/usage during campaign window",
      secondary_kpis: "30-day retention after seasonal period",
      guardrails: "Unsub/complaints, fatigue metrics",
      duration: "2–3 weeks campaign + 4-week retention read",
      success_criteria: "Faster launch + measurable incremental lift vs baseline",
      notes: "Store playbook variants in Idea Bank for repeat",
    },
  },

  // 18) STO Expansion Audit
  {
    opportunity: {
      title: "STO Expansion Audit",
      problem: "STO is enabled in some flows but not others; we may be missing easy wins.",
      insight: "You already store STO flag per flow — can audit systematically.",
      hypothesis: "If we expand STO where appropriate, engagement and activation improve (especially for high-intent moments).",
      proposed_solution: "Audit flows with STO=No; classify: 'Should be STO' (high intent, time-sensitive), 'Should not' (broad education / low intent). Create backlog and implement top candidates.",
      audience_logic: "Not segment-specific; flow metadata review.",
      primary_kpi: "Engagement lift (CTR/CTOR) and downstream conversion.",
      secondary_kpis: "Unsub/complaints; send volume.",
      guardrails: "Fatigue risk if STO increases sends.",
      test_design: "ab_test",
      success_criteria: "Meaningful lift without harming fatigue metrics.",
      data_requirements: "STO capability + metrics by STO status.",
      execution_notes: "Start with 3 candidate flows: unpaid PL, delivered POS activation, installed TTP.",
      risks_mitigations: "Incorrect STO usage → add caps and governance.",
    },
    experiment: {
      title: "STO On vs Off for High-Intent Flows",
      design_type: "ab_test",
      eligibility: "Users entering specific high-intent triggers (pick 1–2 flows: unpaid PL, delivered CR activation)",
      treatment: "STO-enabled delivery (send at optimal time)",
      control: "Non-STO standard timing",
      exposure_definition: "STO send delivered within the 'best window' (define: local working hours)",
      primary_kpi: "Conversion rate on the targeted action (paid conversion / first txn)",
      secondary_kpis: "CTR/CTOR, time-to-action",
      guardrails: "Unsub/complaints; send-time annoyance",
      duration: "3–4 weeks",
      success_criteria: "Higher conversion without guardrail increase",
      notes: "Confirm STO capabilities/limits per channel",
    },
  },

  // 19) Multi-Product User VIP Program
  {
    opportunity: {
      title: "Multi-Product User VIP Program",
      problem: "High-value multi-product users are treated like everyone else; we miss retention/advocacy upside.",
      insight: "Your products have strong 'power user' signals (counts, values). A VIP track can protect and grow revenue.",
      hypothesis: "If we recognise and support power users, we increase retention and expansion.",
      proposed_solution: "Define VIP criteria (e.g., high PL paid value OR frequent TTP/POS usage). Provide: proactive tips, early access / education, dedicated support prompts, relevant upgrades (NDS).",
      audience_logic: "Power user thresholds per product + multi-product mix.",
      primary_kpi: "Retention/TPV for VIP cohort vs control.",
      secondary_kpis: "Upgrade adoption (NDS), satisfaction proxies (complaints/support contacts).",
      guardrails: "Fairness perception, not over-promising benefits.",
      test_design: "holdout",
      success_criteria: "Improved retention + incremental upgrade adoption.",
      data_requirements: "Value signals (TPV proxies), product mix.",
      execution_notes: "Keep perks 'soft' first (education/support) — no discounts.",
      risks_mitigations: "VIP definition too broad → start narrow and expand.",
    },
    experiment: {
      title: "VIP Track (High Engagement) vs Standard Lifecycle",
      design_type: "holdout",
      eligibility: "Users active in 2+ products OR above thresholds (e.g., PL paid + TTP tx count)",
      treatment: "VIP comms: fewer touches, higher value content, proactive tips, targeted upgrades",
      control: "Standard product flows (with current suppressions)",
      exposure_definition: "Received VIP digest/sequence instead of multiple product messages",
      primary_kpi: "60-day retention (multi-product activity) and/or TPV proxy",
      secondary_kpis: "Upgrade adoption, lower unsub/complaints",
      guardrails: "Perceived unfairness isn't measurable; track complaints/support sentiment",
      duration: "8 weeks (VIP effects are slower)",
      success_criteria: "Higher retention and lower fatigue vs control",
      notes: "Start with 'soft VIP' (education + tips)",
    },
  },
];

export async function seedFullOpportunities() {
  const results = {
    deduped: 0,
    opportunitiesUpdated: 0,
    experimentsCreated: 0,
    errors: [] as string[],
  };

  try {
    console.log("Starting full opportunities and experiments seed...");

    // Step 1: DEDUPLICATE OPPORTUNITIES
    console.log("\n=== Step 1: Deduplicating opportunities ===");

    // Get all opportunities grouped by title
    const { data: allOpportunities, error: fetchError } = await supabase
      .from("opportunities")
      .select("id, title, created_at, status")
      .order("title")
      .order("created_at");

    if (fetchError) {
      throw new Error(`Failed to fetch opportunities: ${fetchError.message}`);
    }

    // Group by title and find duplicates
    const titleGroups = new Map<string, any[]>();
    for (const opp of (allOpportunities as any[]) || []) {
      if (!titleGroups.has(opp.title)) {
        titleGroups.set(opp.title, []);
      }
      titleGroups.get(opp.title)!.push(opp);
    }

    // For each title group with duplicates, keep the oldest and archive the rest
    for (const [title, opportunities] of titleGroups.entries()) {
      if (opportunities.length > 1) {
        // Sort by created_at to get the oldest
        opportunities.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const canonical = opportunities[0];
        const duplicates = opportunities.slice(1);

        console.log(`Found ${duplicates.length} duplicates for "${title}"`);
        console.log(`  Keeping: ${canonical.id} (created ${canonical.created_at})`);

        // Delete duplicates (use 'rejected' status instead of 'archived')
        for (const dup of duplicates) {
          const { error: deleteError } = await supabase
            .from("opportunities")
            .delete()
            .eq("id", dup.id);

          if (deleteError) {
            console.error(`  Failed to delete duplicate ${dup.id}: ${deleteError.message}`);
            results.errors.push(`Failed to remove duplicate: ${title}`);
          } else {
            console.log(`  Deleted duplicate: ${dup.id}`);
            results.deduped++;
          }
        }
      }
    }

    console.log(`\nDeduplication complete: ${results.deduped} duplicates handled`);

    // Step 2 & 3: POPULATE OPPORTUNITIES AND CREATE EXPERIMENTS
    console.log("\n=== Step 2 & 3: Populating opportunities and creating experiments ===");

    for (const item of OPPORTUNITIES_DATA) {
      const { opportunity, experiment } = item;

      try {
        // Find the canonical opportunity by title
        const { data: existingOpp, error: oppFetchError } = await supabase
          .from("opportunities")
          .select("id, problem, product_id")
          .eq("title", opportunity.title)
          .maybeSingle();

        if (oppFetchError) {
          console.error(`Error fetching opportunity "${opportunity.title}": ${oppFetchError.message}`);
          results.errors.push(`Failed to fetch: ${opportunity.title}`);
          continue;
        }

        if (!existingOpp) {
          console.log(`Opportunity not found: "${opportunity.title}" - skipping`);
          results.errors.push(`Not found: ${opportunity.title}`);
          continue;
        }

        // Update opportunity if not already populated (check problem field)
        if (!(existingOpp as any).problem || (existingOpp as any).problem.trim() === "") {
          const { error: updateError } = await supabase
            .from("opportunities")
            .update({
              problem: opportunity.problem,
              insight: opportunity.insight,
              hypothesis: opportunity.hypothesis,
              proposed_solution: opportunity.proposed_solution,
              audience_logic: opportunity.audience_logic,
              primary_kpi: opportunity.primary_kpi,
              secondary_kpis: opportunity.secondary_kpis,
              guardrails: opportunity.guardrails,
              test_design: opportunity.test_design,
              success_criteria: opportunity.success_criteria,
              data_requirements: opportunity.data_requirements,
              execution_notes: opportunity.execution_notes,
              risks_mitigations: opportunity.risks_mitigations,
            } as any)
            .eq("id", (existingOpp as any).id);

          if (updateError) {
            console.error(`Failed to update opportunity "${opportunity.title}": ${updateError.message}`);
            results.errors.push(`Failed to update: ${opportunity.title}`);
            continue;
          }

          console.log(`✓ Updated opportunity: "${opportunity.title}"`);
          results.opportunitiesUpdated++;
        } else {
          console.log(`○ Opportunity already populated: "${opportunity.title}"`);
        }

        // Create experiment if it doesn't exist
        const { data: existingExp, error: expFetchError } = await supabase
          .from("experiments")
          .select("id")
          .eq("opportunity_id", (existingOpp as any).id)
          .maybeSingle();

        if (expFetchError) {
          console.error(`Error checking experiment for "${opportunity.title}": ${expFetchError.message}`);
          results.errors.push(`Failed to check experiment: ${opportunity.title}`);
          continue;
        }

        if (!existingExp) {
          const { error: createExpError } = await supabase
            .from("experiments")
            .insert({
              title: experiment.title,
              opportunity_id: (existingOpp as any).id,
              design_type: experiment.design_type,
              eligibility: experiment.eligibility,
              treatment: experiment.treatment,
              control: experiment.control,
              exposure_definition: experiment.exposure_definition,
              primary_kpi: experiment.primary_kpi,
              secondary_kpis: experiment.secondary_kpis,
              guardrails: experiment.guardrails,
              duration: experiment.duration,
              success_criteria: experiment.success_criteria,
              notes: experiment.notes,
              status: "draft",
            } as any);

          if (createExpError) {
            console.error(`Failed to create experiment for "${opportunity.title}": ${createExpError.message}`);
            results.errors.push(`Failed to create experiment: ${opportunity.title}`);
            continue;
          }

          console.log(`✓ Created experiment: "${experiment.title}"`);
          results.experimentsCreated++;
        } else {
          console.log(`○ Experiment already exists for: "${opportunity.title}"`);
        }
      } catch (err) {
        console.error(`Error processing "${opportunity.title}":`, err);
        results.errors.push(`Error processing: ${opportunity.title}`);
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Duplicates handled: ${results.deduped}`);
    console.log(`Opportunities updated: ${results.opportunitiesUpdated}`);
    console.log(`Experiments created: ${results.experimentsCreated}`);
    console.log(`Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log("\nErrors encountered:");
      results.errors.forEach(err => console.log(`  - ${err}`));
    }

    revalidatePath("/opportunities");
    revalidatePath("/experiments");

    return {
      success: true,
      ...results,
    };
  } catch (error) {
    console.error("Fatal error during seed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      ...results,
    };
  }
}
