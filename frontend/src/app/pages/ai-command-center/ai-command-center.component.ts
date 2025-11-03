import { Component, OnInit } from '@angular/core';
import { ClipboardService } from '../../services/clipboard.service';
import { Router, ActivatedRoute } from '@angular/router';

interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  variables: string[];
  icon: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

@Component({
  selector: 'app-ai-command-center',
  templateUrl: './ai-command-center.component.html',
  styleUrls: ['./ai-command-center.component.css'],
  standalone: false
})
export class AiCommandCenterComponent implements OnInit {
  // UI State
  selectedCategory: string = 'all';
  selectedContext: string = 'general';
  customQuery: string = '';
  generatedPrompt: string = '';
  showCustomForm: boolean = false;
  searchTerm: string = '';
  selectedDifficulty: string = 'all';
  
  // Form variables
  projectName: string = '';
  teamSize: string = '';
  technology: string = '';
  timeframe: string = '';
  specificGoal: string = '';
  budget: string = '';
  deadline: string = '';
  stakeholders: string = '';
  constraints: string = '';
  currentIssue: string = '';
  desiredOutcome: string = '';

  // Enhanced Categories
  categories = [
    { id: 'all', name: 'All Prompts', icon: 'apps', count: 0 },
    { id: 'planning', name: 'Planning & Strategy', icon: 'event_note', count: 0 },
    { id: 'development', name: 'Development', icon: 'code', count: 0 },
    { id: 'testing', name: 'Testing & QA', icon: 'bug_report', count: 0 },
    { id: 'documentation', name: 'Documentation', icon: 'description', count: 0 },
    { id: 'optimization', name: 'Optimization', icon: 'speed', count: 0 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: 'build', count: 0 },
    { id: 'security', name: 'Security & Compliance', icon: 'security', count: 0 },
    { id: 'devops', name: 'DevOps & Infrastructure', icon: 'cloud', count: 0 },
    { id: 'management', name: 'Team & Project Management', icon: 'groups', count: 0 },
    { id: 'design', name: 'UX/UI Design', icon: 'palette', count: 0 },
    { id: 'data', name: 'Data & Analytics', icon: 'analytics', count: 0 }
  ];

  // Context options
  contextOptions = [
    { id: 'general', name: 'General Project', icon: 'folder', description: 'General project context' },
    { id: 'sprint', name: 'Sprint Planning', icon: 'sprint', description: 'Current sprint context' },
    { id: 'feature', name: 'Feature Development', icon: 'extension', description: 'Specific feature work' },
    { id: 'team', name: 'Team Collaboration', icon: 'groups', description: 'Team dynamics and collaboration' },
    { id: 'architecture', name: 'System Architecture', icon: 'account_tree', description: 'Architecture decisions' },
    { id: 'incident', name: 'Incident Response', icon: 'emergency', description: 'Production issues' },
    { id: 'review', name: 'Code Review', icon: 'rate_review', description: 'Code review process' }
  ];

