-- Add deliverability columns to metric_snapshots
ALTER TABLE metric_snapshots
  ADD COLUMN unsubs INTEGER,
  ADD COLUMN unsub_rate DECIMAL(5,2),
  ADD COLUMN bounces INTEGER,
  ADD COLUMN bounce_rate DECIMAL(5,2),
  ADD COLUMN complaints INTEGER,
  ADD COLUMN complaint_rate DECIMAL(5,2),
  ADD COLUMN delivered INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_unsub_rate ON metric_snapshots(unsub_rate) WHERE unsub_rate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_bounce_rate ON metric_snapshots(bounce_rate) WHERE bounce_rate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_complaint_rate ON metric_snapshots(complaint_rate) WHERE complaint_rate IS NOT NULL;

-- Seed default deliverability targets
-- Note: Using 'product' scope_type as a placeholder for global targets
-- target_value = green threshold (ideal target)
-- amber_threshold = warning level
-- red_threshold = critical level
INSERT INTO kpi_targets (scope_type, scope_id, metric, target_value, amber_threshold, red_threshold)
VALUES
  ('product', NULL, 'unsub_rate', 0.20, 0.35, 0.50),
  ('product', NULL, 'bounce_rate', 1.5, 3.0, 5.0),
  ('product', NULL, 'complaint_rate', 0.02, 0.05, 0.10)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON COLUMN metric_snapshots.unsubs IS 'Total unsubscribes for the period';
COMMENT ON COLUMN metric_snapshots.unsub_rate IS 'Unsubscribe rate as percentage (unsubs/sends * 100)';
COMMENT ON COLUMN metric_snapshots.bounces IS 'Total bounces (hard + soft) for the period';
COMMENT ON COLUMN metric_snapshots.bounce_rate IS 'Bounce rate as percentage (bounces/delivered or sends * 100)';
COMMENT ON COLUMN metric_snapshots.complaints IS 'Total spam complaints for the period';
COMMENT ON COLUMN metric_snapshots.complaint_rate IS 'Complaint rate as percentage (complaints/delivered or sends * 100)';
COMMENT ON COLUMN metric_snapshots.delivered IS 'Total successfully delivered messages (sends - bounces)';
