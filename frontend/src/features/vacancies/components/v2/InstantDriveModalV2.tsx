'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/design-system';
import {
  useGetMasterDataByCategoryQuery,
  useGetRoleHiringProfilesV2Query,
  useCreateInstantDriveV2Mutation,
  type RoleHiringProfileData,
  type InstantDriveResultData,
} from '@/store/services/api';
import { useAppDispatch, notifySuccess, notifyError } from '@/store';

interface InstantDriveModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onDriveCreated?: (drive: InstantDriveResultData) => void;
}

export const InstantDriveModalV2: React.FC<InstantDriveModalV2Props> = ({
  isOpen,
  onClose,
  onDriveCreated,
}) => {
  const dispatch = useAppDispatch();

  // Queries
  const { data: rolesRes, isLoading: isRolesLoading } = useGetMasterDataByCategoryQuery('roles', {
    skip: !isOpen,
  });
  const { data: locationsRes } = useGetMasterDataByCategoryQuery('hiringlocations', {
    skip: !isOpen,
  });
  const { data: departmentsRes } = useGetMasterDataByCategoryQuery('departments', {
    skip: !isOpen,
  });

  const roles = useMemo(() => rolesRes?.data || [], [rolesRes]);
  const hiringLocations = useMemo(() => locationsRes?.data || [], [locationsRes]);
  const departments = useMemo(() => departmentsRes?.data || [], [departmentsRes]);

  // Form State
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [selectedProfileId, setSelectedProfileId] = useState<number>(0);
  const [selectedLocationId, setSelectedLocationId] = useState<number>(0);
  const [selectedDeptId, setSelectedDeptId] = useState<number>(0);
  const [totalOpenings, setTotalOpenings] = useState<number>(5);
  const [walkinDate, setWalkinDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Query profiles for the selected role
  const {
    data: profilesRes,
    isLoading: isProfilesLoading,
  } = useGetRoleHiringProfilesV2Query(selectedRoleId, {
    skip: !selectedRoleId,
  });

  const profiles: RoleHiringProfileData[] = useMemo(() => profilesRes?.data || [], [profilesRes]);

  // Active selected profile
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === selectedProfileId) || profiles[0] || null;
  }, [profiles, selectedProfileId]);

  // Auto-select initial role & location
  useEffect(() => {
    if (roles.length > 0 && selectedRoleId === 0) {
      const defaultRole = roles[0];
      setSelectedRoleId(Number(defaultRole.id));
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    if (hiringLocations.length > 0 && selectedLocationId === 0) {
      setSelectedLocationId(Number(hiringLocations[0].id));
    }
    if (departments.length > 0 && selectedDeptId === 0) {
      setSelectedDeptId(Number(departments[0].id));
    }
  }, [hiringLocations, departments, selectedLocationId, selectedDeptId]);

  // Auto-select default profile when profiles load
  useEffect(() => {
    if (profiles.length > 0) {
      const def = profiles.find((p) => p.isDefault) || profiles[0];
      setSelectedProfileId(def.id);
    } else {
      setSelectedProfileId(0);
    }
  }, [profiles]);

  // Mutation
  const [createInstantDrive, { isLoading: isLaunching }] = useCreateInstantDriveV2Mutation();

  // Success State
  const [createdDrive, setCreatedDrive] = useState<InstantDriveResultData | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLaunch = async () => {
    if (!selectedRoleId) {
      dispatch(notifyError({ title: 'Validation Error', description: 'Please select a job role.' }));
      return;
    }

    try {
      const payload = {
        masterRoleId: selectedRoleId,
        roleHiringProfileId: selectedProfileId > 0 ? selectedProfileId : null,
        departmentId: selectedDeptId > 0 ? selectedDeptId : null,
        hiringLocationId: selectedLocationId > 0 ? selectedLocationId : null,
        totalOpenings: totalOpenings > 0 ? totalOpenings : 5,
        walkinDriveDate: walkinDate,
      };

      const res = await createInstantDrive(payload).unwrap();
      if (res.success && res.data) {
        setCreatedDrive(res.data);
        dispatch(
          notifySuccess({
            title: '⚡ Autonomous Drive Live',
            description: `Drive "${res.data.title}" launched with QR Code in < 1 second.`,
          })
        );
        onDriveCreated?.(res.data);
      }
    } catch (err: any) {
      dispatch(
        notifyError({
          title: 'Launch Failed',
          description: err?.data?.message || 'Failed to spawn instant drive.',
        })
      );
    }
  };

  const handleCopyLink = () => {
    if (createdDrive?.registrationUrl) {
      navigator.clipboard.writeText(createdDrive.registrationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      dispatch(notifySuccess({ title: 'Link Copied', description: 'Candidate apply URL copied to clipboard.' }));
    }
  };

  const handleResetAndClose = () => {
    setCreatedDrive(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glowing Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-2xs">
              <Icon name="zap" size="sm" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] font-heading flex items-center gap-2">
                <span>1-Click Autonomous Recruitment Drive</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-indigo)] text-white uppercase tracking-wider font-mono">
                  V2 Engine
                </span>
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Instant drive initialization, cloned assessment paper, and live QR code in 1 click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
          >
            <Icon name="x" size="sm" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!createdDrive ? (
            <>
              {/* Step 1 & Step 2 Row: Role + Hiring Profile Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Icon name="briefcase" size="xs" className="text-[var(--accent-indigo)]" />
                    <span>Target Role</span>
                  </label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                    disabled={isRolesLoading || isLaunching}
                    className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none transition-all cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Profile Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Icon name="graduation-cap" size="xs" className="text-amber-500" />
                    <span>Recruitment Profile</span>
                    {isProfilesLoading && <span className="text-[10px] text-[var(--text-tertiary)] animate-pulse">(Loading...)</span>}
                  </label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(Number(e.target.value))}
                    disabled={isProfilesLoading || profiles.length === 0 || isLaunching}
                    className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.profileName} {p.isDefault ? '⚡ (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Automation Blueprint Card */}
              {activeProfile && (
                <div className="p-4 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] border border-[var(--border-default)] space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Icon name="sparkles" size="xs" className="text-amber-500" />
                      <span className="text-xs font-bold text-[var(--text-primary)] font-heading">
                        Autonomous Blueprint: {activeProfile.profileName}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      Passing Cutoff: {activeProfile.passingPercentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-default)]">
                      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Exp. Target</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {activeProfile.minExperienceYears} – {activeProfile.maxExperienceYears} Yrs
                      </span>
                    </div>

                    <div className="p-2 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-default)]">
                      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Base Salary</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {activeProfile.defaultBaseCTC ? `₹${(activeProfile.defaultBaseCTC / 100000).toFixed(1)} LPA` : 'Standard'}
                      </span>
                    </div>

                    <div className="p-2 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-default)]">
                      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Pipeline</span>
                      <span className="font-bold text-[var(--text-primary)]">3 Rounds (Auto)</span>
                    </div>

                    <div className="p-2 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-default)]">
                      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Screening</span>
                      <span className="font-bold text-emerald-600">Zero-Touch</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-[var(--radius-md)]">
                    <Icon name="check-circle" size="xs" className="text-amber-600 shrink-0" />
                    <span>
                      Candidates scoring <strong>≥ {activeProfile.passingPercentage}%</strong> will automatically advance to <strong>Interview Scheduled</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Secondary Options: Openings, Location, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Open Positions</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={totalOpenings}
                    onChange={(e) => setTotalOpenings(Number(e.target.value))}
                    disabled={isLaunching}
                    className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Hiring Location</label>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                    disabled={isLaunching}
                    className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                  >
                    {hiringLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Drive Date</label>
                  <input
                    type="date"
                    value={walkinDate}
                    onChange={(e) => setWalkinDate(e.target.value)}
                    disabled={isLaunching}
                    className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Success & Instant Live QR Card */
            <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-[var(--radius-lg)] bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-md mb-1">
                  <Icon name="check" size="sm" />
                </div>
                <h3 className="text-base font-extrabold text-emerald-700 font-heading">
                  Drive is Live & Accepting Candidates!
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {createdDrive.title} ({createdDrive.vacancyCode})
                </p>
              </div>

              {/* QR Code & Candidate Apply Box */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-[var(--radius-xl)] bg-[var(--surface-2)] border border-[var(--border-default)]">
                {/* Visual QR Placeholder / Display */}
                <div className="w-36 h-36 bg-white p-2 rounded-xl border border-[var(--border-default)] flex flex-col items-center justify-center shadow-xs shrink-0">
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                    <Icon name="qr-code" size="lg" className="text-gray-800" />
                    <span className="text-[9px] font-mono font-bold text-gray-600 mt-1 uppercase">
                      {createdDrive.qrCodeString}
                    </span>
                  </div>
                </div>

                {/* Apply Link & Quick Actions */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">
                      Candidate Registration URL (V2)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdDrive.registrationUrl}
                        className="flex-1 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-mono text-[var(--text-primary)] select-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`h-9 px-3 rounded-[var(--radius-md)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon name={copiedLink ? 'check' : 'copy'} size="xs" />
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-[var(--surface-1)] border border-[var(--border-default)]">
                      <span className="text-[10px] text-[var(--text-tertiary)] block">Cutoff</span>
                      <span className="font-bold text-[var(--text-primary)]">{createdDrive.passingPercentage}% Pass</span>
                    </div>
                    <div className="p-2 rounded bg-[var(--surface-1)] border border-[var(--border-default)]">
                      <span className="text-[10px] text-[var(--text-tertiary)] block">Questions</span>
                      <span className="font-bold text-[var(--text-primary)]">{createdDrive.totalQuestions} Questions</span>
                    </div>
                  </div>

                  <a
                    href={createdDrive.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-indigo)] hover:underline"
                  >
                    <Icon name="external-link" size="xs" />
                    <span>Open Live Candidate Landing Portal</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--surface-2)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="h-9 px-4 rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
          >
            {createdDrive ? 'Done' : 'Cancel'}
          </button>

          {!createdDrive ? (
            <button
              type="button"
              onClick={handleLaunch}
              disabled={isLaunching || !selectedRoleId}
              className="h-10 px-6 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLaunching ? (
                <>
                  <Icon name="spinner" size="xs" className="animate-spin" />
                  <span>Launching Drive...</span>
                </>
              ) : (
                <>
                  <Icon name="zap" size="xs" />
                  <span>⚡ Launch Instant Recruitment Drive</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCreatedDrive(null)}
              className="h-9 px-4 rounded-full bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="plus" size="xs" />
              <span>Launch Another Drive</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