  // Comprehensive Prompt Templates Library
  promptTemplates: PromptTemplate[] = [
    // ===== PLANNING & STRATEGY =====
    {
      id: 'sprint-planning-advanced',
      category: 'planning',
      title: 'Advanced Sprint Planning',
      description: 'Comprehensive sprint planning with velocity tracking and risk management',
      prompt: 'Act as an experienced Agile Coach and Scrum Master. Help me plan a {timeframe} sprint for {projectName}.\n\n**Team Context:**\n- Team Size: {teamSize}\n- Technology Stack: {technology}\n- Sprint Goal: {specificGoal}\n- Budget Constraints: {budget}\n- Key Stakeholders: {stakeholders}\n\n**Please provide:**\n1. **Sprint Goal Definition**: Clear, measurable sprint goal\n2. **User Stories**: Break down into user stories with acceptance criteria (Given-When-Then format)\n3. **Story Point Estimation**: Estimate complexity using Fibonacci sequence\n4. **Task Breakdown**: Detailed tasks for each story with time estimates\n5. **Capacity Planning**: Consider team velocity and availability\n6. **Risk Assessment**: Identify technical, resource, and timeline risks with mitigation strategies\n7. **Dependencies**: Map out dependencies between stories and external teams\n8. **Definition of Done**: Clear DoD for each story\n9. **Sprint Metrics**: Key metrics to track (velocity, burndown, etc.)\n10. **Daily Standup Structure**: Suggested format for daily standups',
      variables: ['projectName', 'teamSize', 'technology', 'timeframe', 'specificGoal', 'budget', 'stakeholders'],
      icon: 'event_note',
      difficulty: 'advanced',
      tags: ['agile', 'scrum', 'planning', 'sprint']
    },
    {
      id: 'product-roadmap',
      category: 'planning',
      title: 'Product Roadmap Generator',
      description: 'Create a strategic product roadmap with milestones and priorities',
      prompt: 'As a Product Strategy expert, help me create a comprehensive product roadmap for {projectName}.\n\n**Product Context:**\n- Technology: {technology}\n- Target Timeline: {timeframe}\n- Key Objectives: {specificGoal}\n- Budget: {budget}\n- Stakeholders: {stakeholders}\n\n**Deliverables:**\n1. **Vision Statement**: Clear product vision and mission\n2. **Strategic Themes**: 3-5 major themes for the roadmap period\n3. **Quarterly Milestones**: Key deliverables per quarter\n4. **Feature Prioritization**: Using RICE or MoSCoW framework\n5. **Success Metrics**: KPIs for each milestone\n6. **Resource Allocation**: Team and budget distribution\n7. **Risk & Dependencies**: Critical path analysis\n8. **Stakeholder Communication Plan**: How to keep stakeholders informed\n9. **Go-to-Market Strategy**: Launch plans for major features\n10. **Feedback Loops**: How to incorporate user feedback',
      variables: ['projectName', 'technology', 'timeframe', 'specificGoal', 'budget', 'stakeholders'],
      icon: 'map',
      difficulty: 'advanced',
      tags: ['product', 'roadmap', 'strategy', 'planning']
    },
    {
      id: 'technical-feasibility',
      category: 'planning',
      title: 'Technical Feasibility Analysis',
      description: 'Assess technical feasibility of a project or feature',
      prompt: 'As a Technical Architect, conduct a feasibility analysis for: {specificGoal}\n\n**Project Details:**\n- Project: {projectName}\n- Technology Stack: {technology}\n- Timeline: {timeframe}\n- Team: {teamSize}\n- Constraints: {constraints}\n\n**Analysis Required:**\n1. **Technical Viability**: Can it be built with current technology?\n2. **Architecture Options**: 3 potential architectural approaches with pros/cons\n3. **Technology Stack Evaluation**: Assess proposed technologies\n4. **Scalability Assessment**: Can it handle expected load?\n5. **Integration Complexity**: Third-party integrations needed\n6. **Security Considerations**: Security implications and requirements\n7. **Performance Expectations**: Expected performance characteristics\n8. **Resource Requirements**: Infrastructure, tools, and team skills needed\n9. **Risk Analysis**: Technical risks and mitigation strategies\n10. **Recommendation**: Go/No-Go with detailed justification',
      variables: ['specificGoal', 'projectName', 'technology', 'timeframe', 'teamSize', 'constraints'],
      icon: 'assessment',
      difficulty: 'advanced',
      tags: ['feasibility', 'architecture', 'analysis']
    },
    {
      id: 'mvp-definition',
      category: 'planning',
      title: 'MVP Definition & Scope',
      description: 'Define minimum viable product scope and features',
      prompt: 'As a Lean Startup advisor, help me define an MVP for {projectName}.\n\n**Context:**\n- Goal: {specificGoal}\n- Technology: {technology}\n- Timeline: {timeframe}\n- Budget: {budget}\n\n**Please provide:**\n1. **Core Value Proposition**: What problem does this solve?\n2. **Target User Persona**: Who is the primary user?\n3. **Must-Have Features**: Absolute minimum features for MVP\n4. **Nice-to-Have Features**: Features for future iterations\n5. **Success Criteria**: How to measure MVP success\n6. **User Journey**: Key user flows in MVP\n7. **Technical Scope**: Minimal technical implementation\n8. **Launch Strategy**: How to launch and gather feedback\n9. **Iteration Plan**: How to evolve from MVP to full product\n10. **Resource Estimate**: Time and cost for MVP',
      variables: ['projectName', 'specificGoal', 'technology', 'timeframe', 'budget'],
      icon: 'rocket_launch',
      difficulty: 'intermediate',
      tags: ['mvp', 'lean', 'startup', 'planning']
    },

    // ===== DEVELOPMENT =====
    {
      id: 'code-architecture-design',
      category: 'development',
      title: 'Software Architecture Design',
      description: 'Design comprehensive software architecture',
      prompt: 'As a Senior Software Architect, design the architecture for {specificGoal} in {projectName}.\n\n**Requirements:**\n- Technology: {technology}\n- Team Size: {teamSize}\n- Constraints: {constraints}\n\n**Architecture Design:**\n1. **System Overview**: High-level architecture diagram description\n2. **Component Breakdown**: Major components and their responsibilities\n3. **Data Flow**: How data moves through the system\n4. **API Design**: RESTful/GraphQL API structure\n5. **Database Schema**: Entity relationships and data model\n6. **Technology Choices**: Justification for each technology\n7. **Scalability Strategy**: How system scales horizontally/vertically\n8. **Security Architecture**: Authentication, authorization, data protection\n9. **Deployment Architecture**: CI/CD pipeline and infrastructure\n10. **Monitoring & Observability**: Logging, metrics, tracing strategy\n11. **Error Handling**: Global error handling approach\n12. **Testing Strategy**: Unit, integration, E2E testing approach',
      variables: ['specificGoal', 'projectName', 'technology', 'teamSize', 'constraints'],
      icon: 'architecture',
      difficulty: 'advanced',
      tags: ['architecture', 'design', 'system-design']
    },
    {
      id: 'code-review-comprehensive',
      category: 'development',
      title: 'Comprehensive Code Review',
      description: 'Detailed code review checklist and guidelines',
      prompt: 'As a Senior Code Reviewer, create a comprehensive code review guide for {technology} projects.\n\n**Review Scope:**\n- Project: {projectName}\n- Focus Area: {specificGoal}\n\n**Code Review Checklist:**\n1. **Code Quality**:\n   - Readability and maintainability\n   - Naming conventions\n   - Code complexity (cyclomatic complexity)\n   - DRY principle adherence\n2. **Architecture & Design**:\n   - Design patterns usage\n   - SOLID principles\n   - Separation of concerns\n   - Dependency injection\n3. **Performance**:\n   - Algorithm efficiency\n   - Database query optimization\n   - Memory management\n   - Caching strategies\n4. **Security**:\n   - Input validation\n   - SQL injection prevention\n   - XSS prevention\n   - Authentication/authorization\n5. **Testing**:\n   - Test coverage\n   - Test quality\n   - Edge cases\n   - Mock usage\n6. **Documentation**:\n   - Code comments\n   - API documentation\n   - README updates\n7. **Error Handling**:\n   - Exception handling\n   - Error messages\n   - Logging\n8. **Best Practices**: {technology}-specific best practices',
      variables: ['technology', 'projectName', 'specificGoal'],
      icon: 'rate_review',
      difficulty: 'intermediate',
      tags: ['code-review', 'quality', 'best-practices']
    },
    {
      id: 'refactoring-legacy',
      category: 'development',
      title: 'Legacy Code Refactoring',
      description: 'Strategy for refactoring legacy codebases',
      prompt: 'As a Legacy Code expert, help me refactor {specificGoal} in {projectName}.\n\n**Current State:**\n- Technology: {technology}\n- Current Issues: {currentIssue}\n- Desired Outcome: {desiredOutcome}\n- Constraints: {constraints}\n\n**Refactoring Strategy:**\n1. **Code Assessment**: Analyze current code quality and technical debt\n2. **Prioritization**: Which parts to refactor first (risk vs. value)\n3. **Strangler Fig Pattern**: Gradual migration strategy\n4. **Test Coverage**: Add tests before refactoring\n5. **Refactoring Steps**: Detailed step-by-step refactoring plan\n6. **Design Patterns**: Which patterns to introduce\n7. **Breaking Changes**: How to handle breaking changes\n8. **Rollback Strategy**: Safe rollback if issues arise\n9. **Performance Monitoring**: Ensure no performance regression\n10. **Documentation**: Update documentation during refactoring\n11. **Team Training**: Knowledge transfer for new patterns\n12. **Timeline**: Realistic timeline with milestones',
      variables: ['specificGoal', 'projectName', 'technology', 'currentIssue', 'desiredOutcome', 'constraints'],
      icon: 'auto_fix_high',
      difficulty: 'advanced',
      tags: ['refactoring', 'legacy', 'technical-debt']
    },
    {
      id: 'microservices-design',
      category: 'development',
      title: 'Microservices Architecture',
      description: 'Design microservices architecture and boundaries',
      prompt: 'As a Microservices Architect, help me design a microservices architecture for {projectName}.\n\n**Context:**\n- Current System: {currentIssue}\n- Goal: {specificGoal}\n- Technology: {technology}\n- Team: {teamSize}\n\n**Microservices Design:**\n1. **Service Boundaries**: Identify bounded contexts and service boundaries\n2. **Service Catalog**: List of microservices with responsibilities\n3. **Communication Patterns**: Sync vs. async, REST vs. messaging\n4. **Data Management**: Database per service, data consistency strategies\n5. **API Gateway**: Design API gateway and routing\n6. **Service Discovery**: How services find each other\n7. **Configuration Management**: Centralized config management\n8. **Distributed Tracing**: Observability across services\n9. **Circuit Breakers**: Resilience patterns\n10. **Deployment Strategy**: Container orchestration (K8s, etc.)\n11. **Testing Strategy**: Contract testing, integration testing\n12. **Migration Path**: How to migrate from monolith (if applicable)',
      variables: ['projectName', 'currentIssue', 'specificGoal', 'technology', 'teamSize'],
      icon: 'hub',
      difficulty: 'advanced',
      tags: ['microservices', 'architecture', 'distributed-systems']
    },

    // ===== TESTING & QA =====
    {
      id: 'test-automation-strategy',
      category: 'testing',
      title: 'Test Automation Strategy',
      description: 'Comprehensive test automation framework and strategy',
      prompt: 'As a Test Automation Architect, create a test automation strategy for {projectName}.\n\n**Project Details:**\n- Technology: {technology}\n- Team: {teamSize}\n- Focus: {specificGoal}\n\n**Test Automation Strategy:**\n1. **Testing Pyramid**: Unit, integration, E2E test distribution\n2. **Framework Selection**: Recommended testing frameworks for {technology}\n3. **Test Coverage Goals**: Coverage targets for each layer\n4. **CI/CD Integration**: How tests run in pipeline\n5. **Test Data Management**: Test data creation and management\n6. **Page Object Model**: Design patterns for UI tests\n7. **API Testing**: REST/GraphQL API testing approach\n8. **Performance Testing**: Load and stress testing strategy\n9. **Security Testing**: Automated security scanning\n10. **Visual Regression**: Screenshot comparison testing\n11. **Test Reporting**: Dashboards and reporting\n12. **Maintenance Strategy**: Keeping tests maintainable',
      variables: ['projectName', 'technology', 'teamSize', 'specificGoal'],
      icon: 'verified',
      difficulty: 'advanced',
      tags: ['testing', 'automation', 'qa', 'ci-cd']
    },
    {
      id: 'bug-triage-process',
      category: 'testing',
      title: 'Bug Triage & Management',
      description: 'Establish effective bug triage and management process',
      prompt: 'As a QA Lead, help me establish a bug triage process for {projectName}.\n\n**Current Situation:**\n- Issue: {currentIssue}\n- Team: {teamSize}\n- Technology: {technology}\n\n**Bug Management Process:**\n1. **Bug Report Template**: Standardized bug report format\n2. **Severity Levels**: Define P0, P1, P2, P3, P4 criteria\n3. **Triage Process**: How bugs are reviewed and prioritized\n4. **Assignment Rules**: How bugs are assigned to developers\n5. **SLA Definitions**: Response and resolution time by severity\n6. **Bug Workflow**: States (New, In Progress, Fixed, Verified, Closed)\n7. **Regression Testing**: When and how to regression test\n8. **Root Cause Analysis**: Process for critical bugs\n9. **Metrics & Reporting**: Bug metrics to track\n10. **Communication**: How to communicate bugs to stakeholders',
      variables: ['projectName', 'currentIssue', 'teamSize', 'technology'],
      icon: 'bug_report',
      difficulty: 'intermediate',
      tags: ['qa', 'bugs', 'process', 'triage']
    },

    // ===== SECURITY & COMPLIANCE =====
    {
      id: 'security-audit',
      category: 'security',
      title: 'Security Audit Checklist',
      description: 'Comprehensive security audit and vulnerability assessment',
      prompt: 'As a Security Auditor, conduct a security audit for {projectName}.\n\n**System Details:**\n- Technology: {technology}\n- Focus Area: {specificGoal}\n- Compliance Requirements: {constraints}\n\n**Security Audit:**\n1. **Authentication & Authorization**:\n   - Authentication mechanisms\n   - Password policies\n   - Multi-factor authentication\n   - Session management\n   - Role-based access control\n2. **Data Protection**:\n   - Encryption at rest\n   - Encryption in transit\n   - PII handling\n   - Data retention policies\n3. **Input Validation**:\n   - SQL injection prevention\n   - XSS prevention\n   - CSRF protection\n   - File upload security\n4. **API Security**:\n   - API authentication\n   - Rate limiting\n   - Input validation\n   - CORS configuration\n5. **Infrastructure Security**:\n   - Network segmentation\n   - Firewall rules\n   - DDoS protection\n   - Security groups\n6. **Dependency Management**:\n   - Vulnerable dependencies\n   - License compliance\n   - Supply chain security\n7. **Logging & Monitoring**:\n   - Security event logging\n   - Intrusion detection\n   - Audit trails\n8. **Compliance**: GDPR, HIPAA, SOC2, etc.',
      variables: ['projectName', 'technology', 'specificGoal', 'constraints'],
      icon: 'security',
      difficulty: 'advanced',
      tags: ['security', 'audit', 'compliance', 'vulnerabilities']
    },
    {
      id: 'gdpr-compliance',
      category: 'security',
      title: 'GDPR Compliance Guide',
      description: 'Ensure GDPR compliance for your application',
      prompt: 'As a GDPR Compliance expert, help me ensure {projectName} is GDPR compliant.\n\n**Application Details:**\n- Technology: {technology}\n- Data Handled: {specificGoal}\n- User Base: {stakeholders}\n\n**GDPR Compliance Checklist:**\n1. **Lawful Basis**: Identify lawful basis for data processing\n2. **Consent Management**: Implement proper consent mechanisms\n3. **Data Minimization**: Collect only necessary data\n4. **Right to Access**: Implement data export functionality\n5. **Right to Erasure**: Implement data deletion\n6. **Right to Rectification**: Allow users to correct data\n7. **Data Portability**: Export data in machine-readable format\n8. **Privacy by Design**: Build privacy into architecture\n9. **Data Protection Impact Assessment**: Conduct DPIA\n10. **Data Breach Procedures**: 72-hour notification process\n11. **Privacy Policy**: Clear, accessible privacy policy\n12. **Cookie Consent**: Proper cookie consent banner\n13. **Third-Party Processors**: DPA with processors\n14. **International Transfers**: Safeguards for data transfers',
      variables: ['projectName', 'technology', 'specificGoal', 'stakeholders'],
      icon: 'policy',
      difficulty: 'advanced',
      tags: ['gdpr', 'compliance', 'privacy', 'legal']
    },

    // ===== DEVOPS & INFRASTRUCTURE =====
    {
      id: 'cicd-pipeline',
      category: 'devops',
      title: 'CI/CD Pipeline Design',
      description: 'Design comprehensive CI/CD pipeline',
      prompt: 'As a DevOps Engineer, design a CI/CD pipeline for {projectName}.\n\n**Project Context:**\n- Technology: {technology}\n- Team: {teamSize}\n- Deployment Target: {specificGoal}\n\n**CI/CD Pipeline Design:**\n1. **Source Control**: Git workflow (GitFlow, trunk-based, etc.)\n2. **Build Stage**:\n   - Build automation\n   - Dependency management\n   - Artifact creation\n3. **Test Stage**:\n   - Unit tests\n   - Integration tests\n   - Code quality checks (SonarQube, etc.)\n   - Security scanning\n4. **Deployment Stages**:\n   - Dev environment\n   - Staging environment\n   - Production environment\n5. **Deployment Strategies**:\n   - Blue-green deployment\n   - Canary releases\n   - Rolling updates\n6. **Infrastructure as Code**: Terraform, CloudFormation, etc.\n7. **Container Strategy**: Docker, Kubernetes\n8. **Monitoring & Alerts**: Pipeline health monitoring\n9. **Rollback Strategy**: Automated rollback procedures\n10. **Secrets Management**: Vault, AWS Secrets Manager\n11. **Compliance Gates**: Security and compliance checks\n12. **Documentation**: Pipeline documentation and runbooks',
      variables: ['projectName', 'technology', 'teamSize', 'specificGoal'],
      icon: 'cloud',
      difficulty: 'advanced',
      tags: ['devops', 'ci-cd', 'automation', 'deployment']
    },
    {
      id: 'kubernetes-deployment',
      category: 'devops',
      title: 'Kubernetes Deployment Strategy',
      description: 'Design Kubernetes deployment and orchestration',
      prompt: 'As a Kubernetes expert, design a K8s deployment strategy for {projectName}.\n\n**Application Details:**\n- Technology: {technology}\n- Scale Requirements: {specificGoal}\n- Constraints: {constraints}\n\n**Kubernetes Strategy:**\n1. **Cluster Architecture**: Node pools, namespaces, resource quotas\n2. **Deployment Manifests**: Deployments, StatefulSets, DaemonSets\n3. **Service Discovery**: Services, Ingress, DNS\n4. **Configuration Management**: ConfigMaps, Secrets\n5. **Storage**: PersistentVolumes, StorageClasses\n6. **Scaling**: HPA, VPA, Cluster Autoscaler\n7. **Health Checks**: Liveness, readiness, startup probes\n8. **Resource Management**: CPU/memory requests and limits\n9. **Security**: RBAC, Pod Security Policies, Network Policies\n10. **Monitoring**: Prometheus, Grafana setup\n11. **Logging**: ELK/EFK stack\n12. **Backup & DR**: Velero, disaster recovery plan',
      variables: ['projectName', 'technology', 'specificGoal', 'constraints'],
      icon: 'settings_applications',
      difficulty: 'advanced',
      tags: ['kubernetes', 'k8s', 'orchestration', 'containers']
    },
    {
      id: 'monitoring-observability',
      category: 'devops',
      title: 'Monitoring & Observability',
      description: 'Implement comprehensive monitoring and observability',
      prompt: 'As an SRE, design a monitoring and observability strategy for {projectName}.\n\n**System Context:**\n- Technology: {technology}\n- Scale: {specificGoal}\n- Critical Services: {stakeholders}\n\n**Observability Strategy:**\n1. **The Three Pillars**:\n   - Metrics (Prometheus, CloudWatch)\n   - Logs (ELK, Splunk, Loki)\n   - Traces (Jaeger, Zipkin)\n2. **Golden Signals**:\n   - Latency\n   - Traffic\n   - Errors\n   - Saturation\n3. **SLIs & SLOs**: Define Service Level Indicators and Objectives\n4. **Dashboards**: Key dashboards for different audiences\n5. **Alerting Strategy**:\n   - Alert rules and thresholds\n   - On-call rotation\n   - Escalation policies\n   - Alert fatigue prevention\n6. **Distributed Tracing**: Request flow across microservices\n7. **Application Performance Monitoring**: APM tools setup\n8. **Infrastructure Monitoring**: Server, network, database monitoring\n9. **Business Metrics**: User-facing metrics\n10. **Incident Response**: Runbooks and playbooks\n11. **Post-Mortem Process**: Learning from incidents\n12. **Cost Monitoring**: Cloud cost tracking and optimization',
      variables: ['projectName', 'technology', 'specificGoal', 'stakeholders'],
      icon: 'monitor_heart',
      difficulty: 'advanced',
      tags: ['monitoring', 'observability', 'sre', 'metrics']
    },

    // ===== TEAM & PROJECT MANAGEMENT =====
    {
      id: 'team-onboarding',
      category: 'management',
      title: 'Developer Onboarding Program',
      description: 'Create comprehensive developer onboarding program',
      prompt: 'As a Team Lead, create an onboarding program for new developers joining {projectName}.\n\n**Team Context:**\n- Team Size: {teamSize}\n- Technology: {technology}\n- Project Complexity: {specificGoal}\n\n**Onboarding Program:**\n1. **Week 1 - Setup & Orientation**:\n   - Development environment setup\n   - Access to tools and systems\n   - Team introductions\n   - Company culture and values\n2. **Week 2 - Codebase Familiarization**:\n   - Architecture overview\n   - Code walkthrough\n   - Development workflow\n   - First small task\n3. **Week 3-4 - Increasing Complexity**:\n   - Medium-sized tasks\n   - Code review participation\n   - Pair programming sessions\n4. **Ongoing - Continuous Learning**:\n   - Mentorship program\n   - Knowledge sharing sessions\n   - Documentation contribution\n5. **Resources**:\n   - Technical documentation\n   - Architecture diagrams\n   - API documentation\n   - Runbooks\n6. **Success Metrics**: How to measure onboarding success\n7. **Feedback Loop**: Regular check-ins and feedback\n8. **30-60-90 Day Goals**: Clear goals for first 3 months',
      variables: ['projectName', 'teamSize', 'technology', 'specificGoal'],
      icon: 'school',
      difficulty: 'intermediate',
      tags: ['onboarding', 'team', 'management', 'training']
    },
    {
      id: 'remote-team-management',
      category: 'management',
      title: 'Remote Team Management',
      description: 'Best practices for managing remote development teams',
      prompt: 'As a Remote Team expert, help me manage a remote team for {projectName}.\n\n**Team Details:**\n- Team Size: {teamSize}\n- Time Zones: {constraints}\n- Current Challenges: {currentIssue}\n\n**Remote Team Strategy:**\n1. **Communication**:\n   - Synchronous vs. asynchronous communication\n   - Tool stack (Slack, Zoom, etc.)\n   - Communication guidelines\n   - Over-communication practices\n2. **Collaboration**:\n   - Pair programming remotely\n   - Code review process\n   - Knowledge sharing\n   - Virtual whiteboarding\n3. **Meetings**:\n   - Meeting best practices\n   - Time zone considerations\n   - Meeting recordings\n   - Action items tracking\n4. **Productivity**:\n   - Work hours flexibility\n   - Focus time blocks\n   - Productivity metrics\n   - Avoiding burnout\n5. **Team Building**:\n   - Virtual team activities\n   - Coffee chats\n   - Celebrating wins\n6. **Documentation**:\n   - Written communication culture\n   - Decision documentation\n   - Knowledge base\n7. **Tools & Infrastructure**:\n   - Development tools\n   - Project management tools\n   - Time tracking (if needed)\n8. **Performance Management**: Remote performance evaluation',
      variables: ['projectName', 'teamSize', 'constraints', 'currentIssue'],
      icon: 'groups',
      difficulty: 'intermediate',
      tags: ['remote', 'team', 'management', 'collaboration']
    },

    // ===== UX/UI DESIGN =====
    {
      id: 'ux-research-plan',
      category: 'design',
      title: 'UX Research Plan',
      description: 'Design comprehensive UX research strategy',
      prompt: 'As a UX Researcher, create a research plan for {projectName}.\n\n**Product Context:**\n- Goal: {specificGoal}\n- Target Users: {stakeholders}\n- Timeline: {timeframe}\n\n**UX Research Plan:**\n1. **Research Objectives**: What we want to learn\n2. **Research Methods**:\n   - User interviews\n   - Surveys\n   - Usability testing\n   - A/B testing\n   - Analytics analysis\n   - Card sorting\n   - Tree testing\n3. **Participant Recruitment**: How to find and recruit users\n4. **Research Questions**: Specific questions to answer\n5. **Test Scenarios**: User tasks to observe\n6. **Success Metrics**: How to measure success\n7. **Analysis Plan**: How to analyze findings\n8. **Reporting**: How to present findings to stakeholders\n9. **Actionable Insights**: Converting research to design decisions\n10. **Iteration Plan**: How to incorporate feedback',
      variables: ['projectName', 'specificGoal', 'stakeholders', 'timeframe'],
      icon: 'psychology',
      difficulty: 'intermediate',
      tags: ['ux', 'research', 'user-testing', 'design']
    },
    {
      id: 'design-system',
      category: 'design',
      title: 'Design System Creation',
      description: 'Build a comprehensive design system',
      prompt: 'As a Design Systems expert, help me create a design system for {projectName}.\n\n**Project Context:**\n- Technology: {technology}\n- Brand Guidelines: {specificGoal}\n- Team: {teamSize}\n\n**Design System Components:**\n1. **Foundation**:\n   - Color palette (primary, secondary, semantic colors)\n   - Typography scale\n   - Spacing system\n   - Grid system\n   - Breakpoints\n2. **Components**:\n   - Buttons\n   - Forms (inputs, selects, checkboxes, etc.)\n   - Navigation\n   - Cards\n   - Modals\n   - Tables\n   - Icons\n3. **Patterns**:\n   - Layout patterns\n   - Navigation patterns\n   - Form patterns\n   - Data visualization patterns\n4. **Documentation**:\n   - Component documentation\n   - Usage guidelines\n   - Accessibility guidelines\n   - Code examples\n5. **Implementation**:\n   - Component library (React, Vue, etc.)\n   - Storybook setup\n   - Version control\n6. **Governance**:\n   - Contribution guidelines\n   - Review process\n   - Versioning strategy\n7. **Accessibility**: WCAG 2.1 AA compliance\n8. **Theming**: Dark mode, custom themes',
      variables: ['projectName', 'technology', 'specificGoal', 'teamSize'],
      icon: 'palette',
      difficulty: 'advanced',
      tags: ['design-system', 'ui', 'components', 'accessibility']
    },

    // ===== DATA & ANALYTICS =====
    {
      id: 'data-pipeline',
      category: 'data',
      title: 'Data Pipeline Architecture',
      description: 'Design scalable data pipeline and ETL processes',
      prompt: 'As a Data Engineer, design a data pipeline for {projectName}.\n\n**Data Requirements:**\n- Data Sources: {specificGoal}\n- Technology: {technology}\n- Scale: {constraints}\n\n**Data Pipeline Design:**\n1. **Data Sources**: Identify all data sources\n2. **Ingestion Layer**:\n   - Batch vs. streaming\n   - Data connectors\n   - Change data capture\n3. **Storage Layer**:\n   - Data lake architecture\n   - Data warehouse design\n   - Hot vs. cold storage\n4. **Processing Layer**:\n   - ETL vs. ELT\n   - Data transformation logic\n   - Data quality checks\n5. **Orchestration**: Airflow, Prefect, etc.\n6. **Data Catalog**: Metadata management\n7. **Data Governance**:\n   - Data lineage\n   - Data quality monitoring\n   - Access control\n8. **Performance Optimization**:\n   - Partitioning strategy\n   - Indexing\n   - Caching\n9. **Monitoring**: Pipeline health and data quality\n10. **Disaster Recovery**: Backup and recovery procedures',
      variables: ['projectName', 'specificGoal', 'technology', 'constraints'],
      icon: 'analytics',
      difficulty: 'advanced',
      tags: ['data', 'pipeline', 'etl', 'data-engineering']
    },
    {
      id: 'analytics-implementation',
      category: 'data',
      title: 'Analytics Implementation',
      description: 'Implement comprehensive product analytics',
      prompt: 'As an Analytics expert, help me implement analytics for {projectName}.\n\n**Product Context:**\n- Goal: {specificGoal}\n- Technology: {technology}\n- Key Metrics: {desiredOutcome}\n\n**Analytics Implementation:**\n1. **Tracking Plan**:\n   - Events to track\n   - Event properties\n   - User properties\n   - Naming conventions\n2. **Implementation**:\n   - Analytics SDK integration\n   - Event tracking code\n   - Server-side vs. client-side tracking\n3. **Key Metrics**:\n   - Acquisition metrics\n   - Activation metrics\n   - Retention metrics\n   - Revenue metrics\n   - Referral metrics\n4. **Funnels**: Key user funnels to track\n5. **Cohort Analysis**: User cohort definitions\n6. **A/B Testing**: Experimentation framework\n7. **Dashboards**: Key dashboards for different stakeholders\n8. **Data Privacy**: GDPR-compliant tracking\n9. **Data Quality**: Validation and monitoring\n10. **Reporting**: Automated reports and alerts',
      variables: ['projectName', 'specificGoal', 'technology', 'desiredOutcome'],
      icon: 'insights',
      difficulty: 'intermediate',
      tags: ['analytics', 'metrics', 'tracking', 'data']
    },

    // ===== DOCUMENTATION =====
    {
      id: 'api-documentation',
      category: 'documentation',
      title: 'API Documentation',
      description: 'Create comprehensive API documentation',
      prompt: 'As a Technical Writer, create API documentation for {projectName}.\n\n**API Details:**\n- Technology: {technology}\n- API Type: {specificGoal}\n- Audience: {stakeholders}\n\n**API Documentation Structure:**\n1. **Getting Started**:\n   - Authentication\n   - Base URL\n   - Rate limiting\n   - Quick start guide\n2. **API Reference**:\n   - Endpoints list\n   - Request/response examples\n   - Parameters\n   - Error codes\n3. **Authentication**:\n   - Auth methods (API key, OAuth, JWT)\n   - Token management\n   - Security best practices\n4. **Use Cases**: Common use case examples\n5. **SDKs & Libraries**: Available client libraries\n6. **Webhooks**: Webhook documentation (if applicable)\n7. **Changelog**: API version history\n8. **Error Handling**: Error codes and messages\n9. **Best Practices**: API usage best practices\n10. **Interactive Documentation**: Swagger/OpenAPI spec\n11. **Code Examples**: Multiple language examples\n12. **Support**: How to get help',
      variables: ['projectName', 'technology', 'specificGoal', 'stakeholders'],
      icon: 'description',
      difficulty: 'intermediate',
      tags: ['documentation', 'api', 'technical-writing']
    },

    // ===== OPTIMIZATION =====
    {
      id: 'performance-optimization',
      category: 'optimization',
      title: 'Performance Optimization',
      description: 'Comprehensive performance optimization strategy',
      prompt: 'As a Performance Engineer, optimize {projectName} for {specificGoal}.\n\n**Current State:**\n- Technology: {technology}\n- Performance Issues: {currentIssue}\n- Target Metrics: {desiredOutcome}\n\n**Performance Optimization:**\n1. **Frontend Optimization**:\n   - Bundle size reduction\n   - Code splitting\n   - Lazy loading\n   - Image optimization\n   - Caching strategies\n   - CDN usage\n2. **Backend Optimization**:\n   - Database query optimization\n   - N+1 query prevention\n   - Caching (Redis, Memcached)\n   - Connection pooling\n   - Async processing\n3. **Database Optimization**:\n   - Index optimization\n   - Query optimization\n   - Denormalization strategies\n   - Read replicas\n4. **Network Optimization**:\n   - HTTP/2 or HTTP/3\n   - Compression (gzip, brotli)\n   - Minification\n   - Resource hints\n5. **Monitoring**:\n   - Performance metrics\n   - Real user monitoring\n   - Synthetic monitoring\n6. **Load Testing**: Stress testing strategy\n7. **Performance Budget**: Set and enforce budgets',
      variables: ['projectName', 'specificGoal', 'technology', 'currentIssue', 'desiredOutcome'],
      icon: 'speed',
      difficulty: 'advanced',
      tags: ['performance', 'optimization', 'speed', 'scalability']
    },

    // ===== TROUBLESHOOTING =====
    {
      id: 'incident-postmortem',
      category: 'troubleshooting',
      title: 'Incident Post-Mortem',
      description: 'Conduct blameless post-mortem analysis',
      prompt: 'As an SRE, conduct a post-mortem for an incident in {projectName}.\n\n**Incident Details:**\n- What Happened: {currentIssue}\n- Impact: {specificGoal}\n- Technology: {technology}\n\n**Post-Mortem Template:**\n1. **Incident Summary**:\n   - Date and time\n   - Duration\n   - Severity\n   - Impact (users affected, revenue impact)\n2. **Timeline**:\n   - Detection time\n   - Response time\n   - Resolution time\n   - Key events during incident\n3. **Root Cause Analysis**:\n   - Primary cause\n   - Contributing factors\n   - Why it wasn\'t caught earlier\n4. **Resolution**:\n   - How it was fixed\n   - Who was involved\n   - Tools used\n5. **Impact Assessment**:\n   - User impact\n   - Business impact\n   - Data integrity\n6. **What Went Well**: Positive aspects of response\n7. **What Went Wrong**: Areas for improvement\n8. **Action Items**:\n   - Immediate fixes\n   - Long-term improvements\n   - Process improvements\n   - Monitoring improvements\n9. **Lessons Learned**: Key takeaways\n10. **Follow-up**: Tracking action items',
      variables: ['projectName', 'currentIssue', 'specificGoal', 'technology'],
      icon: 'emergency',
      difficulty: 'intermediate',
      tags: ['incident', 'post-mortem', 'sre', 'troubleshooting']
    }
  ];

