export type Orientation = 'lead_architect_scrummaster' | 'fullstack_backend' | 'fullstack_frontend' | 'junior_fullstack' | 'ux_ui' | 'devops' | 'qa_automation';
export interface Preferences {
    cost_sensitivity: number;
    security_rigidity: number;
    maintainability: number;
    performance: number;
}
export interface Agent {
    id: string;
    name: string;
    orientation: Orientation;
    strengths: string[];
    constraints: string[];
    preferences: Preferences;
}
export interface FeatureConfig {
    name: string;
    scope: string;
    acceptanceCriteria: string[];
}
export interface TeamConfig {
    projectName: string;
    agents: Agent[];
    features: FeatureConfig[];
}
export interface ExportOptions {
    format: 'zip' | 'json';
    includeMetadata?: boolean;
}
export interface PromptPack {
    id: string;
    name: string;
    description: string;
    template: string;
    variables: string[];
}
