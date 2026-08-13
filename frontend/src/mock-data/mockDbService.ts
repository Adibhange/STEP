import { MOCK_USER_ACCOUNTS, generateMockAuthPayload, type MockUserAccount } from './auth.mock';
import { MOCK_MASTER_DATA } from './settings.mock';
import { MOCK_USERS } from './users.mock';
import { MOCK_VACANCIES, type MockVacancy } from './vacancies.mock';
import { MOCK_QUESTION_PAPERS, type MockQuestionPaper } from './questionPapers.mock';
import { MOCK_CANDIDATES, type MockCandidate } from './candidates.mock';
import {
  MOCK_EXAM_SESSIONS,
  MOCK_EVALUATION_SESSIONS,
} from './assessments.mock';
import { MOCK_INTERVIEWS } from './interviews.mock';
import { MOCK_OFFERS } from './offers.mock';
import {
  MOCK_QR_CODES,
  MOCK_QR_ANALYTICS,
  getMockQRScanResult,
  checkMockEligibility,
} from './qrcodes.mock';
import { computeMockRecruitmentFunnel } from './reports.mock';
import type { ApiEnvelope, MasterRecord, UserItem } from '@/store/services/api';

const STORAGE_KEY = 'step_enterprise_mock_db_v1';

interface MockDbState {
  users: UserItem[];
  userAccounts: MockUserAccount[];
  masterData: Record<string, MasterRecord[]>;
  vacancies: MockVacancy[];
  questionPapers: MockQuestionPaper[];
  candidates: MockCandidate[];
  examSessions: Record<string, any>;
  evaluations: Record<number, any>;
  interviews: Record<number, any>;
  offers: Record<number, any>;
}

