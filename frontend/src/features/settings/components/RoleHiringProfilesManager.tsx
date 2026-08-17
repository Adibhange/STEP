'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import {
  staggerContainer,
  tactilePopCardVariant,
} from '@/design-system/motion';
import { useGetMasterDataByCategoryQuery } from '@/store/services/api';
import {
  MOCK_BLUEPRINTS,
  type AssessmentBlueprint,
} from '@/mock-data/blueprints.mock';

export const RoleHiringProfilesManager: React.FC = () => {
  // Language domain master list (used in section rule editor)
  const { data: languagesRes } = useGetMasterDataByCategoryQuery('languages');
  const languagesList = useMemo(() => {
    if (languagesRes?.data && languagesRes.data.length > 0) {
      return languagesRes.data.map((l) => l.name);
    }
    return ['General Aptitude', 'C# (.NET)', 'JavaScript / React', 'TypeScript', 'SQL (Database)', 'Python', 'Java', 'C++', 'Go (Golang)'];
  }, [languagesRes]);

  // Templates local state
  const [templates, setTemplates] = useState<AssessmentBlueprint[]>(MOCK_BLUEPRINTS);

  // Template modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<AssessmentBlueprint> | null>(null);

  // ── Template CRUD Handlers ──────────────────────────────────────────────────

  const handleOpenCreateTemplate = () => {
    setEditingTemplate({
      code: `RULE-${Date.now().toString().slice(-4)}`,
      name: '',
      defaultPassingPercentage: 70,
      totalDurationMinutes: 85,
      totalQuestions: 28,
      totalMarks: 60,
      enableQuestionShuffling: true,
      enableOptionShuffling: true,
      sectionRules: [
        {
          id: 1,
          sectionName: 'Technical MCQs (Single & Multi-Select)',
          sectionType: 'TechnicalMCQ',
          questionType: 'SINGLE_CHOICE',
          experienceTier: '{InheritFromCandidateTier}',
          requiredTags: '{InheritFromRole}',
          questionCount: 20,
          marksPerQuestion: 1.0,
          timeLimitMinutes: 25,
          selectionStrategy: 'RandomShuffled',
          displayOrder: 1,
        },
        {
          id: 2,
          sectionName: 'Live Coding IDE Challenges',
          sectionType: 'Coding',
          questionType: 'CODING',
          experienceTier: '{InheritFromCandidateTier}',
          requiredTags: '{InheritFromRole}',
          questionCount: 5,
          marksPerQuestion: 5.0,
          timeLimitMinutes: 45,
          selectionStrategy: 'RandomShuffled',
          displayOrder: 2,
        },
        {
          id: 3,
          sectionName: 'Subjective / Theory Questions',
          sectionType: 'SubjectiveTheory',
          questionType: 'SUBJECTIVE',
          experienceTier: '{InheritFromCandidateTier}',
          requiredTags: '{InheritFromRole}',
          questionCount: 3,
          marksPerQuestion: 5.0,
          timeLimitMinutes: 15,
          selectionStrategy: 'RandomShuffled',
          displayOrder: 3,
        },
      ],
    });
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: AssessmentBlueprint) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tmpl)));
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.name?.trim()) {
      toast.error('Validation Error', { description: 'Template name is required.' });
      return;
    }

    const rules = editingTemplate.sectionRules || [];
    const totalQuestions = rules.reduce((acc, r) => acc + (Number(r.questionCount) || 0), 0);
    const totalMarks = rules.reduce((acc, r) => acc + ((Number(r.questionCount) || 0) * (Number(r.marksPerQuestion) || 1)), 0);
    const totalDuration = rules.reduce((acc, r) => acc + (Number(r.timeLimitMinutes) || 0), 0);

    if (editingTemplate.id) {
      setTemplates((prev) =>
        prev.map((b) =>
          b.id === editingTemplate.id
            ? {
                ...(editingTemplate as AssessmentBlueprint),
                totalQuestions,
                totalMarks,
                totalDurationMinutes: totalDuration || 60,
                enableQuestionShuffling: true,
                enableOptionShuffling: true,
              }
            : b
        )
      );
      toast.success('Template Updated', { description: `Changes saved for "${editingTemplate.name}".` });
    } else {
      const newTmpl: AssessmentBlueprint = {
        ...(editingTemplate as AssessmentBlueprint),
        id: Date.now(),
        code: editingTemplate.code || `RULE-${Date.now().toString().slice(-4)}`,
        totalQuestions,
        totalMarks,
        totalDurationMinutes: totalDuration || 60,
        enableQuestionShuffling: true,
        enableOptionShuffling: true,
        assignedRolesCount: 0,
      };
      setTemplates((prev) => [...prev, newTmpl]);
      toast.success('Template Created', { description: `"${newTmpl.name}" is ready to be selected when creating a vacancy.` });
    }

    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: number) => {
    const tmpl = templates.find((b) => b.id === id);
    setTemplates((prev) => prev.filter((b) => b.id !== id));
    toast.success('Template Removed', { description: `Test template "${tmpl?.name || id}" deleted.` });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 w-full font-sans"
    >
      {/* ── MAIN CARD ── */}
      <motion.div
        variants={tactilePopCardVariant}
        className="bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-xs flex flex-col overflow-hidden w-full relative z-0"
      >
        {/* Top highlight catch */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none rounded-t-[var(--radius-lg)]" />

        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-[var(--border-default)] bg-[var(--surface-1)]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Icon name="file-text" size="sm" className="text-[var(--accent-indigo)]" />
              <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
                Assessment Templates &amp; Rules
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)]">
                {templates.length} Templates
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] ml-6">
              Define reusable test templates. Templates are selected when creating a vacancy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateTemplate}
            className="h-8.5 px-3.5 rounded-full bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Icon name="plus" size="xs" />
            <span>Create Template</span>
          </button>
        </div>

        {/* ── TEMPLATES GRID ── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.02 },
            },
          }}
          className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5"
        >
          {templates.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center gap-3 text-[var(--text-tertiary)]">
              <Icon name="file-text" size="lg" className="opacity-30" />
              <p className="text-sm font-medium">No templates yet.</p>
              <button
                type="button"
                onClick={handleOpenCreateTemplate}
                className="px-3 py-1.5 rounded-full bg-[var(--accent-indigo)] text-white text-xs font-bold cursor-pointer"
              >
                + Create First Template
              </button>
            </div>
          )}

          {templates.map((tmpl) => (
            <motion.div
              key={tmpl.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="p-5 rounded-[var(--radius-xl)] bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--accent-indigo)]/50 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group"
            >
              {/* Subtle top accent line on hover */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-[var(--accent-indigo)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10.5px] font-bold text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] px-2 py-0.5 rounded border border-[var(--accent-indigo)]/20">
                        {tmpl.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-default)] flex items-center gap-1">
                        <Icon name="zap" size="xs" className="text-[var(--accent-indigo)]" />
                        <span>Universal (All Tiers)</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-heading mt-2 group-hover:text-[var(--accent-indigo)] transition-colors duration-150">
                      {tmpl.name}
                    </h4>
                  </div>
                </div>

                {/* Shuffle indicator */}
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] mt-2 font-mono">
                  <span className="inline-flex items-center gap-1 text-[var(--status-success-text)] font-semibold">
                    <Icon name="check-circle" size="xs" />
                    <span>Auto-Shuffled Sequence &amp; Options</span>
                  </span>
                </div>

                {/* Section Rules Preview */}
                <div className="mt-3 space-y-1.5 border-t border-[var(--border-default)] pt-3">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase block">
                    Section Composition ({tmpl.sectionRules.length} Sections):
                  </span>
                  {tmpl.sectionRules.map((rule, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center justify-between text-xs font-medium transition-colors duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          name={
                            rule.sectionType === 'SQLQuery'
                              ? 'file-text'
                              : rule.sectionType === 'Coding'
                              ? 'code-2'
                              : rule.sectionType === 'SubjectiveTheory'
                              ? 'file-text'
                              : 'check-square'
                          }
                          size="xs"
                          className="text-[var(--accent-indigo)] shrink-0"
                        />
                        <span className="text-[var(--text-primary)] font-semibold">{rule.sectionName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-tertiary)]">
                        <span className="font-bold text-[var(--text-secondary)]">{rule.questionCount} Qs</span>
                        {rule.timeLimitMinutes && <span>({rule.timeLimitMinutes}m)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Stats & Actions */}
              <div className="border-t border-[var(--border-default)] pt-3 flex items-center justify-between mt-1">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">
                    Total: <strong className="text-[var(--text-primary)]">{tmpl.totalQuestions} Qs</strong>
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    Pass: <strong className="text-[var(--status-success-text)]">{tmpl.defaultPassingPercentage}%</strong>
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">{tmpl.totalDurationMinutes}m</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTemplate(tmpl)}
                    className="px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-default)] cursor-pointer transition-colors duration-150"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tmpl.id)}
                    className="p-1 rounded text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)] cursor-pointer transition-colors duration-150"
                    title="Delete Template"
                  >
                    <Icon name="trash-2" size="xs" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── TEST TEMPLATE BUILDER MODAL ── */}
      <AnimatePresence>
        {isTemplateModalOpen && editingTemplate && (
          <div
            onClick={() => setIsTemplateModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading flex items-center gap-2">
                  <Icon name="file-text" size="sm" className="text-[var(--accent-indigo)]" />
                  <span>{editingTemplate.id ? 'Edit Assessment Template' : 'Create Assessment Template'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <Icon name="x" size="xs" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Template Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Template Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineering Technical Track"
                      value={editingTemplate.name || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                    />
                  </div>

                  {/* Passing Cutoff */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Passing Cutoff %</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={editingTemplate.defaultPassingPercentage ?? 70}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultPassingPercentage: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--status-success-text)] outline-none focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                </div>

                {/* Section Rules Editor */}
                <div className="space-y-2 border-t border-[var(--border-default)] pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">
                        Assessment Sections ({editingTemplate.sectionRules?.length || 0})
                      </label>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        Questions are filtered by candidate's experience tier at runtime
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = editingTemplate.sectionRules || [];
                        setEditingTemplate({
                          ...editingTemplate,
                          sectionRules: [
                            ...current,
                            {
                              id: Date.now(),
                              sectionName: 'Technical MCQs',
                              sectionType: 'TechnicalMCQ',
                              questionType: 'SINGLE_CHOICE',
                              experienceTier: '{InheritFromCandidateTier}',
                              requiredTags: '{InheritFromRole}',
                              questionCount: 10,
                              marksPerQuestion: 1.0,
                              timeLimitMinutes: 15,
                              selectionStrategy: 'RandomShuffled',
                              displayOrder: current.length + 1,
                            },
                          ],
                        });
                      }}
                      className="px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--accent-indigo)] border border-[var(--border-default)] cursor-pointer"
                    >
                      + Add Section
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(editingTemplate.sectionRules || []).map((rule, idx) => (
                      <div key={idx} className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-default)] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={rule.sectionName}
                            onChange={(e) => {
                              const updated = [...(editingTemplate.sectionRules || [])];
                              updated[idx] = { ...updated[idx], sectionName: e.target.value };
                              setEditingTemplate({ ...editingTemplate, sectionRules: updated });
                            }}
                            className="font-bold text-xs bg-transparent border-b border-[var(--border-default)] text-[var(--text-primary)] outline-none w-full pb-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editingTemplate.sectionRules || []).filter((_, i) => i !== idx);
                              setEditingTemplate({ ...editingTemplate, sectionRules: updated });
                            }}
                            className="text-[var(--status-danger-text)] hover:opacity-80 p-1 cursor-pointer"
                          >
                            <Icon name="trash-2" size="xs" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block mb-1">Type</label>
                            <CustomSelect
                              label="Section Type"
                              value={rule.sectionType}
                              options={[
                                { value: 'TechnicalMCQ', label: 'Technical MCQ' },
                                { value: 'Coding', label: 'Coding IDE' },
                                { value: 'SQLQuery', label: 'SQL Query' },
                                { value: 'SubjectiveTheory', label: 'Subjective / Theory' },
                              ]}
                              onChange={(val) => {
                                const updated = [...(editingTemplate.sectionRules || [])];
                                updated[idx] = { ...updated[idx], sectionType: val as any };
                                setEditingTemplate({ ...editingTemplate, sectionRules: updated });
                              }}
                              widthClass="w-full"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block mb-1">Questions</label>
                            <input
                              type="number"
                              min={1}
                              value={rule.questionCount}
                              onChange={(e) => {
                                const updated = [...(editingTemplate.sectionRules || [])];
                                updated[idx] = { ...updated[idx], questionCount: Number(e.target.value) };
                                setEditingTemplate({ ...editingTemplate, sectionRules: updated });
                              }}
                              className="w-full h-8.5 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-[11px] font-mono font-bold outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block mb-1">Time (Min)</label>
                            <input
                              type="number"
                              min={1}
                              value={rule.timeLimitMinutes || 15}
                              onChange={(e) => {
                                const updated = [...(editingTemplate.sectionRules || [])];
                                updated[idx] = { ...updated[idx], timeLimitMinutes: Number(e.target.value) };
                                setEditingTemplate({ ...editingTemplate, sectionRules: updated });
                              }}
                              className="w-full h-8.5 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-[11px] font-mono font-bold outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block mb-1">Language Domain</label>
                            <CustomSelect
                              label="Language Domain"
                              value={rule.requiredTags}
                              options={[
                                { value: '{InheritFromRole}', label: '⚡ Inherit from Role' },
                                ...languagesList.map((lang) => ({ value: lang, label: lang })),
                              ]}
                              onChange={(val) => {
                                const updated = [...(editingTemplate.sectionRules || [])];
                                updated[idx] = { ...updated[idx], requiredTags: val };
                                setEditingTemplate({ ...editingTemplate, sectionRules: updated });
                              }}
                              widthClass="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="h-9 px-4 rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-full bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
