-- Create experiments table for tracking measurement plans

CREATE TYPE experiment_status AS ENUM ('draft', 'ready', 'running', 'readout', 'shipped', 'killed');
CREATE TYPE experiment_design_type AS ENUM ('ab_test', 'holdout', 'pre_post', 'geo_split');

CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status experiment_status DEFAULT 'draft' NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  linked_flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  hypothesis TEXT,
  primary_kpi TEXT,
  secondary_kpis TEXT,
  guardrails TEXT,
  design_type experiment_design_type,
  eligibility TEXT,
  exposure_definition TEXT,
  success_criteria TEXT,
  start_date DATE,
  end_date DATE,
  analysis_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add index for querying by opportunity
CREATE INDEX idx_experiments_opportunity_id ON experiments(opportunity_id);
CREATE INDEX idx_experiments_linked_flow_id ON experiments(linked_flow_id);
CREATE INDEX idx_experiments_status ON experiments(status);

-- Add trigger for updated_at
CREATE TRIGGER set_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE experiments IS 'Tracks measurement plans for opportunities and flow changes';
COMMENT ON COLUMN experiments.status IS 'Experiment lifecycle stage';
COMMENT ON COLUMN experiments.design_type IS 'Type of experimental design';
COMMENT ON COLUMN experiments.opportunity_id IS 'Required link to the opportunity this experiment tests';
COMMENT ON COLUMN experiments.linked_flow_id IS 'Optional link to the flow being tested';
