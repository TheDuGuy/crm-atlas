// @ts-nocheck
"use server";

import { supabase } from "@/lib/supabase/client";

// Types
export type SeasonalCampaign = {
  id: string;
  name: string;
  product: string;
  season: string;
  year: number;
  objective: string;
  status: string;
  priority: string;
  market: string[];
  start_date: string | null;
  end_date: string | null;
  summary: string | null;
  creative_direction: string | null;
  created_at: string;
  updated_at: string;
};

export type SeasonalAudience = {
  id: string;
  seasonal_campaign_id: string;
  audience_name: string;
  description: string | null;
  segment_criteria: string | null;
  estimated_size: number | null;
  created_at: string;
  updated_at: string;
};

export type SeasonalOrchestrationStep = {
  id: string;
  seasonal_campaign_id: string;
  step_order: number;
  channel: string;
  timing_description: string;
  content_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type SeasonalKpi = {
  id: string;
  seasonal_campaign_id: string;
  kpi_name: string;
  kpi_type: string;
  target_value: string | null;
  actual_value: string | null;
  created_at: string;
  updated_at: string;
};

export type SeasonalAsset = {
  id: string;
  seasonal_campaign_id: string;
  asset_type: string;
  title: string;
  content: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
};

export type SeasonalDataRequirement = {
  id: string;
  seasonal_campaign_id: string;
  requirement_name: string;
  description: string | null;
  data_source: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SeasonalCampaignWithRelations = SeasonalCampaign & {
  audiences?: SeasonalAudience[];
  orchestration_steps?: SeasonalOrchestrationStep[];
  kpis?: SeasonalKpi[];
  assets?: SeasonalAsset[];
  data_requirements?: SeasonalDataRequirement[];
};

// Campaign CRUD
export async function getSeasonalCampaigns() {
  const { data, error } = await supabase
    .from('seasonal_campaigns')
    .select('*')
    .order('year', { ascending: false })
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as SeasonalCampaign[];
}

export async function getSeasonalCampaign(id: string) {
  const { data, error } = await supabase
    .from('seasonal_campaigns')
    .select(`
      *,
      audiences:seasonal_audiences(*),
      orchestration_steps:seasonal_orchestration_steps(*),
      kpis:seasonal_kpis(*),
      assets:seasonal_assets(*),
      data_requirements:seasonal_data_requirements(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as SeasonalCampaignWithRelations;
}

export async function createSeasonalCampaign(input: Partial<SeasonalCampaign>) {
  const { data, error } = await supabase
    .from('seasonal_campaigns')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalCampaign;
}

export async function updateSeasonalCampaign(id: string, updates: Partial<SeasonalCampaign>) {
  const { data, error } = await supabase
    .from('seasonal_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalCampaign;
}

export async function deleteSeasonalCampaign(id: string) {
  const { error } = await supabase
    .from('seasonal_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Audiences
export async function createSeasonalAudience(input: Partial<SeasonalAudience>) {
  const { data, error } = await supabase
    .from('seasonal_audiences')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalAudience;
}

export async function updateSeasonalAudience(id: string, updates: Partial<SeasonalAudience>) {
  const { data, error } = await supabase
    .from('seasonal_audiences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalAudience;
}

export async function deleteSeasonalAudience(id: string) {
  const { error } = await supabase
    .from('seasonal_audiences')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Orchestration Steps
export async function createSeasonalOrchestrationStep(input: Partial<SeasonalOrchestrationStep>) {
  const { data, error } = await supabase
    .from('seasonal_orchestration_steps')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalOrchestrationStep;
}

export async function updateSeasonalOrchestrationStep(id: string, updates: Partial<SeasonalOrchestrationStep>) {
  const { data, error } = await supabase
    .from('seasonal_orchestration_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalOrchestrationStep;
}

export async function deleteSeasonalOrchestrationStep(id: string) {
  const { error } = await supabase
    .from('seasonal_orchestration_steps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// KPIs
export async function createSeasonalKpi(input: Partial<SeasonalKpi>) {
  const { data, error } = await supabase
    .from('seasonal_kpis')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalKpi;
}

export async function updateSeasonalKpi(id: string, updates: Partial<SeasonalKpi>) {
  const { data, error } = await supabase
    .from('seasonal_kpis')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalKpi;
}

export async function deleteSeasonalKpi(id: string) {
  const { error } = await supabase
    .from('seasonal_kpis')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Assets
export async function createSeasonalAsset(input: Partial<SeasonalAsset>) {
  const { data, error } = await supabase
    .from('seasonal_assets')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalAsset;
}

export async function updateSeasonalAsset(id: string, updates: Partial<SeasonalAsset>) {
  const { data, error } = await supabase
    .from('seasonal_assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalAsset;
}

export async function deleteSeasonalAsset(id: string) {
  const { error } = await supabase
    .from('seasonal_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Data Requirements
export async function createSeasonalDataRequirement(input: Partial<SeasonalDataRequirement>) {
  const { data, error } = await supabase
    .from('seasonal_data_requirements')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalDataRequirement;
}

export async function updateSeasonalDataRequirement(id: string, updates: Partial<SeasonalDataRequirement>) {
  const { data, error } = await supabase
    .from('seasonal_data_requirements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SeasonalDataRequirement;
}

export async function deleteSeasonalDataRequirement(id: string) {
  const { error } = await supabase
    .from('seasonal_data_requirements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Export brief
export async function generateSeasonalBrief(id: string): Promise<string> {
  const campaign = await getSeasonalCampaign(id);

  let brief = `# ${campaign.name}\n\n`;
  brief += `**Product:** ${campaign.product}\n`;
  brief += `**Season:** ${campaign.season} ${campaign.year}\n`;
  brief += `**Objective:** ${campaign.objective}\n`;
  brief += `**Status:** ${campaign.status}\n`;
  brief += `**Priority:** ${campaign.priority}\n`;
  brief += `**Markets:** ${campaign.market.join(', ')}\n`;

  if (campaign.start_date || campaign.end_date) {
    brief += `**Timing:** ${campaign.start_date || 'TBD'} - ${campaign.end_date || 'TBD'}\n`;
  }

  brief += `\n---\n\n`;

  if (campaign.summary) {
    brief += `## Summary\n\n${campaign.summary}\n\n`;
  }

  if (campaign.creative_direction) {
    brief += `## Creative Direction\n\n${campaign.creative_direction}\n\n`;
  }

  if (campaign.audiences && campaign.audiences.length > 0) {
    brief += `## Audiences\n\n`;
    campaign.audiences.forEach((aud) => {
      brief += `### ${aud.audience_name}\n`;
      if (aud.description) brief += `${aud.description}\n`;
      if (aud.segment_criteria) brief += `**Criteria:** ${aud.segment_criteria}\n`;
      if (aud.estimated_size) brief += `**Est. Size:** ${aud.estimated_size.toLocaleString()}\n`;
      brief += `\n`;
    });
  }

  if (campaign.orchestration_steps && campaign.orchestration_steps.length > 0) {
    brief += `## Orchestration\n\n`;
    const sortedSteps = [...campaign.orchestration_steps].sort((a, b) => a.step_order - b.step_order);
    sortedSteps.forEach((step) => {
      brief += `**Step ${step.step_order}:** ${step.channel.toUpperCase()}\n`;
      brief += `- Timing: ${step.timing_description}\n`;
      if (step.content_summary) brief += `- Content: ${step.content_summary}\n`;
      brief += `\n`;
    });
  }

  if (campaign.kpis && campaign.kpis.length > 0) {
    brief += `## KPIs\n\n`;
    campaign.kpis.forEach((kpi) => {
      brief += `- **${kpi.kpi_name}** (${kpi.kpi_type})`;
      if (kpi.target_value) brief += `: Target ${kpi.target_value}`;
      if (kpi.actual_value) brief += ` | Actual ${kpi.actual_value}`;
      brief += `\n`;
    });
    brief += `\n`;
  }

  const copyAssets = campaign.assets?.filter(a => a.asset_type === 'copy') || [];
  if (copyAssets.length > 0) {
    brief += `## Copy\n\n`;
    copyAssets.forEach((asset) => {
      brief += `### ${asset.title}\n`;
      if (asset.content) brief += `${asset.content}\n`;
      if (asset.url) brief += `[Link](${asset.url})\n`;
      brief += `\n`;
    });
  }

  if (campaign.data_requirements && campaign.data_requirements.length > 0) {
    brief += `## Data Requirements\n\n`;
    campaign.data_requirements.forEach((req) => {
      brief += `- **${req.requirement_name}** (${req.status})`;
      if (req.data_source) brief += ` - Source: ${req.data_source}`;
      if (req.description) brief += `\n  ${req.description}`;
      brief += `\n`;
    });
  }

  return brief;
}
