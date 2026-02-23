-- Seed 2 new comprehensive opportunities
-- A) POS – Top 3 Industries Targeting
-- B) TTP – Install → First Transaction Activation Journey

DO $$
DECLARE
  v_terminal_id UUID;
  v_ttp_id UUID;
  v_opp_a_id UUID;
  v_opp_b_id UUID;
BEGIN

  -- Get or create Terminal product (for POS)
  SELECT id INTO v_terminal_id FROM products WHERE name = 'Terminal' LIMIT 1;
  IF v_terminal_id IS NULL THEN
    INSERT INTO products (name, description)
    VALUES ('Terminal', 'Point of Sale terminal and hardware')
    RETURNING id INTO v_terminal_id;
  END IF;

  -- Get or create Tap to Pay product
  SELECT id INTO v_ttp_id FROM products WHERE name = 'Tap to Pay' LIMIT 1;
  IF v_ttp_id IS NULL THEN
    INSERT INTO products (name, description)
    VALUES ('Tap to Pay', 'Tap to Pay mobile product')
    RETURNING id INTO v_ttp_id;
  END IF;

  -- ========================================
  -- OPPORTUNITY A: POS – Top 3 Industries Targeting
  -- ========================================
  INSERT INTO opportunities (
    product_id,
    title,
    description,
    impact,
    effort,
    confidence,
    status,
    problem,
    insight,
    hypothesis,
    proposed_solution,
    audience_logic,
    execution_notes,
    primary_kpi,
    secondary_kpis,
    guardrails,
    data_requirements,
    test_design,
    success_criteria,
    risks_mitigations,
    created_at,
    updated_at
  ) VALUES (
    v_terminal_id,
    'POS – Top 3 Industries Targeting',
    'Improve POS acquisition by tailoring messaging to top 3 high-conversion industries vs generic positioning',
    4, -- impact
    3, -- effort
    3, -- confidence
    'planned',
    -- problem
    'Generic POS acquisition messaging underperforms vs relevant industry-tailored comms; we''re missing a scalable way to prioritise segments with highest conversion + activation.',
    -- insight
    'Industry is one of the biggest drivers of payment behaviour + intent; selecting top 3 "POS-heavy" industries can maximise paid orders and downstream usage.',
    -- hypothesis
    'Tailoring hero/use-case per industry will improve paid orders and early activation vs generic messaging.',
    -- proposed_solution
    E'## Proposed Solution\n\nCreate industry-specific variants of POS acquisition campaigns targeting top 3 industries with highest POS conversion potential.\n\n**Approach:**\n- Identify top 3 industries with highest paid order rates and activation (Data analysis)\n- Develop industry-tailored email creative (hero image, use case, social proof)\n- Build 3-variant A/B test vs control (generic POS messaging)\n\n**Channels:**\n- Email (primary)\n- Optional: in-app banner for cross-sell\n\n**Timeline:**\n- 2-3 week journey per cohort\n- Step 1: Industry-tailored email Day 0\n- Step 2: Follow-up to non-converters Day 3-4\n- Step 3: Optional final nudge Day 7',
    -- audience_logic
    E'## Target Audience (V1)\n\n**Inclusion:**\n- `CardReader.eligible = true` (POS eligible)\n- `CardReader.order_paid = false` (no paid order yet)\n- Has valid `industry_classification` field\n- Industry matches one of top 3 segments (TBD by Data)\n\n**Exclusions:**\n- Already active POS users (`device_delivered = true` OR `first_transaction_date IS NOT NULL`)\n- Recent POS comms (last 7 days)\n- Ordered-not-paid cohort (handled by separate rescue flow)\n- Standard suppressions (unsubscribed, bounced, complained)\n\n**Estimated Size:** ~75K eligible per industry per month',
    -- execution_notes
    E'## Orchestration Plan\n\n**Step 1: Email Day 0**\n- Send industry-tailored variant (A/B/C based on top 3 industries)\n- Control group receives generic POS email\n- CTA: "Get started with [Industry] POS"\n\n**Step 2: Email Day 3-4**\n- Target: Non-converters from Step 1 (`order_paid = false`)\n- Reinforcement message with additional use case\n- Urgency + social proof\n\n**Step 3: Email Day 7 (Optional)**\n- Final nudge to remaining non-converters\n- Simpler CTA, focus on ease of setup\n\n**Exit Rules:**\n- Exit on `order_paid = true`\n- Exit on `device_delivered = true`\n- Exit on unsubscribe or hard bounce\n\n**Dependencies:**\n- Data: Top 3 industry list + segment mapping\n- Creative: 3 industry variant templates\n- Eng: Segment build + journey orchestration',
    -- primary_kpi
    'Paid order conversion within 7 days of journey entry',
    -- secondary_kpis
    E'- Email CTR (click-through rate)\n- Time-to-paid-order (median days)\n- Downstream activation: First transaction within 14 days of delivery\n- Device setup completion rate',
    -- guardrails
    E'- Unsubscribe rate (should not exceed baseline + 10%)\n- Bounce rate (hard + soft)\n- Support contact rate (complaints, confusion)\n- Email deliverability health',
    -- data_requirements
    E'## Must Have:\n- `industry_classification` field (existing)\n- `CardReader.eligible` (boolean)\n- `CardReader.order_paid` (boolean)\n- `CardReader.order_date` (timestamp)\n- `CardReader.device_delivered` (boolean)\n- `CardReader.first_transaction_date` (timestamp)\n\n## Need from Data:\n- Top 3 industry segments (analysis required)\n- Industry mapping/lookup table for exact enum values\n- Historical conversion rates by industry (baseline)\n\n## Nice to Have:\n- `industry_confidence_score` (how accurate is the classification)\n- Transaction volume patterns by industry',
    -- test_design
    'ab_test',
    -- success_criteria
    E'**Primary Success:**\n- Paid order rate (7d) for industry-tailored variants > control by 15%+ (relative lift)\n- Statistical significance at 95% confidence\n\n**Secondary Success:**\n- CTR improvement of 10%+\n- Time-to-paid-order reduces by 1+ day\n- Activation rate (first txn within 14d) improves by 10%+\n\n**Decision Criteria:**\n- If 1+ industry variant wins: Roll out to full cohort, iterate on other industries\n- If all variants lose: Investigate creative, messaging, or audience fit\n- If neutral: Consider testing different value props',
    -- risks_mitigations
    E'## Risks:\n\n1. **Industry classification accuracy**\n   - Mitigation: Work with Data to validate accuracy; consider confidence threshold\n   - Fallback: Default to generic messaging for low-confidence classifications\n\n2. **Creative/messaging misalignment**\n   - Mitigation: User research + testing with target industries pre-launch\n   - Mitigation: A/B test messaging angles within variants\n\n3. **Cannibalization of existing POS flows**\n   - Mitigation: Careful exclusion logic to avoid overlap\n   - Monitor: Overall POS acquisition metrics don''t decline\n\n4. **Limited top 3 addressable market**\n   - Mitigation: Expand to top 5-7 industries if initial test succeeds\n   - Consider: Long-tail strategy for remaining industries\n\n5. **Data dependencies delay launch**\n   - Mitigation: Start with best-guess top 3 based on existing knowledge\n   - Iterate: Refine segments as Data analysis completes',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO v_opp_a_id;

  -- ========================================
  -- OPPORTUNITY B: TTP – Install → First Transaction Activation Journey
  -- ========================================
  INSERT INTO opportunities (
    product_id,
    title,
    description,
    impact,
    effort,
    confidence,
    status,
    problem,
    insight,
    hypothesis,
    proposed_solution,
    audience_logic,
    execution_notes,
    primary_kpi,
    secondary_kpis,
    guardrails,
    data_requirements,
    test_design,
    success_criteria,
    risks_mitigations,
    created_at,
    updated_at
  ) VALUES (
    v_ttp_id,
    'TTP – Install → First Transaction Activation Journey',
    'Drive first transaction among TTP-enabled users who haven''t transacted within 72h of enablement',
    5, -- impact (higher than A - directly addresses activation gap)
    3, -- effort
    4, -- confidence
    'planned',
    -- problem
    'Users enable/install TTP but don''t transact; current orchestration triggers on first txn so we miss the key activation window. Enabled-but-inactive users represent missed revenue and failed onboarding.',
    -- insight
    'The first 72h post-enable is the highest leverage moment to drive first use; once first txn happens, habit formation is the next lever. Data shows dropoff is steepest in Days 1-3 post-install.',
    -- hypothesis
    'A simple 2-3 touch activation sequence triggered 72h post-enable will increase first txn rate vs no messaging or delayed messaging.',
    -- proposed_solution
    E'## Proposed Solution\n\nBuild a time-triggered activation journey that starts 72h after TTP enablement for users who have not yet completed their first transaction.\n\n**Approach:**\n- Trigger cohort entry at `enabledDate + 72 hours` where `ttpTransactionCount = 0`\n- Send value-reinforcement email (Step 1) highlighting speed, convenience, and use cases\n- Follow with push notification (Step 2) 24h later if still no transaction\n- Optional final email (Step 3) at Day 7 with simplified CTA\n\n**Test Design:**\n- A/B test copy framing: Variant A = friendly/supportive; Variant B = outcome-driven/urgency\n- Optional 10% holdout group (no messaging) to measure incremental impact\n\n**Exit on first TTP transaction** to avoid message fatigue',
    -- audience_logic
    E'## Target Audience (Cohort A - V1)\n\n**Inclusion:**\n- `TapToPay.ttpEnabled = true` (TTP is enabled)\n- `TapToPay.ttpTransactionCount = 0` (no transactions yet)\n- `TapToPay.ttpEnabledDate >= 72 hours ago` (at least 3 days since enable)\n- Has valid email + push token (for multi-channel delivery)\n\n**Exclusions:**\n- Already transacted (`ttpTransactionCount > 0` OR `ttpLatestTransactionAt IS NOT NULL`)\n- Recent TTP comms (last 7 days) to avoid oversaturation\n- Standard suppressions (unsubscribed, push opt-out, bounced)\n\n**Estimated Size:** ~15K new users per week entering cohort\n\n**Future Cohorts (V2+):**\n- Cohort B: Enabled 7-14 days, still no txn (different messaging)\n- Cohort C: Lapsed users (had txns, now inactive 30+ days)',
    -- execution_notes
    E'## Orchestration Plan\n\n**Step 1: Email - Day 3 post-enable**\n- **Timing:** Triggered 72 hours after `ttpEnabledDate`\n- **Audience:** `ttpTransactionCount = 0`\n- **Subject (A/B test):**\n  - Variant A: "Your mobile payment setup is ready 📱"\n  - Variant B: "Get paid faster: Complete your first TTP sale"\n- **Content:** Reinforce value (speed, convenience), show simple use case, clear CTA\n- **CTA:** "Try your first Tap to Pay"\n\n**Step 2: Push - Day 4 post-enable**\n- **Timing:** 24 hours after Step 1 email, if `ttpTransactionCount` still = 0\n- **Message:** "Accept your first payment with Tap to Pay in seconds"\n- **Deep link:** Direct to TTP activation flow or demo\n\n**Step 3: Email - Day 7 post-enable (Optional)**\n- **Timing:** 7 days post-enable, if still no txn\n- **Content:** Simplified message, address potential friction (setup confusion, use case fit)\n- **CTA:** Link to help docs or support\n\n**Exit Rules:**\n- Exit immediately on first TTP transaction (`ttpTransactionCount > 0`)\n- Exit on unsubscribe or push opt-out\n- Exit after Step 3 (max 3 touches)\n\n**Dependencies:**\n- Data: `ttpEnabledDate` field (check if exists; create Missing Signal if not)\n- Creative: Email + push templates (2 variants each)\n- Eng: Journey build + exit logic on transaction event',
    -- primary_kpi
    'First TTP transaction within 7 days of journey entry (Step 1 send)',
    -- secondary_kpis
    E'- Time-to-first-transaction (median, p50/p90)\n- 14-day TTP transaction count per user (usage depth)\n- 14-day TTP TPV (transaction processing volume)\n- Email CTR + push CTR\n- Incremental lift vs holdout group (if included)',
    -- guardrails
    E'- Unsubscribe rate (should not exceed baseline + 5%)\n- Push opt-out rate\n- Bounce rate (email deliverability health)\n- Negative feedback (complaints, "not helpful" signals)\n- Support contact volume related to TTP confusion',
    -- data_requirements
    E'## Must Have:\n- `TapToPay.ttpEnabled` (boolean) — *existing*\n- `TapToPay.ttpTransactionCount` (integer) — *existing*\n- `TapToPay.ttpEnabledDate` (timestamp) — **check if exists; if not, create Missing Signal**\n- `TapToPay.ttpLatestTransactionAt` (timestamp) OR `ttpFirstTransactionDate` — *existing or derivable*\n\n## Events:\n- `TTP Transaction Completed` event (real-time trigger for exit logic)\n\n## Nice to Have:\n- `ttpInstallSource` (how user enabled TTP: onboarding, in-app promo, etc.)\n- `ttpDeviceModel` (iPhone model for compatibility insights)\n- Historical TTP activation benchmarks (current rate without intervention)',
    -- test_design
    'ab_test',
    -- success_criteria
    E'**Primary Success:**\n- First transaction rate (7d) for test group > holdout by 20%+ (relative lift)\n  - Example: Holdout = 10% → Test = 12%+ would be a win\n- Statistical significance at 95% confidence\n\n**Secondary Success:**\n- Time-to-first-txn reduces by 1+ day (median)\n- 14-day transaction count per activated user increases by 15%+\n- Messaging variant A or B shows clear winner (10%+ relative difference)\n\n**Decision Criteria:**\n- **Strong win (20%+ lift):** Roll out to 100% of cohort; explore Cohorts B/C\n- **Moderate win (10-20% lift):** Roll out; iterate on messaging/timing\n- **Weak/neutral (<10% lift):** Investigate barriers (product friction, messaging, timing)\n- **Loss (negative impact):** Stop; revisit hypothesis and user research',
    -- risks_mitigations
    E'## Risks:\n\n1. **Missing ttpEnabledDate field**\n   - **Impact:** Cannot trigger journey accurately\n   - **Mitigation:** Check schema; if missing, create Missing Signal and backfill data\n   - **Fallback:** Use proxy (first app login after TTP feature visible)\n\n2. **Low email/push deliverability or engagement**\n   - **Impact:** Messaging doesn''t reach users\n   - **Mitigation:** Validate contact data quality; warm up sending domains\n   - **Monitor:** Deliverability metrics in guardrails\n\n3. **Product friction blocking first txn (not messaging issue)**\n   - **Impact:** Messaging won''t help if product has UX barriers\n   - **Mitigation:** User research + usability testing on TTP flow\n   - **Parallel work:** Product improvements to reduce friction\n\n4. **Cannibalization of organic activation**\n   - **Impact:** We''re just accelerating what would happen anyway\n   - **Mitigation:** Holdout group measures true incrementality\n   - **Monitor:** Overall TTP activation rate doesn''t decline\n\n5. **Message fatigue or negative sentiment**\n   - **Impact:** Users annoyed by "nagging" to transact\n   - **Mitigation:** Limit to 3 touches; friendly/helpful tone; clear opt-out\n   - **Monitor:** Unsub rate, negative feedback, support contacts\n\n6. **Timing misalignment (72h too soon or too late)**\n   - **Impact:** Users not ready or already churned\n   - **Mitigation:** A/B test timing windows (48h vs 72h vs 5d) in future iteration\n   - **Data:** Analyze activation curve to find optimal window',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO v_opp_b_id;

  -- ========================================
  -- Missing Signals for Opportunity B (if needed)
  -- ========================================
  -- Check if ttpEnabledDate signal exists; if not, create it
  IF NOT EXISTS (
    SELECT 1 FROM missing_signals
    WHERE signal_name = 'TapToPay.ttpEnabledDate'
  ) THEN
    INSERT INTO missing_signals (
      product_id,
      linked_opportunity_id,
      signal_type,
      signal_name,
      description,
      why_missing,
      estimated_impact,
      effort_type,
      status,
      created_at,
      updated_at
    ) VALUES (
      v_ttp_id,
      v_opp_b_id,
      'field',
      'TapToPay.ttpEnabledDate',
      'Timestamp when user first enabled/installed Tap to Pay. Critical for activation journey timing and cohort building.',
      'Not currently tracked; need backend instrumentation to capture enable timestamp',
      'High',
      'Data',
      'requested',
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '2 days'
    );
  END IF;

  RAISE NOTICE 'Successfully created 2 opportunities:';
  RAISE NOTICE '  A) POS – Top 3 Industries Targeting (ID: %)', v_opp_a_id;
  RAISE NOTICE '  B) TTP – Install → First Transaction Activation Journey (ID: %)', v_opp_b_id;

END $$;
