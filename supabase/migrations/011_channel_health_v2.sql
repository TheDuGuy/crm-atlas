-- Channel Health V2: Pulse Scorecard, Targets Versioning, Persisted RAG

-- ======================
-- 1) Workflow → Product Mapping
-- ======================
CREATE TABLE workflow_product_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_product_map_product ON workflow_product_map(product_id);

COMMENT ON TABLE workflow_product_map IS 'Manual or inferred mapping of Iterable workflow IDs to products';

-- ======================
-- 2) Persisted RAG Flags (Auditability)
-- ======================
CREATE TABLE health_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  period_type period_type NOT NULL,
  period_start_date DATE NOT NULL,
  metric_name TEXT NOT NULL, -- 'open_rate', 'click_rate', 'unsub_rate', 'bounce_rate', 'complaint_rate', 'sends', 'opens', 'clicks'
  value NUMERIC,
  target NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('green', 'amber', 'red', 'unknown')),
  reason TEXT NOT NULL,
  delta_wow NUMERIC, -- Week-over-week delta (percentage)
  delta_mom NUMERIC, -- Month-over-month delta (percentage)
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workflow_id, channel, period_type, period_start_date, metric_name)
);

CREATE INDEX idx_health_flags_workflow ON health_flags(workflow_id, period_start_date);
CREATE INDEX idx_health_flags_product ON health_flags(product_id, period_start_date);
CREATE INDEX idx_health_flags_status ON health_flags(status, period_start_date);
CREATE INDEX idx_health_flags_period ON health_flags(period_start_date DESC);

COMMENT ON TABLE health_flags IS 'Computed and persisted RAG status per workflow/metric/period for auditability';

-- ======================
-- 3) Global Health Config
-- ======================
CREATE TABLE health_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amber_floor NUMERIC NOT NULL DEFAULT 0.7, -- Amber if value < target * amber_floor
  wow_amber_drop NUMERIC NOT NULL DEFAULT 0.15, -- 15% drop triggers amber
  wow_red_drop NUMERIC NOT NULL DEFAULT 0.25, -- 25% drop triggers red
  rollup_strategy TEXT NOT NULL DEFAULT 'worst_of' CHECK (rollup_strategy IN ('worst_of', 'weighted')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default config (single row)
INSERT INTO health_config (amber_floor, wow_amber_drop, wow_red_drop, rollup_strategy)
VALUES (0.7, 0.15, 0.25, 'worst_of');

COMMENT ON TABLE health_config IS 'Global configuration for RAG thresholds and rollup strategy';

-- ======================
-- 4) Extend kpi_targets for Versioning + Scoping
-- ======================

-- Add new columns to kpi_targets for versioning and granular scoping
ALTER TABLE kpi_targets
  ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ADD COLUMN workflow_id TEXT,
  ADD COLUMN channel TEXT,
  ADD COLUMN period_type period_type,
  ADD COLUMN metric_name TEXT, -- Rename from 'metric' conceptually, but keep both for now
  ADD COLUMN amber_floor NUMERIC, -- Override global amber_floor for this target
  ADD COLUMN red_floor NUMERIC, -- Optional explicit red threshold
  ADD COLUMN effective_to DATE; -- NULL means active indefinitely

-- Backfill metric_name from existing metric column
UPDATE kpi_targets SET metric_name = metric WHERE metric_name IS NULL;

-- Make metric_name NOT NULL after backfill
ALTER TABLE kpi_targets ALTER COLUMN metric_name SET NOT NULL;

-- Rename effective_from if it doesn't exist (it should from V1)
-- ALTER TABLE kpi_targets ADD COLUMN effective_from DATE NOT NULL DEFAULT CURRENT_DATE;
-- (Assuming effective_from doesn't exist in original migration - let's add it if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_targets' AND column_name = 'effective_from'
  ) THEN
    ALTER TABLE kpi_targets ADD COLUMN effective_from DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Create indexes for efficient target lookups
CREATE INDEX idx_kpi_targets_product ON kpi_targets(product_id, metric_name);
CREATE INDEX idx_kpi_targets_workflow ON kpi_targets(workflow_id, metric_name);
CREATE INDEX idx_kpi_targets_channel ON kpi_targets(channel, metric_name);
CREATE INDEX idx_kpi_targets_dates ON kpi_targets(effective_from, effective_to);

-- Overlap prevention is handled by application logic in the Targets UI
-- No database-level unique constraint due to nullable scope columns

COMMENT ON COLUMN kpi_targets.product_id IS 'Target scoped to specific product';
COMMENT ON COLUMN kpi_targets.workflow_id IS 'Target scoped to specific workflow';
COMMENT ON COLUMN kpi_targets.channel IS 'Target scoped to specific channel (email, push, in_app)';
COMMENT ON COLUMN kpi_targets.period_type IS 'Target scoped to specific period type (week, month)';
COMMENT ON COLUMN kpi_targets.effective_from IS 'Date when this target becomes active';
COMMENT ON COLUMN kpi_targets.effective_to IS 'Date when this target expires (NULL = active indefinitely)';
COMMENT ON COLUMN kpi_targets.amber_floor IS 'Override global amber_floor for this target';
COMMENT ON COLUMN kpi_targets.red_floor IS 'Explicit red threshold (optional)';

-- ======================
-- 5) Seed Enhanced Deliverability Targets for V2
-- ======================

