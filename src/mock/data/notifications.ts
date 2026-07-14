import type { AppNotification } from "@/types/notification";

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    type: "PROPOSAL",
    title: "Proposal submitted",
    message: "Your proposal 'AI-based Plagiarism Detection' was submitted successfully.",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "n-2",
    type: "REVIEW",
    title: "Review assigned",
    message: "You have been assigned to review 'Smart Campus IoT Platform'.",
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n-3",
    type: "MEETING",
    title: "Council meeting scheduled",
    message: "A council meeting has been scheduled for tomorrow at 09:00 via Google Meet.",
    read: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n-4",
    type: "SYSTEM",
    title: "Welcome to FURPMS",
    message: "Explore your dashboard to get started with the research management workflow.",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
