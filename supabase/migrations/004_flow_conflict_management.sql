-- Add conflict management fields to flows table

-- Priority: 1-100, lower = higher priority
ALTER TABLE flows
ADD COLUMN priority INTEGER CHECK (priority >= 1 AND priority <= 100);

-- Max frequency per user (in days) - how often this flow can send to same user
ALTER TABLE flows
ADD COLUMN max_frequency_per_user_days INTEGER CHECK (max_frequency_per_user_days > 0);

-- Suppression rules: free text field for documenting suppression logic
-- e.g., "Suppress if user received any PL flow in last 24h"
--       "Suppress if TTP transaction in last 7d"
ALTER TABLE flows
ADD COLUMN suppression_rules TEXT;

-- Add index for conflict detection queries
CREATE INDEX idx_flows_live_channels ON flows (live) WHERE live = true;

-- Add comments for documentation
COMMENT ON COLUMN flows.priority IS 'Flow priority: 1-100, lower number = higher priority. Used for conflict resolution.';
COMMENT ON COLUMN flows.max_frequency_per_user_days IS 'Maximum frequency this flow can send to the same user (in days). NULL = no limit.';
COMMENT ON COLUMN flows.suppression_rules IS 'Free text description of suppression logic and rules for this flow.';
