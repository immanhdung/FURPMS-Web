# CLAUDE.md

# FURPMS Frontend Development Guide

Project Name:

FPT University Research Project Management System (FURPMS)

---

# Project Overview

FURPMS is a university-level research project management platform developed for FPT University.

The system manages the complete lifecycle of research projects:

- Research Cycle Management
- Research Proposal Submission
- Research Order Management
- Research Review Workflow
- Research Councils
- Reviewer Assignment
- Scoring & Evaluation
- Contract Management
- Deliverables
- Progress Reports
- Final Reports
- Notifications
- Analytics
- AI-powered Features

The frontend must be production-ready, scalable, maintainable, and suitable for a graduation capstone project.

---

# Core Business Roles

## Administrator

Responsibilities:

- Manage users
- Manage research cycles
- Manage research types
- Manage budget categories
- Manage financial configurations
- Manage organizational units
- Manage rubric criteria
- Upload applied research topics via Excel
- Monitor system analytics
- Manage permissions

---

## Staff

Responsibilities:

- Configure research cycles
- Configure research fields
- Create review councils
- Invite reviewers
- Create meetings
- Generate Google Meet links
- Manage review workflow
- Monitor proposal progress
- Manage research resources

---

## Principal Investigator (PI)

Responsibilities:

- Submit proposals
- Upload research files
- Manage project progress
- Submit reports
- Respond to reviewer feedback

---

## Review Committee

Responsibilities:

- Accept invitations
- Decline invitations
- Review proposals
- Score proposals
- Submit feedback
- Join meetings

---

# Research Types

The system supports two research types.

---

## Basic Research

Characteristics:

- PI uploads PDF or DOCX
- AI extracts information

Examples:

- Journal paper
- Conference paper
- Scientific publication

AI extracts:

- Title
- Abstract
- Keywords
- Research area

PI can edit extracted information before submission.

---

## Applied Research

Characteristics:

- Based on external research orders
- Topics imported by Admin

Examples:

- Build website
- Mobile application
- AI system
- IoT solution

Workflow:

1. PI selects topic
2. Upload proposal
3. AI compares uploaded document with topic

If similarity is low:

Display warning:

"The uploaded file does not appear to match the selected research topic. Do you want to continue submission?"

PI may still continue.

---

# Research Cycle

A research cycle contains:

- Submission period
- Review period
- Acceptance period

Statuses:

PLANNING

OPEN

CLOSED

Only OPEN cycles allow submissions.

---

# Research Fields

One cycle may contain multiple fields.

Examples:

- Information Technology
- Artificial Intelligence
- Data Science
- Business
- Economics
- Language
- Education

Fields are configured by Staff.

---

# Council Structure

Each council contains exactly:

1 Chairman

1 Secretary

2 Members

Total:

4 Members

Invitation statuses:

PENDING

ACCEPTED

DECLINED

---

# Meeting Management

Supported:

- Google Meet
- Microsoft Teams

Meeting contains:

- Agenda
- Date
- Time
- Participants
- Meeting Link

Staff manages meetings.

Reviewers can join meetings.

---

# Proposal Workflow

Proposal Statuses

DRAFT

SUBMITTED

UNDER_REVIEW

APPROVED

REJECTED

WITHDRAWN

Workflow:

DRAFT

↓

SUBMITTED

↓

UNDER_REVIEW

↓

APPROVED / REJECTED

---

# Review Workflow

Review Round Types

SCREENING

REVIEW

ACCEPTANCE

Decision Types

APPROVED

REJECTED

REVISION_REQUIRED

---

# Technical Stack

Frontend Stack:

- React 19
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- React Router v7
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Dayjs

Do not use Redux.

Do not use Context API for global business state.

Use Zustand.

---

# Design Philosophy

The application must not look AI-generated.

Visual references:

- Linear
- Stripe
- Vercel
- Notion
- Clerk
- Supabase

Characteristics:

- Premium
- Professional
- Modern
- Minimal
- Academic

Use whitespace properly.

Avoid excessive colors.

Avoid default shadcn appearance.

Customize components.

---

# Color System

Primary

#2563EB

Secondary

#0F172A

Accent

#14B8A6

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Background

#F8FAFC

Card

#FFFFFF

Dark mode required.

---

# Animation Rules

Use Framer Motion.

Required:

- Page transitions
- Sidebar transitions
- Modal animations
- Card hover effects
- Table loading skeletons
- Animated counters
- Chart animations

Animation duration:

150ms–300ms

Avoid excessive motion.

---

# Folder Structure

src/

app/

router/

providers/

components/

ui/

layout/

shared/

features/

auth/

dashboard/

admin/

staff/

pi/

reviewer/

proposal/

research-cycle/

research-order/

council/

meeting/

review/

contract/

analytics/

notification/

ai/

services/

api/

hooks/

store/

types/

utils/

constants/

mock/

assets/

---

# API Layer Architecture

Use:

services/

Example:

auth.service.ts

proposal.service.ts

cycle.service.ts

council.service.ts

meeting.service.ts

notification.service.ts

analytics.service.ts

Never call axios directly inside components.

Always use service layer.

---

# Query Architecture

Use TanStack Query.

Create:

queryKeys.ts

Example:

queryKeys.proposals.list

queryKeys.proposals.detail

queryKeys.cycles.list

queryKeys.users.list

Do not hardcode query keys.

---

# Forms

Use:

React Hook Form

-

Zod

Requirements:

- Validation
- Error messages
- Loading states
- Disabled states

---

# Table Standards

All data tables must support:

- Sorting
- Filtering
- Pagination
- Search
- Column visibility
- Export

Use TanStack Table.

---

# Dashboard Standards

Every dashboard must include:

- KPI cards
- Charts
- Activity feed
- Quick actions

Charts:

- Area Chart
- Line Chart
- Bar Chart
- Pie Chart

Use Recharts.

---

# Mock Strategy

Backend currently lacks some endpoints.

Use MSW.

Feature flag:

USE_MOCK_API

Mock:

- Research Types
- AI Extraction
- AI Similarity Check
- AI Feedback
- AI Rubric Suggestions
- Research Topic Import
- Proposal Documents
- Realtime Notifications

Switching to real backend should only require changing service implementations.

No UI refactoring.

---

# Authentication

Backend:

JWT Bearer

Store token securely.

Create:

authStore

Functions:

login

logout

getCurrentUser

refreshProfile

Role-based route protection required.

---

# Error Handling

Every API request must support:

- Loading state
- Error state
- Retry state

Display user-friendly messages.

Never expose backend stack traces.

---

# Accessibility

Required:

- Keyboard navigation
- Screen reader labels
- Focus states
- Proper aria attributes

---

# Code Standards

Always use TypeScript.

Avoid any.

Prefer interfaces.

Prefer reusable components.

Avoid duplicated code.

Keep components small.

Extract business logic into hooks.

Use feature-based architecture.

---

# Performance Rules

Use:

React.lazy

Suspense

Code splitting

Memoization when necessary

Virtualized tables for large datasets

---

# Deliverable Goal

Build a production-quality SaaS platform that can be demonstrated to lecturers, supervisors, and thesis defense committees.

The system should feel like a real commercial research management platform rather than a student project.

Prioritize:

1. User Experience
2. Maintainability
3. Scalability
4. Clean Architecture
5. Business Workflow Accuracy
