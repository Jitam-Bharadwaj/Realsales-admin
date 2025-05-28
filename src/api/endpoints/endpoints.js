export const endpoints = {
  auth: {
    register: "v1/auth/sign-up",
    login: "v1/auth/sign-in",
  },
  closing:{
     getClosing:"/v1/interaction-modes/by-name",
     editClosingData:"v1/interaction-modes",
     modeAiRoles:"v1/interaction-mode-ai-roles",
     manufacturingModels:"v1/interaction-mode-manufacturing-models"
  }
};
