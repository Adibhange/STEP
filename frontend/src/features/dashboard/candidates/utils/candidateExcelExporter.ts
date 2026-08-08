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
