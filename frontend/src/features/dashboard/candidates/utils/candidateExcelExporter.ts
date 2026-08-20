import ExcelJS from 'exceljs';

export async function exportCandidatesToExcel(candidates: any[], filenamePrefix: string = 'STEP_Candidates_Export'): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Master Candidates Sheet
  const masterSheet = wb.addWorksheet('Candidates Summary');
  masterSheet.columns = [
    { header: 'Candidate Code', key: 'candidateCode', width: 16 },
    { header: 'Full Name', key: 'name', width: 24 },
    { header: 'Email Address', key: 'email', width: 28 },
    { header: 'Phone Number', key: 'phone', width: 16 },
    { header: 'Vacancy / Role', key: 'vacancyTitle', width: 26 },
    { header: 'Current Stage', key: 'currentStage', width: 28 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Registration Channel', key: 'registrationChannel', width: 22 },
    { header: 'Total Exp (Years)', key: 'totalExperienceYears', width: 18 },
    { header: 'Current CTC (LPA)', key: 'currentCTC', width: 18 },
    { header: 'Expected CTC (LPA)', key: 'expectedCTC', width: 18 },
    { header: 'Notice Period (Days)', key: 'noticePeriodDays', width: 20 },
    { header: 'Location', key: 'currentLocation', width: 18 },
    { header: 'Highest Qualification', key: 'highestQualification', width: 22 },
    { header: 'Applied Date', key: 'appliedDate', width: 16 },
  ];

  const headerRow = masterSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3730A3' }, // Indigo-800
  };
  headerRow.height = 24;

  candidates.forEach((c) => {
    const row = masterSheet.addRow({
      candidateCode: c.candidateCode || c.code || `CND-${c.id}`,
      name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A',
      email: c.email || 'N/A',
      phone: c.phone || 'N/A',
      vacancyTitle: c.vacancyTitle || c.vacancy?.title || 'N/A',
      currentStage: c.currentStage || 'N/A',
      status: c.status || 'N/A',
      registrationChannel: c.registrationChannel || 'Direct',
      totalExperienceYears: c.totalExperienceYears ?? 0,
      currentCTC: c.currentCTC ? Number(c.currentCTC) : 'N/A',
      expectedCTC: c.expectedCTC ? Number(c.expectedCTC) : 'N/A',
      noticePeriodDays: c.noticePeriodDays ?? 'N/A',
      currentLocation: c.currentLocation || 'N/A',
      highestQualification: c.highestQualification || 'N/A',
      appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : c.appliedDate || dateStr,
    });

    row.height = 20;
  });

  // 2. Granular Pipeline Round Details Sheet
  const detailsSheet = wb.addWorksheet('Pipeline Round Details');
  detailsSheet.columns = [
    { header: 'Candidate Code', key: 'candidateCode', width: 16 },
    { header: 'Candidate Name', key: 'candidateName', width: 24 },
    { header: 'Round Number', key: 'roundNumber', width: 14 },
    { header: 'Round Title', key: 'roundTitle', width: 28 },
    { header: 'Round Type', key: 'roundType', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Score / %', key: 'scoreObtained', width: 14 },
    { header: 'Scheduled Date', key: 'scheduledDate', width: 16 },
    { header: 'Test Mode', key: 'assessmentMode', width: 16 },
    { header: 'Evaluated Date', key: 'completedAt', width: 16 },
    { header: 'Remarks / Feedback', key: 'remarks', width: 35 },
  ];

  const detailHeaderRow = detailsSheet.getRow(1);
  detailHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  detailHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF065F46' }, // Emerald-800
  };
  detailHeaderRow.height = 24;

  candidates.forEach((c) => {
    const candCode = c.candidateCode || c.code || `CND-${c.id}`;
    const candName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A';
    const history = c.pipelineProgressHistory || c.progressHistory || [];

    if (Array.isArray(history) && history.length > 0) {
      history.forEach((round: any) => {
        const row = detailsSheet.addRow({
          candidateCode: candCode,
          candidateName: candName,
          roundNumber: round.roundNumber || 1,
          roundTitle: round.roundTitle || 'N/A',
          roundType: round.roundType || 'N/A',
          status: round.status || 'Pending',
          scoreObtained: round.scoreObtained !== null && round.scoreObtained !== undefined ? `${round.scoreObtained}%` : 'N/A',
          scheduledDate: round.scheduledTestDate ? new Date(round.scheduledTestDate).toISOString().split('T')[0] : 'N/A',
          assessmentMode: round.assessmentMode || 'N/A',
          completedAt: round.completedAt || round.evaluatedAt ? new Date(round.completedAt || round.evaluatedAt).toISOString().split('T')[0] : 'N/A',
          remarks: round.remarks || 'N/A',
        });
        row.height = 20;
      });
    } else {
      const row = detailsSheet.addRow({
        candidateCode: candCode,
        candidateName: candName,
        roundNumber: 1,
        roundTitle: c.currentStage || 'Screening',
        roundType: 'Assessment',
        status: c.status || 'Assigned',
        scoreObtained: 'N/A',
        scheduledDate: 'N/A',
        assessmentMode: 'N/A',
        completedAt: 'N/A',
        remarks: 'No granular history loaded',
      });
      row.height = 20;
    }
  });

  // Write binary buffer and download in browser
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${dateStr}.xlsx`;
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
