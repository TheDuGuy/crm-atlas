-- Channel Health Reporting Schema

-- Period type enum
CREATE TYPE period_type AS ENUM ('week', 'month');

-- Scope type enum for targets
CREATE TYPE scope_type AS ENUM ('product', 'flow', 'channel', 'lifecycle');

-- Metric snapshots table (append-only historical data)
CREATE TABLE metric_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL, -- Using TEXT for Iterable workflow IDs
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL, -- Link to our flows table
  period_start_date DATE NOT NULL,
  period_type period_type NOT NULL,
  channel channel_type NOT NULL,
  sends INTEGER NOT NULL DEFAULT 0,
  opens INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  open_rate DECIMAL(5,2), -- Percentage (e.g., 23.45)
  click_rate DECIMAL(5,2), -- Percentage
  ctor DECIMAL(5,2), -- Click-to-open rate (optional)
  import_batch_id UUID NOT NULL,
  source TEXT DEFAULT 'looker_csv',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workflow_id, period_start_date, period_type, channel)
);

-- KPI targets and thresholds
CREATE TABLE kpi_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type scope_type NOT NULL,
  scope_id TEXT, -- product_id, flow_id, channel name, or lifecycle stage
  metric TEXT NOT NULL, -- 'open_rate', 'click_rate', 'ctor', 'sends'
  target_value DECIMAL(10,2) NOT NULL,
  amber_threshold DECIMAL(10,2) NOT NULL, -- Warning level
  red_threshold DECIMAL(10,2) NOT NULL, -- Critical level
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_metric_snapshots_workflow ON metric_snapshots(workflow_id);
CREATE INDEX idx_metric_snapshots_flow ON metric_snapshots(flow_id);
CREATE INDEX idx_metric_snapshots_period ON metric_snapshots(period_start_date, period_type);
CREATE INDEX idx_metric_snapshots_channel ON metric_snapshots(channel);
CREATE INDEX idx_kpi_targets_scope ON kpi_targets(scope_type, scope_id);

-- Comments
COMMENT ON TABLE metric_snapshots IS 'Historical channel performance metrics imported from Looker/Iterable';
COMMENT ON TABLE kpi_targets IS 'KPI targets and RAG thresholds for health reporting';
COMMENT ON COLUMN metric_snapshots.workflow_id IS 'Iterable workflow ID from Looker export';
COMMENT ON COLUMN metric_snapshots.flow_id IS 'Linked flow in our system (nullable if workflow not mapped)';
COMMENT ON COLUMN metric_snapshots.import_batch_id IS 'Groups metrics from the same CSV import';
COMMENT ON COLUMN kpi_targets.scope_id IS 'Optional - NULL means applies to all within scope_type';
