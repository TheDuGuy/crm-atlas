-- Create idea bank table for rapid response campaigns

CREATE TYPE idea_type AS ENUM ('one_off', 'burst', 'reactive', 'seasonal', 'recovery');
CREATE TYPE idea_goal AS ENUM ('activation', 'retention', 'cross_sell', 'winback', 'education');
CREATE TYPE message_angle AS ENUM ('benefit', 'urgency', 'proof', 'how_to');
CREATE TYPE idea_status AS ENUM ('ready', 'needs_review', 'archived');

CREATE TABLE idea_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type idea_type NOT NULL,
  goal idea_goal NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  audience_logic TEXT,
  suggested_trigger_type trigger_type,
  channels channel_type[] DEFAULT '{}',
  message_angle message_angle,
  deeplink_id UUID REFERENCES deeplinks(id) ON DELETE SET NULL,
  copy_notes TEXT,
  effort INTEGER CHECK (effort >= 1 AND effort <= 5),
  expected_impact INTEGER CHECK (expected_impact >= 1 AND expected_impact <= 5),
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  status idea_status DEFAULT 'ready' NOT NULL,
  last_used_at DATE,
  owner TEXT,
  related_flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for common queries
CREATE INDEX idx_idea_bank_product_id ON idea_bank(product_id);
CREATE INDEX idx_idea_bank_status ON idea_bank(status);
CREATE INDEX idx_idea_bank_type ON idea_bank(type);
CREATE INDEX idx_idea_bank_goal ON idea_bank(goal);

-- Add trigger for updated_at
CREATE TRIGGER set_idea_bank_updated_at
  BEFORE UPDATE ON idea_bank
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE idea_bank IS 'Reusable tactical campaign ideas for urgent sends or recovery';
COMMENT ON COLUMN idea_bank.type IS 'Type of campaign: one_off, burst, reactive, seasonal, recovery';
COMMENT ON COLUMN idea_bank.goal IS 'Primary business goal: activation, retention, cross_sell, winback, education';
COMMENT ON COLUMN idea_bank.effort IS 'Implementation effort score 1-5 (lower = easier)';
COMMENT ON COLUMN idea_bank.expected_impact IS 'Expected business impact 1-5 (higher = bigger impact)';
COMMENT ON COLUMN idea_bank.confidence IS 'Confidence in success 1-5 (higher = more confident)';
COMMENT ON COLUMN idea_bank.last_used_at IS 'Date this idea was last used in a campaign';
