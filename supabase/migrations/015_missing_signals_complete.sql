-- Missing Signals: Complete setup - table + seed data

-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS missing_signals CASCADE;

-- Create missing_signals table
CREATE TABLE missing_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  signal_name TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('field', 'event')),
  description TEXT NOT NULL,
  why_missing TEXT NOT NULL,
  unlocks TEXT, -- What flows/opportunities this enables
  estimated_impact TEXT CHECK (estimated_impact IN ('High', 'Medium', 'Low')),
  effort_type TEXT CHECK (effort_type IN ('CRM', 'Data', 'Backend', 'Mixed')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'requested', 'in_progress', 'live', 'dropped')),
  linked_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, signal_name)
);

-- Indexes for performance
CREATE INDEX idx_missing_signals_product ON missing_signals(product_id);
CREATE INDEX idx_missing_signals_status ON missing_signals(status);
CREATE INDEX idx_missing_signals_impact ON missing_signals(estimated_impact);
CREATE INDEX idx_missing_signals_opportunity ON missing_signals(linked_opportunity_id);

-- Comments
COMMENT ON TABLE missing_signals IS 'Documents fields/events that do not exist but would unlock better CRM targeting, lifecycle logic, and experimentation';
COMMENT ON COLUMN missing_signals.signal_name IS 'Name of the missing field or event';
COMMENT ON COLUMN missing_signals.signal_type IS 'Whether this is a missing field or event';
COMMENT ON COLUMN missing_signals.why_missing IS 'Why this signal does not currently exist';
COMMENT ON COLUMN missing_signals.unlocks IS 'What flows/opportunities this would enable';
COMMENT ON COLUMN missing_signals.estimated_impact IS 'Estimated impact if implemented';
COMMENT ON COLUMN missing_signals.effort_type IS 'Which team would need to build this';
COMMENT ON COLUMN missing_signals.status IS 'Current status of the signal request';

-- ==========================================
-- SEED DATA: 47 Missing Signals
-- ==========================================

DO $$
DECLARE
  v_card_reader_id UUID;
  v_payment_links_id UUID;
  v_tap_to_pay_id UUID;
  v_tic_id UUID;
  v_pbb_id UUID;
  v_sip_id UUID;
  v_tools_boosts_id UUID;
  v_global_id UUID;
