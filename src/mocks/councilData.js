// Mock data for Review Councils — matching API contract §8
// Council statuses: FORMING → READY → IN_MEETING → DECIDED → CLOSED

export const mockCouncilsList = [
  {
    id: "council-001",
    proposalId: "a1b2c3d4-0001",
    proposalTitle: "Nghiên cứu ứng dụng AI trong quản lý năng lượng bền vững",
    roundId: 2,
    roundNumber: 2,
    dimension: "FINANCE",
    councilType: "PROPOSAL_REVIEW",
    status: "IN_MEETING",
    establishmentDecisionNo: "123/QĐ-ĐHFPT",
    establishedAt: "2026-06-01",
    meetingDeadline: "2026-06-30",
    minMembersRequired: 3,
    maxMembersAllowed: 5,
    acceptedMembers: 4,
    meeting: {
      title: "Họp Hội đồng Xét duyệt Tài chính — FPT-2024-081",
      platform: "GOOGLE_MEET",
      scheduledAt: "2026-06-28T07:00:00Z",
      durationMinutes: 120,
      meetingLink: "https://meet.google.com/abc-defg-hij",
    },
    members: [
      { id: "m1", fullName: "PGS.TS. Nguyễn Văn Hùng", memberRole: "CHAIR", status: "ACCEPTED", email: "hungnv@fpt.edu.vn", isExternal: false },
      { id: "m2", fullName: "TS. Trần Minh Quân", memberRole: "REVIEWER", status: "ACCEPTED", email: "quantm@fpt.edu.vn", isExternal: false },
      { id: "m3", fullName: "PGS.TS. Lê Thị Lan", memberRole: "REVIEWER", status: "ACCEPTED", email: "lanlt@industry.com", isExternal: true },
      { id: "m4", fullName: "TS. Phạm Đức Toàn", memberRole: "SECRETARY", status: "ACCEPTED", email: "toanpd@fpt.edu.vn", isExternal: false },
    ],
  },
  {
    id: "council-002",
    proposalId: "a1b2c3d4-0002",
    proposalTitle: "Mở rộng phòng thí nghiệm Robot nhận thức",
    roundId: 3,
    roundNumber: 1,
    dimension: "SCIENCE",
    councilType: "PROPOSAL_REVIEW",
    status: "FORMING",
    establishmentDecisionNo: "145/QĐ-ĐHFPT",
    establishedAt: "2026-06-15",
    meetingDeadline: "2026-07-15",
    minMembersRequired: 3,
    maxMembersAllowed: 5,
    acceptedMembers: 1,
    meeting: null,
    members: [
      { id: "m5", fullName: "GS.TS. Hoàng Văn Nam", memberRole: "CHAIR", status: "ACCEPTED", email: "namhv@fpt.edu.vn", isExternal: false },
      { id: "m6", fullName: "TS. Vũ Thị Hoa", memberRole: "REVIEWER", status: "INVITED", email: "hoavt@industry.com", isExternal: true },
      { id: "m7", fullName: "PGS.TS. Đỗ Minh Tú", memberRole: "REVIEWER", status: "DECLINED", email: "tudm@fpt.edu.vn", isExternal: false },
    ],
  },
  {
    id: "council-003",
    proposalId: "a1b2c3d4-0003",
    proposalTitle: "Ứng dụng trí tuệ nhân tạo trong quản lý nước đô thị",
    roundId: 1,
    roundNumber: 1,
    dimension: "SCIENCE",
    councilType: "PROPOSAL_REVIEW",
    status: "DECIDED",
    establishmentDecisionNo: "089/QĐ-ĐHFPT",
    establishedAt: "2025-10-01",
    meetingDeadline: "2025-10-20",
    minMembersRequired: 3,
    maxMembersAllowed: 5,
    acceptedMembers: 5,
    meeting: {
      title: "Họp Hội đồng Xét duyệt Khoa học — FPT-2022-019",
      platform: "TEAMS",
      scheduledAt: "2025-10-18T08:00:00Z",
      durationMinutes: 90,
      meetingLink: null,
    },
    members: [
      { id: "m8", fullName: "GS.TSKH. Trần Văn Bảo", memberRole: "CHAIR", status: "ACCEPTED", email: "baotv@fpt.edu.vn", isExternal: false },
      { id: "m9", fullName: "PGS.TS. Nguyễn Thị Cúc", memberRole: "REVIEWER", status: "ACCEPTED", email: "cucnt@fpt.edu.vn", isExternal: false },
      { id: "m10", fullName: "TS. Lê Minh Đạt", memberRole: "REVIEWER", status: "ACCEPTED", email: "datlm@industry.com", isExternal: true },
      { id: "m11", fullName: "TS. Phạm Văn Hải", memberRole: "REVIEWER", status: "ACCEPTED", email: "haipv@fpt.edu.vn", isExternal: false },
      { id: "m12", fullName: "ThS. Bùi Thị Yến", memberRole: "SECRETARY", status: "ACCEPTED", email: "yenbt@fpt.edu.vn", isExternal: false },
    ],
    decision: {
      result: "APPROVED",
      councilComments: "Đề cương đạt yêu cầu, điểm trung bình 85/100. Hội đồng nhất trí phê duyệt.",
      averageScore: 85,
    },
  },
];

