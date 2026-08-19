'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Icon,
  CustomSelect,
  elasticDialogVariant,
  dialogBackdropVariant,
  dialogContentBlossomVariant,
} from '@/design-system';
import {
  useGetMasterDataByCategoryQuery,
  useGetRoleHiringProfilesV2Query,
  useCreateInstantDriveV2Mutation,
  type RoleHiringProfileData,
  type InstantDriveResultData,
} from '@/store/services/api';
import { useAppDispatch, notifySuccess, notifyError } from '@/store';
import { getAppOrigin } from '@/lib/utils/url-helper';

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

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Form State
  const [driveType, setDriveType] = useState<'Walk-in Drive' | 'Direct / Sourced Hiring'>('Walk-in Drive');
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [selectedProfileId, setSelectedProfileId] = useState<number>(0);
  const [selectedLocationId, setSelectedLocationId] = useState<number>(0);
  const [selectedDeptId, setSelectedDeptId] = useState<number>(0);
  const [totalOpenings, setTotalOpenings] = useState<number>(5);
  const [walkinDate, setWalkinDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  // CustomSelect Options Mappings
  const roleOptions = useMemo(() => {
    return roles.map((r) => ({
      value: String(r.id),
      label: `${r.name} (${r.code || '—'})`,
    }));
  }, [roles]);

  const locationOptions = useMemo(() => {
    return hiringLocations.map((loc) => ({
      value: String(loc.id),
      label: `${loc.name} (${loc.code || '—'})`,
    }));
  }, [hiringLocations]);

  // Query profiles for the selected role
  const {
    data: profilesRes,
    isLoading: isProfilesLoading,
  } = useGetRoleHiringProfilesV2Query(selectedRoleId, {
    skip: !selectedRoleId,
  });

  const profiles: RoleHiringProfileData[] = useMemo(() => profilesRes?.data || [], [profilesRes]);

  const profileOptions = useMemo(() => {
    return profiles.map((p) => ({
      value: String(p.id),
      label: `${p.profileName} ${p.isDefault ? '(Default)' : ''}`.trim(),
    }));
  }, [profiles]);

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

  const resolvedRegistrationUrl = useMemo(() => {
    if (!createdDrive) return '';
    if (createdDrive.qrCodeString) {
      return `${getAppOrigin()}/apply/${createdDrive.qrCodeString}`;
    }
    return createdDrive.registrationUrl || '';
  }, [createdDrive]);

  const handleLaunch = async () => {
    if (!selectedRoleId) {
      dispatch(notifyError({ title: 'Validation Error', description: 'Please select a job role.' }));
      return;
    }

    try {
      const result = await createInstantDrive({
        roleId: selectedRoleId,
        profileId: selectedProfileId || undefined,
        driveType,
        hiringLocationId: selectedLocationId || undefined,
        departmentId: selectedDeptId || undefined,
        totalOpenings,
        walkinDate,
      }).unwrap();

      if (result.success && result.data) {
        setCreatedDrive(result.data);
        dispatch(
          notifySuccess({
            title: driveType === 'Walk-in Drive' ? '⚡ Walk-in Drive Live!' : '⚡ Direct Hiring Vacancy Live!',
            description: `Created vacancy ${result.data.vacancyCode} with assessment & registration portal.`,
          })
        );
        onDriveCreated?.(result.data);
      } else {
        dispatch(
          notifyError({
            title: 'Drive Launch Failed',
            description: result.message || 'Could not spawn instant drive.',
          })
        );
      }
    } catch (err: any) {
      dispatch(
        notifyError({
          title: 'Error',
          description: err?.data?.message || 'Failed to spawn instant drive.',
        })
      );
    }
  };

  const handleCopyLink = () => {
    if (resolvedRegistrationUrl) {
      navigator.clipboard.writeText(resolvedRegistrationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      dispatch(notifySuccess({ title: 'Link Copied', description: 'Candidate apply URL copied to clipboard.' }));
    }
  };

  const handleResetAndClose = () => {
    setCreatedDrive(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto isolate">
          {/* Theme-Aware Backdrop */}
          <motion.div
            key="backdrop"
            variants={dialogBackdropVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs transform-gpu"
            aria-hidden="true"
          />

          {/* Modal Window with Elastic Blooming Spring */}
          <motion.div
            key="modal"
            variants={elasticDialogVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: '50% 40%' }}
            className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl shadow-[0_25px_70px_-15px_rgba(99,102,241,0.22),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 transform-gpu my-auto"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Responsive Header */}
          <motion.div
            variants={dialogContentBlossomVariant}
            initial="hidden"
            animate="show"
            className="flex items-center justify-between p-3.5 sm:px-6 sm:py-4 border-b border-[var(--border-default)] bg-[var(--surface-2)] shrink-0 gap-2"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--accent-indigo-dim)] border border-[var(--accent-indigo)]/30 flex items-center justify-center text-[var(--accent-indigo)] shadow-2xs shrink-0">
                <Icon name="zap" size="sm" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-base font-extrabold text-[var(--text-primary)] font-heading leading-tight truncate">
                    1-Click Autonomous Drive
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 uppercase tracking-wider font-mono shrink-0 whitespace-nowrap">
                    V2 Engine
                  </span>
                </div>
                <p className="text-[10.5px] sm:text-xs text-[var(--text-tertiary)] mt-0.5 truncate sm:whitespace-normal">
                  Instant drive initialization, assessment blueprint & QR hub.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer shrink-0"
            >
              <Icon name="x" size="xs" />
            </button>
          </motion.div>

          {/* Modal Body with Smooth Scrollability */}
          <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-[var(--text-primary)] flex-1 min-h-0 scrollbar-thin">
            {!createdDrive ? (
              <>
                {/* 1. Recruitment Model: Walk-in Drive vs Direct HR Screening */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Icon name="layers" size="xs" className="text-[var(--accent-indigo)]" />
                      <span>Recruitment Model</span>
                    </span>
                    <span className="hidden sm:inline text-[10.5px] font-mono text-[var(--text-tertiary)]">
                      {driveType === 'Walk-in Drive' ? 'QR Code & Venue Check-in' : 'Direct Sourcing & HR Screening'}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDriveType('Walk-in Drive')}
                      className={`h-8 sm:h-9 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                        driveType === 'Walk-in Drive'
                          ? 'bg-[var(--accent-indigo)] text-white shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <Icon name="qr-code" size="xs" className="shrink-0" />
                      <span className="truncate">Walk-in Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriveType('Direct / Sourced Hiring')}
                      className={`h-8 sm:h-9 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                        driveType === 'Direct / Sourced Hiring'
                          ? 'bg-[var(--accent-indigo)] text-white shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <Icon name="users" size="xs" className="shrink-0" />
                      <span className="truncate">Direct / Sourced</span>
                    </button>
                  </div>
                </div>

                {/* 2. Tokenized CustomSelect Dropdowns: Role & Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Role Selector with CustomSelect */}
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Icon name="briefcase" size="xs" className="text-[var(--accent-indigo)]" />
                      <span>Target Role</span>
                    </label>
                    <CustomSelect
                      label="Target Role"
                      value={String(selectedRoleId)}
                      options={roleOptions}
                      onChange={(val) => {
                        setSelectedRoleId(Number(val));
                        setSelectedProfileId(0);
                      }}
                      disabled={isRolesLoading || isLaunching}
                      widthClass="w-full"
                    />
                  </div>

                  {/* Profile Selector with CustomSelect */}
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Icon name="graduation-cap" size="xs" className="text-[var(--accent-indigo)]" />
                      <span>Recruitment Profile / Tier</span>
                      {isProfilesLoading && <span className="text-[10px] text-[var(--text-tertiary)] animate-pulse">(Loading...)</span>}
                    </label>
                    <CustomSelect
                      label="Recruitment Profile"
                      value={String(selectedProfileId)}
                      options={profileOptions}
                      onChange={(val) => setSelectedProfileId(Number(val))}
                      disabled={isProfilesLoading || profiles.length === 0 || isLaunching}
                      widthClass="w-full"
                    />
                  </div>
                </div>

                {/* 3. Dynamic Automation Hiring Profile Card */}
                {activeProfile && (
                  <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-2.5 sm:space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon name="sparkles" size="xs" className="text-[var(--accent-indigo)] shrink-0" />
                        <span className="text-[11.5px] sm:text-xs font-bold text-[var(--text-primary)] font-heading truncate">
                          Hiring Profile: {activeProfile.profileName}
                        </span>
                      </div>
                      <span className="text-[10.5px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)] shrink-0">
                        Cutoff: {activeProfile.passingPercentage}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Exp. Target</span>
                        <span className="font-bold text-[var(--text-primary)] mt-0.5 block truncate">
                          {activeProfile.minExperienceYears} – {activeProfile.maxExperienceYears} Yrs
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Base Salary</span>
                        <span className="font-bold text-[var(--text-primary)] mt-0.5 block truncate">
                          {activeProfile.defaultBaseCTC ? `₹${(activeProfile.defaultBaseCTC / 100000).toFixed(1)} LPA` : 'Standard'}
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Pipeline</span>
                        <span className="font-bold text-[var(--text-primary)] mt-0.5 block truncate">
                          {driveType === 'Walk-in Drive' ? '4 Rounds' : '3 Rounds'}
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] font-semibold text-[var(--text-tertiary)] uppercase block">Screening</span>
                        <span className="font-bold text-[var(--status-success-text)] mt-0.5 block truncate">Zero-Touch</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] text-[var(--text-secondary)] bg-[var(--surface-1)] border border-[var(--border-default)] p-2 sm:p-2.5 rounded-lg">
                      <Icon name="check-circle" size="xs" className="text-[var(--accent-indigo)] shrink-0" />
                      <span className="leading-snug">
                        {driveType === 'Walk-in Drive' ? (
                          <>Round 1 requires <strong>≥ {activeProfile.passingPercentage}%</strong> to unlock Technical Assessment.</>
                        ) : (
                          <>Candidates scoring <strong>≥ {activeProfile.passingPercentage}%</strong> advance to Interview.</>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Secondary Options: Openings, Location, Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-[10.5px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Open Positions</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={totalOpenings}
                      onChange={(e) => setTotalOpenings(Number(e.target.value))}
                      disabled={isLaunching}
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Hiring Location</label>
                    <CustomSelect
                      label="Location"
                      value={String(selectedLocationId)}
                      options={locationOptions}
                      onChange={(val) => setSelectedLocationId(Number(val))}
                      disabled={isLaunching}
                      widthClass="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase">
                      {driveType === 'Walk-in Drive' ? 'Drive Date' : 'Target Start Date'}
                    </label>
                    <input
                      type="date"
                      value={walkinDate}
                      onChange={(e) => setWalkinDate(e.target.value)}
                      disabled={isLaunching}
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Success Card */
              <div className="space-y-3.5 py-1">
                <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--status-success)] text-white shadow-md mb-1">
                    <Icon name="check" size="sm" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--status-success-text)] font-heading leading-tight">
                    {driveType === 'Walk-in Drive' ? 'Drive is Live & Accepting Candidates!' : 'Vacancy Published & Ready for Sourcing!'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {createdDrive.title} ({createdDrive.vacancyCode}) • {driveType}
                  </p>
                </div>

                {/* QR Code & Candidate Apply Box */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)]">
                  {/* Visual QR Display for Walk-in Drive */}
                  {driveType === 'Walk-in Drive' ? (
                    <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-2 rounded-xl border border-[var(--border-default)] flex flex-col items-center justify-center shadow-xs shrink-0">
                      <div className="w-full h-full border border-dashed border-[var(--border-default)] rounded-lg flex flex-col items-center justify-center p-2 text-center">
                        <Icon name="qr-code" size="lg" className="text-[var(--text-primary)]" />
                        <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-[var(--text-secondary)] mt-1 uppercase">
                          {createdDrive.qrCodeString}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 sm:w-36 sm:h-36 bg-[var(--surface-1)] p-3 rounded-xl border border-[var(--border-default)] flex flex-col items-center justify-center shadow-xs shrink-0 text-center">
                      <Icon name="users" size="lg" className="text-[var(--accent-indigo)]" />
                      <span className="text-[11px] font-bold text-[var(--text-primary)] mt-2">
                        HR Direct Sourced
                      </span>
                      <span className="text-[9.5px] text-[var(--text-tertiary)] mt-0.5">
                        Direct Portal Link
                      </span>
                    </div>
                  )}

                  {/* Apply Link & Quick Actions */}
                  <div className="flex-1 space-y-2.5 sm:space-y-3 w-full min-w-0">
                    <div className="space-y-1">
                      <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">
                        {driveType === 'Walk-in Drive' ? 'Walk-in Registration URL (QR)' : 'Direct Screening Link'}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={resolvedRegistrationUrl}
                          className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-mono text-[var(--text-primary)] select-all outline-none min-w-0"
                        />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-primary)] shadow-2xs shrink-0"
                        >
                          <Icon name={copiedLink ? 'check' : 'copy'} size="xs" />
                          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[10px] text-[var(--text-tertiary)] block">Cutoff</span>
                        <span className="font-bold text-[var(--text-primary)]">{createdDrive.passingPercentage}% Pass</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[10px] text-[var(--text-tertiary)] block">Questions</span>
                        <span className="font-bold text-[var(--text-primary)]">{createdDrive.totalQuestions} Questions</span>
                      </div>
                    </div>

                    <a
                      href={resolvedRegistrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-indigo)] hover:underline"
                    >
                      <Icon name="external-link" size="xs" />
                      <span>Open Candidate Portal</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full-Width Streamlined Footer */}
          <div className="p-3.5 sm:px-6 sm:py-4 border-t border-[var(--border-default)] bg-[var(--surface-2)] shrink-0">
            {!createdDrive ? (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={isLaunching || !selectedRoleId}
                className="w-full h-10 sm:h-10.5 px-5 rounded-xl bg-gradient-to-b from-[var(--accent-indigo)] to-[#4f46e5] hover:from-[#6b6ff5] hover:to-[#4338ca] text-white text-[13px] font-bold flex items-center justify-center gap-2.5 shadow-[0_2px_10px_rgba(99,102,241,0.38),0_1px_0_rgba(255,255,255,0.2)_inset] border border-indigo-400/30 hover:border-indigo-300/50 transition-all duration-150 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLaunching ? (
                  <>
                    <Icon name="spinner" size="xs" className="animate-spin" />
                    <span>Launching Vacancy...</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-md bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 transition-colors">
                      <Icon name="zap" size="xs" />
                    </div>
                    <span>{driveType === 'Walk-in Drive' ? 'Launch Instant Walk-in Drive' : 'Publish Direct Hiring Vacancy'}</span>
                    <Icon name="chevron-right" size="xs" className="text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full h-10 sm:h-10.5 px-5 rounded-xl bg-gradient-to-b from-[var(--accent-indigo)] to-[#4f46e5] hover:from-[#6b6ff5] hover:to-[#4338ca] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(99,102,241,0.38),0_1px_0_rgba(255,255,255,0.2)_inset] border border-indigo-400/30 hover:border-indigo-300/50 transition-all duration-150 cursor-pointer active:scale-[0.99]"
              >
                <Icon name="check" size="xs" />
                <span>Done & Close</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
