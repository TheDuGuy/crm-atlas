-- CRM Atlas Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE flow_purpose AS ENUM ('activation', 'retention', 'winback', 'transactional');
CREATE TYPE channel_type AS ENUM ('email', 'push', 'in_app');
CREATE TYPE trigger_type AS ENUM ('event_based', 'scheduled', 'api_triggered');
CREATE TYPE opportunity_status AS ENUM ('idea', 'planned', 'in_progress', 'completed', 'rejected');
CREATE TYPE signal_type AS ENUM ('field', 'event');

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fields table
CREATE TABLE fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  format TEXT,
  live BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, name)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, name)
);

-- Deeplinks table
CREATE TABLE deeplinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel channel_type NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flows table
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purpose flow_purpose NOT NULL,
  description TEXT,
  trigger_type trigger_type NOT NULL,
  trigger_logic TEXT,
  frequency TEXT,
  channels channel_type[] NOT NULL DEFAULT '{}',
  live BOOLEAN NOT NULL DEFAULT false,
  sto BOOLEAN NOT NULL DEFAULT false,
  iterable_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, name)
);

-- Flow field dependencies (many-to-many)
CREATE TABLE flow_field_dependencies (
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (flow_id, field_id)
);

-- Flow event dependencies (many-to-many)
CREATE TABLE flow_event_dependencies (
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (flow_id, event_id)
);

-- Flow deeplinks (many-to-many)
CREATE TABLE flow_deeplinks (
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  deeplink_id UUID NOT NULL REFERENCES deeplinks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (flow_id, deeplink_id)
);

-- Notes table (polymorphic - can attach to any entity)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  linked_flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  effort INTEGER CHECK (effort >= 1 AND effort <= 5),
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  status opportunity_status NOT NULL DEFAULT 'idea',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Missing signals table
CREATE TABLE missing_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  signal_type signal_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fields_product_id ON fields(product_id);
CREATE INDEX idx_fields_live ON fields(live);
CREATE INDEX idx_events_product_id ON events(product_id);
CREATE INDEX idx_flows_product_id ON flows(product_id);
CREATE INDEX idx_flows_purpose ON flows(purpose);
CREATE INDEX idx_flows_live ON flows(live);
CREATE INDEX idx_flows_sto ON flows(sto);
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX idx_opportunities_product_id ON opportunities(product_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_missing_signals_product_id ON missing_signals(product_id);
CREATE INDEX idx_missing_signals_opportunity_id ON missing_signals(opportunity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deeplinks_updated_at BEFORE UPDATE ON deeplinks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missing_signals_updated_at BEFORE UPDATE ON missing_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
