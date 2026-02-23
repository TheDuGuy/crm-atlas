-- Add new POS Top 3 Industries opportunity
-- Owner: Edou
-- Priority: P0 (Impact=5, Effort=2)

DO $$
DECLARE
  v_terminal_id UUID;
  v_opp_id UUID;
BEGIN

  -- Get Terminal product (POS)
  SELECT id INTO v_terminal_id FROM products WHERE name = 'Terminal' LIMIT 1;
  IF v_terminal_id IS NULL THEN
    INSERT INTO products (name, description)
    VALUES ('Terminal', 'Point of Sale terminal and hardware')
    RETURNING id INTO v_terminal_id;
  END IF;

  -- Create the opportunity
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
    'POS Top 3 Industries – Activation & Depth Lift',
    'Focus on high-frequency POS industries (Restaurant, Fast Food, Personal Services) to drive paid orders and activation depth via industry-targeted CRM',
    5, -- impact (P0 = highest)
    2, -- effort (relatively low - leverage existing industry data)
    4, -- confidence (validated approach)
    'planned',
    -- problem
    E'## Problem Statement\n\nPOS needs a lift in paid orders and activation depth. Rather than broad messaging, we will focus on high-frequency POS industries where incremental CRM lift is most likely to translate into revenue.\n\nCurrent state: Generic POS messaging fails to resonate with specific industry needs and use cases.',
    -- insight
    E'## Industry Performance Insights\n\n**Top 3 Industries identified:**\n1. **Restaurant** – Strong delivered device base, high activation %, strong repeat depth\n2. **Fast Food / Takeaway** – High transaction frequency, solid TPV contribution\n3. **Personal Services (Barber + Hairdresser)** – Excellent repeat depth (10+/30+/90+ transactions)\n\n**Rationale:**\n- Material delivered device base\n- High activation rates\n- Strong repeat depth (10+/30+/90+ transactions)\n- Material TPV contribution\n- High-frequency POS behavior (vs high-ticket, low-frequency segments)\n\n**Excluded:** Structural industries like Construction (high ATV but low frequency, less suited for depth optimization)',
    -- hypothesis
    'Industry-specific messaging and use cases will drive higher first transaction rates and depth (10+/30+ txns) vs generic POS messaging, particularly in high-frequency industries where CRM can accelerate activation.',
    -- proposed_solution
    E'## Proposed Solution\n\nBuild industry-targeted activation journey for Top 3 POS industries.\n\n**Approach:**\n- Segment POS-delivered users by industry (Top 3 only)\n- Create 3 content variants with industry-specific:\n  - Hero imagery\n  - Use cases\n  - Social proof\n  - CTAs\n- Target both no-transaction and low-depth cohorts\n\n**Decision Framework:**\nBlended score of:\n- Volume (delivered devices)\n- Repeat depth (10+/30+/90+ txn rates)\n- TPV contribution\n- Frequency profile (prioritize high-frequency over high-ticket)\n\n**Channels:**\n- Email (primary)\n- Follow-up after 48-72h\n- Optional: In-app / push if available',
    -- audience_logic
    E'## Target Audience\n\n**Inclusion criteria:**\n- `device_delivered = true` (POS device delivered)\n- `industry_classification IN (''Restaurant'', ''Fast Food / Takeaway'', ''Personal Services'')` (Top 3 industries)\n- **Cohort A:** No transactions yet (`first_transaction_date IS NULL`)\n- **Cohort B:** Low depth (e.g., `txn_count < 10` within 30 days)\n\n**Exclusions:**\n- Already high-depth users (`txn_count >= 30` in last 30 days)\n- Recent POS activation comms (last 7 days)\n- Standard suppressions (unsubscribed, bounced)\n\n**Estimated size:** TBD (pending Data analysis of delivered device base by industry)',
    -- execution_notes
    E'## Orchestration Plan\n\n**Journey Type:** Industry-targeted activation nudge\n\n**Touch 1: Email (Industry-specific)**\n- Timing: At journey entry (device delivered + industry match + cohort criteria met)\n- Content: 3 variants (Restaurant / Fast Food / Personal Services)\n  - Industry-specific hero image\n  - Relevant use case (e.g., "Accept payments tableside" for Restaurant)\n  - Social proof from similar businesses\n  - Clear CTA: "Start taking payments"\n\n**Touch 2: Follow-up (48-72h)**\n- Condition: Still no transaction OR still low depth\n- Content: Reinforcement message + additional use case\n- Urgency element if appropriate\n\n**Optional Touch 3: In-app / Push**\n- If available, use for additional reinforcement\n- Deep link to activation flow or transaction tutorial\n\n**Exit Rules:**\n- Exit on first transaction (for Cohort A)\n- Exit on reaching 10+ txns (for Cohort B)\n- Exit on unsubscribe or hard bounce\n\n**Same journey structure, 3 content variants** (one per industry)',
    -- primary_kpi
    E'**Primary KPIs:**\n- First transaction rate (7d / 14d) for Cohort A (no-txn)\n- % reaching 10+ transactions within 30 days for both cohorts',
    -- secondary_kpis
    E'- % reaching 30+ transactions (depth milestone)\n- 30-day TPV uplift (revenue impact)\n- 90-day retention / repeat transaction rate\n- Email engagement (CTR, conversion)\n- Complaint rate / negative feedback',
    -- guardrails
    E'- Unsubscribe rate (should not exceed baseline + 5%)\n- Support contact volume (monitor confusion/complaints)\n- Deliverability health (bounce rate, spam reports)\n- Negative sentiment in responses',
    -- data_requirements
    E'## Data Requirements\n\n**Must Have:**\n- `industry_classification` field – confirm exact field name and valid values\n- `device_delivered` (boolean) and `device_delivered_date` (timestamp)\n- `first_transaction_date` (timestamp)\n- `txn_count` (integer, ideally with 30d/90d windows)\n- Transaction thresholds: 10/30/90 if available as pre-computed flags\n\n**Top 3 Industries List:**\n- Validate exact enum/string values used for:\n  1. Restaurant\n  2. Fast Food / Takeaway\n  3. Personal Services (or separate: Barber, Hairdresser)\n- Confirm: Fixed list vs data-scored (recommend fixed for V1 stability)\n\n**Nice to Have:**\n- TPV by industry (for baseline + lift measurement)\n- Activation curve data (time-to-first-txn by industry)\n- Depth distribution (% at 10+/30+/90+ txns)',
    -- test_design
    'ab_test',
    -- success_criteria
    E'**Primary Success:**\n- First transaction rate (14d) improves by 20%+ vs control\n- % reaching 10+ txns improves by 15%+ vs control\n- Statistical significance at 95% confidence\n\n**Secondary Success:**\n- % reaching 30+ txns improves by 10%+\n- 30d TPV per user increases by 15%+\n- At least 1 industry variant outperforms control\n\n**Decision Criteria:**\n- **Strong win (20%+ lift):** Roll out to all Top 3 industries; explore expanding to Top 5-7\n- **Moderate win (10-20% lift):** Roll out; iterate on messaging and timing\n- **Weak/neutral (<10% lift):** Investigate barriers; consider product friction vs messaging\n- **Industry-specific results:** Double down on winning industry, iterate on others',
    -- risks_mitigations
    E'## Risks & Mitigations\n\n**1. Industry classification accuracy/coverage**\n- **Risk:** Industry field is sparse, inaccurate, or uses inconsistent values\n- **Mitigation:** Validate coverage % with Data; set minimum confidence threshold\n- **Fallback:** Exclude low-confidence classifications; default to generic messaging\n\n**2. Delivered device base too small**\n- **Risk:** Top 3 industries have insufficient volume for meaningful test\n- **Mitigation:** Get Data to size cohorts before launch; expand to Top 5 if needed\n\n**3. Low depth is product/UX issue, not messaging**\n- **Risk:** Users want to transact but face friction (hardware, setup, UX)\n- **Mitigation:** Parallel product improvements; user research on activation barriers\n- **Monitor:** If messaging shows no impact, flag to Product for investigation\n\n**4. Cannibalization of organic activation**\n- **Risk:** We accelerate what would happen anyway (no true incrementality)\n- **Mitigation:** Include holdout group to measure true lift\n- **Monitor:** Overall POS activation/depth metrics don''t decline\n\n**5. Creative misalignment with industry needs**\n- **Risk:** Our assumed use cases don''t resonate with target industries\n- **Mitigation:** User research + testing with real merchants pre-launch\n- **Mitigation:** A/B test multiple messaging angles within each industry\n\n**6. Data dependencies delay launch**\n- **Risk:** Waiting for perfect data/analysis blocks execution\n- **Mitigation:** Launch with best available data; iterate as Data refines\n- **Phase approach:** V1 = Top 3 validated; V2 = expand based on learnings',
    NOW(),
    NOW()
  ) RETURNING id INTO v_opp_id;

  RAISE NOTICE 'Successfully created opportunity: POS Top 3 Industries – Activation & Depth Lift (ID: %)', v_opp_id;
  RAISE NOTICE 'Owner: Edou | Priority: P0 (Impact=5, Effort=2) | Status: planned';

END $$;
