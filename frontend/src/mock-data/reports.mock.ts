export interface MockRecruitmentFunnelData {
  totalCandidates: number;
  totalApplications: number;
  appliedCount: number;
  screeningCount: number;
  assessmentPassed: number;
  inProgressCount: number;
  interviewCleared: number;
  offeredCount: number;
  offersIssued: number;
  onHoldCount: number;
  withdrawnCount: number;
  rejectedCount: number;
  joinedCount: number;
  openVacancies: number;
}

export function computeMockRecruitmentFunnel(candidates: any[], vacancies: any[]): MockRecruitmentFunnelData {
  const totalCandidates = candidates.length;
  const appliedCount = candidates.filter((c) => c.currentStage === 'Applied' || c.currentStage === 'Screening').length;
  const inProgressCount = candidates.filter((c) => c.status === 'In-Progress').length;
  const assessmentPassed = candidates.filter((c) =>
    (c.pipelineProgress || []).some((p: any) => p.roundType === 'Assessment' && p.status === 'Passed')
  ).length;
  const interviewCleared = candidates.filter((c) =>
    (c.pipelineProgress || []).some((p: any) => p.roundType === 'Interview' && p.status === 'Passed')
  ).length;
  const offeredCount = candidates.filter((c) => c.status === 'Offered').length;
  const joinedCount = candidates.filter((c) => c.status === 'Hired' || c.status === 'Joined').length;
  const onHoldCount = candidates.filter((c) => c.status === 'On Hold').length;
  const rejectedCount = candidates.filter((c) => c.status === 'Rejected').length;
  const openVacancies = vacancies.filter((v) => v.status === 'Open').length;

  return {
    totalCandidates: totalCandidates || 49,
    totalApplications: totalCandidates || 49,
    appliedCount: appliedCount || 14,
    screeningCount: appliedCount || 14,
    assessmentPassed: assessmentPassed || 28,
    inProgressCount: inProgressCount || 19,
    interviewCleared: interviewCleared || 15,
    offeredCount: offeredCount || 7,
    offersIssued: offeredCount || 7,
    onHoldCount: onHoldCount || 3,
    withdrawnCount: 2,
    rejectedCount: rejectedCount || 12,
    joinedCount: joinedCount || 5,
    openVacancies: openVacancies || 4,
  };
}
