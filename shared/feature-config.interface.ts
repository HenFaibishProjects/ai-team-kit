export interface FeatureConfig {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum FeatureType {
  AI_ASSISTANT = 'ai_assistant',
  CODE_REVIEW = 'code_review',
  ANALYTICS = 'analytics',
  AUTOMATION = 'automation'
}
