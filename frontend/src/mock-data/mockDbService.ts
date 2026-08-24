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
import { MOCK_QUESTION_BANK, type MockQuestionBankItem } from './questionBank.mock';
import { MOCK_BLUEPRINTS } from './blueprints.mock';
import type { ApiEnvelope, MasterRecord, UserItem } from '@/store/services/api';

const STORAGE_KEY = 'step_enterprise_mock_db_v5';

interface MockDbState {
  users: UserItem[];
  userAccounts: MockUserAccount[];
  masterData: Record<string, MasterRecord[]>;
  vacancies: MockVacancy[];
  questionPapers: MockQuestionPaper[];
  questionBank: MockQuestionBankItem[];
  candidates: MockCandidate[];
  examSessions: Record<string, any>;
  evaluations: Record<number, any>;
  interviews: Record<number, any>;
  offers: Record<number, any>;
  directorAccessLinks: Record<string, any>;
  blueprints: any[];
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
          const parsed = JSON.parse(saved);
          // Ensure newly added master categories (skills, languages) are populated
          parsed.masterData = {
            ...MOCK_MASTER_DATA,
            ...(parsed.masterData || {}),
          };
          delete parsed.masterData.skills;
          delete parsed.masterData.subjects;
          parsed.masterData.languages = JSON.parse(JSON.stringify(MOCK_MASTER_DATA.languages));
          for (const key of Object.keys(MOCK_MASTER_DATA)) {
            if (!parsed.masterData[key] || parsed.masterData[key].length === 0) {
              parsed.masterData[key] = JSON.parse(JSON.stringify(MOCK_MASTER_DATA[key]));
            }
          }
          if (!parsed.questionBank || parsed.questionBank.length === 0) {
            parsed.questionBank = JSON.parse(JSON.stringify(MOCK_QUESTION_BANK));
          }
          if (!parsed.vacancies || parsed.vacancies.length === 0) {
            parsed.vacancies = JSON.parse(JSON.stringify(MOCK_VACANCIES));
          }
          if (!parsed.questionPapers || parsed.questionPapers.length === 0) {
            parsed.questionPapers = JSON.parse(JSON.stringify(MOCK_QUESTION_PAPERS));
          }
          if (!parsed.candidates || parsed.candidates.length === 0) {
            parsed.candidates = JSON.parse(JSON.stringify(MOCK_CANDIDATES));
          }
          if (!parsed.directorAccessLinks) {
            parsed.directorAccessLinks = {};
          }
          const existingCodes = new Set((parsed.blueprints || []).map((b: any) => b.code));
          const mergedBlueprints = [...(parsed.blueprints || [])];
          for (const defaultBp of MOCK_BLUEPRINTS) {
            if (!existingCodes.has(defaultBp.code)) {
              mergedBlueprints.push(JSON.parse(JSON.stringify(defaultBp)));
            }
          }
          parsed.blueprints = mergedBlueprints;
          return parsed;
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
      questionBank: JSON.parse(JSON.stringify(MOCK_QUESTION_BANK)),
      candidates: JSON.parse(JSON.stringify(MOCK_CANDIDATES)),
      examSessions: JSON.parse(JSON.stringify(MOCK_EXAM_SESSIONS)),
      evaluations: JSON.parse(JSON.stringify(MOCK_EVALUATION_SESSIONS)),
      interviews: JSON.parse(JSON.stringify(MOCK_INTERVIEWS)),
      offers: JSON.parse(JSON.stringify(MOCK_OFFERS)),
      directorAccessLinks: {},
      blueprints: JSON.parse(JSON.stringify(MOCK_BLUEPRINTS)),
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

      // ────────────────── V2 QUESTION BANK ──────────────────
      if (url === '/v2/question-bank' && method === 'GET') {
        let list = [...this.state.questionBank];
        const { language, sectionType, experienceTier, difficulty, questionType, search } = params;
        if (language && language !== 'All') {
          list = list.filter((q) => q.language.toLowerCase() === language.toLowerCase());
        }
        if (sectionType && sectionType !== 'All') {
          list = list.filter((q) => q.sectionType === sectionType);
        }
        const expFilter = experienceTier || difficulty;
        if (expFilter && expFilter !== 'All') {
          list = list.filter((q) => q.experienceTier === expFilter);
        }
        if (questionType && questionType !== 'All') {
          list = list.filter((q) => q.questionType === questionType);
        }
        if (search && search.trim()) {
          const qSearch = search.toLowerCase().trim();
          list = list.filter(
            (q) =>
              q.questionText.toLowerCase().includes(qSearch) ||
              (q.code && q.code.toLowerCase().includes(qSearch)) ||
              q.language.toLowerCase().includes(qSearch)
          );
        }
        return { data: this.envelope(list) };
      }

