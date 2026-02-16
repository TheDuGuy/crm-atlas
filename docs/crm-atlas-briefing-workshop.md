# CRM Atlas: Findings, Recommendations & Workshop Plan

**Prepared for:** CRM + Product + Data Brainstorming Session
**Format:** 45–60 min FigJam Workshop (sticky notes + dot voting)
**Source of truth:** CRM Atlas (Next.js + Supabase)
**Date:** February 2026

---

## A) Executive Summary

1. **What we have today.** CRM Atlas maps our full acquiring ecosystem: products, fields, events, flows, deeplinks, suppressions, and a backlog of 19 strategic opportunities—each with a linked experiment plan. We have a single source of truth for the first time.

2. **What's working.** Core lifecycle flows exist across Payment Links, TTP, Card Reader, and TIC. Suppression logic sits inside individual flows. We have usable recency/frequency/value fields for most products. STO is enabled on select high-intent flows (e.g., NDS Acquisition).

3. **What's not working.** We operate in product silos. There is no unified lifecycle stage, no cross-product orchestration layer, and no global touch-frequency governance. Most triggers are scheduled or profile-updated—not intent-based. Mid-funnel visibility is nearly zero: we see eligibility and outcomes but not the steps in between.

4. **Biggest leverage.** Five plays account for most of the upside: (i) cross-product upgrade engine, (ii) unpaid paylink conversion, (iii) dormancy ladder precision, (iv) flow conflict governance, and (v) unified maturity staging. All five have experiment plans ready.

5. **What we need from Product and Data.** 15 missing signals have been identified (9 fields, 6 events). The highest-priority asks are: `feature_page_viewed`, `onboarding_step_completed`, `deeplink_clicked`, `card_reader_setup_completed`, and `monthly_tpv_band`. Without these, mid-funnel targeting and value-based segmentation remain guesswork.

---

## B) Current-State Inventory

### B.1 Atlas Coverage by Product

| Product | Fields | Events | Flows | Deeplinks | Notes |
|---|---|---|---|---|---|
| Payment Links | Core set (created/paid counts, values, recency, unpaid signals) | `payment_link_created` | Share Payment Details + SMO flows | Yes | Strongest signal coverage; missing lifecycle events (view/resend/edit) |
| TTP (Tap to Pay) | Transaction count, latest tx date, install success | Limited | Momentum/activation flows | Yes | Good recency signals; missing mid-funnel intent |
| Card Reader | Delivery status, potential churn flag, days since last tx | Limited | Post-delivery activation | Yes | Key gap: no setup_completed event |
| TIC | Enabled/onboarded/links created | `tic_checkout_started` | Acquisition comms | Yes | Weakest signal set; adoption under-driven |
| NDS (Next Day Settlement) | Subscription status | — | NDS Acquisition (event-based, STO on) | Yes | One flow; needs value-based targeting |
| Tools/Boosts (SMO) | SMO feature flags | — | Multiple SMO threshold flows | Yes | Flow overlap risk; needs consolidation |

### B.2 Lifecycle Coverage Matrix

| Stage | Payment Links | TTP | Card Reader | TIC | NDS |
|---|---|---|---|---|---|
| **Acquisition/Eligibility** | Covered | Covered | Covered | Covered (weak) | Covered |
| **Activation (first success)** | Partial | Partial | Gap (delivery→tx) | Gap | N/A |
| **Habit / Repeat use** | SMO ladder (messy) | Post-1st tx triggers | Minimal | Minimal | N/A |
| **Retention / At-risk** | Not laddered | Not laddered | potentialChurn flag | None | None |
| **Winback / Lapsed** | Generic winback | Generic | None specific | None | None |
| **Upsell / Cross-sell** | NDS upsell exists | None | None | None | N/A |

**Key takeaway:** Acquisition is broadly covered. Activation has structural gaps (especially Card Reader delivery→transaction and TIC enabled→first link). Retention and winback are generic, not staged. Cross-sell is a greenfield.

### B.3 Signal Strength Assessment

