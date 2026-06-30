import MockAdapter from "axios-mock-adapter";
import { mockProposalsList, mockProposalDetail } from "./proposalData";
import { setupProposalWizardMocks } from "./proposalWizardMocks";
import { 
  mockCouncilsList, 
  mockReviewRounds, 
  mockRubricTemplate, 
  mockScores, 
  mockDecisions 
} from "./councilData";
import { mockContractsList } from "./contractData";
import { mockUsersList, mockUserProfile, MOCK_UNITS } from "./userMocks";
import {
  mockCyclesList,
  mockTracks,
  mockBudgetCategories,
  mockFinancialConfigs,
  mockPersonnelRoles,
  mockProductCategories,
  mockRubricCriteria,
  mockAmendmentCategories,
} from "./settingsMocks";

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

    const user = mockUsersList.find(u => u.email === data.email);

    if (user) {
      return [200, {
        success: true, message: "Login successful.", errorCode: null,
        data: { token: `mock-jwt-token-${user.id}`, user },
        errors: null, pagination: null
      }];
    }

    // Default fallback
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

  // ─── Notifications / Recent Activity ────────────────────────────────
  mock.onGet("/notifications").reply(200, {
    success: true,
    data: [
      { id: "n1", type: "PROPOSAL_SUBMITTED", title: "Đề xuất đã được nộp", message: "Đề xuất 'Ứng dụng AI trong y tế' đã được nộp thành công.", createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), isRead: false },
      { id: "n2", type: "REVIEW_ASSIGNED", title: "Được phân công đánh giá", message: "Bạn được phân công đánh giá đề xuất 'Blockchain cho chuỗi cung ứng'.", createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(), isRead: false },
      { id: "n3", type: "CYCLE_OPENED", title: "Chu kỳ mới đã mở", message: "Chu kỳ tài trợ 2026-B đã mở nhận hồ sơ.", createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(), isRead: true },
      { id: "n4", type: "PROPOSAL_APPROVED", title: "Đề xuất được duyệt", message: "Đề xuất 'Năng lượng tái tạo' đã được Hội đồng phê duyệt.", createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(), isRead: true },
      { id: "n5", type: "DEADLINE_REMINDER", title: "Nhắc nhở hạn chót", message: "Hạn nộp báo cáo tiến độ còn 3 ngày.", createdAt: new Date(Date.now() - 72 * 3600_000).toISOString(), isRead: true },
    ],
    pagination: { page: 1, limit: 5, total: 5, totalPages: 1 }
  });
  // ─── Users CRUD ────────────────────────────────────────────────────
  mock.onGet("/users").reply((config) => {
    const params = new URLSearchParams(config.params);
    let filtered = [...mockUsersList];

    const role = params.get("role");
    if (role && role !== "ALL") {
      filtered = filtered.filter(u => u.roles.includes(role));
    }

    const unitId = params.get("unitId");
    if (unitId) {
      filtered = filtered.filter(u => u.unitId === Number(unitId));
    }

    const search = params.get("search");
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

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

  mock.onGet(/\/users\/[^/]+\/profile$/).reply((config) => {
    const id = config.url.split("/").slice(-2, -1)[0];
    if (id === mockUserProfile.userId) {
      return [200, { success: true, data: mockUserProfile }];
    }
    // Return generic empty profile for others
    return [200, { success: true, data: { userId: id, fullName: "", education: [], workHistory: [], publications: [], projects: [] } }];
  });

  mock.onPut(/\/users\/[^/]+\/profile$/).reply(200, {
    success: true, message: "Profile updated.", data: mockUserProfile
  });

  mock.onGet(/\/users\/[^/]+$/).reply((config) => {
    const id = config.url.split("/").pop();
    const user = mockUsersList.find(u => u.id === id);
    if (!user) return [404, { success: false, message: "User not found.", data: null }];
    return [200, { success: true, data: user }];
  });

  mock.onPost("/users").reply(201, {
    success: true, message: "User created.", data: { id: "u-new-" + Date.now() }
  });

  mock.onPut(/\/users\/[^/]+$/).reply(200, {
    success: true, message: "User updated.", data: null
  });

  mock.onDelete(/\/users\/[^/]+$/).reply(200, {
    success: true, message: "User deactivated (soft delete).", data: null
  });

  // ─── Organizational Units (lookup) ─────────────────────────────────
  mock.onGet("/organizational-units").reply(200, {
    success: true, data: MOCK_UNITS
  });

  // ─── Cycles & Tracks ───────────────────────────────────────────────
  mock.onGet("/cycles").reply((config) => {
    const params = new URLSearchParams(config.params);
    let filtered = [...mockCyclesList];

    const status = params.get("status");
    if (status && status !== "ALL") filtered = filtered.filter(c => c.status === status);

    const year = params.get("year");
    if (year && year !== "ALL") filtered = filtered.filter(c => c.year === Number(year));

    return [200, { success: true, data: filtered, pagination: { page: 1, limit: 10, total: filtered.length, totalPages: 1 } }];
  });

  mock.onGet(/\/cycles\/\d+$/).reply((config) => {
    const id = Number(config.url.split("/").pop());
    const cycle = mockCyclesList.find(c => c.id === id);
    if (!cycle) return [404, { success: false, message: "Cycle not found." }];
    return [200, { success: true, data: cycle }];
  });

  mock.onPost("/cycles").reply(201, { success: true, data: { id: Date.now() }, message: "Tạo đợt tài trợ thành công." });
  mock.onPut(/\/cycles\/\d+$/).reply(200, { success: true, message: "Cập nhật đợt tài trợ thành công." });

  // Cycle State Transitions
  mock.onPost(/\/cycles\/\d+\/open/).reply(200, { success: true, message: "Đã mở nhận hồ sơ." });
  mock.onPost(/\/cycles\/\d+\/start-review/).reply(200, { success: true, message: "Đã chuyển sang giai đoạn xét duyệt." });
  mock.onPost(/\/cycles\/\d+\/close/).reply(200, { success: true, message: "Đã đóng đợt tài trợ." });
  mock.onPost(/\/cycles\/\d+\/archive/).reply(200, { success: true, message: "Đã lưu trữ đợt tài trợ." });

  mock.onGet("/cycles/tracks").reply(200, { success: true, data: mockTracks });

  // ─── Lookups ───────────────────────────────────────────────────────
  const mockLookups = (endpoint, dataArray) => {
    mock.onGet(endpoint).reply(200, { success: true, data: dataArray });
    mock.onPost(endpoint).reply(201, { success: true, message: "Thêm mới thành công." });
    mock.onPut(new RegExp(`^${endpoint}/\\d+$`)).reply(200, { success: true, message: "Cập nhật thành công." });
    mock.onPatch(new RegExp(`^${endpoint}/\\d+/deactivate$`)).reply((config) => {
      // Simulate 409 Conflict for specific items to test error handling
      const id = Number(config.url.split("/")[2]);
      if (id === 1) { // Hardcode ID 1 to always fail for testing 409
        return [409, { success: false, message: "Conflict: Dữ liệu đang được sử dụng trong hệ thống." }];
      }
      return [200, { success: true, message: "Cập nhật trạng thái thành công." }];
    });
  };

  mockLookups("/budget-expense-categories", mockBudgetCategories);
  mockLookups("/financial-configs", mockFinancialConfigs);
  mockLookups("/personnel-role-types", mockPersonnelRoles);
  mockLookups("/product-categories", mockProductCategories);
  mockLookups("/rubric-criteria", mockRubricCriteria);
  mockLookups("/amendment-categories", mockAmendmentCategories);

  // ─── Council Review & Scoring (Sprint 5) ───────────────────────────
  // Rounds
  mock.onGet(/\/proposals\/[^/]+\/rounds/).reply((config) => {
    const proposalId = config.url.split("/")[2];
    const rounds = mockReviewRounds.filter(r => r.proposalId === proposalId);
    return [200, { success: true, data: rounds }];
  });
  mock.onPost(/\/proposals\/[^/]+\/rounds/).reply(201, { success: true, message: "Round created" });
  mock.onPost(/\/rounds\/[^/]+\/open/).reply((config) => {
    const roundId = Number(config.url.split("/")[2]);
    const round = mockReviewRounds.find(r => r.id === roundId);
    if (round?.prerequisiteRoundId) {
      const prereq = mockReviewRounds.find(r => r.id === round.prerequisiteRoundId);
      if (prereq && prereq.status !== "PASSED") {
        return [409, { success: false, message: "Prerequisite round not passed" }];
      }
    }
    return [200, { success: true, message: "Round opened" }];
  });
  mock.onPost(/\/rounds\/[^/]+\/close/).reply(200, { success: true, message: "Round closed" });

  // Councils
  mock.onGet("/councils/my-memberships").reply(200, { success: true, data: mockCouncilsList });
  mock.onGet(/\/councils\/[^/]+$/).reply((config) => {
    const id = config.url.split("/").pop();
    const council = mockCouncilsList.find(c => c.id === id);
    if (!council) return [404, { success: false }];
    return [200, { success: true, data: council }];
  });
  mock.onPost("/councils").reply(201, { success: true, message: "Council created" });
  mock.onPatch(/\/councils\/[^/]+\/status/).reply(200, { success: true, message: "Status updated" });
  
  // Council Members
  mock.onGet(/\/councils\/[^/]+\/members/).reply((config) => {
    const id = config.url.split("/")[2];
    const council = mockCouncilsList.find(c => c.id === id);
    return [200, { success: true, data: council?.members || [] }];
  });
  mock.onPost(/\/councils\/[^/]+\/members\/invite-by-email/).reply(200, { success: true, message: "Invited by email" });
  mock.onPost(/\/councils\/[^/]+\/members/).reply(200, { success: true, message: "Member added" });
  mock.onPatch(/\/council-members\/[^/]+\/respond/).reply(200, { success: true, message: "Responded" });
  mock.onDelete(/\/council-members\/[^/]+$/).reply(200, { success: true, message: "Member removed" });

  // Scoring
  mock.onGet("/review-scoring/rubrics").reply(200, { success: true, data: [mockRubricTemplate] });
  mock.onGet(/\/review-scoring\/rubrics\/[^/]+$/).reply(200, { success: true, data: mockRubricTemplate });
  
  mock.onGet(/\/review-scoring\/councils\/[^/]+\/scores\/my/).reply((config) => {
    const councilId = config.url.split("/")[3];
    // hardcoded logic for mock user 'uuid-123'
    const userScore = mockScores.find(s => s.councilId === councilId && s.reviewerId === "uuid-123");
    return [200, { success: true, data: userScore || null }];
  });

  // ─── Meetings ────────────────────────────────────────────────────────
  mock.onGet(/\/councils\/[^/]+\/meeting/).reply((config) => {
    const councilId = config.url.split("/")[2];
    const meeting = data.mockMeetings.find(m => m.councilId === councilId);
    return [200, { success: true, data: meeting || null }];
  });

  mock.onPost(/\/councils\/[^/]+\/meeting/).reply((config) => {
    const councilId = config.url.split("/")[2];
    const body = JSON.parse(config.data);
    
    // Simulate updating council status to IN_MEETING when meeting is scheduled
    const councilIndex = data.mockCouncilsList.findIndex(c => c.id === councilId);
    if (councilIndex !== -1 && data.mockCouncilsList[councilIndex].status === "READY") {
      data.mockCouncilsList[councilIndex].status = "IN_MEETING";
    }

    const newMeeting = {
      id: `meeting-${Date.now()}`,
      councilId,
      ...body,
      status: "SCHEDULED"
    };
    
    data.mockMeetings.push(newMeeting);
    return [200, { success: true, data: newMeeting }];
  });

  // Decisions
  mock.onPost(/\/councils\/[^/]+\/decisions/).reply((config) => {
    const councilId = config.url.split("/")[2];
    const body = JSON.parse(config.data);
    
    const councilIndex = data.mockCouncilsList.findIndex(c => c.id === councilId);
    if (councilIndex !== -1) {
      data.mockCouncilsList[councilIndex].status = "DECIDED";
    }

    return [200, { success: true, data: { id: `decision-${Date.now()}`, councilId, ...body } }];
  });

  mock.onGet(/\/review-scoring\/councils\/[^/]+\/scores/).reply((config) => {
    const councilId = config.url.split("/")[3];
    const scores = mockScores.filter(s => s.councilId === councilId);
    return [200, { success: true, data: scores }];
  });
  
  mock.onPost(/\/review-scoring\/councils\/[^/]+\/scores/).reply(201, { success: true, message: "Score submitted" });
  
  mock.onPost(/\/review-scoring\/councils\/[^/]+\/decision/).reply(200, { success: true, message: "Decision finalized" });
  mock.onGet(/\/review-scoring\/councils\/[^/]+\/decision/).reply((config) => {
    const councilId = config.url.split("/")[3];
    const decision = mockDecisions.find(d => d.councilId === councilId);
    return [200, { success: true, data: decision || null }];
  });

  return mock;
};