-- Update existing deliverability targets to use new structure
UPDATE kpi_targets
SET
  metric_name = metric,
  effective_from = COALESCE(effective_from, CURRENT_DATE)
WHERE metric IN ('unsub_rate', 'bounce_rate', 'complaint_rate');

-- Add default engagement targets if not present
INSERT INTO kpi_targets (scope_type, metric, metric_name, target_value, amber_threshold, red_threshold, effective_from)
VALUES
  ('product', 'open_rate', 'open_rate', 20.0, 14.0, 10.0, CURRENT_DATE),
  ('product', 'click_rate', 'click_rate', 2.0, 1.4, 1.0, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ======================
-- 6) Helper View: Latest Metrics with Product Mapping
-- ======================

CREATE OR REPLACE VIEW v_latest_health_metrics AS
SELECT
  ms.id,
  ms.workflow_id,
  ms.flow_id,
  ms.period_start_date,
  ms.period_type,
  ms.channel,
  ms.sends,
  ms.opens,
  ms.clicks,
  ms.open_rate,
  ms.click_rate,
  ms.ctor,
  ms.unsubs,
  ms.unsub_rate,
  ms.bounces,
  ms.bounce_rate,
  ms.complaints,
  ms.complaint_rate,
  ms.delivered,
  ms.created_at,
  -- Product resolution
  COALESCE(
    wpm.product_id,
    f.product_id
  ) AS product_id,
  -- Flow metadata
  f.name AS flow_name,
  f.purpose AS flow_purpose,
  f.live AS flow_live,
  -- Product metadata
  p.name AS product_name
FROM metric_snapshots ms
LEFT JOIN workflow_product_map wpm ON ms.workflow_id = wpm.workflow_id
LEFT JOIN flows f ON ms.flow_id = f.id
LEFT JOIN products p ON COALESCE(wpm.product_id, f.product_id) = p.id;

COMMENT ON VIEW v_latest_health_metrics IS 'Metrics with product resolution via workflow_product_map or flows table';

-- ======================
-- 7) Function: Get Applicable Target
-- ======================

CREATE OR REPLACE FUNCTION get_applicable_target(
  p_metric_name TEXT,
  p_workflow_id TEXT,
  p_product_id UUID,
  p_channel TEXT,
  p_period_type period_type,
  p_period_date DATE
)
RETURNS TABLE (
  target_value NUMERIC,
  amber_floor NUMERIC,
  red_floor NUMERIC
) AS $$
BEGIN
  -- Return most specific target that matches scope and is active on p_period_date
  -- Priority order: workflow+channel+period > workflow+channel > workflow > product+channel+period > product+channel > product > channel+period > channel > global
  RETURN QUERY
  SELECT
    kt.target_value,
    COALESCE(kt.amber_floor, (SELECT amber_floor FROM health_config LIMIT 1)),
    kt.red_floor
  FROM kpi_targets kt
  WHERE kt.metric_name = p_metric_name
    AND kt.effective_from <= p_period_date
    AND (kt.effective_to IS NULL OR kt.effective_to >= p_period_date)
    AND (
      -- Most specific: workflow + channel + period
      (kt.workflow_id = p_workflow_id AND kt.channel = p_channel AND kt.period_type = p_period_type) OR
      -- workflow + channel
      (kt.workflow_id = p_workflow_id AND kt.channel = p_channel AND kt.period_type IS NULL) OR
      -- workflow only
      (kt.workflow_id = p_workflow_id AND kt.channel IS NULL AND kt.period_type IS NULL) OR
      -- product + channel + period
      (kt.product_id = p_product_id AND kt.channel = p_channel AND kt.period_type = p_period_type AND kt.workflow_id IS NULL) OR
      -- product + channel
      (kt.product_id = p_product_id AND kt.channel = p_channel AND kt.period_type IS NULL AND kt.workflow_id IS NULL) OR
      -- product only
      (kt.product_id = p_product_id AND kt.channel IS NULL AND kt.period_type IS NULL AND kt.workflow_id IS NULL) OR
      -- channel + period
      (kt.channel = p_channel AND kt.period_type = p_period_type AND kt.workflow_id IS NULL AND kt.product_id IS NULL) OR
      -- channel only
      (kt.channel = p_channel AND kt.period_type IS NULL AND kt.workflow_id IS NULL AND kt.product_id IS NULL) OR
      -- global default
      (kt.workflow_id IS NULL AND kt.product_id IS NULL AND kt.channel IS NULL AND kt.period_type IS NULL)
    )
  ORDER BY
    -- Prioritize most specific
    CASE
      WHEN kt.workflow_id IS NOT NULL AND kt.channel IS NOT NULL AND kt.period_type IS NOT NULL THEN 1
      WHEN kt.workflow_id IS NOT NULL AND kt.channel IS NOT NULL THEN 2
      WHEN kt.workflow_id IS NOT NULL THEN 3
      WHEN kt.product_id IS NOT NULL AND kt.channel IS NOT NULL AND kt.period_type IS NOT NULL THEN 4
      WHEN kt.product_id IS NOT NULL AND kt.channel IS NOT NULL THEN 5
      WHEN kt.product_id IS NOT NULL THEN 6
      WHEN kt.channel IS NOT NULL AND kt.period_type IS NOT NULL THEN 7
      WHEN kt.channel IS NOT NULL THEN 8
      ELSE 9
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_applicable_target IS 'Returns most specific applicable target for a metric given scope and date';
