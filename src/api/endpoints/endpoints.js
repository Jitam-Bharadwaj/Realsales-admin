export const endpoints = {
  auth: {
    register: "v1/auth/sign-up",
    login: "v1/auth/sign-in",
    allUsers: "/v1/auth/all-users",
  },
  sessions: {
    byUser: "/v1/sessions/by-user/",
  },
  subscriptions: {
    byUser: "/v1/user-subscriptions/by-user/",
    update: "/v1/user-subscriptions/",
  },
  closing: {
    getClosing: "v1/interaction-modes",
    editClosingData: "v1/interaction-modes",
    modeAiRoles: "v1/interaction-mode-ai-roles",
    manufacturingModels: "v1/interaction-mode-manufacturing-models",
    plantModeSize: "v1/interaction-mode-plant-size-impacts",
    industrysize: "v1/industries/",
  },
  mods: {
    interaction_modes: "v1/interaction-modes",
  },
  persona: {
    persona: "v1/ai-personas/",
    interview_behavior: "v1/interview/get-persona-behavior",
    produced_products: "/v1/persona-produced-products/",
  },
  ai: {
    industries: "/v1/industries/",
    plant_size_impacts: "/v1/plant-size-impacts/",
    company_size: "/v1/company-sizes/",
    product: "/v1/produced-product-categories/",
    ai_roles: "/v1/ai-roles/",
    manufacturing_models: "/v1/manufacturing-models/",
  },
  report: {
    modeReport: "/v1/interaction-mode-report-details/",
  },
  coaching: {
    fetchPrompts: "v1/ai-coaching/prompts",
    updatePrompt: "v1/ai-coaching/prompt/", 
  },
};