class MockDatabaseService {
  private state: MockDbState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MockDbState {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('[MockDB] Could not load state from localStorage:', e);
      }
    }

    return {
      users: JSON.parse(JSON.stringify(MOCK_USERS)),
      userAccounts: JSON.parse(JSON.stringify(MOCK_USER_ACCOUNTS)),
      masterData: JSON.parse(JSON.stringify(MOCK_MASTER_DATA)),
      vacancies: JSON.parse(JSON.stringify(MOCK_VACANCIES)),
      questionPapers: JSON.parse(JSON.stringify(MOCK_QUESTION_PAPERS)),
      candidates: JSON.parse(JSON.stringify(MOCK_CANDIDATES)),
      examSessions: JSON.parse(JSON.stringify(MOCK_EXAM_SESSIONS)),
      evaluations: JSON.parse(JSON.stringify(MOCK_EVALUATION_SESSIONS)),
      interviews: JSON.parse(JSON.stringify(MOCK_INTERVIEWS)),
      offers: JSON.parse(JSON.stringify(MOCK_OFFERS)),
    };
  }

  private saveState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('[MockDB] Could not save state to localStorage:', e);
      }
    }
  }

  public resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = this.loadState();
  }

  private envelope<T>(data: T, message = 'Success', statusCode = 200): ApiEnvelope<T> {
    return {
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      message,
      data,
      errors: null,
      correlationId: `mock-corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  private errorEnvelope(message: string, statusCode = 400, errors: string[] = []): ApiEnvelope<any> {
    return {
      success: false,
      statusCode,
      message,
      data: null,
      errors: errors.length > 0 ? errors : [message],
      correlationId: `mock-err-${Date.now()}`,
    };
  }

  private sleep(ms = 120): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Primary router to handle simulated HTTP requests
   */
  public async handleRequest(req: { url: string; method?: string; body?: any; params?: any }): Promise<{ data?: any; error?: any }> {
    await this.sleep(120);

    const url = (req.url || '').split('?')[0];
    const method = (req.method || 'GET').toUpperCase();
    const body = req.body || {};
    const params = req.params || {};

    try {
      // ────────────────── AUTH ──────────────────
      if (url === '/auth/login' && method === 'POST') {
        const { email, password } = body;
        const found = this.state.userAccounts.find(
          (u) => u.email.toLowerCase() === (email || '').toLowerCase().trim()
        );
        if (!found || (found.password && found.password !== password && password !== 'Admin@1234')) {
          // Allow demo bypass with standard password
          if (!found) {
            return {
              error: {
                status: 401,
                data: this.errorEnvelope('Invalid email address or password.', 401),
              },
            };
          }
        }
        const payload = generateMockAuthPayload(found || this.state.userAccounts[0]);
        return { data: this.envelope(payload, 'Login successful') };
      }

      if (url === '/auth/director-pin-login' && method === 'POST') {
        const { pin } = body;
        const director = this.state.userAccounts.find((u) => u.role === 'Director') || this.state.userAccounts[1];
        if (pin === '1234' || pin === '9876' || (director.pin && director.pin === pin)) {
          const payload = generateMockAuthPayload(director);
          return { data: this.envelope(payload, 'Director PIN verified') };
        }
        return {
          error: {
            status: 401,
            data: this.errorEnvelope('Invalid Director PIN. Please try again.', 401),
          },
        };
      }

      if (url === '/auth/refresh-token' && method === 'POST') {
        const user = this.state.userAccounts[0];
        const payload = generateMockAuthPayload(user);
        return { data: this.envelope(payload, 'Token refreshed') };
      }

      // ────────────────── MASTER DATA ──────────────────
      if (url.startsWith('/masterdata') && method === 'GET') {
        const parts = url.split('/').filter(Boolean);
        const category = parts[1]?.toLowerCase() || 'roles';
        const records = this.state.masterData[category] || [];
        return { data: this.envelope(records) };
      }

      if (url.startsWith('/masterdata') && method === 'POST') {
        const parts = url.split('/').filter(Boolean);
        const category = parts[1]?.toLowerCase() || 'roles';
        if (!this.state.masterData[category]) {
          this.state.masterData[category] = [];
        }
        const newRecord: MasterRecord = {
          id: String(Date.now()),
          category,
          code: body.code || `REC-${Date.now()}`,
          name: body.name || 'New Master Record',
          description: body.description || '',
          displayOrder: this.state.masterData[category].length + 1,
          isActive: body.isActive ?? true,
        };
        this.state.masterData[category].push(newRecord);
        this.saveState();
        return { data: this.envelope(newRecord, 'Master record created') };
      }

      if (url.startsWith('/masterdata') && method === 'PUT') {
        const parts = url.split('/').filter(Boolean);
        const category = parts[1]?.toLowerCase();
        const id = parts[2];
        const list = this.state.masterData[category] || [];
        const idx = list.findIndex((m) => String(m.id) === String(id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...body, id: String(id), category };
          this.saveState();
          return { data: this.envelope(list[idx], 'Master record updated') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Record not found', 404) } };
      }

      if (url.startsWith('/masterdata') && url.includes('/toggle-status') && method === 'PATCH') {
        const parts = url.split('/').filter(Boolean);
        const category = parts[1]?.toLowerCase();
        const id = parts[2];
        const list = this.state.masterData[category] || [];
        const found = list.find((m) => String(m.id) === String(id));
        if (found) {
          found.isActive = !found.isActive;
          this.saveState();
          return { data: this.envelope(found, 'Status toggled') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Record not found', 404) } };
      }

      if (url.startsWith('/masterdata') && method === 'DELETE') {
        const parts = url.split('/').filter(Boolean);
        const category = parts[1]?.toLowerCase();
        const id = parts[2];
        const list = this.state.masterData[category] || [];
        this.state.masterData[category] = list.filter((m) => String(m.id) !== String(id));
        this.saveState();
        return { data: this.envelope(true, 'Master record deleted') };
      }

      // ────────────────── USERS ──────────────────
      if (url === '/users' && method === 'GET') {
        return { data: this.envelope(this.state.users) };
      }

      if (url === '/users' && method === 'POST') {
        const newUser: UserItem = {
          id: this.state.users.length + 1,
          employeeCode: body.employeeCode || `EMP-${1000 + this.state.users.length + 1}`,
          firstName: body.firstName || '',
          lastName: body.lastName || '',
          email: body.email || '',
          role: body.role || 'Interviewer',
          department: body.department || 'Engineering',
          status: 'Active',
        };
        this.state.users.unshift(newUser);
        this.saveState();
        return { data: this.envelope(newUser, 'User created') };
      }

      if (url.startsWith('/users/') && method === 'PUT') {
        const id = Number(url.split('/')[2]);
        const idx = this.state.users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          this.state.users[idx] = { ...this.state.users[idx], ...body, id };
          this.saveState();
          return { data: this.envelope(this.state.users[idx], 'User updated') };
        }
        return { error: { status: 404, data: this.errorEnvelope('User not found', 404) } };
      }

      if (url === '/users/change-password' && method === 'POST') {
        return { data: this.envelope(true, 'Password changed successfully') };
      }

      if (url === '/users/change-pin' && method === 'POST') {
        const { newPin } = body;
        const dir = this.state.userAccounts.find((u) => u.role === 'Director');
        if (dir) dir.pin = newPin;
        this.saveState();
        return { data: this.envelope(true, 'Director PIN changed successfully') };
      }

      // ────────────────── VACANCIES ──────────────────
      if (url === '/vacancies' && method === 'GET') {
        let list = [...this.state.vacancies];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (v) =>
              v.title.toLowerCase().includes(q) ||
              v.vacancyCode.toLowerCase().includes(q) ||
              v.department.toLowerCase().includes(q)
          );
        }
        if (params?.status && params.status !== 'All') {
          list = list.filter((v) => v.status === params.status);
        }
        return { data: this.envelope(list) };
      }

      if (url.startsWith('/vacancies/') && !url.includes('/pipeline-flows') && method === 'GET') {
        const id = Number(url.split('/')[2]);
        const v = this.state.vacancies.find((item) => item.id === id);
        if (v) return { data: this.envelope(v) };
        // Fallback to first if not found
        return { data: this.envelope(this.state.vacancies[0] || null) };
      }

      if (url === '/vacancies' && method === 'POST') {
        const newId = this.state.vacancies.length + 1;
        const newVacancy: MockVacancy = {
          id: newId,
          vacancyCode: `VAC-2026-${newId}`,
          title: body.title || 'New Vacancy',
          department: body.department || 'Engineering',
          role: body.role || body.title || 'Software Engineer',
          employmentType: body.employmentType || 'Full-Time Permanent',
          experience: body.experience || '3-5 Years',
          experienceYearsMin: body.experienceYearsMin || 3,
          experienceYearsMax: body.experienceYearsMax || 5,
          hiringLocation: body.hiringLocation || 'Mumbai HQ',
          testLocation: body.testLocation || 'Mumbai Center',
          workMode: body.workMode || 'Hybrid',
          openingsCount: body.openingsCount || body.positionsCount || 1,
          positionsCount: body.openingsCount || body.positionsCount || 1,
          status: 'Open',
          driveType: body.driveType || 'Walk-in Drive',
          createdAt: new Date().toISOString(),
          closingDate: body.closingDate || new Date(Date.now() + 60 * 86400000).toISOString(),
          assignedRecruiter: 'Priya Sharma (HR)',
          hiringManager: 'Rajesh Kulkarni (Director)',
          appliedCount: 0,
          assessmentCount: 0,
          interviewCount: 0,
          offeredCount: 0,
          joinedCount: 0,
          pipelineFlows: [
            {
              id: Date.now(),
              flowName: 'Standard Flow',
              isDefault: true,
              version: 1,
              rounds: [
                {
                  id: 1,
                  roundNumber: 1,
                  roundTitle: 'Initial Screening & Assessment',
                  roundType: 'Assessment',
                  durationMinutes: 45,
                },
                {
                  id: 2,
                  roundNumber: 2,
                  roundTitle: 'Technical Interview',
                  roundType: 'Interview',
                  durationMinutes: 45,
                },
              ],
            },
          ],
        };
        this.state.vacancies.unshift(newVacancy);
        this.saveState();
        return { data: this.envelope(newVacancy, 'Vacancy created successfully') };
      }

      if (url.startsWith('/vacancies/') && !url.includes('/pipeline-flows') && method === 'PUT') {
        const id = Number(url.split('/')[2]);
        const idx = this.state.vacancies.findIndex((v) => v.id === id);
        if (idx !== -1) {
          this.state.vacancies[idx] = { ...this.state.vacancies[idx], ...(body.data || body), id };
          this.saveState();
          return { data: this.envelope(this.state.vacancies[idx], 'Vacancy updated') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Vacancy not found', 404) } };
      }

      // ────────────────── QUESTION PAPERS ──────────────────
      if (url === '/questionpapers' && method === 'GET') {
        return { data: this.envelope(this.state.questionPapers) };
      }

      if (url.startsWith('/questionpapers/') && !url.includes('/publish') && !url.includes('/import-excel') && method === 'GET') {
        const id = Number(url.split('/')[2]);
        const qp = this.state.questionPapers.find((p) => p.id === id);
        if (qp) return { data: this.envelope(qp) };
        return { data: this.envelope(this.state.questionPapers[0] || null) };
      }

      if (url === '/questionpapers' && method === 'POST') {
        const newId = this.state.questionPapers.length + 1;
        const newPaper: MockQuestionPaper = {
          id: newId,
          title: body.title || `Question Paper #${newId}`,
          paperCode: `QP-${Date.now().toString().slice(-4)}`,
          category: body.category || 'Engineering',
          vacancyId: body.vacancyId || 1,
          status: 'Active',
          totalQuestions: (body.questions || []).length || 5,
          totalMarks: body.totalMarks || 100,
          durationMinutes: body.durationMinutes || 45,
          publishedAt: new Date().toISOString(),
          questions: body.questions || [],
        };
        this.state.questionPapers.unshift(newPaper);
        this.saveState();
        return { data: this.envelope(newPaper, 'Question paper created') };
      }

      if (url.startsWith('/questionpapers/') && url.includes('/publish') && method === 'POST') {
        const id = Number(url.split('/')[2]);
        const qp = this.state.questionPapers.find((p) => p.id === id);
        if (qp) {
          qp.status = 'Active';
          qp.publishedAt = new Date().toISOString();
          this.saveState();
          return { data: this.envelope(qp, 'Question paper published') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Paper not found', 404) } };
      }

      if (url.startsWith('/questionpapers/') && url.includes('/import-excel') && method === 'POST') {
        return { data: this.envelope(true, 'Excel question paper imported successfully') };
      }

      // ────────────────── CANDIDATES ──────────────────
      if (url === '/candidates' && method === 'GET') {
        let list = [...this.state.candidates];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (c) =>
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
              c.candidateCode.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              c.vacancyTitle.toLowerCase().includes(q)
          );
        }
        if (params?.status && params.status !== 'All') {
          list = list.filter((c) => c.status === params.status);
        }
        if (params?.vacancyId) {
          list = list.filter((c) => c.vacancyId === Number(params.vacancyId));
        }
        return { data: this.envelope(list) };
      }

      if (url.startsWith('/candidates/') && !url.includes('/documents') && !url.includes('/schedule-test') && !url.includes('/evaluate-stage') && !url.includes('/assign-evaluator') && !url.includes('/assign-pipeline-flow') && method === 'GET') {
        const id = Number(url.split('/')[2]);
        const c = this.state.candidates.find((item) => item.id === id);
        if (c) return { data: this.envelope(c) };
        return { data: this.envelope(this.state.candidates[0] || null) };
      }

      if (url === '/candidates' && method === 'POST') {
        const newId = this.state.candidates.length + 1;
        const newCandidate: MockCandidate = {
          id: newId,
          candidateCode: `CND-2026-${1000 + newId}`,
          firstName: body.firstName || 'Candidate',
          lastName: body.lastName || '',
          email: body.email || '',
          phone: body.phone || '',
          gender: body.gender || 'Male',
          dateOfBirth: body.dateOfBirth || '1998-01-01',
          currentLocation: body.currentLocation || 'Mumbai',
          hiringLocation: body.hiringLocation || 'Mumbai HQ',
          testLocation: body.testLocation || 'Mumbai Center',
          role: body.role || 'Software Engineer',
          vacancyId: Number(body.vacancyId) || 1,
          vacancyTitle: body.vacancyTitle || 'Software Engineer Opening',
          experienceYears: Number(body.experienceYears) || 0,
          totalExperienceYears: Number(body.experienceYears) || 0,
          registrationChannel: body.registrationChannel || 'Walk-in',
          currentStage: 'Screening',
          status: 'In-Progress',
          currentCompany: body.currentCompany || '',
          currentDesignation: body.currentDesignation || '',
          currentCTC: Number(body.currentCTC) || 0,
          expectedCTC: Number(body.expectedCTC) || 0,
          noticePeriodDays: Number(body.noticePeriodDays) || 30,
          highestQualification: body.highestQualification || 'B.Tech / B.E.',
          institutionName: body.institutionName || '',
          yearOfPassing: Number(body.yearOfPassing) || 2022,
          assignedInterviewer: 'Recruitment Team',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pipelineProgress: [
            {
              id: Date.now(),
              roundNumber: 1,
              roundTitle: 'Initial Screening Assessment',
              roundType: 'Assessment',
              status: 'Pending',
              scoreObtained: null,
              startedAt: null,
              completedAt: null,
              candidateExamSessionId: null,
              interviewId: null,
            },
          ],
          documents: [],
        };
        this.state.candidates.unshift(newCandidate);
        this.saveState();
        return { data: this.envelope(newCandidate, 'Candidate registered successfully') };
      }

      if (url.startsWith('/candidates/') && method === 'PUT') {
        const id = Number(url.split('/')[2]);
        const idx = this.state.candidates.findIndex((c) => c.id === id);
        if (idx !== -1) {
          const updated = { ...this.state.candidates[idx], ...(body.data || body), id, updatedAt: new Date().toISOString() };
          this.state.candidates[idx] = updated;
          this.saveState();
          return { data: this.envelope(updated, 'Candidate profile updated') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Candidate not found', 404) } };
      }

      if (url.startsWith('/candidates/') && url.includes('/evaluate-stage') && method === 'POST') {
        const id = Number(url.split('/')[2]);
        const { roundNumber, passed, remarks } = body;
        const candidate = this.state.candidates.find((c) => c.id === id);
        if (candidate) {
          const round = candidate.pipelineProgress.find((p) => p.roundNumber === roundNumber);
          if (round) {
            round.status = passed ? 'Passed' : 'Failed';
            round.completedAt = new Date().toISOString();
          }
          if (!passed) {
            candidate.status = 'Rejected';
          }
          this.saveState();
          return { data: this.envelope(candidate, 'Candidate stage evaluated') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Candidate not found', 404) } };
      }

      if (url.startsWith('/candidates/') && url.includes('/schedule-test') && method === 'POST') {
        const id = Number(url.split('/')[2]);
        const candidate = this.state.candidates.find((c) => c.id === id);
        if (candidate) {
          const firstRound = candidate.pipelineProgress[0];
          if (firstRound) {
            firstRound.status = 'In-Progress';
            firstRound.startedAt = new Date().toISOString();
            firstRound.candidateExamSessionId = 1000 + id;
          }
          this.saveState();
          return { data: this.envelope(true, 'Test scheduled and link dispatched') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Candidate not found', 404) } };
      }

      if (url.startsWith('/candidates/') && url.includes('/assign-evaluator') && method === 'POST') {
        return { data: this.envelope(true, 'Evaluator assigned successfully') };
      }

      if (url.startsWith('/candidates/') && url.includes('/documents') && method === 'POST') {
        const id = Number(url.split('/')[2]);
        const candidate = this.state.candidates.find((c) => c.id === id);
        if (candidate) {
          const newDoc = {
            id: Date.now(),
            documentType: body.documentType || 'Other',
            name: 'Uploaded_Document.pdf',
            originalFileName: 'Uploaded_Document.pdf',
            uploadedAt: new Date().toISOString(),
            fileSizeBytes: 284000,
            storageUrl: '/mock-documents/sample.pdf',
          };
          candidate.documents.push(newDoc);
          this.saveState();
          return { data: this.envelope(newDoc, 'Document uploaded') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Candidate not found', 404) } };
      }

      // ────────────────── EXAM PORTAL ──────────────────
      if (url === '/exams/start' && method === 'POST') {
        const sessionToken = `SES-EXAM-${Date.now().toString().slice(-4)}`;
        const examSession: any = {
          sessionToken,
          candidateName: body.candidateCode ? `Candidate (${body.candidateCode})` : 'Live Test Candidate',
          vacancyTitle: 'Senior Software Engineer Assessment',
          paperTitle: 'Technical & System Architecture Assessment',
          durationMinutes: 60,
          totalTimeLeftSeconds: 3600,
          activeQuestionIndex: 0,
          sessionStatus: 'InProgress',
          questions: this.state.questionPapers[0]?.questions || [],
        };
        this.state.examSessions[sessionToken] = examSession;
        this.saveState();
        return { data: this.envelope(examSession, 'Exam session started') };
      }

      if (url.startsWith('/exams/resume/') && method === 'GET') {
        const token = url.split('/')[3];
        const sess = this.state.examSessions[token] || Object.values(this.state.examSessions)[0] || MOCK_EXAM_SESSIONS['SES-EXAM-1001'];
        return { data: this.envelope(sess) };
      }

      if (url === '/exams/answers' && method === 'POST') {
        return { data: this.envelope(true, 'Answer saved successfully') };
      }

      if (url === '/exams/submit' && method === 'POST') {
        const submitResult: any = {
          sessionStatus: 'Completed',
          totalScore: 85,
          totalMarks: 100,
          pendingManualEvaluationCount: 1,
        };
        return { data: this.envelope(submitResult, 'Exam submitted successfully') };
      }

      if (url === '/exams/violations' && method === 'POST') {
        const res: any = {
          tabSwitchWarnings: 1,
          assessmentIntegrityScore: 90,
          autoSubmitted: false,
          submitResult: null,
        };
        return { data: this.envelope(res, 'Violation logged') };
      }

      if (url.startsWith('/exams/') && url.includes('/evaluation') && method === 'GET') {
        const sessionId = Number(url.split('/')[2]);
        const evalData = this.state.evaluations[sessionId] || this.state.evaluations[1001] || MOCK_EVALUATION_SESSIONS[1001];
        return { data: this.envelope(evalData) };
      }

      if (url === '/exams/evaluate' && method === 'POST') {
        const { candidateExamAnswerId, marksObtained, evaluatorRemarks } = body;
        Object.values(this.state.evaluations).forEach((ev: any) => {
          const ans = (ev.answers || []).find((a: any) => a.candidateExamAnswerId === candidateExamAnswerId);
          if (ans) {
            ans.marksObtained = marksObtained;
            ans.evaluatorRemarks = evaluatorRemarks;
            ans.evaluationStatus = 'Evaluated';
          }
        });
        this.saveState();
        return { data: this.envelope(true, 'Evaluation score recorded') };
      }

      if (url.startsWith('/exams/') && url.includes('/publish') && method === 'POST') {
        const sessionId = Number(url.split('/')[2]);
        const pubResult: any = {
          candidateExamSessionId: sessionId,
          resultStatus: 'Passed',
          totalScore: 88,
          totalMarks: 100,
          percentage: 88,
          advancedToNextRound: true,
          nextRoundTitle: 'Technical Interview',
          nextRoundExamPasscode: null,
          candidateStatus: 'In-Progress',
        };
        return { data: this.envelope(pubResult, 'Assessment result published') };
      }

      // ────────────────── INTERVIEWS ──────────────────
      if (url.startsWith('/interviews/') && !url.includes('/publish') && method === 'GET') {
        const id = Number(url.split('/')[2]);
        const interview = this.state.interviews[id] || this.state.interviews[2001] || MOCK_INTERVIEWS[2001];
        return { data: this.envelope(interview) };
      }

      if (url === '/interviews/schedule' && method === 'POST') {
        const newId = 2000 + Object.keys(this.state.interviews).length + 1;
        const newInterview = {
          id: newId,
          candidateId: body.candidateId,
          candidateName: 'Candidate',
          vacancyTitle: 'Interview Round',
          interviewerUserId: body.interviewerUserId || 4,
          interviewerName: 'Vikram Deshmukh',
          scheduledAt: body.scheduledAt || new Date().toISOString(),
          durationMinutes: body.durationMinutes || 45,
          mode: body.mode || 'Online',
          meetingLinkOrLocation: body.meetingLinkOrLocation || 'https://meet.google.com/step-interview',
          status: 'Scheduled',
          roundDetails: [],
        };
        this.state.interviews[newId] = newInterview;
        this.saveState();
        return { data: this.envelope(newInterview, 'Interview scheduled') };
      }

      if (url === '/interviews/feedback' && method === 'POST') {
        const { interviewId, technicalRating, communicationRating, problemSolvingRating, culturalFitRating, strengths, weaknesses, recommendation, comments } = body;
        const interview = this.state.interviews[interviewId];
        if (interview) {
          interview.status = recommendation === 'Reject' ? 'Rejected' : 'Passed';
          interview.roundDetails.push({
            id: Date.now(),
            panelistUserId: 4,
            panelistName: 'Assigned Panelist',
            technicalRating,
            communicationRating,
            problemSolvingRating,
            culturalFitRating,
            strengths,
            weaknesses,
            recommendation,
            comments,
            submittedAt: new Date().toISOString(),
          });
          this.saveState();
        }
        return { data: this.envelope(true, 'Interview scorecard submitted') };
      }

      if (url.startsWith('/interviews/') && url.includes('/publish') && method === 'POST') {
        return { data: this.envelope(true, 'Interview result published') };
      }

      // ────────────────── OFFERS ──────────────────
      if (url.startsWith('/offers/') && !url.includes('/approve') && method === 'GET') {
        const id = Number(url.split('/')[2]);
        const offer = this.state.offers[id] || this.state.offers[4001] || MOCK_OFFERS[4001];
        return { data: this.envelope(offer) };
      }

      if (url === '/offers' && method === 'POST') {
        const newId = 4000 + Object.keys(this.state.offers).length + 1;
        const newOffer = {
          id: newId,
          candidateId: body.candidateId,
          candidateName: 'Candidate',
          vacancyId: 1,
          vacancyTitle: 'Engineering Position',
          offeredCTC: body.offeredCTC || 2000000,
          joiningDate: body.joiningDate || '2026-04-01',
          status: 'Prepared',
          preparedByName: 'Priya Sharma (HR)',
          approvedByName: null,
          approvedAt: null,
          generatedPdfPath: null,
        };
        this.state.offers[newId] = newOffer;
        this.saveState();
        return { data: this.envelope(newOffer, 'Offer letter generated') };
      }

      if (url.startsWith('/offers/') && url.includes('/approve') && method === 'POST') {
        const id = Number(url.split('/')[2]);
        const { directorPin } = body;
        if (directorPin !== '1234' && directorPin !== '9876') {
          return { error: { status: 401, data: this.errorEnvelope('Invalid Director PIN authorization', 401) } };
        }
        const offer = this.state.offers[id];
        if (offer) {
          offer.status = 'Approved';
          offer.approvedByName = 'Rajesh Kulkarni (Director)';
          offer.approvedAt = new Date().toISOString();
          this.saveState();
        }
        return { data: this.envelope(true, 'Offer letter authorized by Director') };
      }

      // ────────────────── QR CODE & PUBLIC APPLY ──────────────────
      if (url.startsWith('/publicregistration') && url.includes('/eligibility') && method === 'GET') {
        const parts = url.split('/').filter(Boolean);
        const code = parts[1] || 'WALK-IN';
        return { data: this.envelope(checkMockEligibility(code, params?.email, params?.phone)) };
      }

      if (url.startsWith('/publicregistration/') && method === 'GET') {
        const code = url.split('/')[2] || 'WALK-IN';
        return { data: this.envelope(getMockQRScanResult(code)) };
      }

      if (url === '/publicregistration' && method === 'POST') {
        const newId = this.state.candidates.length + 1;
        const newCandidate: MockCandidate = {
          id: newId,
          candidateCode: `CND-2026-${1000 + newId}`,
          firstName: body.firstName || 'Candidate',
          lastName: body.lastName || '',
          email: body.email || '',
          phone: body.phone || '',
          gender: 'Male',
          dateOfBirth: '1998-01-01',
          currentLocation: body.currentLocation || 'Pune',
          hiringLocation: 'Pune Center (Hinjawadi)',
          testLocation: 'Pune Assessment Hub',
          role: 'Applicant',
          vacancyId: 2,
          vacancyTitle: 'Walk-In Registration',
          experienceYears: Number(body.totalExperienceYears) || 0,
          totalExperienceYears: Number(body.totalExperienceYears) || 0,
          registrationChannel: 'Walk-in',
          currentStage: 'Screening',
          status: 'Applied',
          currentCTC: Number(body.currentCTC) || 0,
          expectedCTC: Number(body.expectedCTC) || 0,
          noticePeriodDays: Number(body.noticePeriodDays) || 30,
          highestQualification: body.highestQualification || 'B.Tech / B.E.',
          assignedInterviewer: 'Walk-in Desk',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pipelineProgress: [],
          documents: [],
        };
        this.state.candidates.unshift(newCandidate);
        this.saveState();
        return { data: this.envelope(newCandidate, 'Registration successful. Welcome to SCIPL!') };
      }

      if (url.startsWith('/qrcodes/vacancy/') && method === 'GET') {
        const vacId = Number(url.split('/')[3]);
        const qr = Object.values(MOCK_QR_CODES).find((q) => q.vacancyId === vacId) || MOCK_QR_CODES['WALK-IN-2026-PUNE'];
        return { data: this.envelope(qr) };
      }

      if (url.startsWith('/qrcodes/') && url.includes('/analytics') && method === 'GET') {
        const id = Number(url.split('/')[2]);
        return { data: this.envelope(MOCK_QR_ANALYTICS[id] || MOCK_QR_ANALYTICS[1]) };
      }

      // ────────────────── REPORTS ──────────────────
      if (url === '/reports/recruitment-funnel' && method === 'GET') {
        const funnel = computeMockRecruitmentFunnel(this.state.candidates, this.state.vacancies);
        return { data: this.envelope(funnel) };
      }

      // Generic fallback
      return { data: this.envelope(true, 'Mock API OK') };
    } catch (err: any) {
      console.error('[MockDatabaseService] Router error:', err);
      return {
        error: {
          status: 500,
          data: this.errorEnvelope(err?.message || 'Mock Internal Server Error', 500),
        },
      };
    }
  }
}

export const mockDbService = new MockDatabaseService();
