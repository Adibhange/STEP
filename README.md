# STEP - Sthapatya Talent Excellance Platform

STEP is an end-to-end Enterprise Recruitment Management System designed to streamline candidate tracking, interview schedules, skill assessments, dynamic workflows, anti-cheating candidate evaluations, and recruitment analytics.

## 🚀 Repository Structure

```
STEP/
├── backend/                  # .NET 10 ASP.NET Core Clean Architecture API
│   ├── STEP.Api/             # REST API Controllers, Middlewares & App Configuration
│   ├── STEP.Application/     # CQRS Handlers, DTOs, Application Interfaces & Business Logic
│   ├── STEP.Domain/          # Domain Entities, Enums, Value Objects & Domain Events
│   ├── STEP.Infrastructure/   # Entity Framework Core, SQL Server Repositories & External Services
│   ├── STEP.sln              # Visual Studio Solution File
│   └── .env.example          # Environment Variables Template
├── frontend/                 # Next.js 16 Modern Web Application (TypeScript & Tailwind CSS)
│   ├── src/                  # App Router, Components, Redux Toolkit Query & UI Modules
│   ├── public/               # Static Assets & Icons
│   ├── package.json          # Node Dependencies & Scripts
│   └── .env.example          # Frontend Environment Variables Template
└── README.md                 # Project Overview & Setup Instructions
```

## 🛠️ Tech Stack

- **Backend**: .NET 10, C#, Entity Framework Core, SQL Server, CQRS Clean Architecture, Swagger / OpenAPI
- **Frontend**: Next.js 16 (App Router), TypeScript, Redux Toolkit (RTK Query), Tailwind CSS, Lucide Icons
- **Database**: Microsoft SQL Server with Relational Schema & Stored Procedures / Indexes

## 🚦 Getting Started

### Backend Setup (.NET 10 API)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env` and configure your SQL Server connection string:
   ```bash
   cp .env.example .env
   ```
3. Run database scripts located in `STEP.Api/STEP_Schema.sql` to initialize database tables and seed data.
4. Restore dependencies and run the API:
   ```bash
   dotnet restore
   dotnet run --project STEP.Api
   ```
   The backend API will run on `http://localhost:5000`.

### Frontend Setup (Next.js 16)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on `http://localhost:3000`.

## 📦 Features

- **Candidate Management**: Full lifecycle candidate tracking, resume parsing, status tracking, and notes.
- **Job Requisitions**: Departmental job postings, custom candidate requirements, and workflow pipelines.
- **Interactive Interview Scheduling**: Automated round slot allocation, panelist assignment, and real-time status updates.
- **Skill Assessments & Anti-Cheat**: Online assessment portal with question bank management, dynamic timer, focus-loss tracking, and auto-evaluations.
- **Enterprise Dashboard**: Real-time analytics for recruiter productivity, funnel metrics, and candidate performance scores.

## 📄 License

This project is proprietary and maintained by Aditya Bhange.
