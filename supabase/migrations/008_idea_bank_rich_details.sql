-- Add rich detail fields to idea_bank table

ALTER TABLE idea_bank
ADD COLUMN reasoning TEXT,
ADD COLUMN hypothesis TEXT,
ADD COLUMN what_to_send TEXT,
ADD COLUMN why_now_trigger TEXT,
ADD COLUMN measurement_plan TEXT,
ADD COLUMN guardrails TEXT,
ADD COLUMN variants TEXT,
ADD COLUMN prerequisites TEXT,
ADD COLUMN follow_ups TEXT,
ADD COLUMN converted_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL;

-- Add index for converted opportunities
CREATE INDEX idx_idea_bank_converted_opportunity_id ON idea_bank(converted_opportunity_id);

-- Add comments
COMMENT ON COLUMN idea_bank.reasoning IS 'Why this idea makes sense - data/insight behind it';
COMMENT ON COLUMN idea_bank.hypothesis IS 'Testable hypothesis for this campaign';
COMMENT ON COLUMN idea_bank.what_to_send IS 'Message structure and content bullets (not full copy)';
COMMENT ON COLUMN idea_bank.why_now_trigger IS 'When and why to deploy this campaign';
COMMENT ON COLUMN idea_bank.measurement_plan IS 'KPIs and comparison methodology';
COMMENT ON COLUMN idea_bank.guardrails IS 'Metrics to monitor for potential harm';
COMMENT ON COLUMN idea_bank.variants IS 'Optional A/B test angles or variations';
COMMENT ON COLUMN idea_bank.prerequisites IS 'Required fields, events, or data points';
COMMENT ON COLUMN idea_bank.follow_ups IS 'Next steps if user converts or doesn''t convert';
COMMENT ON COLUMN idea_bank.converted_opportunity_id IS 'Link to opportunity created from this idea';
