-- Add missing experiment fields for full detail support

-- Update experiment_design_type enum to include staged_rollout
ALTER TYPE experiment_design_type ADD VALUE IF NOT EXISTS 'staged_rollout';

-- Add missing columns to experiments table
ALTER TABLE experiments
ADD COLUMN IF NOT EXISTS treatment TEXT,
ADD COLUMN IF NOT EXISTS control TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments for new fields
COMMENT ON COLUMN experiments.treatment IS 'Description of the treatment/test group experience';
COMMENT ON COLUMN experiments.control IS 'Description of the control group experience';
COMMENT ON COLUMN experiments.duration IS 'Expected duration of the experiment (e.g., "4 weeks", "2 months")';
COMMENT ON COLUMN experiments.notes IS 'Additional notes, analysis, or context about the experiment';
