import { mockProposalsList, mockProposalDetail } from "./proposalData";

/**
 * Mock handlers for Proposal Wizard workflows
 * Extends the basic proposal mock handlers in setupMocks.js
 */
export function setupProposalWizardMocks(mock) {
  // ─── Proposal Create / Edit (Step 1) ──────────────────────────────────
  
  mock.onPost("/proposals").reply((config) => {
    const payload = JSON.parse(config.data);
    
    // Simulate server side ID generation and timestamping
    const newProposal = {
      ...payload,
      id: `new-${Date.now()}`,
      status: "DRAFT",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teamMembers: [],
      budgetSummary: { totalAmount: 0, items: [] },
      documents: []
    };
    
    // In a real app we'd push to the array, but for mock just returning it is fine
    // mockProposalsList.push(newProposal);
    
    return [201, { success: true, message: "Draft proposal created", data: newProposal }];
  });

  mock.onPut(/\/proposals\/[^/]+$/).reply((config) => {
    const id = config.url.split("/").pop();
    const payload = JSON.parse(config.data);
    
    const existing = id === mockProposalDetail.id ? mockProposalDetail : mockProposalsList.find(p => p.id === id);
    if (!existing) return [404, { success: false, message: "Proposal not found" }];
    
    const updated = { ...existing, ...payload, updatedAt: new Date().toISOString() };
    
    return [200, { success: true, message: "Proposal updated", data: updated }];
  });

  // ─── Proposal Team Management (Step 2) ──────────────────────────────
  
  mock.onPost(/\/proposals\/[^/]+\/team-members$/).reply((config) => {
    const id = config.url.split("/")[2];
    const payload = JSON.parse(config.data);
    
    const newMember = {
      ...payload,
      id: Date.now(),
    };
    
    return [201, { success: true, message: "Team member added", data: newMember }];
  });

  mock.onPut(/\/proposals\/[^/]+\/team-members\/[^/]+$/).reply((config) => {
    const payload = JSON.parse(config.data);
    return [200, { success: true, message: "Team member updated", data: payload }];
  });

  mock.onDelete(/\/proposals\/[^/]+\/team-members\/[^/]+$/).reply(200, { 
    success: true, message: "Team member removed", data: null 
  });

  // ─── Proposal Budget Management (Step 3) ────────────────────────────
  
  mock.onPut(/\/proposals\/[^/]+\/budget\/items$/).reply((config) => {
    const payload = JSON.parse(config.data);
    // Payload should be array of budget items
    
    const totalAmount = payload.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const newBudget = {
      totalAmount,
      items: payload,
    };
    
    return [200, { success: true, message: "Budget updated", data: newBudget }];
  });

  mock.onPut(/\/proposals\/[^/]+\/budget\/labor\/[^/]+$/).reply((config) => {
    const payload = JSON.parse(config.data);
    return [200, { success: true, message: "Labor cost updated", data: payload }];
  });

  // ─── Proposal Document Management (Step 4) ──────────────────────────
  
  mock.onPost("/documents").reply((config) => {
    // Config.data is FormData, which is tricky to parse in axios-mock-adapter.
    // We just return a mock success response.
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      fileName: "uploaded_file.pdf",
      fileUrl: "https://example.com/uploaded_file.pdf",
      category: "OTHER",
      uploadedAt: new Date().toISOString(),
    };
    
    return [201, { success: true, message: "Document uploaded", data: newDoc }];
  });

  mock.onDelete(/\/documents\/[^/]+$/).reply(200, { 
    success: true, message: "Document deleted", data: null 
  });

  // ─── AI Features ──────────────────────────────────────────────────────
  
  mock.onPost(/\/ai\/proposals\/[^/]+\/generate-summary$/).reply((config) => {
    // Simulate AI processing delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([200, { 
          success: true, 
          message: "AI Summary generated", 
          data: {
            summary: "Đề xuất này tập trung vào việc nghiên cứu và ứng dụng trí tuệ nhân tạo (AI) trong việc tối ưu hóa quản lý năng lượng tại các tòa nhà thông minh. Bằng cách sử dụng Reinforcement Learning kết hợp với dữ liệu IoT thời gian thực, dự án kỳ vọng sẽ giảm 30% lượng điện năng tiêu thụ, đóng góp vào mục tiêu phát triển bền vững của trường."
          }
        }]);
      }, 1500);
    });
  });
}
