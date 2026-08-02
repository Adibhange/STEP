# STEP Enterprise ATS — Phase 1 Freeze Policy

> [!IMPORTANT]
> **ARCHITECTURE & UI FREEZE NOTICE**
> The Information Architecture, Sidebar Hierarchy, Workspace Hierarchy, Configuration Hierarchy, Workspace Navigation, and Reusable Primitives are now **FROZEN**.
>
> Future development must **extend** these components rather than restructure existing layouts or workflows.

---

## 1. Frozen Navigation & Workspace Hierarchy

```
STEP Enterprise Platform
│
├── Dashboard (/dashboard)
│   └── Candidate Operational Workspace (KPI Cards + Candidates Table)
│
├── Vacancies (/dashboard/vacancies)
│   └── Vacancy Workspace (/dashboard/vacancies/[id])
│       ├── Overview
│       ├── Pipeline
│       ├── Candidates
│       ├── Question Paper
│       ├── Walk-in Drive
│       ├── QR Registration (STEP Flagship)
│       ├── Interview Schedule
│       ├── Documents
│       └── Activity
│
├── Candidate Workspace (/dashboard/candidates/[id])
│   ├── Overview
│   ├── Assessment
│   ├── Interviews
│   ├── Documents
│   └── Activity
│
├── Question Papers (/dashboard/question-papers)
├── Assessments (/dashboard/assessments)
├── Reports (/dashboard/reports)
├── Users (/dashboard/users)
└── Settings (/dashboard/settings)
    └── Configuration
        ├── Recruitment (Roles, Experience, Departments, Employment Types)
        ├── Locations (Hiring Locations, Test Locations)
        ├── Assessment (Question Categories, Difficulty, Technology Stack, Skills)
        ├── Interview (Interview Types, Interview Rounds)
        └── System (Candidate Statuses, Vacancy Templates)
```

---

## 2. Reusable Primitives (`src/features/shared/`)

All new features MUST reuse these frozen primitives:

1. **`<WorkspaceHeader />`** (`src/features/shared/workspace-header/WorkspaceHeader.tsx`)
2. **`<StatsCard />`** (`src/features/shared/stats-card/StatsCard.tsx`)
3. **`<EntityStatus />`** (`src/features/shared/entity-status/EntityStatus.tsx`)
4. **`<ActivityFeed />`** (`src/features/shared/activity-feed/ActivityFeed.tsx`)
5. **`<MasterTable />`** (`src/features/settings/components/MasterTable.tsx`)

---

## 3. Strict Rules for Future Features

- Do NOT create duplicate layouts.
- Do NOT add standalone database tables to the sidebar.
- Do NOT redesign existing workflows.
- Every new module must integrate directly into this frozen hierarchy.