      if (url === '/v2/question-bank' && method === 'POST') {
        const newId = this.state.questionBank.reduce((max, q) => Math.max(max, q.id), 0) + 1;
        const newQuestion: MockQuestionBankItem = {
          id: newId,
          code: body.code || `QB-NEW-${newId.toString().padStart(2, '0')}`,
          language: body.language || 'General Aptitude',
          sectionType: body.sectionType || 'Aptitude',
          questionType: body.questionType || 'SINGLE_CHOICE',
          experienceTier: body.experienceTier || body.difficulty || 'Junior',
          questionText: body.questionText || '',
          marks: Number(body.marks) || 1,
          sqlSchema: body.sqlSchema || null,
          starterCode: body.starterCode || null,
          testCases: body.testCases || null,
          options: body.options || [],
          isActive: body.isActive ?? true,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        this.state.questionBank.unshift(newQuestion);
        this.saveState();
        return { data: this.envelope(newQuestion, 'Question added successfully') };
      }

      if (url.startsWith('/v2/question-bank/') && method === 'PUT') {
        const id = Number(url.split('/')[3]);
        const idx = this.state.questionBank.findIndex((q) => q.id === id);
        if (idx !== -1) {
          this.state.questionBank[idx] = {
            ...this.state.questionBank[idx],
            ...body,
            id,
            updatedAt: new Date().toISOString().split('T')[0],
          };
          this.saveState();
          return { data: this.envelope(this.state.questionBank[idx], 'Question updated successfully') };
        }
        return { error: { status: 404, data: this.errorEnvelope('Question not found', 404) } };
      }

      if (url.startsWith('/v2/question-bank/') && method === 'DELETE') {
        const id = Number(url.split('/')[3]);
        this.state.questionBank = this.state.questionBank.filter((q) => q.id !== id);
        this.saveState();
        return { data: this.envelope(true, 'Question deleted successfully') };
      }

      if (url === '/v2/question-bank/bulk-delete' && method === 'POST') {
        const ids: number[] = body.questionIds || [];
        const idSet = new Set(ids);
        this.state.questionBank = this.state.questionBank.filter((q) => !idSet.has(q.id));
        this.saveState();
        return { data: this.envelope(true, `${ids.length} questions deleted successfully`) };
      }

      if (url === '/v2/question-bank/bulk-status' && method === 'POST') {
        const ids: number[] = body.questionIds || [];
        const isActive: boolean = body.isActive ?? true;
        const idSet = new Set(ids);
        this.state.questionBank.forEach((q) => {
          if (idSet.has(q.id)) {
            q.isActive = isActive;
            q.updatedAt = new Date().toISOString().split('T')[0];
          }
        });
        this.saveState();
        return { data: this.envelope(true, `${ids.length} questions updated successfully`) };
      }

      if ((url === '/v2/question-bank/bulk-import' || url === '/question-bank/bulk-import') && method === 'POST') {
        const items: any[] = body.questions || [];
        let nextId = this.state.questionBank.reduce((max, q) => Math.max(max, q.id), 0) + 1;
        const importedList: MockQuestionBankItem[] = items.map((it: any) => ({
          id: nextId++,
          code: it.code || `QB-IMP-${nextId}`,
          language: it.language || 'General Aptitude',
          sectionType: it.sectionType || 'Aptitude',
          questionType: it.questionType || 'SINGLE_CHOICE',
          experienceTier: it.experienceTier || it.difficulty || 'Junior',
          questionText: it.questionText || '',
          marks: Number(it.marks) || 1,
          sqlSchema: it.sqlSchema || null,
          starterCode: it.starterCode || null,
          testCases: it.testCases || null,
          options: it.options || [],
          isActive: true,
          updatedAt: new Date().toISOString().split('T')[0],
        }));
        this.state.questionBank.unshift(...importedList);
        this.saveState();
        return { data: this.envelope(importedList, `${importedList.length} questions imported successfully`) };
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

      if (url.startsWith('/candidates/') && !url.includes('/director-access') && !url.includes('/director-access-link') && !url.includes('/documents') && !url.includes('/schedule-test') && !url.includes('/evaluate-stage') && !url.includes('/assign-evaluator') && !url.includes('/assign-pipeline-flow') && method === 'GET') {
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

      // ────────────────── DIRECTOR CANDIDATE ACCESS GATEWAY ──────────────────
      if (url.startsWith('/candidates/') && url.includes('/director-access-link') && method === 'POST') {
        const id = Number(url.split('/')[2]);
        const candidate = this.state.candidates.find((c) => c.id === id);
        if (!candidate) {
          return { error: { status: 404, data: this.errorEnvelope('Candidate not found', 404) } };
        }

        const candidateName = `${candidate.firstName} ${candidate.lastName}`.trim();
        const candidateCode = candidate.candidateCode;
        const vacancyTitle = candidate.vacancyTitle || candidate.role;

        // Check if an active, unexpired, non-revoked link already exists for this candidate
        const existingTokenKey = Object.keys(this.state.directorAccessLinks).find((k) => {
          const r = this.state.directorAccessLinks[k];
          return r.candidateId === id && !r.isRevoked && new Date() < new Date(r.expiresAt);
        });

        // If active link exists and client did not request explicit regeneration, return the existing active link
        if (existingTokenKey && !body?.regenerate) {
          const activeRecord = this.state.directorAccessLinks[existingTokenKey];
          const accessUrl = `/?d=${activeRecord.token}`;
          return {
            data: this.envelope(
              {
                token: activeRecord.token,
                accessUrl,
                expiresAt: activeRecord.expiresAt,
                candidateName,
                candidateCode,
                vacancyTitle,
                isExisting: true,
              },
              'Active Director access link returned'
            ),
          };
        }

        // If regenerating, revoke existing active links for this candidate
        if (existingTokenKey && body?.regenerate) {
          this.state.directorAccessLinks[existingTokenKey].isRevoked = true;
          this.state.directorAccessLinks[existingTokenKey].revokedAt = new Date().toISOString();
        }

        const token = `dir_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const record = {
          token,
          candidateId: id,
          candidateName,
          candidateCode,
          vacancyTitle,
          currentStage: candidate.currentStage,
          createdAt: new Date().toISOString(),
          expiresAt,
          isRevoked: false,
        };

        this.state.directorAccessLinks[token] = record;
        this.saveState();

        const accessUrl = `/?d=${token}`;
        return {
          data: this.envelope(
            {
              token,
              accessUrl,
              expiresAt,
              candidateName,
              candidateCode,
              vacancyTitle,
              isExisting: false,
            },
            'Director access link generated (Valid for 24 Hours)'
          ),
        };
      }

      if (url.includes('/candidates/director-access/') && !url.includes('/verify-pin') && method === 'GET') {
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split('/');
        const token = parts[parts.length - 1];
        const record = this.state.directorAccessLinks[token];

        if (!record) {
          const fallbackCand = this.state.candidates[0] || MOCK_CANDIDATES[0];
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          return {
            data: this.envelope({
              valid: true,
              token,
              candidateId: fallbackCand.id,
              candidateName: `${fallbackCand.firstName} ${fallbackCand.lastName}`.trim(),
              candidateCode: fallbackCand.candidateCode,
              vacancyTitle: fallbackCand.vacancyTitle || fallbackCand.role,
              currentStage: fallbackCand.currentStage,
              createdAt: new Date().toISOString(),
              expiresAt,
              isExpired: false,
              remainingMinutes: 1440,
            }),
          };
        }

        const isExpired = record.isRevoked || new Date() > new Date(record.expiresAt);
        const remainingMinutes = Math.max(0, Math.round((new Date(record.expiresAt).getTime() - Date.now()) / 60000));

        return {
          data: this.envelope({
            valid: !isExpired,
            token,
            candidateId: record.candidateId,
            candidateName: record.candidateName,
            candidateCode: record.candidateCode,
            vacancyTitle: record.vacancyTitle,
            currentStage: record.currentStage,
            createdAt: record.createdAt,
            expiresAt: record.expiresAt,
            isExpired,
            remainingMinutes,
          }),
        };
      }

      if (url.includes('/candidates/director-access/verify-pin') && method === 'POST') {
        const { token, pin } = body;
        const record = this.state.directorAccessLinks[token];
        const candidateId = record?.candidateId || 1;

        if (record && (record.isRevoked || new Date() > new Date(record.expiresAt))) {
          return {
            error: {
              status: 401,
              data: this.errorEnvelope('This Director access link has expired after 24 hours. Please request a new link from HR.', 401),
            },
          };
        }

        const validPins = ['1234', '9876'];
        const directorUser = this.state.users.find((u) => u.role?.toLowerCase() === 'director') || {
          id: 4,
          employeeCode: 'EMP-004',
          firstName: 'Vikram',
          lastName: 'Deshmukh',
          email: 'vikram.deshmukh@enterprise.step',
          role: 'Director',
          permissions: ['DIRECTOR_DECISION', 'VIEW_ALL_CANDIDATES', 'EVALUATION_WRITE'],
        };

        if (!validPins.includes(pin) && pin !== (directorUser as any).pin) {
          return {
            error: {
              status: 401,
              data: this.errorEnvelope('Invalid Director Security PIN. Please enter your valid 4-digit Director PIN.', 401),
            },
          };
        }

        return {
          data: this.envelope(
            {
              accessToken: `mock_jwt_director_${Date.now()}`,
              refreshToken: `mock_refresh_director_${Date.now()}`,
              user: directorUser,
              candidateId,
              redirectUrl: `/dashboard/candidates/${candidateId}`,
            },
            'Director authenticated successfully'
          ),
        };
      }

      // ────────────────── EXAM PORTAL ──────────────────
      if (url === '/exams/start' && method === 'POST') {
        const sessionToken = `SES-EXAM-${Date.now().toString().slice(-4)}`;
        const matchedCandidate = this.state.candidates.find((c) => c.candidateCode === body.candidateCode);
        const fallbackQuestions =
          (this.state.questionPapers && this.state.questionPapers[0]?.questions?.length > 0)
            ? this.state.questionPapers[0].questions
            : MOCK_QUESTION_PAPERS[0]?.questions || [];

        const examSession: any = {
          sessionToken,
          candidateName: matchedCandidate ? `${matchedCandidate.firstName} ${matchedCandidate.lastName}` : (body.candidateCode ? `Candidate (${body.candidateCode})` : 'Live Test Candidate'),
          vacancyTitle: matchedCandidate?.role || matchedCandidate?.vacancyTitle || 'SQL Developer Assessment',
          paperTitle: 'Database & SQL Engineering Track',
          durationMinutes: 85,
          totalTimeLeftSeconds: 85 * 60,
          activeQuestionIndex: 0,
          sessionStatus: 'InProgress',
          questions: fallbackQuestions,
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
      if ((url.startsWith('/publicregistration') || url.startsWith('/v2/publicregistration') || url.startsWith('/apply') || url.startsWith('/v2/apply')) && url.includes('/eligibility') && method === 'GET') {
        const parts = url.split('/').filter(Boolean);
        const code = parts.find((p) => p !== 'publicregistration' && p !== 'apply' && p !== 'v2' && p !== 'eligibility') || 'WALK-IN';
        return { data: this.envelope(checkMockEligibility(code, params?.email, params?.phone)) };
      }

      if ((url.startsWith('/publicregistration/') || url.startsWith('/v2/publicregistration/') || url.startsWith('/apply/') || url.startsWith('/v2/apply/')) && method === 'GET') {
        const parts = url.split('/').filter(Boolean);
        const code = decodeURIComponent(parts.find((p) => p !== 'publicregistration' && p !== 'apply' && p !== 'v2' && p !== 'eligibility') || 'WALK-IN');
        const matched =
          this.state.vacancies.find(
            (v) =>
              String(v.id) === code ||
              v.vacancyCode?.toLowerCase() === code.toLowerCase() ||
              code.toLowerCase().includes(String(v.id))
          ) || this.state.vacancies[0];

        if (matched) {
          return {
            data: this.envelope({
              qrCodeId: matched.id * 10,
              vacancyId: matched.id,
              vacancyTitle: matched.title ? matched.title.replace(/[-–—]\s*⚡?\s*1-Click Drive/gi, '').trim() : 'Senior .NET Architect',
              venueName: matched.testLocation || matched.hiringLocation || 'Pune Assessment Hub',
              departmentName: matched.department || 'Production',
              openingsCount: matched.openingsCount || matched.positionsCount || 5,
              driveType: matched.driveType || 'Walk-in Drive',
              vacancyCode: matched.vacancyCode || 'VAC-2026-106',
              isOpenForRegistration: true,
              message: null,
            }),
          };
        }
        return { data: this.envelope(getMockQRScanResult(code)) };
      }

      if ((url === '/publicregistration' || url === '/v2/publicregistration' || url === '/apply' || url === '/v2/apply') && method === 'POST') {
        const newId = this.state.candidates.length + 1;
        const pass = String(Math.floor(1000 + Math.random() * 9000));
        const matchedVacancy =
          this.state.vacancies.find(
            (v) =>
              String(v.id) === body.code ||
              v.vacancyCode?.toLowerCase() === body.code?.toLowerCase() ||
              body.code?.toLowerCase().includes(String(v.id))
          ) || this.state.vacancies[0];

        const newCandidate: MockCandidate & {
          passcode?: string;
          institutionName?: string;
          yearOfPassing?: number;
          marksPercentage?: number;
          refType?: string;
          refName?: string;
          refMobile?: string;
        } = {
          id: newId,
          candidateCode: `CND-2026-${1000 + newId}`,
          firstName: body.firstName || 'Candidate',
          lastName: body.lastName || '',
          email: body.email || '',
          phone: body.phone || '',
          gender: body.gender || 'Male',
          dateOfBirth: body.dob || '2002-05-15',
          currentLocation: body.currentLocation || 'Pune',
          hiringLocation: matchedVacancy?.hiringLocation || 'Pune Center (Hinjawadi)',
          testLocation: matchedVacancy?.testLocation || 'Pune Assessment Hub',
          role: matchedVacancy?.title?.replace(/[-–—]\s*⚡?\s*1-Click Drive/gi, '').trim() || 'Senior .NET Architect',
          vacancyId: matchedVacancy?.id || 2,
          vacancyTitle: matchedVacancy?.title?.replace(/[-–—]\s*⚡?\s*1-Click Drive/gi, '').trim() || 'Senior .NET Architect',
          experienceYears: Number(body.totalExperienceYears) || 0,
          totalExperienceYears: Number(body.totalExperienceYears) || 0,
          registrationChannel: matchedVacancy?.driveType === 'Direct / Sourced Hiring' ? 'Direct' : 'Walk-in',
          currentStage: 'Screening',
          status: 'Applied',
          currentCompany: body.currentCompany || '',
          currentDesignation: body.currentDesignation || '',
          currentCTC: Number(body.currentCTC) || 0,
          expectedCTC: Number(body.expectedCTC) || 0,
          noticePeriodDays: Number(body.noticePeriodDays) || 30,
          highestQualification: body.highestQualification || 'B.Tech / B.E.',
          institutionName: body.institutionName || 'COEP Technological University',
          yearOfPassing: Number(body.yearOfPassing) || 2026,
          marksPercentage: Number(body.marksPercentage) || 85,
          avatarUrl: body.avatarUrl || '',
          refType: body.refType || 'Direct',
          refName: body.refName || '',
          refMobile: body.refMobile || '',
          assignedInterviewer: 'Walk-in Desk',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pipelineProgress: [],
          documents: body.resumeFileName
            ? [
                {
                  id: 1,
                  documentType: 'Resume',
                  name: body.resumeFileName,
                  originalFileName: body.resumeFileName,
                  uploadedAt: new Date().toISOString(),
                  fileSizeBytes: 1800000,
                  storageUrl: '#',
                },
              ]
            : [],
        };
        this.state.candidates.unshift(newCandidate);
        this.saveState();
        return {
          data: this.envelope(
            {
              ...newCandidate,
              passcode: pass,
            },
            'Registration successful. Welcome to SCIPL!'
          ),
        };
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

      if (url.startsWith('/reports/recruitment-funnel') && method === 'GET') {
        const candidates = this.state.candidates || [];
        const totalCandidates = candidates.length;
        const appliedCount = candidates.filter((c) => {
          const s = (c.currentStage || c.status || '').toLowerCase();
          return s.includes('screen') || s.includes('applied') || s.includes('register');
        }).length;
        const inProgressCount = candidates.filter((c) => {
          const s = (c.currentStage || c.status || '').toLowerCase();
          return s.includes('interview') || s.includes('assess') || s.includes('director') || s.includes('round');
        }).length;
        const offeredCount = candidates.filter((c) => {
          const s = (c.status || c.currentStage || '').toLowerCase();
          return s.includes('offer');
        }).length;
        const withdrawnCount = candidates.filter((c) => {
          const s = (c.status || c.currentStage || '').toLowerCase();
          return s.includes('hold') || s.includes('withdraw');
        }).length;
        const rejectedCount = candidates.filter((c) => {
          const s = (c.status || c.currentStage || '').toLowerCase();
          return s.includes('reject');
        }).length;
        const joinedCount = candidates.filter((c) => {
          const s = (c.status || c.currentStage || '').toLowerCase();
          return s.includes('hire') || s.includes('join');
        }).length;

        const funnelData = {
          totalCandidates,
          totalApplications: totalCandidates,
          appliedCount,
          assessmentPassed: appliedCount,
          inProgressCount,
          interviewCleared: inProgressCount,
          offeredCount,
          offersIssued: offeredCount,
          withdrawnCount,
          onHoldCount: withdrawnCount,
          rejectedCount,
          joinedCount,
        };
        return { data: this.envelope(funnelData) };
      }

      // ────────────────── V2 AUTONOMOUS RECRUITMENT ENGINE ──────────────────
      if ((url === '/v2/hiring-blueprints' || url === '/v2/assessment-templates' || url === '/assessment-templates' || url === '/hiring-blueprints') && method === 'GET') {
        const list = this.state.blueprints || MOCK_BLUEPRINTS;
        return { data: this.envelope(list, 'Assessment blueprints retrieved') };
      }

      if ((url.startsWith('/v2/hiring-blueprints/') || url.startsWith('/v2/assessment-templates/') || url.startsWith('/hiring-blueprints/')) && method === 'GET') {
        const id = Number(url.split('/').pop()) || 1;
        const list = this.state.blueprints || MOCK_BLUEPRINTS;
        const bp = list.find((b: any) => b.id === id) || list[0];
        return { data: this.envelope(bp, 'Assessment blueprint retrieved') };
      }

      if ((url === '/v2/hiring-blueprints' || url === '/v2/assessment-templates' || url === '/assessment-templates' || url === '/hiring-blueprints') && method === 'POST') {
        const body = (req as any).body || {};
        const rules = body.sectionRules || [];
        const totalQuestions = rules.reduce((acc: number, r: any) => acc + (Number(r.questionCount) || 0), 0);
        const totalMarks = rules.reduce((acc: number, r: any) => acc + ((Number(r.questionCount) || 0) * (Number(r.marksPerQuestion) || 1)), 0);
        const totalDuration = rules.reduce((acc: number, r: any) => acc + (Number(r.timeLimitMinutes) || 0), 0);

        if (!this.state.blueprints) this.state.blueprints = JSON.parse(JSON.stringify(MOCK_BLUEPRINTS));
        const maxId = this.state.blueprints.reduce((max: number, b: any) => Math.max(max, Number(b.id) || 0), 0);
        const newBlueprint = {
          ...body,
          id: maxId + 1,
          code: body.code || `RULE-${maxId + 1}`,
          name: body.name,
          defaultPassingPercentage: body.defaultPassingPercentage ?? 70,
          totalDurationMinutes: totalDuration || 60,
          totalQuestions,
          totalMarks,
          enableQuestionShuffling: true,
          enableOptionShuffling: true,
          isDefault: body.isDefault ?? false,
          assignedRolesCount: 0,
          sectionRules: rules.map((r: any, idx: number) => ({
            ...r,
            id: r.id || idx + 1,
            displayOrder: idx + 1,
          })),
        };

        this.state.blueprints.push(newBlueprint);
        this.saveState();
        return { data: this.envelope(newBlueprint, 'Assessment blueprint created') };
      }

      if ((url.startsWith('/v2/hiring-blueprints/') || url.startsWith('/v2/assessment-templates/') || url.startsWith('/hiring-blueprints/')) && method === 'PUT') {
        const id = Number(url.split('/').pop());
        const body = (req as any).body || {};
        const rules = body.sectionRules || [];
        const totalQuestions = rules.reduce((acc: number, r: any) => acc + (Number(r.questionCount) || 0), 0);
        const totalMarks = rules.reduce((acc: number, r: any) => acc + ((Number(r.questionCount) || 0) * (Number(r.marksPerQuestion) || 1)), 0);
        const totalDuration = rules.reduce((acc: number, r: any) => acc + (Number(r.timeLimitMinutes) || 0), 0);

        if (!this.state.blueprints) this.state.blueprints = JSON.parse(JSON.stringify(MOCK_BLUEPRINTS));
        const idx = this.state.blueprints.findIndex((b: any) => b.id === id);
        if (idx !== -1) {
          this.state.blueprints[idx] = {
            ...this.state.blueprints[idx],
            ...body,
            id,
            totalDurationMinutes: totalDuration || 60,
            totalQuestions,
            totalMarks,
            sectionRules: rules.map((r: any, rIdx: number) => ({
              ...r,
              id: r.id || rIdx + 1,
              displayOrder: rIdx + 1,
            })),
          };
          this.saveState();
          return { data: this.envelope(this.state.blueprints[idx], 'Assessment blueprint updated') };
        }
        return { data: this.envelope(body, 'Assessment blueprint updated') };
      }

      if ((url.startsWith('/v2/hiring-blueprints/') || url.startsWith('/v2/assessment-templates/') || url.startsWith('/hiring-blueprints/')) && method === 'DELETE') {
        const id = Number(url.split('/').pop());
        if (!this.state.blueprints) this.state.blueprints = JSON.parse(JSON.stringify(MOCK_BLUEPRINTS));
        this.state.blueprints = this.state.blueprints.filter((b: any) => b.id !== id);
        this.saveState();
        return { data: this.envelope(true, 'Assessment blueprint deleted') };
      }

      if (url.startsWith('/v2/vacancies/roles/') && url.endsWith('/profiles') && method === 'GET') {
        const parts = url.split('/').filter(Boolean);
        const roleId = Number(parts[3]) || 1;
        const roleName = this.state.masterData['roles']?.find((r) => String(r.id) === String(roleId))?.name || 'Software Engineer';
        
        const mockProfiles = [
          {
            id: roleId * 10 + 1,
            masterRoleId: roleId,
            roleName,
            profileName: 'Fresher (0-1 Year)',
            experienceLevelId: 1,
            experienceLevelName: 'Fresher (0 Years)',
            minExperienceYears: 0.0,
            maxExperienceYears: 1.0,
            questionPaperTemplateId: 1,
            questionPaperTitle: `${roleName} Fundamentals Assessment (Fresher)`,
            passingPercentage: 65.0,
            pipelineFlowTemplateId: 1,
            autoAdvanceOnPass: true,
            autoRejectOnFail: true,
            autoPrepareOfferOnFinalPass: true,
            defaultBaseCTC: 450000,
            isDefault: true,
            isActive: true,
          },
          {
            id: roleId * 10 + 2,
            masterRoleId: roleId,
            roleName,
            profileName: 'Junior (1-2 Years)',
            experienceLevelId: 2,
            experienceLevelName: 'Junior (0-1 Year)',
            minExperienceYears: 1.0,
            maxExperienceYears: 2.5,
            questionPaperTemplateId: 2,
            questionPaperTitle: `${roleName} Core & Practical Assessment`,
            passingPercentage: 70.0,
            pipelineFlowTemplateId: 1,
            autoAdvanceOnPass: true,
            autoRejectOnFail: true,
            autoPrepareOfferOnFinalPass: true,
            defaultBaseCTC: 650000,
            isDefault: false,
            isActive: true,
          },
          {
            id: roleId * 10 + 3,
            masterRoleId: roleId,
            roleName,
            profileName: 'Mid-Level (2-4 Years)',
            experienceLevelId: 3,
            experienceLevelName: 'Mid-Level (1-3 Years)',
            minExperienceYears: 2.5,
            maxExperienceYears: 4.5,
            questionPaperTemplateId: 3,
            questionPaperTitle: `${roleName} Advanced Architecture & Problem Solving`,
            passingPercentage: 75.0,
            pipelineFlowTemplateId: 1,
            autoAdvanceOnPass: true,
            autoRejectOnFail: true,
            autoPrepareOfferOnFinalPass: true,
            defaultBaseCTC: 1100000,
            isDefault: false,
            isActive: true,
          },
        ];
        return { data: this.envelope(mockProfiles, 'Hiring profile templates retrieved') };
      }

      if (url === '/v2/vacancies/instant-drive' && method === 'POST') {
        const roleId = Number(body.roleId || body.masterRoleId) || 1;
        const roleName = this.state.masterData['roles']?.find((r) => String(r.id) === String(roleId))?.name || 'Software Engineer';
        const expId = Number(body.experienceLevelId) || 1;
        const bpId = Number(body.blueprintId) || 1;

        const expLevel = this.state.masterData['experiencelevels']?.find((e) => String(e.id) === String(expId));
        const blueprint = MOCK_BLUEPRINTS.find((b) => b.id === bpId) || MOCK_BLUEPRINTS[0];

        const minExp = expLevel?.minYears ?? 0;
        const maxExp = expLevel?.maxYears ?? 99;

        const locId = Number(body.hiringLocationId) || 1;
        const locName = this.state.masterData['hiringlocations']?.find((l) => String(l.id) === String(locId))?.name || 'Pune Center (Hinjawadi)';
        const deptId = Number(body.departmentId) || 1;
        const deptName = this.state.masterData['departments']?.find((d) => String(d.id) === String(deptId))?.name || 'Engineering';

        const newId = this.state.vacancies.length + 1;
        const code = `VAC-2026-${100 + newId}`;
        const qrCodeStr = `WD-V2-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const isTechnicalTrack = blueprint?.code !== 'RULE-MCQ-ONLY';
        const isWalkin = (body.driveType || 'Walk-in Drive') === 'Walk-in Drive';

        const generatedRounds = isWalkin
          ? isTechnicalTrack
            ? [
                { id: newId * 10 + 1, roundNumber: 1, roundTitle: 'Round 1: Aptitude Assessment (Elimination)', roundType: 'Assessment' as const, durationMinutes: 30, passingScore: 70 },
                { id: newId * 10 + 2, roundNumber: 2, roundTitle: `Round 2: ${blueprint?.name || 'Technical Assessment'}`, roundType: 'Assessment' as const, durationMinutes: blueprint?.totalDurationMinutes || 85, passingScore: blueprint?.defaultPassingPercentage || 70 },
                { id: newId * 10 + 3, roundNumber: 3, roundTitle: 'Round 3: Technical Interview', roundType: 'Interview' as const, durationMinutes: 45, passingScore: 70 },
                { id: newId * 10 + 4, roundNumber: 4, roundTitle: 'Round 4: Director Final & Offer', roundType: 'Interview' as const, durationMinutes: 30, passingScore: 70 },
              ]
            : [
                { id: newId * 10 + 1, roundNumber: 1, roundTitle: 'Round 1: Standard Domain & Aptitude Assessment', roundType: 'Assessment' as const, durationMinutes: blueprint?.totalDurationMinutes || 30, passingScore: blueprint?.defaultPassingPercentage || 70 },
                { id: newId * 10 + 2, roundNumber: 2, roundTitle: 'Round 2: HR / Domain Interview', roundType: 'Interview' as const, durationMinutes: 45, passingScore: 70 },
                { id: newId * 10 + 3, roundNumber: 3, roundTitle: 'Round 3: Director Final & Offer', roundType: 'Interview' as const, durationMinutes: 30, passingScore: 70 },
              ]
          : [
              { id: newId * 10 + 1, roundNumber: 1, roundTitle: 'Round 1: HR Sourcing & Screening (Auto-Passed)', roundType: 'Assessment' as const, durationMinutes: 15, passingScore: 70 },
              { id: newId * 10 + 2, roundNumber: 2, roundTitle: `Round 2: ${blueprint?.name || 'Technical Assessment'}`, roundType: 'Assessment' as const, durationMinutes: blueprint?.totalDurationMinutes || 85, passingScore: blueprint?.defaultPassingPercentage || 70 },
              { id: newId * 10 + 3, roundNumber: 3, roundTitle: 'Round 3: Technical / Domain Interview', roundType: 'Interview' as const, durationMinutes: 45, passingScore: 70 },
              { id: newId * 10 + 4, roundNumber: 4, roundTitle: 'Round 4: Director Final & Offer', roundType: 'Interview' as const, durationMinutes: 30, passingScore: 70 },
            ];

        const newVac: MockVacancy = {
          id: newId,
          vacancyCode: code,
          title: roleName,
          role: roleName,
          department: deptName,
          employmentType: 'Full-Time Permanent',
          experience: `${minExp}-${maxExp} Years`,
          experienceYearsMin: minExp,
          experienceYearsMax: maxExp,
          hiringLocation: locName,
          testLocation: locName,
          workMode: 'Onsite',
          openingsCount: body.totalOpenings || 5,
          positionsCount: body.totalOpenings || 5,
          status: 'Open',
          driveType: body.driveType || 'Walk-in Drive',
          createdAt: new Date().toISOString().split('T')[0],
          closingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          assignedRecruiter: 'AI Recruitment Engine',
          hiringManager: 'Technical Director',
          appliedCount: 0,
          assessmentCount: 0,
          interviewCount: 0,
          offeredCount: 0,
          joinedCount: 0,
          pipelineFlows: [
            {
              id: newId,
              flowName: 'Autonomous Flow v2',
              isDefault: true,
              version: 2,
              rounds: generatedRounds,
            },
          ],
        };

        this.state.vacancies.unshift(newVac);
        this.saveState();

        const result = {
          vacancyId: newId,
          vacancyCode: code,
          title: newVac.title,
          profileName: expLevel?.name || 'Fresher (0-1 Years)',
          departmentName: deptName,
          hiringLocationName: locName,
          totalOpenings: newVac.positionsCount,
          minExperienceYears: minExp,
          maxExperienceYears: maxExp,
          passingPercentage: blueprint?.defaultPassingPercentage || 70,
          questionPaperTitle: `${roleName} - ${blueprint?.name || 'Assessment Track'}`,
          totalQuestions: blueprint?.totalQuestions || 20,
          durationMinutes: blueprint?.totalDurationMinutes || 30,
          qrCodeId: newId * 100,
          qrCodeString: qrCodeStr,
          registrationUrl: `http://localhost:3000/apply/${qrCodeStr}`,
          qrCodeDataUrl: `/api/v2/qrcodes/vacancy/${newId}`,
        };

        return { data: this.envelope(result, '⚡ Autonomous recruitment drive launched successfully') };
      }

      if (url === '/v2/exams/temp-pass' && method === 'POST') {
        const nextNum = Math.floor(1000 + Math.random() * 9000);
        const code = `CAN-2026-${nextNum}`;
        const pass = String(Math.floor(1000 + Math.random() * 9000));
        const res = {
          candidateCode: code,
          passcode: pass,
          candidateName: body.candidateName || 'Spot Candidate',
          roleName: 'Software Engineer',
          examUrl: `http://localhost:3000/exam?code=${code}&pass=${pass}`,
          expiresAtUtc: new Date(Date.now() + 24 * 3600000).toISOString(),
          validityHours: 24,
        };
        return { data: this.envelope(res, 'Temporary spot exam pass generated') };
      }

      if (url === '/v2/exams/batch-answers' && method === 'POST') {
        const count = Array.isArray(body.answers) ? body.answers.length : 1;
        return {
          data: this.envelope(
            {
              syncedCount: count,
              serverSyncedAtUtc: new Date().toISOString(),
              sessionStatus: 'InProgress',
            },
            'Offline answers synced'
          ),
        };
      }

      if (url.startsWith('/v2/exams/') && url.includes('/auto-grade-publish') && method === 'POST') {
        const sessionId = Number(url.split('/')[3]) || 1;
        return {
          data: this.envelope(
            {
              candidateExamSessionId: sessionId,
              resultStatus: 'Pass',
              totalScore: 18,
              totalMarks: 20,
              percentage: 90,
              advancedToNextRound: true,
              nextRoundTitle: 'Technical Interview',
              nextRoundExamPasscode: null,
              candidateStatus: 'In-Progress',
            },
            'Assessment auto-evaluated and published'
          ),
        };
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
