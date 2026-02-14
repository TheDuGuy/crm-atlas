-- Add rich detail fields to opportunities table

ALTER TABLE opportunities
ADD COLUMN problem TEXT,
ADD COLUMN insight TEXT,
ADD COLUMN hypothesis TEXT,
ADD COLUMN proposed_solution TEXT,
ADD COLUMN primary_kpi TEXT,
ADD COLUMN secondary_kpis TEXT,
ADD COLUMN guardrails TEXT,
ADD COLUMN audience_logic TEXT,
ADD COLUMN execution_notes TEXT,
ADD COLUMN data_requirements TEXT,
ADD COLUMN test_design experiment_design_type,
ADD COLUMN success_criteria TEXT,
ADD COLUMN risks_mitigations TEXT;

-- Add comments
COMMENT ON COLUMN opportunities.problem IS 'Clear problem statement that this opportunity addresses';
COMMENT ON COLUMN opportunities.insight IS 'Key insight or data that led to this opportunity';
COMMENT ON COLUMN opportunities.hypothesis IS 'Testable hypothesis for this opportunity';
COMMENT ON COLUMN opportunities.proposed_solution IS 'Detailed solution description';
COMMENT ON COLUMN opportunities.primary_kpi IS 'Primary metric to track';
COMMENT ON COLUMN opportunities.secondary_kpis IS 'Secondary metrics to monitor';
COMMENT ON COLUMN opportunities.guardrails IS 'Metrics to watch to ensure no harm';
COMMENT ON COLUMN opportunities.audience_logic IS 'Target audience definition and logic';
COMMENT ON COLUMN opportunities.execution_notes IS 'Implementation details and notes';
COMMENT ON COLUMN opportunities.data_requirements IS 'Required fields, events, or data points';
COMMENT ON COLUMN opportunities.test_design IS 'Recommended test methodology';
COMMENT ON COLUMN opportunities.success_criteria IS 'Criteria to declare success';
COMMENT ON COLUMN opportunities.risks_mitigations IS 'Potential risks and mitigation strategies';