  filteredTemplates: PromptTemplate[] = [];

  constructor(
    private clipboardService: ClipboardService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.updateCategoryCounts();
    this.filterTemplates();
    
    // Check for query params to pre-select category
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterTemplates();
      }
    });
  }

  updateCategoryCounts() {
    this.categories.forEach(cat => {
      if (cat.id === 'all') {
        cat.count = this.promptTemplates.length;
      } else {
        cat.count = this.promptTemplates.filter(t => t.category === cat.id).length;
      }
    });
  }

  filterTemplates() {
    let filtered = this.promptTemplates;
    
    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.selectedCategory);
    }
    
    // Filter by difficulty
    if (this.selectedDifficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === this.selectedDifficulty);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    this.filteredTemplates = filtered;
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.filterTemplates();
  }

  useTemplate(template: PromptTemplate) {
    this.showCustomForm = true;
    this.generatedPrompt = template.prompt;
    
    // Scroll to form
    setTimeout(() => {
      document.getElementById('custom-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  generatePrompt() {
    let prompt = this.generatedPrompt;
    
    // Replace all variables
    prompt = prompt.replace(/{projectName}/g, this.projectName || '[Your Project Name]');
    prompt = prompt.replace(/{teamSize}/g, this.teamSize || '[Team Size]');
    prompt = prompt.replace(/{technology}/g, this.technology || '[Technology Stack]');
    prompt = prompt.replace(/{timeframe}/g, this.timeframe || '[Timeframe]');
    prompt = prompt.replace(/{specificGoal}/g, this.specificGoal || '[Your Specific Goal]');
    prompt = prompt.replace(/{budget}/g, this.budget || '[Budget]');
    prompt = prompt.replace(/{deadline}/g, this.deadline || '[Deadline]');
    prompt = prompt.replace(/{stakeholders}/g, this.stakeholders || '[Stakeholders]');
    prompt = prompt.replace(/{constraints}/g, this.constraints || '[Constraints]');
    prompt = prompt.replace(/{currentIssue}/g, this.currentIssue || '[Current Issue]');
    prompt = prompt.replace(/{desiredOutcome}/g, this.desiredOutcome || '[Desired Outcome]');
    
    // Add context
    const contextPrefix = this.getContextPrefix();
    this.generatedPrompt = contextPrefix + '\n\n' + prompt;
  }

  getContextPrefix(): string {
    const context = this.contextOptions.find(c => c.id === this.selectedContext);
    return context ? `🎯 Context: ${context.name}\n${context.description}` : '💡 Context: General Project';
  }

  createCustomPrompt() {
    const contextPrefix = this.getContextPrefix();
    
    // If there's already a generated prompt (from a template), enhance it with custom query
    if (this.generatedPrompt && this.generatedPrompt.trim()) {
      // Remove any existing "Additional Custom Requirements" section to avoid duplication
      const additionalReqMarker = '\n\n**Additional Custom Requirements:**';
      const markerIndex = this.generatedPrompt.indexOf(additionalReqMarker);
      if (markerIndex !== -1) {
        // Remove everything from the marker onwards
        this.generatedPrompt = this.generatedPrompt.substring(0, markerIndex);
      }
      
      // Check if the prompt already has variable placeholders filled
      const hasFilledVariables = !this.generatedPrompt.includes('[Your Project Name]') && 
                                  !this.generatedPrompt.includes('[Team Size]') &&
                                  !this.generatedPrompt.includes('[Technology Stack]');
      
      if (!hasFilledVariables) {
        // Template has placeholders, fill them first
        this.generatePrompt(); // Fill in the variables
      }
      
      // ONLY add custom query section if there's actual content
      if (this.customQuery && this.customQuery.trim().length > 0) {
        this.generatedPrompt += `\n\n**Additional Custom Requirements:**\n${this.customQuery}`;
      }
    } else {
      // No template selected, create prompt from scratch with custom query
      this.generatedPrompt = `${contextPrefix}\n\n${this.customQuery}`;
      
      // Add all filled form fields to the prompt
      const fields: string[] = [];
      if (this.projectName) fields.push(`Project: ${this.projectName}`);
      if (this.technology) fields.push(`Technology: ${this.technology}`);
      if (this.specificGoal) fields.push(`Goal: ${this.specificGoal}`);
      if (this.teamSize) fields.push(`Team Size: ${this.teamSize}`);
      if (this.timeframe) fields.push(`Timeframe: ${this.timeframe}`);
      if (this.budget) fields.push(`Budget: ${this.budget}`);
      if (this.deadline) fields.push(`Deadline: ${this.deadline}`);
      if (this.stakeholders) fields.push(`Stakeholders: ${this.stakeholders}`);
      if (this.constraints) fields.push(`Constraints: ${this.constraints}`);
      if (this.currentIssue) fields.push(`Current Issue: ${this.currentIssue}`);
      if (this.desiredOutcome) fields.push(`Desired Outcome: ${this.desiredOutcome}`);
      
      if (fields.length > 0) {
        this.generatedPrompt += '\n\n' + fields.join('\n');
      }
    }
  }

  copyPrompt() {
    this.clipboardService.copyToClipboard(this.generatedPrompt, 'Prompt copied to clipboard!');
  }

  clearForm() {
    this.projectName = '';
    this.teamSize = '';
    this.technology = '';
    this.timeframe = '';
    this.specificGoal = '';
    this.budget = '';
    this.deadline = '';
    this.stakeholders = '';
    this.constraints = '';
    this.currentIssue = '';
    this.desiredOutcome = '';
    this.customQuery = '';
    this.generatedPrompt = '';
    this.showCustomForm = false;
  }

  toggleCustomForm() {
    this.showCustomForm = !this.showCustomForm;
    if (this.showCustomForm) {
      setTimeout(() => {
        document.getElementById('custom-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  onSearchChange() {
    this.filterTemplates();
  }

  onDifficultyChange() {
    this.filterTemplates();
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }
}
