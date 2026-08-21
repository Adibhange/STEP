import ExcelJS from 'exceljs';

export interface CandidateExportOptions {
  filenamePrefix?: string;
  vacancyContext?: {
    code?: string;
    title?: string;
    role?: string;
    driveType?: string;
    department?: string;
    location?: string;
    openings?: number;
    passingPercentage?: number;
  };
}

/**
 * STEP Enterprise ATS — Multi-Sheet V2 Candidate Excel Export Engine
 * Generates an executive workbook with 4 specialized worksheets:
 *   1. 📊 Executive Dashboard & KPIs
 *   2. 👥 Master Candidate Roster
 *   3. 🧪 V2 Assessment & Exam Telemetry
 *   4. 🔄 Pipeline & Evaluation History
 */
export async function exportCandidatesToExcel(
  candidates: any[],
  filenamePrefixOrOptions: string | CandidateExportOptions = 'STEP_Candidates_Export'
): Promise<void> {
  const options: CandidateExportOptions =
    typeof filenamePrefixOrOptions === 'string'
      ? { filenamePrefix: filenamePrefixOrOptions }
      : filenamePrefixOrOptions;

  const prefix = options.filenamePrefix || 'STEP_Recruitment_Report';
  const vacancy = options.vacancyContext;
  const dateStr = new Date().toISOString().split('T')[0];

  const wb = new ExcelJS.Workbook();
  wb.creator = 'STEP Enterprise ATS — Sthapatya 2026';
  wb.created = new Date();
  wb.modified = new Date();

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. 📊 EXECUTIVE DASHBOARD & KPI SUMMARY SHEET
  // ─────────────────────────────────────────────────────────────────────────────
  const kpiSheet = wb.addWorksheet('Executive Dashboard', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF312E81' } }, // Indigo
  });

  kpiSheet.columns = [
    { width: 4 },
    { width: 32 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
  ];

  // Title Banner
  kpiSheet.mergeCells('B2:F2');
  const titleCell = kpiSheet.getCell('B2');
  titleCell.value = 'STEP ENTERPRISE ATS — RECRUITMENT & ASSESSMENT REPORT (V2)';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF312E81' }, // Deep Indigo
  };
  kpiSheet.getRow(2).height = 36;

  // Metadata Sub-banner
  kpiSheet.mergeCells('B3:F3');
  const subTitleCell = kpiSheet.getCell('B3');
  subTitleCell.value = `Export Generated: ${new Date().toLocaleString()} | Total Candidates in Dataset: ${candidates.length}`;
  subTitleCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FFCBD5E1' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E1B4B' }, // Darker Indigo
  };
  kpiSheet.getRow(3).height = 20;

  // Overview Table
  kpiSheet.getCell('B5').value = '1. HIRING DRIVE & VACANCY METADATA';
  kpiSheet.getCell('B5').font = { bold: true, color: { argb: 'FF312E81' }, size: 11 };

  const metaHeaders = ['Parameter', 'Value', 'Parameter', 'Value'];
  const metaHeaderRow = kpiSheet.getRow(6);
  ['B', 'C', 'D', 'E'].forEach((col, idx) => {
    const c = kpiSheet.getCell(`${col}6`);
    c.value = metaHeaders[idx];
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
    c.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  metaHeaderRow.height = 22;

  const targetRole = vacancy?.role || vacancy?.title || (candidates[0]?.vacancyTitle) || 'Multi-Role Dataset';
  const vacancyCode = vacancy?.code || (candidates[0]?.vacancyCode) || 'ALL-ROLES';
  const driveType = vacancy?.driveType || (candidates[0]?.registrationChannel) || 'Walk-in / Direct';
  const hiringLocation = vacancy?.location || (candidates[0]?.currentLocation) || 'Pune HQ';
  const totalOpenings = vacancy?.openings || 5;
  const passingCutoff = vacancy?.passingPercentage || 70;

  const metaDataRows = [
    ['Target Role / Title', targetRole, 'Drive Model', driveType],
    ['Vacancy Code', vacancyCode, 'Primary Location', hiringLocation],
    ['Total Open Positions', totalOpenings, 'Default Passing Cutoff', `${passingCutoff}%`],
    ['Total Registered Candidates', candidates.length, 'Report Export Date', dateStr],
  ];

  metaDataRows.forEach((r, idx) => {
    const rowNum = 7 + idx;
    kpiSheet.getCell(`B${rowNum}`).value = r[0];
    kpiSheet.getCell(`B${rowNum}`).font = { bold: true, color: { argb: 'FF475569' }, size: 9.5 };
    kpiSheet.getCell(`C${rowNum}`).value = r[1];
    kpiSheet.getCell(`C${rowNum}`).font = { size: 9.5 };

    kpiSheet.getCell(`D${rowNum}`).value = r[2];
    kpiSheet.getCell(`D${rowNum}`).font = { bold: true, color: { argb: 'FF475569' }, size: 9.5 };
    kpiSheet.getCell(`E${rowNum}`).value = r[3];
    kpiSheet.getCell(`E${rowNum}`).font = { size: 9.5 };
    kpiSheet.getRow(rowNum).height = 19;
  });

  // Funnel Calculations
  let assessmentStageCount = 0;
  let passedAssessmentCount = 0;
  let failedAssessmentCount = 0;
  let interviewStageCount = 0;
  let offeredCount = 0;
  let rejectedCount = 0;
  let inProgressCount = 0;

  let totalScoreSum = 0;
  let scoredCount = 0;

  let fresherCount = 0;
  let juniorCount = 0;
  let midCount = 0;
  let seniorCount = 0;
  let leadCount = 0;

  candidates.forEach((c) => {
    const stage = (c.currentStage || '').toLowerCase();
    const status = (c.status || '').toLowerCase();
    const expYears = Number(c.totalExperienceYears ?? 0);

    if (expYears <= 1) fresherCount++;
    else if (expYears <= 3) juniorCount++;
    else if (expYears <= 5) midCount++;
    else if (expYears <= 8) seniorCount++;
    else leadCount++;

    if (status.includes('offer') || status.includes('joined')) {
      offeredCount++;
    } else if (status.includes('reject') || status.includes('failed')) {
      rejectedCount++;
    } else {
      inProgressCount++;
    }

    if (stage.includes('interview') || stage.includes('f2f') || stage.includes('director')) {
      interviewStageCount++;
    } else {
      assessmentStageCount++;
    }

    // Check pipeline history scores
    const history = c.pipelineProgressHistory || c.pipelineProgress || c.progressHistory || [];
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        if (h.scoreObtained !== null && h.scoreObtained !== undefined && !isNaN(Number(h.scoreObtained))) {
          totalScoreSum += Number(h.scoreObtained);
          scoredCount++;
        }
        if (String(h.status).toLowerCase() === 'passed') passedAssessmentCount++;
        if (String(h.status).toLowerCase() === 'failed') failedAssessmentCount++;
      });
    }
  });

  const avgScore = scoredCount > 0 ? (totalScoreSum / scoredCount).toFixed(1) : 'N/A';

  // Funnel Section
  kpiSheet.getCell('B12').value = '2. RECRUITMENT FUNNEL & CONVERSION ANALYTICS';
  kpiSheet.getCell('B12').font = { bold: true, color: { argb: 'FF312E81' }, size: 11 };

  const funnelHeaders = ['Stage / Milestone', 'Candidates Count', 'Conversion Rate %', 'Stage Status / Notes'];
  ['B', 'C', 'D', 'E'].forEach((col, idx) => {
    const c = kpiSheet.getCell(`${col}13`);
    c.value = funnelHeaders[idx];
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }; // Emerald
    c.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  kpiSheet.getRow(13).height = 22;

  const total = candidates.length || 1;
  const funnelRows = [
    ['1. Total Registered (Roster Ingestion)', candidates.length, '100.0%', 'Walk-in QR / Direct Ingested'],
    ['2. In Assessment Pipeline (R1/R2)', assessmentStageCount, `${((assessmentStageCount / total) * 100).toFixed(1)}%`, 'Aptitude & Technical Sandbox'],
    ['3. Advanced to Interview (R3/R4)', interviewStageCount, `${((interviewStageCount / total) * 100).toFixed(1)}%`, 'Technical F2F & Director Interview'],
    ['4. Selected & Offer Released', offeredCount, `${((offeredCount / total) * 100).toFixed(1)}%`, 'Official Offer Dispatched'],
    ['5. Active In-Progress Candidates', inProgressCount, `${((inProgressCount / total) * 100).toFixed(1)}%`, 'Currently in Pipeline Evaluation'],
    ['6. Rejected / Did Not Qualify', rejectedCount, `${((rejectedCount / total) * 100).toFixed(1)}%`, 'Assessment or Interview Knockout'],
  ];

  funnelRows.forEach((r, idx) => {
    const rowNum = 14 + idx;
    kpiSheet.getCell(`B${rowNum}`).value = r[0];
    kpiSheet.getCell(`C${rowNum}`).value = r[1];
    kpiSheet.getCell(`C${rowNum}`).alignment = { horizontal: 'center' };
    kpiSheet.getCell(`D${rowNum}`).value = r[2];
    kpiSheet.getCell(`D${rowNum}`).alignment = { horizontal: 'center' };
    kpiSheet.getCell(`E${rowNum}`).value = r[3];
    kpiSheet.getRow(rowNum).height = 19;
  });

  // Experience Distribution Section
  kpiSheet.getCell('B21').value = '3. TALENT EXPERIENCE TIER DISTRIBUTION';
  kpiSheet.getCell('B21').font = { bold: true, color: { argb: 'FF312E81' }, size: 11 };

  const expHeaders = ['Experience Tier', 'Experience Range', 'Candidate Count', 'Distribution %'];
  ['B', 'C', 'D', 'E'].forEach((col, idx) => {
    const c = kpiSheet.getCell(`${col}22`);
    c.value = expHeaders[idx];
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } }; // Violet
    c.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  kpiSheet.getRow(22).height = 22;

  const expRows = [
    ['Fresher (EXP-0)', '0 – 1 Years', fresherCount, `${((fresherCount / total) * 100).toFixed(1)}%`],
    ['Junior Specialist (EXP-1-3)', '1 – 3 Years', juniorCount, `${((juniorCount / total) * 100).toFixed(1)}%`],
    ['Mid-Level Engineer (EXP-3-5)', '3 – 5 Years', midCount, `${((midCount / total) * 100).toFixed(1)}%`],
    ['Senior Lead (EXP-5-8)', '5 – 8 Years', seniorCount, `${((seniorCount / total) * 100).toFixed(1)}%`],
    ['Principal / Architect (EXP-8+)', '8+ Years', leadCount, `${((leadCount / total) * 100).toFixed(1)}%`],
  ];

  expRows.forEach((r, idx) => {
    const rowNum = 23 + idx;
    kpiSheet.getCell(`B${rowNum}`).value = r[0];
    kpiSheet.getCell(`C${rowNum}`).value = r[1];
    kpiSheet.getCell(`D${rowNum}`).value = r[2];
    kpiSheet.getCell(`D${rowNum}`).alignment = { horizontal: 'center' };
    kpiSheet.getCell(`E${rowNum}`).value = r[3];
    kpiSheet.getCell(`E${rowNum}`).alignment = { horizontal: 'center' };
    kpiSheet.getRow(rowNum).height = 19;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. 👥 MASTER CANDIDATE ROSTER SHEET
  // ─────────────────────────────────────────────────────────────────────────────
  const rosterSheet = wb.addWorksheet('Candidate Roster', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: true }],
    properties: { tabColor: { argb: 'FF1E1B4B' } },
  });

  rosterSheet.columns = [
    { header: 'Candidate Code', key: 'candidateCode', width: 17 },
    { header: 'Full Name', key: 'name', width: 25 },
    { header: 'Email Address', key: 'email', width: 28 },
    { header: 'Phone Number', key: 'phone', width: 16 },
    { header: 'Target Role', key: 'vacancyTitle', width: 26 },
    { header: 'Experience Tier', key: 'experienceTier', width: 20 },
    { header: 'Total Exp (Yrs)', key: 'totalExperienceYears', width: 16 },
    { header: 'Current CTC (₹ LPA)', key: 'currentCTC', width: 19 },
    { header: 'Expected CTC (₹ LPA)', key: 'expectedCTC', width: 20 },
    { header: 'Notice Period (Days)', key: 'noticePeriodDays', width: 20 },
    { header: 'Location / City', key: 'currentLocation', width: 18 },
    { header: 'Highest Qualification', key: 'highestQualification', width: 24 },
    { header: 'Registration Channel', key: 'registrationChannel', width: 22 },
    { header: 'Referral Name', key: 'referralEmployeeName', width: 22 },
    { header: 'Current Stage', key: 'currentStage', width: 28 },
    { header: 'Overall Status', key: 'status', width: 16 },
    { header: 'Registration Date', key: 'appliedDate', width: 18 },
  ];

  const rosterHeader = rosterSheet.getRow(1);
  rosterHeader.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' }, size: 10.5 };
  rosterHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF312E81' }, // Deep Indigo
  };
  rosterHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  rosterHeader.height = 26;

  candidates.forEach((c) => {
    const expYears = Number(c.totalExperienceYears ?? 0);
    let expTier = 'Fresher (0-1 Yrs)';
    if (expYears > 8) expTier = 'Principal (8+ Yrs)';
    else if (expYears > 5) expTier = 'Senior (5-8 Yrs)';
    else if (expYears > 3) expTier = 'Mid-Level (3-5 Yrs)';
    else if (expYears > 1) expTier = 'Junior (1-3 Yrs)';

    const row = rosterSheet.addRow({
      candidateCode: c.candidateCode || c.code || `CND-${c.id}`,
      name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Candidate',
      email: c.email || 'N/A',
      phone: c.phone || 'N/A',
      vacancyTitle: c.vacancyTitle || c.vacancy?.title || targetRole,
      experienceTier: c.experienceTier || expTier,
      totalExperienceYears: expYears,
      currentCTC: c.currentCTC ? Number(c.currentCTC) : '—',
      expectedCTC: c.expectedCTC ? Number(c.expectedCTC) : '—',
      noticePeriodDays: c.noticePeriodDays !== undefined && c.noticePeriodDays !== null ? Number(c.noticePeriodDays) : '—',
      currentLocation: c.currentLocation || 'N/A',
      highestQualification: c.highestQualification || 'N/A',
      registrationChannel: c.registrationChannel || driveType,
      referralEmployeeName: c.referralEmployeeName || '—',
      currentStage: c.currentStage || 'Screening',
      status: c.status || 'In-Progress',
      appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : c.appliedDate || dateStr,
    });

    row.height = 21;
    row.alignment = { vertical: 'middle' };

    // Format numbers
    const statusCell = row.getCell('status');
    const statusVal = String(statusCell.value || '').toLowerCase();
    if (statusVal.includes('passed') || statusVal.includes('offer') || statusVal.includes('accept') || statusVal.includes('hired')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Soft green
      statusCell.font = { bold: true, color: { argb: 'FF166534' } };
    } else if (statusVal.includes('progress') || statusVal.includes('assigned') || statusVal.includes('sched')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Soft amber
      statusCell.font = { bold: true, color: { argb: 'FF92400E' } };
    } else if (statusVal.includes('failed') || statusVal.includes('reject') || statusVal.includes('decline')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Soft red
      statusCell.font = { bold: true, color: { argb: 'FF991B1B' } };
    }
  });

  rosterSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 17 },
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. 🧪 V2 ASSESSMENT & EXAM TELEMETRY SHEET
  // ─────────────────────────────────────────────────────────────────────────────
  const telemetrySheet = wb.addWorksheet('Assessment Telemetry', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: true }],
    properties: { tabColor: { argb: 'FF065F46' } }, // Emerald
  });

  telemetrySheet.columns = [
    { header: 'Candidate Code', key: 'candidateCode', width: 17 },
    { header: 'Candidate Name', key: 'candidateName', width: 25 },
    { header: 'Target Role', key: 'role', width: 24 },
    { header: 'Assessment Track / Blueprint', key: 'blueprintName', width: 32 },
    { header: 'Blueprint Code', key: 'blueprintCode', width: 18 },
    { header: 'Round Title', key: 'roundTitle', width: 26 },
    { header: 'Session Status', key: 'sessionStatus', width: 16 },
    { header: 'Total Marks', key: 'totalMarks', width: 14 },
    { header: 'Marks Obtained', key: 'scoreObtained', width: 16 },
    { header: 'Score %', key: 'scorePercentage', width: 14 },
    { header: 'Cutoff %', key: 'cutoffPercentage', width: 14 },
    { header: 'Result Status', key: 'resultStatus', width: 16 },
    { header: 'Started At', key: 'startedAt', width: 18 },
    { header: 'Submitted At', key: 'completedAt', width: 18 },
    { header: 'Duration (Mins)', key: 'durationMins', width: 16 },
    { header: 'Tab Switch Warnings', key: 'tabSwitchWarnings', width: 20 },
    { header: 'Integrity Score %', key: 'integrityScore', width: 18 },
    { header: 'Exam Passcode / Token', key: 'examPasscode', width: 22 },
  ];

  const telemetryHeader = telemetrySheet.getRow(1);
  telemetryHeader.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' }, size: 10.5 };
  telemetryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF065F46' }, // Deep Emerald
  };
  telemetryHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  telemetryHeader.height = 26;

  candidates.forEach((c) => {
    const candCode = c.candidateCode || c.code || `CND-${c.id}`;
    const candName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Candidate';
    const roleName = c.vacancyTitle || c.vacancy?.title || targetRole;
    const history = c.pipelineProgressHistory || c.pipelineProgress || c.progressHistory || [];

    const examRounds = Array.isArray(history)
      ? history.filter((h: any) => String(h.roundType || '').toLowerCase() === 'assessment' || h.candidateExamSessionId)
      : [];

    if (examRounds.length > 0) {
      examRounds.forEach((round: any) => {
        const score = round.scoreObtained !== null && round.scoreObtained !== undefined ? Number(round.scoreObtained) : null;
        const totalMarks = round.totalMarks || 30;
        const scorePct = score !== null ? `${score}%` : '—';
        const cutoff = round.passingPercentage || passingCutoff;
        const passed = score !== null && score >= cutoff;

        const row = telemetrySheet.addRow({
          candidateCode: candCode,
          candidateName: candName,
          role: roleName,
          blueprintName: round.blueprintName || 'Software Engineering Technical Track',
          blueprintCode: round.blueprintCode || 'RULE-TECH-ENG',
          roundTitle: round.roundTitle || 'Aptitude & Technical Challenge',
          sessionStatus: round.sessionStatus || round.status || 'Completed',
          totalMarks: totalMarks,
          scoreObtained: score !== null ? score : '—',
          scorePercentage: scorePct,
          cutoffPercentage: `${cutoff}%`,
          resultStatus: round.status || (score !== null ? (passed ? 'Passed ✓' : 'Failed ✕') : 'Pending'),
          startedAt: round.startedAt ? new Date(round.startedAt).toLocaleString() : '—',
          completedAt: round.completedAt ? new Date(round.completedAt).toLocaleString() : '—',
          durationMins: round.durationMinutes || 30,
          tabSwitchWarnings: round.tabSwitchWarnings ?? 0,
          integrityScore: round.integrityScore ? `${round.integrityScore}%` : '100%',
          examPasscode: round.testPasscode || round.sessionToken || `PAS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        });

        row.height = 21;
        row.alignment = { vertical: 'middle' };

        const resCell = row.getCell('resultStatus');
        const resVal = String(resCell.value || '').toLowerCase();
        if (resVal.includes('passed')) {
          resCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          resCell.font = { bold: true, color: { argb: 'FF166534' } };
        } else if (resVal.includes('failed')) {
          resCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          resCell.font = { bold: true, color: { argb: 'FF991B1B' } };
        }
      });
    } else {
      // Single fallback row
      const row = telemetrySheet.addRow({
        candidateCode: candCode,
        candidateName: candName,
        role: roleName,
        blueprintName: 'Standard Assessment Track',
        blueprintCode: 'RULE-MCQ-ONLY',
        roundTitle: c.currentStage || 'Round 1: General Assessment',
        sessionStatus: c.status || 'Assigned',
        totalMarks: 30,
        scoreObtained: '—',
        scorePercentage: '—',
        cutoffPercentage: `${passingCutoff}%`,
        resultStatus: c.status || 'Pending',
        startedAt: '—',
        completedAt: '—',
        durationMins: 30,
        tabSwitchWarnings: 0,
        integrityScore: '100%',
        examPasscode: '—',
      });
      row.height = 21;
      row.alignment = { vertical: 'middle' };
    }
  });

  telemetrySheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 18 },
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. 🔄 GRANULAR PIPELINE & EVALUATION HISTORY SHEET
  // ─────────────────────────────────────────────────────────────────────────────
  const pipelineSheet = wb.addWorksheet('Pipeline Evaluation History', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: true }],
    properties: { tabColor: { argb: 'FF5B21B6' } }, // Violet
  });

  pipelineSheet.columns = [
    { header: 'Candidate Code', key: 'candidateCode', width: 17 },
    { header: 'Candidate Name', key: 'candidateName', width: 25 },
    { header: 'Round #', key: 'roundNumber', width: 12 },
    { header: 'Round Title', key: 'roundTitle', width: 30 },
    { header: 'Round Type', key: 'roundType', width: 16 },
    { header: 'Stage Status', key: 'status', width: 16 },
    { header: 'Score / Rating', key: 'scoreObtained', width: 16 },
    { header: 'Interviewer / Evaluator', key: 'interviewerName', width: 24 },
    { header: 'Scheduled Date', key: 'scheduledDate', width: 18 },
    { header: 'Completed Date', key: 'completedAt', width: 18 },
    { header: 'Interviewer Remarks & Technical Feedback', key: 'remarks', width: 45 },
    { header: 'Offer Status', key: 'offerStatus', width: 16 },
    { header: 'Offered CTC (₹ LPA)', key: 'offeredCTC', width: 20 },
    { header: 'Joining Date', key: 'joiningDate', width: 16 },
  ];

  const pipelineHeader = pipelineSheet.getRow(1);
  pipelineHeader.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' }, size: 10.5 };
  pipelineHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF5B21B6' }, // Deep Violet
  };
  pipelineHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  pipelineHeader.height = 26;

  candidates.forEach((c) => {
    const candCode = c.candidateCode || c.code || `CND-${c.id}`;
    const candName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Candidate';
    const history = c.pipelineProgressHistory || c.pipelineProgress || c.progressHistory || [];

    if (Array.isArray(history) && history.length > 0) {
      history.forEach((round: any) => {
        const row = pipelineSheet.addRow({
          candidateCode: candCode,
          candidateName: candName,
          roundNumber: round.roundNumber || 1,
          roundTitle: round.roundTitle || 'Round Evaluation',
          roundType: round.roundType || 'Assessment',
          status: round.status || 'Pending',
          scoreObtained: round.scoreObtained !== null && round.scoreObtained !== undefined ? `${round.scoreObtained}%` : '—',
          interviewerName: round.interviewerName || (round.roundType === 'Interview' ? 'Technical Panel' : 'Auto-Evaluator'),
          scheduledDate: round.scheduledTestDate ? new Date(round.scheduledTestDate).toISOString().split('T')[0] : '—',
          completedAt: round.completedAt ? new Date(round.completedAt).toISOString().split('T')[0] : '—',
          remarks: round.remarks || 'No detailed evaluation notes recorded.',
          offerStatus: c.offerStatus || '—',
          offeredCTC: c.offeredCTC ? Number(c.offeredCTC) : '—',
          joiningDate: c.joiningDate ? new Date(c.joiningDate).toISOString().split('T')[0] : '—',
        });

        row.height = 21;
        row.alignment = { vertical: 'middle' };

        const statusCell = row.getCell('status');
        const stVal = String(statusCell.value || '').toLowerCase();
        if (stVal.includes('passed') || stVal.includes('offer')) {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          statusCell.font = { bold: true, color: { argb: 'FF166534' } };
        } else if (stVal.includes('failed') || stVal.includes('reject')) {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          statusCell.font = { bold: true, color: { argb: 'FF991B1B' } };
        } else if (stVal.includes('progress') || stVal.includes('pending')) {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          statusCell.font = { bold: true, color: { argb: 'FF92400E' } };
        }
      });
    } else {
      const row = pipelineSheet.addRow({
        candidateCode: candCode,
        candidateName: candName,
        roundNumber: 1,
        roundTitle: c.currentStage || 'Stage 1: Profile Screening',
        roundType: 'Assessment',
        status: c.status || 'Assigned',
        scoreObtained: '—',
        interviewerName: 'Auto-Evaluator',
        scheduledDate: '—',
        completedAt: '—',
        remarks: 'Candidate registered and queued in recruitment pipeline.',
        offerStatus: c.offerStatus || '—',
        offeredCTC: '—',
        joiningDate: '—',
      });
      row.height = 21;
      row.alignment = { vertical: 'middle' };
    }
  });

  pipelineSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 14 },
  };

  // Write binary buffer and download in browser
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prefix}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a pre-formatted Excel template for candidate bulk ingestion
 */
export async function downloadCandidateBulkTemplate(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const dateStr = new Date().toISOString().split('T')[0];

  const sheet = wb.addWorksheet('Candidate Ingestion');
  sheet.columns = [
    { header: 'Full Name*', key: 'name', width: 24 },
    { header: 'Email Address*', key: 'email', width: 28 },
    { header: 'Mobile Number*', key: 'phone', width: 18 },
    { header: 'Target Role / Vacancy', key: 'role', width: 26 },
    { header: 'Total Exp (Years)', key: 'totalExp', width: 18 },
    { header: 'Current CTC (LPA)', key: 'currentCTC', width: 18 },
    { header: 'Expected CTC (LPA)', key: 'expectedCTC', width: 18 },
    { header: 'Notice Period (Days)', key: 'noticePeriod', width: 20 },
    { header: 'Current City', key: 'city', width: 18 },
    { header: 'Highest Qualification', key: 'qualification', width: 22 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4338CA' }, // Indigo-700
  };
  headerRow.height = 24;

  const sampleRows = [
    {
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      phone: '9876543210',
      role: 'Senior Full Stack Engineer',
      totalExp: 4.5,
      currentCTC: 14.5,
      expectedCTC: 18.0,
      noticePeriod: 30,
      city: 'Pune',
      qualification: 'B.Tech Computer Science',
    },
    {
      name: 'Pooja Deshmukh',
      email: 'pooja.deshmukh@example.com',
      phone: '9812345678',
      role: 'Backend Engineer (.NET)',
      totalExp: 2.0,
      currentCTC: 8.0,
      expectedCTC: 11.5,
      noticePeriod: 15,
      city: 'Mumbai',
      qualification: 'MCA Computer Applications',
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      phone: '9900112233',
      role: 'QA Automation Engineer',
      totalExp: 3.2,
      currentCTC: 10.0,
      expectedCTC: 13.5,
      noticePeriod: 45,
      city: 'Bengaluru',
      qualification: 'B.E Information Technology',
    },
  ];

  sampleRows.forEach((r) => {
    const row = sheet.addRow(r);
    row.height = 20;
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STEP_Candidate_Ingestion_Template_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ParsedCandidateItem {
  name: string;
  email: string;
  phone: string;
  role: string;
  exp: string;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  city: string;
  qualification?: string;
  status: 'valid' | 'warning_phone' | 'warning_email' | 'warning_missing';
  statusMessage?: string;
}

/**
 * Parses an uploaded Excel spreadsheet (.xlsx or .xls) into validated candidate preview rows
 */
export async function parseCandidatesFromExcel(file: File): Promise<{
  rows: ParsedCandidateItem[];
  totalValid: number;
  totalWarnings: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer);

  const sheet = wb.worksheets[0];
  if (!sheet) {
    throw new Error('The uploaded Excel workbook contains no worksheets.');
  }

  const rows: ParsedCandidateItem[] = [];
  let totalValid = 0;
  let totalWarnings = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip headers

    const rawName = String(row.getCell(1).value || '').trim();
    const rawEmail = String(row.getCell(2).value || '').trim();
    const rawPhone = String(row.getCell(3).value || '').replace(/\D/g, '');
    const rawRole = String(row.getCell(4).value || '').trim();
    const rawExp = String(row.getCell(5).value || '').trim();
    const rawCurrCTC = Number(row.getCell(6).value) || undefined;
    const rawExpCTC = Number(row.getCell(7).value) || undefined;
    const rawNotice = Number(row.getCell(8).value) || undefined;
    const rawCity = String(row.getCell(9).value || '').trim();
    const rawQual = String(row.getCell(10).value || '').trim();

    if (!rawName && !rawEmail && !rawPhone) return; // Skip blank rows

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);
    const isPhoneValid = rawPhone.length >= 10;

    let status: ParsedCandidateItem['status'] = 'valid';
    let statusMessage = 'Ready for Ingestion';

    if (!rawName || !rawEmail) {
      status = 'warning_missing';
      statusMessage = 'Missing Required Name or Email';
      totalWarnings++;
    } else if (!isEmailValid) {
      status = 'warning_email';
      statusMessage = 'Invalid Email Format';
      totalWarnings++;
    } else if (!isPhoneValid && rawPhone.length > 0) {
      status = 'warning_phone';
      statusMessage = 'Incomplete Mobile Number';
      totalWarnings++;
    } else {
      totalValid++;
    }

    rows.push({
      name: rawName || 'Unnamed Candidate',
      email: rawEmail || 'no-email@provided.com',
      phone: rawPhone || 'N/A',
      role: rawRole || 'General Applicant',
      exp: rawExp ? `${rawExp} Yrs` : '0 Yrs',
      currentCTC: rawCurrCTC,
      expectedCTC: rawExpCTC,
      noticePeriod: rawNotice,
      city: rawCity || 'Remote / Unspecified',
      qualification: rawQual || 'N/A',
      status,
      statusMessage,
    });
  });

  return { rows, totalValid, totalWarnings };
}