export const mockReviewRounds = [
  {
    id: 1,
    proposalId: "a1b2c3d4-0003",
    roundNumber: 1,
    dimension: "SCIENCE",
    roundType: "REVIEW",
    status: "PASSED",
    rubricTemplateId: 1,
    sequence: 1,
    prerequisiteRoundId: null,
    result: "APPROVED"
  },
  {
    id: 2,
    proposalId: "a1b2c3d4-0001",
    roundNumber: 2,
    dimension: "FINANCE",
    roundType: "REVIEW",
    status: "OPEN",
    rubricTemplateId: 2,
    sequence: 2,
    prerequisiteRoundId: 1,
    result: null
  },
  {
    id: 3,
    proposalId: "a1b2c3d4-0002",
    roundNumber: 1,
    dimension: "SCIENCE",
    roundType: "REVIEW",
    status: "PENDING",
    rubricTemplateId: 1,
    sequence: 1,
    prerequisiteRoundId: null,
    result: null
  }
];

export const mockRubricTemplate = {
  id: 1,
  name: "Phiếu đánh giá Đề cương Nghiên cứu Khoa học",
  dimension: "SCIENCE",
  maxTotalScore: 100,
  criteria: [
    { id: 11, code: "C1", name: "Tính mới và sáng tạo (Innovation)", max_score: 25 },
    { id: 12, code: "C2", name: "Phương pháp nghiên cứu (Methodology)", max_score: 30 },
    { id: 13, code: "C3", name: "Tính khả thi (Feasibility)", max_score: 20 },
    { id: 14, code: "C4", name: "Tính ứng dụng & Tác động (Impact)", max_score: 25 },
  ]
};

export const mockScores = [
  {
    id: "score-001",
    councilId: "council-003",
    reviewerId: "uuid-123", // Assuming PI or some logged-in user is reviewer for demo
    templateId: 1,
    totalScore: 88,
    generalComments: "Đề tài có tính ứng dụng rất cao, phương pháp rõ ràng.",
    otherRecommendations: "Cần chú ý thêm về dữ liệu đầu vào.",
    scoreDetails: [
      { criterionId: 11, givenScore: 22, comments: "Ý tưởng tốt" },
      { criterionId: 12, givenScore: 28, comments: "Phương pháp chuẩn xác" },
      { criterionId: 13, givenScore: 18, comments: "Có khả năng thực hiện" },
      { criterionId: 14, givenScore: 20, comments: "Tác động xã hội khá" }
    ],
    submittedAt: "2025-10-18T09:15:00Z"
  },
  {
    id: "score-002",
    councilId: "council-003",
    reviewerId: "m9",
    templateId: 1,
    totalScore: 82,
    generalComments: "Tốt, cần làm rõ ngân sách.",
    otherRecommendations: null,
    scoreDetails: [
      { criterionId: 11, givenScore: 20, comments: "" },
      { criterionId: 12, givenScore: 25, comments: "" },
      { criterionId: 13, givenScore: 17, comments: "" },
      { criterionId: 14, givenScore: 20, comments: "" }
    ],
    submittedAt: "2025-10-18T09:10:00Z"
  }
];

export const mockDecisions = [
  {
    id: "dec-001",
    councilId: "council-003",
    result: "APPROVED",
    councilComments: "Đề cương đạt yêu cầu, điểm trung bình 85/100. Hội đồng nhất trí phê duyệt.",
    recommendations: "Cần tối ưu thêm phần mềm mô phỏng.",
    chairUserId: "m8",
    secretaryUserId: "m12",
    finalizedAt: "2025-10-18T10:00:00Z"
  }
];
