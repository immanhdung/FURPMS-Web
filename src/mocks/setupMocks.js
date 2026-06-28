import MockAdapter from "axios-mock-adapter";
import { mockProposalsList, mockProposalDetail } from "./proposalData";
import { setupProposalWizardMocks } from "./proposalWizardMocks";
import { mockCouncilsList } from "./councilData";
import { mockContractsList } from "./contractData";

export const setupMocks = (api) => {
  const mock = new MockAdapter(api, { delayResponse: 500 });

  console.log("🔧 FURPMS Mock API Enabled");

  // Call feature-specific mock setups
  setupProposalWizardMocks(mock);

  // ─── Auth ───────────────────────────────────────────────────────────
  mock.onPost("/auth/login").reply((config) => {
    const data = JSON.parse(config.data);
    if (data.email === "error@fpt.edu.vn") {
      return [401, { success: false, message: "Invalid credentials.", errorCode: "UNAUTHORIZED", data: null, errors: [], pagination: null }];
    }
    return [200, {
      success: true, message: "Login successful.", errorCode: null,
      data: { token: "mock-jwt-token-12345", user: { id: "uuid-123", email: data.email, fullName: "Dr. Nguyễn Văn An", roles: ["PI", "Faculty"] } },
      errors: null, pagination: null
    }];
  });

  mock.onPost("/auth/invitation/verify").reply((config) => {
    const data = JSON.parse(config.data);
    if (data.token === "invalid") {
      return [400, { success: false, message: "Invalid or expired token.", errorCode: "INVALID_TOKEN", data: null }];
    }
    return [200, {
      success: true, message: "Authentication successful.",
      data: { token: "mock-jwt-token-expert", user: { id: "uuid-456", email: "expert@fpt.edu.vn", fullName: "External Expert", roles: ["ReviewCommittee"] } }
    }];
  });

  // ─── Analytics ──────────────────────────────────────────────────────
  mock.onGet("/analytics/overview").reply(200, {
    success: true,
    data: {
      activeProposals: mockProposalsList.filter(p => !["REJECTED", "WITHDRAWN"].includes(p.status)).length,
      totalFunding: mockProposalsList.reduce((sum, p) => sum + p.totalBudget, 0),
      nextMilestone: { title: "Ethics Review Panel", dueHours: 48 }
    }
  });

  // ─── Proposals List (with query filtering & pagination) ─────────────
  mock.onGet("/proposals").reply((config) => {
    const params = new URLSearchParams(config.params);
    let filtered = [...mockProposalsList];

    // Filter by status
    const status = params.get("status");
    if (status && status !== "ALL") {
      filtered = filtered.filter(p => p.status === status);
    }

    // Filter by search keyword (titleVI or titleEN)
    const search = params.get("search");
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.titleVI.toLowerCase().includes(q) ||
        p.titleEN.toLowerCase().includes(q) ||
        p.piName.toLowerCase().includes(q)
      );
    }

    // Filter by trackId
    const trackId = params.get("trackId");
    if (trackId) {
      filtered = filtered.filter(p => p.trackId === Number(trackId));
    }

    // Pagination
    const page = Number(params.get("page")) || 1;
    const limit = Number(params.get("limit")) || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return [200, {
      success: true,
      data: paged,
      pagination: { page, limit, total, totalPages }
    }];
  });

  // ─── Proposal Detail ───────────────────────────────────────────────
  mock.onGet(/\/proposals\/[^/]+$/).reply((config) => {
    const id = config.url.split("/").pop();
    const proposal = mockProposalsList.find(p => p.id === id);
    if (!proposal) {
      return [404, { success: false, message: "Proposal not found.", errorCode: "PROPOSAL_NOT_FOUND", data: null }];
    }
    // Return full detail (use detail mock for the first one, basic for others)
    const detail = proposal.id === mockProposalDetail.id ? mockProposalDetail : { ...proposal, teamMembers: [], budgetSummary: null, rounds: [] };
    return [200, { success: true, data: detail }];
  });

  // ─── Proposal Actions ──────────────────────────────────────────────
  mock.onPost(/\/proposals\/[^/]+\/submit$/).reply(200, {
    success: true, message: "Proposal submitted successfully.", data: null
  });

  mock.onPatch(/\/proposals\/[^/]+\/withdraw$/).reply(200, {
    success: true, message: "Proposal withdrawn.", data: null
  });

  // ─── Councils ──────────────────────────────────────────────────────
  mock.onGet("/councils/my-memberships").reply(200, {
    success: true,
    data: mockCouncilsList,
    pagination: { page: 1, limit: 20, total: mockCouncilsList.length, totalPages: 1 }
  });

  mock.onGet(/\/councils\/[^/]+$/).reply((config) => {
    const id = config.url.split("/").pop();
    const council = mockCouncilsList.find(c => c.id === id);
    if (!council) return [404, { success: false, message: "Council not found.", errorCode: "COUNCIL_NOT_FOUND", data: null }];
    return [200, { success: true, data: council }];
  });

  // ─── Contracts ─────────────────────────────────────────────────────
  mock.onGet("/contracts").reply((config) => {
    const params = new URLSearchParams(config.params);
    let filtered = [...mockContractsList];
    const status = params.get("status");
    if (status && status !== "ALL") filtered = filtered.filter(c => c.status === status);
    return [200, {
      success: true,
      data: filtered,
      pagination: { page: 1, limit: 20, total: filtered.length, totalPages: 1 }
    }];
  });

  mock.onGet(/\/contracts\/[^/]+$/).reply((config) => {
    const id = config.url.split("/").pop();
    const contract = mockContractsList.find(c => c.id === id);
    if (!contract) return [404, { success: false, message: "Contract not found.", data: null }];
    return [200, { success: true, data: contract }];
  });

  return mock;
};