**Strong signals (can act on today):**
- PL created/paid counts and ratios
- PL unpaid paylinks (7–30d window)
- TTP transaction count and recency
- Card Reader delivery status + days since last tx
- Card Reader potentialChurn flag

**Weak signals (limited or missing):**
- No mid-funnel intent events (page views, onboarding steps, deeplink clicks)
- No unified maturity stage across products
- No monthly TPV band for value segmentation
- No message fatigue score for governance
- TIC has minimal behavioural data beyond enabled/links created

### B.4 Trigger Mix Observations

| Trigger Type | Current Usage | Issue |
|---|---|---|
| **Scheduled** | Primary trigger for most flows (e.g., Share Payment Details: every 30 days) | Blunt; doesn't respond to user behaviour |
| **Profile-updated** | Used for threshold-based flows (transaction counts, paid counts) | Better, but still batch-oriented; not real-time |
| **Event-based** | Rare—only NDS Acquisition and some TIC flows | Under-used; highest-value trigger type |
| **Intent-based** | Non-existent | Cannot target mid-funnel actions (viewed, started, clicked) because events don't exist |

**Assessment:** Over-reliance on scheduled/profile-updated triggers means we're messaging based on *what users are* rather than *what users are doing right now*. This is the single biggest structural gap.

---

## C) Key Patterns & Risks

### C.1 Over-reliance on scheduled triggers

Most flows fire on schedules or profile snapshots. Example: "Share Payment Details" triggers every 30 days based on inactivity. This means a user who just viewed the PL creation page (high intent) gets the same message cadence as someone who hasn't opened the app in months. Without intent events, we can't distinguish them.

**Impact:** Lower conversion per send, wasted touches, higher fatigue risk.

### C.2 Cross-product orchestration conflicts

Each product team owns its flows independently. A user active in PL, TTP, and Card Reader can receive messages from multiple product flows on the same day. Current per-flow suppressions only prevent duplicates *within* a flow—not *across* products.

**Example:** A PL power user who also has a Card Reader could receive: (1) Share Payment Details reminder, (2) NDS upsell, (3) Card Reader activation nudge—all on the same day.

**Impact:** Message fatigue, rising unsub rate, diminishing engagement.

### C.3 Per-flow suppressions: necessary but not sufficient

