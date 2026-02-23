-- Create seasonal_campaigns table
CREATE TABLE seasonal_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  product TEXT NOT NULL CHECK (product IN (
    'Card Reader', 'Payment Links', 'Tap to Pay', 'Terminal',
    'PBB', 'Sell in Person', 'Cross-Product', 'Other'
  )),
  season TEXT NOT NULL,
  year INTEGER NOT NULL,
  objective TEXT NOT NULL CHECK (objective IN (
    'activation', 'engagement', 'retention', 'winback', 'revenue', 'awareness'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'planned', 'in_flight', 'completed', 'archived'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'high', 'medium', 'low'
  )),
  market TEXT[] NOT NULL DEFAULT ARRAY['US']::TEXT[],
  start_date DATE,
  end_date DATE,
  summary TEXT,
  creative_direction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seasonal_audiences table
CREATE TABLE seasonal_audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seasonal_campaign_id UUID NOT NULL REFERENCES seasonal_campaigns(id) ON DELETE CASCADE,
  audience_name TEXT NOT NULL,
  description TEXT,
  segment_criteria TEXT,
  estimated_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seasonal_orchestration_steps table
CREATE TABLE seasonal_orchestration_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seasonal_campaign_id UUID NOT NULL REFERENCES seasonal_campaigns(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN (
    'email', 'push', 'sms', 'in-app', 'webhook', 'direct_mail'
  )),
  timing_description TEXT NOT NULL,
  content_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seasonal_kpis table
CREATE TABLE seasonal_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seasonal_campaign_id UUID NOT NULL REFERENCES seasonal_campaigns(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  kpi_type TEXT NOT NULL CHECK (kpi_type IN (
    'engagement', 'conversion', 'revenue', 'retention', 'reach'
  )),
  target_value TEXT,
  actual_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seasonal_assets table
CREATE TABLE seasonal_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seasonal_campaign_id UUID NOT NULL REFERENCES seasonal_campaigns(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'copy', 'creative_direction', 'image', 'template', 'video', 'other'
  )),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seasonal_data_requirements table
CREATE TABLE seasonal_data_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seasonal_campaign_id UUID NOT NULL REFERENCES seasonal_campaigns(id) ON DELETE CASCADE,
  requirement_name TEXT NOT NULL,
  description TEXT,
  data_source TEXT,
  status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN (
    'needed', 'in_progress', 'available'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_seasonal_campaigns_product ON seasonal_campaigns(product);
CREATE INDEX idx_seasonal_campaigns_season ON seasonal_campaigns(season);
CREATE INDEX idx_seasonal_campaigns_year ON seasonal_campaigns(year);
CREATE INDEX idx_seasonal_campaigns_status ON seasonal_campaigns(status);
CREATE INDEX idx_seasonal_campaigns_priority ON seasonal_campaigns(priority);

CREATE INDEX idx_seasonal_audiences_campaign ON seasonal_audiences(seasonal_campaign_id);
CREATE INDEX idx_seasonal_orchestration_steps_campaign ON seasonal_orchestration_steps(seasonal_campaign_id);
CREATE INDEX idx_seasonal_kpis_campaign ON seasonal_kpis(seasonal_campaign_id);
CREATE INDEX idx_seasonal_assets_campaign ON seasonal_assets(seasonal_campaign_id);
CREATE INDEX idx_seasonal_data_requirements_campaign ON seasonal_data_requirements(seasonal_campaign_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_seasonal_campaigns_updated_at
  BEFORE UPDATE ON seasonal_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_audiences_updated_at
  BEFORE UPDATE ON seasonal_audiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_orchestration_steps_updated_at
  BEFORE UPDATE ON seasonal_orchestration_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_kpis_updated_at
  BEFORE UPDATE ON seasonal_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_assets_updated_at
  BEFORE UPDATE ON seasonal_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_data_requirements_updated_at
  BEFORE UPDATE ON seasonal_data_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
