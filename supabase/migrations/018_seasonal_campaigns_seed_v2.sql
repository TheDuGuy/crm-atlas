-- Seed Seasonal Bank campaigns (v2)
-- Idempotent: Delete existing seeds if they exist

-- Clean up existing seed campaigns (idempotent)
DELETE FROM seasonal_campaigns WHERE name IN (
  'Get Paid Anywhere - Valentine''s Day',
  'Busy Weekend Ready - Easter',
  'Spring Reset - Fresh Start',
  'Mother''s Day – Get Paid Anywhere (TTP)',
  'Easter – Busy Weekend Ready (POS)',
  'Spring Reset – Upgrade How You Get Paid'
);

DO $$
DECLARE
  v_mothers_day_ttp_id UUID;
  v_easter_pos_id UUID;
  v_spring_reset_id UUID;
BEGIN

  -- ========================================
  -- CAMPAIGN 1: Mother's Day TTP
  -- ========================================
  INSERT INTO seasonal_campaigns (
    id,
    name,
    product,
    season,
    year,
    objective,
    status,
    priority,
    market,
    start_date,
    end_date,
    summary,
    creative_direction,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Mother''s Day – Get Paid Anywhere (TTP)',
    'Tap to Pay',
    'Mother''s Day',
    2026,
    'activation',
    'draft',
    'high',
    ARRAY['US', 'UK'],
    '2026-05-03',  -- 7-10 days before Mother's Day (May 10, 2026)
    '2026-05-10',
    'Drive first transaction among enabled-but-not-active TTP members by positioning Tap to Pay as a fast mobile solution during Mother''s Day week. Why now: Seasonal surge.',
    'Focus on speed and convenience. Mothers Day theme without being overly sentimental. Clean, professional visuals showing mobile payments in action.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO v_mothers_day_ttp_id;

  -- Audiences for Mother's Day TTP
  INSERT INTO seasonal_audiences (
    seasonal_campaign_id,
    audience_name,
    description,
    segment_criteria,
    estimated_size,
    created_at,
    updated_at
  ) VALUES (
    v_mothers_day_ttp_id,
    'Enabled but No First Transaction',
    'TTP enabled but have not completed first transaction',
    'TapToPay.ttpEnabled = true AND TapToPay.ttpTransactionCount = 0 AND TapToPay.ttpEnabledDate < NOW() - INTERVAL ''72 hours'' AND lastTTPCommDate < NOW() - INTERVAL ''7 days''',
    45000,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  );

  -- Orchestration for Mother's Day TTP
  INSERT INTO seasonal_orchestration_steps (
    seasonal_campaign_id,
    step_order,
    channel,
    timing_description,
    content_summary,
    created_at,
    updated_at
  ) VALUES
    (v_mothers_day_ttp_id, 1, 'email', 'Segment entry', 'Initial campaign email introducing TTP for Mother''s Day week', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 2, 'email', '72 hours after step 1 if ttpTransactionCount still = 0', 'Follow-up reminder for non-converters', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

  -- KPIs for Mother's Day TTP
  INSERT INTO seasonal_kpis (
    seasonal_campaign_id,
    kpi_name,
    kpi_type,
    target_value,
    actual_value,
    created_at,
    updated_at
  ) VALUES
    (v_mothers_day_ttp_id, 'First transaction rate within 7 days', 'conversion', '12%', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'TTP active rate (7d)', 'engagement', '15%', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'Time to first transaction', 'conversion', 'Median 48h', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

  -- Assets for Mother's Day TTP
  INSERT INTO seasonal_assets (
    seasonal_campaign_id,
    asset_type,
    title,
    content,
    created_at,
    updated_at
  ) VALUES
    (v_mothers_day_ttp_id, 'copy', 'Email Subject Line', 'Take payments anywhere this Mother''s Day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'copy', 'Email Headline', 'Get paid wherever your customers are.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'copy', 'Email CTA', 'Start taking payments', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

  -- Data Requirements for Mother's Day TTP
  INSERT INTO seasonal_data_requirements (
    seasonal_campaign_id,
    requirement_name,
    description,
    data_source,
    status,
    created_at,
    updated_at
  ) VALUES
    (v_mothers_day_ttp_id, 'TapToPay.ttpEnabled', 'Flag indicating TTP is enabled for seller', 'TTP Service', 'available', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'TapToPay.ttpTransactionCount', 'Count of TTP transactions', 'Analytics', 'available', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'TapToPay.ttpEnabledDate', 'Date when TTP was enabled', 'TTP Service', 'available', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_mothers_day_ttp_id, 'TransactionCompleted event', 'Event tracking completed transactions', 'Analytics Events', 'available', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

  -- ========================================
  -- CAMPAIGN 2: Easter POS
  -- ========================================
  INSERT INTO seasonal_campaigns (
    id,
    name,
    product,
    season,
    year,
    objective,
    status,
    priority,
    market,
    start_date,
    end_date,
    summary,
    creative_direction,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Easter – Busy Weekend Ready (POS)',
    'Terminal',
    'Easter',
    2026,
    'revenue',
    'draft',
    'high',
    ARRAY['US', 'UK', 'AU'],
    '2026-03-28',
    '2026-04-05',
    'Push ordered-not-paid and delivered-no-txn cohorts to convert before Easter weekend.',
    'Urgency and readiness. Focus on not missing sales. Professional, action-oriented tone.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO v_easter_pos_id;

  -- Audiences for Easter POS
  INSERT INTO seasonal_audiences (
    seasonal_campaign_id,
    audience_name,
    description,
    segment_criteria,
    estimated_size,
    created_at,
    updated_at
  ) VALUES
    (v_easter_pos_id, 'Ordered not paid', 'Users who ordered POS but haven''t paid', 'CardReader.order_status = ''ordered'' AND CardReader.order_status_paid = false', 12000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'Delivered no transaction (72h+)', 'POS delivered but no transactions after 72 hours', 'CardReader.order_status_delivered = true AND daysSinceLastTransaction > 3', 8500, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- Orchestration for Easter POS
  INSERT INTO seasonal_orchestration_steps (
    seasonal_campaign_id,
    step_order,
    channel,
    timing_description,
    content_summary,
    created_at,
    updated_at
  ) VALUES
    (v_easter_pos_id, 1, 'email', 'Campaign entry', 'Initial email urging completion of order or first transaction', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 2, 'email', 'Follow-up after 72h if no transaction', 'Reminder with urgency for Easter weekend', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- KPIs for Easter POS
  INSERT INTO seasonal_kpis (
    seasonal_campaign_id,
    kpi_name,
    kpi_type,
    target_value,
    actual_value,
    created_at,
    updated_at
  ) VALUES
    (v_easter_pos_id, 'Paid order rate within 7 days', 'conversion', '25%', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'First transaction rate', 'conversion', '18%', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- Assets for Easter POS
  INSERT INTO seasonal_assets (
    seasonal_campaign_id,
    asset_type,
    title,
    content,
    created_at,
    updated_at
  ) VALUES
    (v_easter_pos_id, 'copy', 'Email Subject Line', 'Ready for the Easter rush?', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'copy', 'Email Headline', 'Don''t miss sales at checkout.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'copy', 'Email CTA', 'Complete your order', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- Data Requirements for Easter POS
  INSERT INTO seasonal_data_requirements (
    seasonal_campaign_id,
    requirement_name,
    description,
    data_source,
    status,
    created_at,
    updated_at
  ) VALUES
    (v_easter_pos_id, 'CardReader.order_status', 'Current order status', 'Orders API', 'available', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'CardReader.order_status_paid', 'Whether order has been paid', 'Orders API', 'available', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'CardReader.order_status_delivered', 'Whether order has been delivered', 'Orders API', 'available', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_easter_pos_id, 'daysSinceLastTransaction', 'Days since last transaction', 'Transaction Analytics', 'available', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- ========================================
  -- CAMPAIGN 3: Spring Reset
  -- ========================================
  INSERT INTO seasonal_campaigns (
    id,
    name,
    product,
    season,
    year,
    objective,
    status,
    priority,
    market,
    start_date,
    end_date,
    summary,
    creative_direction,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Spring Reset – Upgrade How You Get Paid',
    'Cross-Product',
    'Spring',
    2026,
    'activation',
    'draft',
    'medium',
    ARRAY['US', 'UK', 'CA', 'AU'],
    '2026-04-01',
    '2026-04-30',
    'Light seasonal reset campaign targeting eligible and low-activity users. Focus on acquisition + reactivation.',
    'Fresh, optimistic, upgrade-focused. Show progress and improvement. Spring renewal without clichés.',
    NOW(),
    NOW()
  ) RETURNING id INTO v_spring_reset_id;

  -- Audiences for Spring Reset
  INSERT INTO seasonal_audiences (
    seasonal_campaign_id,
    audience_name,
    description,
    segment_criteria,
    estimated_size,
    created_at,
    updated_at
  ) VALUES
    (v_spring_reset_id, 'POS eligible, no order', 'Eligible for POS but have not ordered', 'POS.eligible = true AND POS.hasOrder = false', 75000, NOW(), NOW()),
    (v_spring_reset_id, 'TTP enabled, no txn 30d', 'TTP enabled but no transactions in 30 days', 'TapToPay.ttpEnabled = true AND daysSinceLastTTPTransaction > 30', 18000, NOW(), NOW());

  -- Orchestration for Spring Reset
  INSERT INTO seasonal_orchestration_steps (
    seasonal_campaign_id,
    step_order,
    channel,
    timing_description,
    content_summary,
    created_at,
    updated_at
  ) VALUES
    (v_spring_reset_id, 1, 'email', 'Campaign launch', 'Spring reset email promoting upgrade options', NOW(), NOW()),
    (v_spring_reset_id, 2, 'email', '5 days later if no conversion', 'Follow-up for non-converters', NOW(), NOW());

  -- KPIs for Spring Reset
  INSERT INTO seasonal_kpis (
    seasonal_campaign_id,
    kpi_name,
    kpi_type,
    target_value,
    actual_value,
    created_at,
    updated_at
  ) VALUES
    (v_spring_reset_id, 'POS paid orders', 'conversion', '8% of eligible', NULL, NOW(), NOW()),
    (v_spring_reset_id, 'TTP first transactions', 'conversion', '10% of inactive', NULL, NOW(), NOW());

  -- Assets for Spring Reset
  INSERT INTO seasonal_assets (
    seasonal_campaign_id,
    asset_type,
    title,
    content,
    created_at,
    updated_at
  ) VALUES
    (v_spring_reset_id, 'copy', 'Email Subject Line', 'Spring reset: upgrade how you get paid', NOW(), NOW()),
    (v_spring_reset_id, 'copy', 'Email Headline', 'A better checkout in minutes.', NOW(), NOW()),
    (v_spring_reset_id, 'copy', 'Email CTA', 'Get started', NOW(), NOW());

  -- Data Requirements for Spring Reset
  INSERT INTO seasonal_data_requirements (
    seasonal_campaign_id,
    requirement_name,
    description,
    data_source,
    status,
    created_at,
    updated_at
  ) VALUES
    (v_spring_reset_id, 'POS eligibility', 'Whether user is eligible for POS', 'Eligibility Service', 'available', NOW(), NOW()),
    (v_spring_reset_id, 'TTP enabled', 'Whether TTP is enabled', 'TTP Service', 'available', NOW(), NOW()),
    (v_spring_reset_id, 'Order timestamps', 'Order creation and payment timestamps', 'Orders API', 'available', NOW(), NOW()),
    (v_spring_reset_id, 'Transaction timestamps', 'Transaction creation timestamps', 'Transaction Analytics', 'available', NOW(), NOW());

END $$;
