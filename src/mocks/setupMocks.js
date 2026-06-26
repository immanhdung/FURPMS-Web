import MockAdapter from "axios-mock-adapter";

export const setupMocks = (api) => {
  const mock = new MockAdapter(api, { delayResponse: 500 });

  console.log("Setting up mock endpoints...");

  // Mock Login endpoint
  mock.onPost("/auth/login").reply((config) => {
    const data = JSON.parse(config.data);
    
    // Simulate error scenario
    if (data.email === "error@fpt.edu.vn") {
      return [401, {
        success: false,
        message: "Invalid credentials.",
        errorCode: "UNAUTHORIZED",
        data: null,
        errors: [],
        pagination: null
      }];
    }

    // Success scenario
    return [200, {
      success: true,
      message: "Login successful.",
      errorCode: null,
      data: {
        token: "mock-jwt-token-12345",
        user: {
          id: "uuid-123",
          email: data.email,
          fullName: "Mock User",
          roles: ["PI", "Faculty"]
        }
      },
      errors: null,
      pagination: null
    }];
  });
  
  // Mock external expert login
  mock.onPost("/auth/invitation/verify").reply((config) => {
    const data = JSON.parse(config.data);
    if (data.token === "invalid") {
      return [400, {
        success: false,
        message: "Invalid or expired token.",
        errorCode: "INVALID_TOKEN",
        data: null
      }];
    }
    
    return [200, {
      success: true,
      message: "Authentication successful.",
      data: {
        token: "mock-jwt-token-expert",
        user: {
          id: "uuid-456",
          email: "expert@fpt.edu.vn",
          fullName: "External Expert",
          roles: ["ReviewCommittee"]
        }
      }
    }];
  });

  // Mock Analytics endpoint
  mock.onGet("/analytics/overview").reply(200, {
    success: true,
    data: {
      activeProposals: 12,
      totalFunding: 1480000,
      nextMilestone: {
        title: "Ethics Review Panel",
        dueHours: 48
      }
    }
  });

  // Mock Proposals list
  mock.onGet("/proposals").reply(200, {
    success: true,
    data: [
      { id: "FPT-2024-081", titleVI: "Sustainable Energy Harvesting", status: "IN_PROGRESS", budgetAmount: 240000, progress: 65 },
      { id: "FPT-2023-142", titleVI: "Cognitive Robotics Lab Expansion", status: "UNDER_REVIEW", budgetAmount: 1200000, progress: 90 },
      { id: "FPT-2022-019", titleVI: "Urban Water Management AI", status: "COMPLETED", budgetAmount: 85000, progress: 100 },
    ],
    pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
  });

  return mock;
};
