export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FlowPurpose = 'activation' | 'retention' | 'winback' | 'transactional';
export type ChannelType = 'email' | 'push' | 'in_app';
export type TriggerType = 'event_based' | 'scheduled' | 'api_triggered';
export type OpportunityStatus = 'idea' | 'planned' | 'in_progress' | 'completed' | 'rejected';
export type SignalType = 'field' | 'event';
export type ExperimentStatus = 'draft' | 'ready' | 'running' | 'readout' | 'shipped' | 'killed';
export type ExperimentDesignType = 'ab_test' | 'holdout' | 'pre_post' | 'geo_split';
export type IdeaType = 'one_off' | 'burst' | 'reactive' | 'seasonal' | 'recovery';
export type IdeaGoal = 'activation' | 'retention' | 'cross_sell' | 'winback' | 'education';
export type MessageAngle = 'benefit' | 'urgency' | 'proof' | 'how_to';
export type IdeaStatus = 'ready' | 'needs_review' | 'archived';

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fields: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          description: string | null;
          format: string | null;
          live: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          description?: string | null;
          format?: string | null;
          live?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          description?: string | null;
          format?: string | null;
          live?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deeplinks: {
        Row: {
          id: string;
          channel: ChannelType;
          url: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel: ChannelType;
          url: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel?: ChannelType;
          url?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flows: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          purpose: FlowPurpose;
          description: string | null;
          trigger_type: TriggerType;
          trigger_logic: string | null;
          frequency: string | null;
          channels: ChannelType[];
          live: boolean;
          sto: boolean;
          iterable_id: string | null;
          priority: number | null;
          max_frequency_per_user_days: number | null;
          suppression_rules: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          purpose: FlowPurpose;
          description?: string | null;
          trigger_type: TriggerType;
          trigger_logic?: string | null;
          frequency?: string | null;
          channels?: ChannelType[];
          live?: boolean;
          sto?: boolean;
          iterable_id?: string | null;
          priority?: number | null;
          max_frequency_per_user_days?: number | null;
          suppression_rules?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          purpose?: FlowPurpose;
          description?: string | null;
          trigger_type?: TriggerType;
          trigger_logic?: string | null;
          frequency?: string | null;
          channels?: ChannelType[];
          live?: boolean;
          sto?: boolean;
          iterable_id?: string | null;
          priority?: number | null;
          max_frequency_per_user_days?: number | null;
          suppression_rules?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flow_field_dependencies: {
        Row: {
          flow_id: string;
          field_id: string;
          created_at: string;
        };
        Insert: {
          flow_id: string;
          field_id: string;
          created_at?: string;
        };
        Update: {
          flow_id?: string;
          field_id?: string;
          created_at?: string;
        };
      };
      flow_event_dependencies: {
        Row: {
          flow_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          flow_id: string;
          event_id: string;
          created_at?: string;
        };
        Update: {
          flow_id?: string;
          event_id?: string;
          created_at?: string;
        };
      };
      flow_deeplinks: {
        Row: {
          flow_id: string;
          deeplink_id: string;
          created_at: string;
        };
        Insert: {
          flow_id: string;
          deeplink_id: string;
          created_at?: string;
        };
        Update: {
          flow_id?: string;
          deeplink_id?: string;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          product_id: string | null;
          linked_flow_id: string | null;
          title: string;
          description: string | null;
          impact: number | null;
          effort: number | null;
          confidence: number | null;
          status: OpportunityStatus;
          problem: string | null;
          insight: string | null;
          hypothesis: string | null;
          proposed_solution: string | null;
          primary_kpi: string | null;
          secondary_kpis: string | null;
          guardrails: string | null;
          audience_logic: string | null;
          execution_notes: string | null;
          data_requirements: string | null;
          test_design: ExperimentDesignType | null;
          success_criteria: string | null;
          risks_mitigations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          linked_flow_id?: string | null;
          title: string;
          description?: string | null;
          impact?: number | null;
          effort?: number | null;
          confidence?: number | null;
          status?: OpportunityStatus;
          problem?: string | null;
          insight?: string | null;
          hypothesis?: string | null;
          proposed_solution?: string | null;
          primary_kpi?: string | null;
          secondary_kpis?: string | null;
          guardrails?: string | null;
          audience_logic?: string | null;
          execution_notes?: string | null;
          data_requirements?: string | null;
          test_design?: ExperimentDesignType | null;
          success_criteria?: string | null;
          risks_mitigations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          linked_flow_id?: string | null;
          title?: string;
          description?: string | null;
          impact?: number | null;
          effort?: number | null;
          confidence?: number | null;
          status?: OpportunityStatus;
          problem?: string | null;
          insight?: string | null;
          hypothesis?: string | null;
          proposed_solution?: string | null;
          primary_kpi?: string | null;
          secondary_kpis?: string | null;
          guardrails?: string | null;
          audience_logic?: string | null;
          execution_notes?: string | null;
          data_requirements?: string | null;
          test_design?: ExperimentDesignType | null;
          success_criteria?: string | null;
          risks_mitigations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      missing_signals: {
        Row: {
          id: string;
          product_id: string;
          opportunity_id: string | null;
          signal_type: SignalType;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          opportunity_id?: string | null;
          signal_type: SignalType;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          opportunity_id?: string | null;
          signal_type?: SignalType;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          title: string;
          status: ExperimentStatus;
          opportunity_id: string;
          linked_flow_id: string | null;
          hypothesis: string | null;
          primary_kpi: string | null;
          secondary_kpis: string | null;
          guardrails: string | null;
          design_type: ExperimentDesignType | null;
          eligibility: string | null;
          exposure_definition: string | null;
          success_criteria: string | null;
          start_date: string | null;
          end_date: string | null;
          analysis_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          status?: ExperimentStatus;
          opportunity_id: string;
          linked_flow_id?: string | null;
          hypothesis?: string | null;
          primary_kpi?: string | null;
          secondary_kpis?: string | null;
          guardrails?: string | null;
          design_type?: ExperimentDesignType | null;
          eligibility?: string | null;
          exposure_definition?: string | null;
          success_criteria?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          analysis_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          status?: ExperimentStatus;
          opportunity_id?: string;
          linked_flow_id?: string | null;
          hypothesis?: string | null;
          primary_kpi?: string | null;
          secondary_kpis?: string | null;
          guardrails?: string | null;
          design_type?: ExperimentDesignType | null;
          eligibility?: string | null;
          exposure_definition?: string | null;
          success_criteria?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          analysis_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      idea_bank: {
        Row: {
          id: string;
          title: string;
          type: IdeaType;
          goal: IdeaGoal;
          product_id: string | null;
          audience_logic: string | null;
          suggested_trigger_type: TriggerType | null;
          channels: ChannelType[];
          message_angle: MessageAngle | null;
          deeplink_id: string | null;
          copy_notes: string | null;
          effort: number | null;
          expected_impact: number | null;
          confidence: number | null;
          status: IdeaStatus;
          last_used_at: string | null;
          owner: string | null;
          related_flow_id: string | null;
          reasoning: string | null;
          hypothesis: string | null;
          what_to_send: string | null;
          why_now_trigger: string | null;
          measurement_plan: string | null;
          guardrails: string | null;
          variants: string | null;
          prerequisites: string | null;
          follow_ups: string | null;
          converted_opportunity_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: IdeaType;
          goal: IdeaGoal;
          product_id?: string | null;
          audience_logic?: string | null;
          suggested_trigger_type?: TriggerType | null;
          channels?: ChannelType[];
          message_angle?: MessageAngle | null;
          deeplink_id?: string | null;
          copy_notes?: string | null;
          effort?: number | null;
          expected_impact?: number | null;
          confidence?: number | null;
          status?: IdeaStatus;
          last_used_at?: string | null;
          owner?: string | null;
          related_flow_id?: string | null;
          reasoning?: string | null;
          hypothesis?: string | null;
          what_to_send?: string | null;
          why_now_trigger?: string | null;
          measurement_plan?: string | null;
          guardrails?: string | null;
          variants?: string | null;
          prerequisites?: string | null;
          follow_ups?: string | null;
          converted_opportunity_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: IdeaType;
          goal?: IdeaGoal;
          product_id?: string | null;
          audience_logic?: string | null;
          suggested_trigger_type?: TriggerType | null;
          channels?: ChannelType[];
          message_angle?: MessageAngle | null;
          deeplink_id?: string | null;
          copy_notes?: string | null;
          effort?: number | null;
          expected_impact?: number | null;
          confidence?: number | null;
          status?: IdeaStatus;
          last_used_at?: string | null;
          owner?: string | null;
          related_flow_id?: string | null;
          reasoning?: string | null;
          hypothesis?: string | null;
          what_to_send?: string | null;
          why_now_trigger?: string | null;
          measurement_plan?: string | null;
          guardrails?: string | null;
          variants?: string | null;
          prerequisites?: string | null;
          follow_ups?: string | null;
          converted_opportunity_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      flow_purpose: FlowPurpose;
      channel_type: ChannelType;
      trigger_type: TriggerType;
      opportunity_status: OpportunityStatus;
      signal_type: SignalType;
      experiment_status: ExperimentStatus;
      experiment_design_type: ExperimentDesignType;
      idea_type: IdeaType;
      idea_goal: IdeaGoal;
      message_angle: MessageAngle;
      idea_status: IdeaStatus;
    };
  };
}