BEGIN
  -- Get or create product IDs
  SELECT id INTO v_card_reader_id FROM products WHERE name = 'Card Reader' LIMIT 1;
  SELECT id INTO v_payment_links_id FROM products WHERE name = 'Payment Links' LIMIT 1;
  SELECT id INTO v_tap_to_pay_id FROM products WHERE name = 'Tap to Pay' LIMIT 1;
  SELECT id INTO v_tic_id FROM products WHERE name = 'TIC' LIMIT 1;
  SELECT id INTO v_pbb_id FROM products WHERE name = 'PBB' LIMIT 1;
  SELECT id INTO v_sip_id FROM products WHERE name = 'Sell in Person' LIMIT 1;
  SELECT id INTO v_tools_boosts_id FROM products WHERE name = 'Tools/Boosts' LIMIT 1;
  SELECT id INTO v_global_id FROM products WHERE name = 'Cross-Product' LIMIT 1;

  -- Create products if they don't exist
  IF v_card_reader_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('Card Reader', 'Physical card reader product') RETURNING id INTO v_card_reader_id;
  END IF;
  IF v_payment_links_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('Payment Links', 'Payment links product') RETURNING id INTO v_payment_links_id;
  END IF;
  IF v_tap_to_pay_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('Tap to Pay', 'Tap to Pay mobile product') RETURNING id INTO v_tap_to_pay_id;
  END IF;
  IF v_tic_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('TIC', 'Transaction in a Click') RETURNING id INTO v_tic_id;
  END IF;
  IF v_pbb_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('PBB', 'Pay by Bank') RETURNING id INTO v_pbb_id;
  END IF;
  IF v_sip_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('Sell in Person', 'Sell in Person subscription') RETURNING id INTO v_sip_id;
  END IF;
  IF v_tools_boosts_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('Tools/Boosts', 'Add-ons and premium features') RETURNING id INTO v_tools_boosts_id;
  END IF;
  IF v_global_id IS NULL THEN
    INSERT INTO products (name, description) VALUES ('Cross-Product', 'Global governance and cross-product signals') RETURNING id INTO v_global_id;
  END IF;

  -- ==========================================
  -- Card Reader — Missing Signals (7)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_card_reader_id, 'card_reader.delivery_confirmed_at', 'event',
     'Carrier confirms delivery time',
     'We can''t separate "not activated because not delivered" vs "delivered but stuck"',
     'Delivery→First Tx funnel, "Day 1/3/7 after delivery" activation ladder, reduce wasted comms',
     'High', 'Mixed'),

    (v_card_reader_id, 'card_reader.first_transaction_at', 'field',
     'First successful POS transaction time',
     'You''re relying on last transaction / days since last transaction, but first-use is the key activation milestone',
     '"Delivered but no first tx", "time-to-first-value" KPI, activation experiments, incentives gating',
     'High', 'Data'),

    (v_card_reader_id, 'card_reader.first_transaction_value', 'field',
     'Value of first transaction',
     'You can''t tell if activation is "real" ($5 test vs $500 sale)',
     'Test vs real adoption, different nudges, quality activation KPI',
     'Medium', 'Data'),

    (v_card_reader_id, 'card_reader.setup_started_at', 'event',
     'User reaches setup screen / pairs device / starts onboarding',
     'Current flows jump from order → usage, but you''re blind to setup abandonment',
     'Setup abandonment recovery, better in-app help timing, reduce "delivered but idle"',
     'High', 'Backend'),

    (v_card_reader_id, 'card_reader.setup_completed_at', 'event',
     'Device setup completed successfully',
     'You can''t isolate "setup friction" vs "commercial/intent friction"',
     '"Setup done, still no tx" ladder, product bug detection, targeted support prompts',
     'High', 'Backend'),

    (v_card_reader_id, 'card_reader.last_7d_tpv', 'field',
     'Total payment volume last 7 days',
     'You have last tx value but not momentum; can''t classify health or decline',
     'Momentum-based retention, "decline early warning", upsell to NDS for higher TPV',
     'High', 'Data'),

    (v_card_reader_id, 'card_reader.refund_or_reversal_rate_30d', 'field',
     'Refund/reversal % over last 30 days',
     'You can''t flag operational risk/experience issues that correlate with churn',
     'Risk mitigation comms, education flows, support handoff triggers',
     'Medium', 'Data');

  -- ==========================================
  -- Payment Links — Missing Signals (7)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_payment_links_id, 'payment_link.created_event', 'event',
     'A paylink is created (with metadata)',
     'If you only have dates/counters, you can''t do real-time orchestration or experiment attribution cleanly',
     'Immediate "created → share" nudges, intent-based upgrades, cleaner measurement',
     'High', 'Mixed'),

    (v_payment_links_id, 'payment_link.shared_event', 'event',
     'User shares link via WhatsApp/email/copy-link',
     'You can''t distinguish "created but not shared" vs "shared but not paid"',
     'Two-step funnel recovery, channel-specific tips ("WhatsApp converts better"), smarter timing',
     'High', 'Backend'),

    (v_payment_links_id, 'payment_link.viewed_event', 'event',
     'Recipient opened the link',
     'Unpaid links could be "never seen" vs "seen but buyer hesitated"',
     '"Viewed-not-paid" recovery messaging, follow-up scripts, reduce spam to creators',
     'High', 'Backend'),

    (v_payment_links_id, 'payment_link.expired_event', 'event',
     'Link expired before payment',
     'You can''t segment avoidable failures (expiry) from "real rejection"',
     'Extend expiry prompt, "resend link" CTA, reduce failed conversions',
     'Medium', 'Backend'),

    (v_payment_links_id, 'payment_link.payment_failed_event', 'event',
     'Payment attempt failed and why',
     'You treat "unpaid" as one bucket; failures are fixable with the right guidance',
     'Tailored rescue flows, fewer support tickets, higher paid rate',
     'High', 'Backend'),

    (v_payment_links_id, 'payment_link.time_to_paid_seconds', 'field',
     'Median/last time-to-paid for user',
     'You can''t tune follow-up timing; 10 min vs 24h matters',
     'Smart follow-ups ("nudge at their usual pattern"), improved suppression rules',
     'Medium', 'Data'),

    (v_payment_links_id, 'payment_link.recurring_buyer_count_90d', 'field',
     'How many distinct payers repeat for same merchant',
     'You can''t identify "strong PL merchants" to upsell (SIP/POS/NDS)',
     'Cross-product upgrade engine, VIP handling, proof-based upsells',
     'Medium', 'Data');

  -- ==========================================
  -- Tap to Pay — Missing Signals (7)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_tap_to_pay_id, 'ttp.enabled_at', 'field',
     'When TTP was enabled',
     'You have enabled flag + onboard date, but not consistently a single clean milestone',
     'Day-0/1/3 onboarding ladder, consistent cohorting and measurement',
     'High', 'Data'),

    (v_tap_to_pay_id, 'ttp.install_started_event', 'event',
     'User initiates install/setup flow',
     'You only see installation success event; you can''t recover drop-offs',
     'Setup abandonment rescue, better in-app tips, faster time-to-first-tx',
     'High', 'Backend'),

    (v_tap_to_pay_id, 'ttp.install_failed_event', 'event',
     'Setup failed and why (with reason/device_model/os_version)',
     'You can''t isolate tech issues causing activation problems',
     'Targeted troubleshooting, product bug reporting, reduce support load',
     'Medium', 'Backend'),

    (v_tap_to_pay_id, 'ttp.first_transaction_at', 'field',
     'First successful TTP transaction',
     'lastTransactionAt doesn''t tell you first-use or time-to-value',
     'Activation KPI, "enabled but never used" segment, better nudges',
     'High', 'Data'),

    (v_tap_to_pay_id, 'ttp.last_7d_txn_count', 'field',
     'Tx count last 7 days',
     'You only have lifetime transaction count; you can''t drive momentum or detect drop-off early',
     'Momentum builder, dormancy ladder precision, reactivation before 14d lapse',
     'High', 'Data'),

    (v_tap_to_pay_id, 'ttp.last_7d_tpv', 'field',
     'TPV last 7 days',
     'Tx count alone misses value; you can''t qualify high value merchants',
     'Upsell to Card Reader/NDS, VIP comms, prioritised support',
     'High', 'Data'),

    (v_tap_to_pay_id, 'ttp.intent_signal', 'field',
     'How often they opened the "take payment" surface without completing tx',
     'You only react to completed transactions',
     'Mid-funnel recovery, better acquisition/activation targeting, more event-based triggers',
     'High', 'Backend');

  -- ==========================================
  -- TIC — Missing Signals (6)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_tic_id, 'tic.enabled_at', 'field',
     'When TIC was enabled',
     'Enabled flag alone is not enough for cohorting and ladder logic',
     'Activation cohorts, timed onboarding',
     'High', 'Data'),

    (v_tic_id, 'tic.first_link_created_at', 'field',
     'First checkout link created',
     'countOfLinksCreated exists but the timestamp unlocks lifecycle precision',
     'First-value activation and time-to-value',
     'High', 'Data'),

    (v_tic_id, 'tic.link_shared_event', 'event',
     'User shares TIC link',
     'Same gap as PL — created ≠ shared',
     'Funnel steps, rescue flows, better comms sequencing',
     'High', 'Backend'),

    (v_tic_id, 'tic.checkout_started_event', 'event',
     'A buyer starts checkout after clicking',
     'You can''t distinguish "no interest" vs "friction in checkout"',
     'Optimise messaging and UX guidance',
     'Medium', 'Backend'),

    (v_tic_id, 'tic.first_paid_at', 'field',
     'First successful paid checkout',
     'Without first-paid, you can''t separate "adoption" from "dabbling"',
     'Activation quality KPI, retention ladder',
     'High', 'Data'),

    (v_tic_id, 'tic.last_30d_gmv', 'field',
     'GMV/TPV through TIC in last 30 days',
     'You can''t run value-based comms or upgrades',
     'VIP program, upsell to SIP/POS',
     'Medium', 'Data');

  -- ==========================================
  -- PBB — Missing Signals (5)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_pbb_id, 'pbb_enabled_at', 'field',
     'When Pay by Bank is enabled',
     'You can''t run proper PBB lifecycle',
     'Activation measurement + retention ladder',
     'Medium', 'Data'),

    (v_pbb_id, 'pbb_first_use_at', 'field',
     'First successful PBB payment',
     'No "first value" milestone',
     'Activation measurement + retention ladder',
     'High', 'Data'),

    (v_pbb_id, 'pbb_decline_reason_distribution_30d', 'field',
     'Most common decline reason per merchant cohort',
     'You can''t tailor education or reduce friction',
     'Recovery flows, operational improvements',
     'Medium', 'Data'),

    (v_pbb_id, 'pbb_customer_repeat_rate_90d', 'field',
     'Repeat customer behavior (signal of product-market fit)',
     'You can''t identify who''s ready to scale',
     'Upgrade engine and VIP',
     'Medium', 'Data'),

    (v_pbb_id, 'pbb_intent_signal', 'event',
     'Opened/initiated but not completed',
     'Missing mid-funnel',
     'Mid-funnel recovery and experimentation',
     'High', 'Backend');

  -- ==========================================
  -- Sell in Person — Missing Signals (6)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_sip_id, 'sip_trial_started_at', 'field',
     'Trial start timestamp',
     'You can''t run structured trial lifecycle comms',
     'Trial onboarding, trial-to-paid conversion ladder',
     'High', 'Data'),

    (v_sip_id, 'sip_trial_activated_at', 'event',
     'First successful usage moment within trial',
     'Trial "active" is usually unknown; you need activation within trial',
     'Save failing trials, target low-usage, improve conversion',
     'High', 'Mixed'),

    (v_sip_id, 'sip_plan_selected', 'field',
     'Which SIP plan / pricing tier',
     'Comms can''t be personalised; churn/upgrade logic is weak',
     'Value messaging by tier, upgrade prompts, churn prevention',
     'Medium', 'Data'),

    (v_sip_id, 'sip_usage_sessions_7d', 'field',
     'Active usage sessions last 7 days',
     'You can''t track habit formation, only transactions',
     'Engagement health, retention nudges',
     'Medium', 'Data'),

    (v_sip_id, 'sip_support_contacted_flag_30d', 'field',
     'Support interaction in last 30 days',
     'Support is a churn signal and a "needs education" flag',
     'Churn prevention, proactive education, VIP care',
     'Medium', 'Data'),

    (v_sip_id, 'sip_device_dependency', 'field',
     'Which in-person method they use (TTP vs card reader vs both)',
     'You can''t orchestrate cross-product without knowing preference',
     'Better upgrade engine, fewer conflicting comms',
     'High', 'Data');

  -- ==========================================
  -- Tools/Boosts — Missing Signals (6)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_tools_boosts_id, 'nds_eligible_at', 'field',
     'When user became eligible for Next Day Settlement',
     'Eligible now is static; eligibility journey matters',
     'Eligibility-triggered comms, cohort analysis',
     'Medium', 'Data'),

    (v_tools_boosts_id, 'nds_value_prop_fit_signal', 'field',
     'Proxy for cashflow urgency/need for faster settlement',
     'You''re upselling without a "why now" trigger',
     'Higher conversion, less spam, better targeting',
     'High', 'Data'),

    (v_tools_boosts_id, 'boosts_viewed_event', 'event',
     'Viewed boosts/toolkits screen in app',
     'No mid-funnel for boosts (view → consider → purchase)',
     'In-app follow-up, retargeting, experiments',
     'Medium', 'Backend'),

    (v_tools_boosts_id, 'boosts_added_to_cart_event', 'event',
     'Start checkout for add-on',
     'You can''t rescue checkout abandonment',
     'Abandonment recovery and experimentation',
     'Medium', 'Backend'),

    (v_tools_boosts_id, 'boosts_payment_failed_event', 'event',
     'Purchase failed and why',
     'Failure reasons are often fixable',
     'Recovery + support routing',
     'Medium', 'Backend'),

    (v_tools_boosts_id, 'multi_product_maturity_stage', 'field',
     'Unified acquiring maturity stage (0-5)',
     'Without a state model, orchestration is brittle and suppression-heavy',
     'Upgrade engine, governance rules, prioritisation, fewer conflicts',
     'High', 'Mixed');

  -- ==========================================
  -- Cross-Product Governance — Missing Signals (3)
  -- ==========================================
  INSERT INTO missing_signals (product_id, signal_name, signal_type, description, why_missing, unlocks, estimated_impact, effort_type)
  VALUES
    (v_global_id, 'crm_touchpoints_last_7d', 'field',
     'CRM touchpoints by channel + total in last 7 days',
     'You can''t enforce max-touches or see saturation at a member level',
     'Global governance, conflict resolution, health context',
     'High', 'Data'),

    (v_global_id, 'last_acquiring_message_sent_at', 'field',
     'Last acquiring-related message sent timestamp',
     'Flow-level suppressions don''t stop cross-product collisions',
     'Priority engine, cool-down rules, better member experience',
     'High', 'Data'),

    (v_global_id, 'primary_acquiring_product', 'field',
     'Primary acquiring product user is engaged with',
     'If you don''t know their main behavior, upgrade logic will conflict',
     'Cleaner segmentation and sequencing',
     'High', 'Data');

END $$;

-- Final comment
COMMENT ON TABLE missing_signals IS 'Comprehensive missing signals catalog - 47 fields/events needed to unlock better targeting, lifecycle logic, and experimentation across 8 product areas';