Every flow has its own suppression logic. This prevents obvious duplicates (don't send the same flow twice in X days). But it cannot:
- Enforce a global daily cap across products
- Prioritise which message wins when a user qualifies for 3 flows
- Detect that a user has already been contacted by another team's flow today

**What's needed:** A governance layer with flow priorities, daily/channel caps, and a "pick the top one" resolution mechanism.

### C.4 Mid-funnel instrumentation gaps

We can see the start (eligibility) and the end (transaction/paid link). We cannot see:
- Did the user view the feature page?
- Did they start onboarding?
- Did they click a deeplink?
- Where exactly did they drop off?

This makes lifecycle optimisation blunt. We can't build "started but didn't finish" flows because we have no "started" event.

**Products most affected:** TTP (install→first tx gap), Card Reader (delivered→setup→first tx), TIC (enabled→first link).

### C.5 STO usage

| Flow | STO Enabled? | Assessment |
|---|---|---|
| NDS Acquisition | Yes | Correct: event-based, high-intent |
| Share Payment Details | No | Should test: scheduled flow, engagement matters |
| Card Reader activation | No | Should test: time-sensitive post-delivery |
| TTP momentum | No | Should test: transaction-based triggers |

**Assessment:** STO is under-deployed. Only 1 of our documented flows uses it. High-intent flows (post-delivery activation, unpaid PL nudges, installed TTP) are prime candidates for STO expansion.

---

## D) Top Opportunities (Ranked from Atlas)

### D.1 Cross-Product Upgrade Engine

| | |
|---|---|
| **Problem** | We treat products in silos; we miss "next best product" moments. |
| **Insight** | Strong signals exist: TTP tx count, PL paid values, Card Reader activity—plus deeplinks for upgrades. |
| **Proposed Solution** | Define 3–5 upgrade rules (behaviour → next product) with deep links. Start with PL high value → NDS. |
| **Impact / Effort / Confidence** | 5 / 4 / — |
| **Data Requirements** | Cross-product join keys, core usage metrics per product. Mostly available today. |
| **Experiment** | "Behavioural Cross-Sell vs Generic Upsell" — A/B test, 4–6 weeks. Start with ONE rule (PL high value → NDS). Treatment: behaviour-triggered cross-sell with "why now" framing + deep link. Control: generic NDS comms. Primary KPI: upgrade conversion (NDS subscribe/enable). |
| **Risks** | Flow conflicts with existing NDS acquisition → integrate with governance. Cannibalisation risk → measure incremental usage, not just conversion. |

### D.2 Unpaid Paylink Conversion Engine

| | |
|---|---|
| **Problem** | Users create paylinks that remain unpaid; revenue sits stuck. |
| **Insight** | Explicit signal exists: `unpaidPaylinks_created_7to30days_ago`. |
| **Proposed Solution** | Trigger sequence: resend + reminder → template text + invoice tips → suggest alternate payment method. |
| **Impact / Effort / Confidence** | 4 / 3 / — |
| **Data Requirements** | Unpaid count + last unpaid date + deep link. All available today. |
| **Experiment** | "Unpaid Paylinks Conversion Nudges (7–30d)" — Holdout, 4 weeks. Primary KPI: paid conversion within 7 days. Cap: max 1 campaign per 30d per user. |
| **Risks** | Annoying users → frequency cap; exclude recent payers. |

### D.3 Dormancy Ladder (7/14/30-day)

| | |
|---|---|
| **Problem** | Dormancy treated as one bucket; we miss earlier intervention windows. |
| **Insight** | Recency fields exist (daysSinceLastTransaction, ttpLatestTransactionAt). Laddering improves relevance. |
| **Proposed Solution** | Staged comms: 7d (gentle reminder), 14d (quick win + friction removal), 30d (stronger reactivation + alt product). |
| **Impact / Effort / Confidence** | 5 / 3 / — |
| **Data Requirements** | Accurate last-activity fields per product. Available today. |
| **Experiment** | "Dormancy Ladder" — A/B test, 6 weeks. Start with one product (TTP or Card Reader). Treatment: ladder at 7/14/30 with escalating angles. Control: existing single dormancy trigger (14-day lapsed). Primary KPI: reactivation within 7 days of first touch. |
| **Risks** | Multiple rungs too close → add strict suppressions. Cross-product overlap → pair with governance. |

### D.4 Unified Acquiring Maturity Stage

| | |
|---|---|
| **Problem** | No shared "where is this member in acquiring maturity" → orchestration conflicts and missed next steps. |
| **Insight** | Signals exist across products, but no unified stage field for prioritisation. |
| **Proposed Solution** | Define stages: 0 Eligible → 1 Enabled → 2 First success → 3 Active → 4 Power user → 5 At risk. Compute daily. |
| **Impact / Effort / Confidence** | 5 / 4 / — |
| **Data Requirements** | Cross-product join + stage logic from existing fields. Needs Data team to build + maintain. |
| **Experiment** | "Stage-Gated Messaging vs Product-Silo Messaging" — Pre/post, 6–8 weeks. Start with PL + TTP. Primary KPI: stage progression rates. |
| **Risks** | Definition disagreement → lock v1 in this workshop. Partly an operating model change—needs buy-in. |

### D.5 Flow Conflict Governance

| | |
|---|---|
| **Problem** | Per-flow suppressions don't prevent cross-product over-messaging. |
| **Insight** | Multiple live daily/profile flows across products; conflict risk is structural. |
| **Proposed Solution** | Global priority per flow + max touches/day per channel + "if eligible for multiple, pick top one." |
| **Impact / Effort / Confidence** | 4 / 4 / — |
| **Data Requirements** | Centralised priority metadata (already in Atlas). Conflict detection logic. `message_fatigue_score` field (missing signal). |
| **Experiment** | "Global Priority + Touch Caps Pilot" — Staged rollout 10% → 50% → 100%, 4+ weeks. Start with email. Primary KPI: unsub rate and complaint rate. |
| **Risks** | Teams resist losing send slots → use Atlas conflict data to demonstrate need. Short-term send volume drop expected. |

### D.6 Card Reader Delivery-to-Transaction Gap

| | |
|---|---|
| **Problem** | Devices delivered but never used. Lost activation + wasted acquisition cost. |
| **Insight** | Delivery status + recency fields exist = perfect activation trigger. |
| **Proposed Solution** | Post-delivery ladder: Day 0 (setup checklist), Day 2 (PIN + tips), Day 5 (troubleshoot), Day 10 (support escalation). |
| **Experiment** | "Post-Delivery Activation Ladder" — A/B test 50/50, 4 weeks. Primary KPI: first tx within 7 days. |
| **Data Requirements** | Delivered flag available. Missing: `card_reader_setup_completed` event. |

### D.7 Churn Prediction Model

| | |
|---|---|
| **Problem** | We react to churn late, after inactivity/TPV drop. |
| **Proposed Solution** | v1: rules-based risk score using recency/frequency/value. v2: ML model with Data. Graduated interventions by risk band. |
| **Experiment** | "Churn Risk Save Program (Rules-based v1)" — Holdout, 4+ weeks. Primary KPI: 30-day reactivation rate. |
| **Data Requirements** | Recency/frequency/value available. Trend deltas (7/30d vs prior) would improve accuracy—needs Data. |

### D.8 Mid-Funnel Intent Instrumentation

| | |
|---|---|
| **Problem** | We see eligibility and outcomes but miss intent steps. |
| **Proposed Solution** | Instrument: feature_page_viewed, activation_started, deeplink_clicked, setup_completed, failed_reason. |
| **Experiment** | "Intent Events Enable Step-Based Retargeting" — Pre/post with QA cohort, 2+4 weeks. Start with TTP. |
| **Data Requirements** | All new events. Requires Product + Engineering. |

### D.9–D.19 Additional Opportunities (in Atlas)

| # | Opportunity | Design | Duration | Key Dependency |
|---|---|---|---|---|
| 6 | Winback Campaign Overhaul | A/B test | 6 wks | Segment logic (available) |
| 10 | PL Low Paid Rate Coaching | A/B test | 6 wks | Created/paid ratios (available) |
| 11 | NDS High-Value Targeting | A/B test | 4–6 wks | `monthly_tpv_band` (missing) |
| 12 | SMO Ladder Rebuild | A/B test | 6 wks | Flow consolidation (CRM work) |
| 13 | TIC Activation Journey | A/B test | 4–6 wks | TIC signals (weak) |
| 14 | TTP Momentum Ladder | A/B test | 6 wks | Tx count fields (available) |
| 15 | In-App Message Optimisation | A/B test | 4 wks | In-app impression tracking (missing) |
| 16 | PL Lifecycle Event Tracking | Pre/post | 2+4 wks | New events (Engineering) |
| 17 | Seasonal Campaign Framework | Pre/post | 2–3 + 4 wks | Playbook templates (CRM) |
| 18 | STO Expansion Audit | A/B test | 3–4 wks | STO capability per channel (check) |
| 19 | VIP Multi-Product Program | Holdout | 8 wks | Value signals + product mix (partial) |

---

## E) Missing Signals Wishlist

### E.1 Priority 1: Unlock mid-funnel targeting (Events)

| Signal | Type | Why It Matters | What It Unlocks | QA / Validation |
|---|---|---|---|---|
| `feature_page_viewed` | Event | Only intent signal for "browsed but didn't act" | Warm-lead activation for any product | Expect high volume; validate against page analytics. Check: fires only on feature pages, not all pages. |
| `onboarding_step_completed` | Event | Track progress per product; rescue stuck users | Step-based retargeting (Opp #2) | Validate step IDs match onboarding flow. Expected: 1 event per step per user. QA with small cohort first. |
| `deeplink_clicked` | Event | Measure deeplink effectiveness; attribute conversions | Campaign attribution; in-app optimisation (Opp #15) | Cross-reference with Iterable click tracking. Volume should correlate with send volume. |
| `card_reader_setup_completed` | Event | Distinguish delivered vs. set up; target setup abandoners | Card Reader activation ladder (Opp #3) | Validate: fires only once per device. Expected volume: ~same as delivery events. |

### E.2 Priority 2: Enable value segmentation (Fields)

| Signal | Type | Why It Matters | What It Unlocks | QA / Validation |
|---|---|---|---|---|
| `monthly_tpv_band` | Field | Essential for NDS targeting and upgrade rules | Cross-product upgrade engine (Opp #4), NDS targeting (Opp #11) | Bands: <£1k, £1–5k, £5–10k, £10k+. Validate against transaction logs. Computed daily. |
| `product_adoption_stage` | Field | Unified lifecycle stage across products | Maturity staging (Opp #8), governance (Opp #9) | Values: 0–5 per product. Validate: no user stuck at stage 0 who has transactions. |
| `message_fatigue_score` | Field | Track send frequency + open-rate decline | Auto-suppress over-messaged users; governance (Opp #9) | Compute from send logs. Validate: high scores correlate with low engagement. |

### E.3 Priority 3: Product-specific enrichment (Fields + Events)

| Signal | Type | Why It Matters | What It Unlocks | QA / Validation |
|---|---|---|---|---|
| `paylink_share_method` | Field | Know if shared via SMS, email, WhatsApp, QR | Channel-specific PL optimisation | Validate against PL creation flow. Not all methods may be trackable. |
| `paylink_payment_method_used` | Field | Card vs. bank transfer vs. Apple Pay | Payment method education flows | Validate against payment processor data. |
| `tic_cart_abandonment` | Event | TIC conversion recovery | TIC adoption improvement (Opp #13) | Validate: fires when checkout started but not completed within X minutes. |
| `sell_more_online_feature_usage` | Field | Which SMO features used (invoicing, bookings, etc.) | SMO ladder personalisation (Opp #12) | Validate against feature toggle flags. |
| `ttp_location_type` | Field | Market stall, pop-up, delivery | Use-case-specific TTP messaging | May require user survey or inference. Low confidence in auto-detection. |
| `support_ticket_category` | Field | Common pain points by product | Proactive education flows | Source from support system. Validate category taxonomy. |
| `peer_referral_source` | Field | Referral attribution | Referrer rewards, social proof | Source from acquisition tracking. |
| `seasonal_business_type` | Field | Ice cream shop, Christmas markets, etc. | Seasonal campaign targeting (Opp #17) | Low confidence in auto-detection. May need user input. |

---

## F) Action Plan & Sequencing

### F.1 Ship in 1–2 Weeks (No New Data Required)

| # | Action | Owner | Dependencies | Notes |
|---|---|---|---|---|
| 1 | Launch Unpaid Paylink Conversion Nudges (holdout test) | CRM | Deep link to paylinks list | Signal exists: `unpaidPaylinks_created_7to30days_ago`. Ready to build in Iterable. |
| 2 | Launch Dormancy Ladder for TTP (A/B test) | CRM | None | Fields exist: `ttpLatestTransactionAt`, `ttpTransactionCount`. Start single product. |
| 3 | Launch PL Low Paid Rate Coaching (A/B test) | CRM | None | Fields exist: `count_created_total`, `count_paid_total`. |
| 4 | STO Expansion: enable on 2–3 high-intent flows | CRM | Confirm STO capability per channel | Audit existing flows. Toggle in Iterable. |
| 5 | Build Cross-Product Upgrade Rule #1: PL high-value → NDS | CRM + Product | Agree on value threshold | Use existing paid value fields. |
| 6 | Publish flow priority matrix in Atlas | CRM | None | Already have priority field in schema. Populate for all live flows. |
| 7 | Winback A/B: segment PL lapsed users into 3 archetypes | CRM | None | Use existing count/recency fields for segmentation. |
| 8 | Card Reader post-delivery ladder (A/B test) | CRM | None | delivery status + recency fields exist. Build 4-step sequence. |

### F.2 Needs Data Support (2–6 Weeks)

| # | Signal / Work | Why | Priority | Owner |
|---|---|---|---|---|
| 1 | `feature_page_viewed` event | Unlocks mid-funnel targeting for all products | P1 | Data + Engineering |
| 2 | `onboarding_step_completed` event | Step-based retargeting | P1 | Data + Engineering |
| 3 | `deeplink_clicked` event | Campaign attribution + in-app optimisation | P1 | Data + Engineering |
| 4 | `card_reader_setup_completed` event | Card Reader activation gap | P1 | Data + Engineering |
| 5 | `monthly_tpv_band` field | Value-based segmentation for NDS + upgrades | P2 | Data |
| 6 | `product_adoption_stage` field | Unified maturity staging | P2 | Data + CRM |
| 7 | `message_fatigue_score` field | Governance automation | P2 | Data + CRM |
| 8 | PL lifecycle events (`paylink_viewed`, `paylink_resent`, `payer_abandoned`) | PL funnel visibility | P2 | Data + Engineering |

### F.3 Longer-Term (6+ Weeks)

| Initiative | Description | Dependencies |
|---|---|---|
| **Unified maturity state model** | Single `product_adoption_stage` field computed daily across all products. Enables stage-gated messaging. | Aligned stage definitions (lock in workshop), Data pipeline, governance buy-in. |
| **Governance automation** | Global priority resolution + daily touch caps enforced at send time. Atlas conflict detector drives suppression. | `message_fatigue_score`, flow priority matrix, Iterable orchestration. |
| **Experimentation maturity** | Move from ad-hoc tests to systematic experiment calendar. Every opportunity has a linked experiment plan (done). Next: automated readout dashboards, holdout methodology, power calculations. | BI/Analytics support, Looker integration. |
| **Propensity / ML models** | v2 churn prediction (ML), next-best-product model, LTV prediction for value-based targeting. | Data Science capacity, feature store, model serving. |

### F.4 Lightweight RACI

| Workstream | CRM | Product | Data | Engineering |
|---|---|---|---|---|
| Quick-win flow launches (F.1) | **R/A** | C | I | I |
| Cross-product upgrade rules | **R** | **A** | C | I |
| Flow priority + governance design | **R/A** | C | C | I |
| Mid-funnel event instrumentation | C | **A** | R | **R** |
| Value segmentation fields | C | C | **R/A** | I |
| Unified maturity stage | **R** | **A** | **R** | C |
| Experiment readout infra | C | I | **R/A** | C |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

## G) Facilitator Plan: FigJam Workshop

### Overview

- **Duration:** 50 minutes (with 10 min buffer)
- **Participants:** CRM, Product, Data (6–12 people)
- **Pre-read:** Share Section A (exec summary) + Section D (top opportunities) 24h before
- **Output:** 3 quick wins committed, 1 Data ask prioritised, 1 governance decision, 1 instrumentation pilot selected

### FigJam Setup: 6 Frames

Create these frames in FigJam before the session:

```
Frame 1: "Current State" (reference only)
Frame 2: "Quick Wins: What Can We Ship This Sprint?"
Frame 3: "Data Asks: What Do We Need from Data/Engineering?"
Frame 4: "Governance: How Do We Stop Over-Messaging?"
Frame 5: "Instrumentation: Where Do We Need Visibility?"
Frame 6: "Decisions & Owners"
```

### Timed Agenda

#### 0:00–0:05 | Context Setting (Facilitator presents)

- Share screen on Frame 1.
- Walk through the 5 exec summary bullets.
- State the goal: "We leave with 3 committed quick wins, 1 prioritised Data ask, 1 governance decision, and 1 instrumentation pilot."
- No discussion yet—just context.

#### 0:05–0:15 | Frame 2: Quick Wins (Silent sticky notes → discussion)

**Sticky note prompt (show on frame):**

> "Which opportunity from the backlog should we ship first—and why? One idea per sticky. Think: biggest impact with what we have today."

- **2 minutes silent:** Everyone adds stickies.
- **3 minutes:** Group similar stickies. Facilitator reads clusters aloud.
- **5 minutes discussion:** Debate top clusters. Use Atlas experiment plans as reference.

**Dot voting:**
- Each participant gets **3 votes**.
- Vote on the opportunity you want to commit to shipping first.
- Top 3 become committed quick wins.

#### 0:15–0:25 | Frame 3: Data Asks (Silent sticky notes → discussion)

**Sticky note prompt:**

> "What signal (field or event) would unlock the most value if we had it? What can't you do today because the data doesn't exist?"

- **2 minutes silent:** Everyone adds stickies. Reference the Missing Signals wishlist (Section E).
- **3 minutes:** Group and read aloud.
- **5 minutes discussion:** Data team reacts with feasibility ("easy / medium / hard") annotations.

**Dot voting:**
- Each participant gets **3 votes**.
- Vote on the signal you'd prioritise.
- Top 1 becomes the committed Data ask with owner and target date.

#### 0:25–0:35 | Frame 4: Governance (Structured discussion)

**Sticky note prompt:**

> "What rule would you implement tomorrow to reduce message fatigue? (e.g., max emails/day, flow priority, channel caps)"

- **2 minutes silent:** Everyone adds stickies.
- **3 minutes:** Cluster into themes (caps, priorities, channel rules).
- **5 minutes discussion:** Converge on one governance decision we can pilot.

**Decision template (fill on frame):**
```
Rule: ___________________________
Scope: _____________ (email only / all channels / specific product)
Pilot %: __________ (10% / 50% / 100%)
Owner: _____________
Start date: ________
```

#### 0:35–0:45 | Frame 5: Instrumentation Pilot (Structured discussion)

**Sticky note prompt:**

> "If you could see ONE user action we currently can't track, what would it be? What flow would you build with it?"

- **2 minutes silent:** Everyone adds stickies.
- **3 minutes:** Group by product / cross-product.
- **5 minutes discussion:** Pick one instrumentation pilot. Data/Engineering confirm scope.

**Decision template (fill on frame):**
```
Event/Field: ___________________________
Product: _____________
First flow to build: _____________
QA approach: _____________
Owner: _____________
Target live date: _____________
```

#### 0:45–0:50 | Frame 6: Decisions & Owners (Facilitator captures)

Facilitator fills Frame 6 in real-time:

```
┌─────────────────────────────────────────────────────┐
│  DECISIONS                                          │
│                                                     │
│  Quick Win #1: ________________  Owner: ___  By: __ │
│  Quick Win #2: ________________  Owner: ___  By: __ │
│  Quick Win #3: ________________  Owner: ___  By: __ │
│                                                     │
│  Data Ask #1:  ________________  Owner: ___  By: __ │
│                                                     │
│  Governance:   ________________  Owner: ___  By: __ │
│                                                     │
│  Instrumentation Pilot:                             │
│  ___________________  Owner: ___  By: __            │
│                                                     │
│  NEXT STEPS                                         │
│  • CRM: Build quick wins in Iterable this sprint    │
│  • Data: Scope instrumentation pilot by [date]      │
│  • Product: Approve governance rule by [date]       │
│  • All: Reconvene in 2 weeks for readout            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Output Artifacts to Capture

After the session, the facilitator should produce:

1. **Screenshot of Frame 6** (decisions + owners) → post to Slack/Teams immediately
2. **Updated Atlas** — mark selected opportunities as `planned`, update experiment status to `ready`
3. **Jira/Linear tickets** for each committed action with owner and due date
4. **Data request ticket** for the prioritised signal with acceptance criteria
5. **Follow-up calendar invite** for 2-week check-in

### Facilitator Tips

- **Keep it tight.** Silent writing prevents one person dominating. Timer on screen.
- **Reference Atlas.** Every opportunity discussed should link back to the Atlas entry. Pull up experiment plans when people ask "how would we test this?"
- **Don't re-litigate definitions.** If someone wants to debate stage definitions or KPI methodology, park it: "That's a follow-up session. Today we decide *what* to ship, not *how* to measure."
- **Bias toward action.** Every frame should end with a decision, not a discussion point.
- **Capture dissent.** If someone strongly disagrees with a priority, note it on a "parking lot" sticky. Don't lose it—just don't let it block the session.

---

*Document generated from CRM Atlas data. All opportunities, experiments, and missing signals referenced above are canonical entries in the system.*
