'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, MapPin, Layers, Users, Calendar, ArrowRight } from 'lucide-react';
import { Button, Badge, Table, Drawer, Column } from '@/components/company-ui';

interface VacancyRow {
  id: number;
  code: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  openings: number;
  stagesCount: number;
  status: 'Draft' | 'Approved' | 'Published' | 'Closed';
}

const mockVacancies: VacancyRow[] = [
  { id: 1, code: 'VAC-2026-001', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Mumbai', experience: '3.0 - 7.0 Yrs', openings: 5, stagesCount: 4, status: 'Published' },
  { id: 2, code: 'VAC-2026-002', title: 'Backend Engineer (.NET 10)', department: 'Engineering', location: 'Pune', experience: '2.0 - 5.0 Yrs', openings: 8, stagesCount: 3, status: 'Published' },
  { id: 3, code: 'VAC-2026-003', title: 'DevOps Architect', department: 'Infrastructure', location: 'Bengaluru', experience: '6.0 - 10.0 Yrs', openings: 2, stagesCount: 4, status: 'Draft' },
];

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<VacancyRow[]>(mockVacancies);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [stages, setStages] = useState([
    { name: 'Online Assessment', type: 'Assessment', passMark: 65 },
    { name: 'Technical Screen', type: 'Technical', passMark: 70 },
    { name: 'Director Interview', type: 'Director', passMark: 80 }
  ]);

  const columns: Column<VacancyRow>[] = [
    { header: 'Vacancy Code', accessorKey: 'code', width: '130px' },
    { header: 'Title', accessorKey: 'title', width: '220px' },
    { header: 'Department', accessorKey: 'department', width: '140px' },
    { header: 'Location', accessorKey: 'location', width: '120px' },
    { header: 'Experience Required', accessorKey: 'experience', width: '140px' },
    { header: 'Openings', accessorKey: 'openings', width: '90px' },
    { 
      header: 'Configured Stages', 
      cell: (row) => <Badge variant="info">{row.stagesCount} Dynamic Stages</Badge>,
      width: '140px' 
    },
    { 
      header: 'Status', 
      cell: (row) => <Badge variant={row.status === 'Published' ? 'success' : 'muted'}>{row.status}</Badge>,
      width: '100px' 
    },
  ];

  const addStage = () => {
    setStages([...stages, { name: `Round ${stages.length + 1}`, type: 'Technical', passMark: 70 }]);
  };

  const handleCreate = () => {
    if (!title) return alert('Please enter vacancy title');
    const newVac: VacancyRow = {
      id: vacancies.length + 1,
      code: `VAC-2026-00${vacancies.length + 1}`,
      title,
      department,
      location: 'Mumbai',
      experience: '3.0 - 6.0 Yrs',
      openings: 4,
      stagesCount: stages.length,
      status: 'Published'
    };
    setVacancies([newVac, ...vacancies]);
    setIsDrawerOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Job Vacancy & Pipeline Configurator
          </h1>
          <p className="text-xs text-slate-500">Configure customizable interview stages and passing marks per job opening.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Create Vacancy
        </Button>
      </div>

      <Table columns={columns} data={vacancies} rowKey="id" />

      {/* Drawer: Create Vacancy & Pipeline Configurator */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Job Vacancy & Dynamic Pipeline"
        subtitle="Define job details and sequential interview rounds"
        width="w-[550px]"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lead React/Next.js Engineer"
              className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
              >
                <option>Engineering</option>
                <option>Product Management</option>
                <option>Infrastructure / DevOps</option>
                <option>Quality Assurance</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Openings Count</label>
              <input
                type="number"
                defaultValue={5}
                className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5"
              />
            </div>
          </div>

          {/* Pipeline Configurator */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">Dynamic Interview Pipeline</h4>
              <Button variant="outline" size="sm" onClick={addStage}>
                <Plus className="w-3 h-3" /> Add Stage
              </Button>
            </div>

            <div className="space-y-2">
              {stages.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-slate-400 font-bold">{idx + 1}.</span>
                  <input
                    type="text"
                    value={st.name}
                    onChange={(e) => {
                      const updated = [...stages];
                      updated[idx].name = e.target.value;
                      setStages(updated);
                    }}
                    className="flex-1 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900"
                  />
                  <select
                    value={st.type}
                    onChange={(e) => {
                      const updated = [...stages];
                      updated[idx].type = e.target.value;
                      setStages(updated);
                    }}
                    className="border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 bg-white dark:bg-slate-900"
                  >
                    <option value="Assessment">Assessment</option>
                    <option value="Technical">Technical</option>
                    <option value="Machine">Machine Test</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Director">Director</option>
                    <option value="HR">HR</option>
                  </select>
                  <span className="text-[10px] font-mono text-slate-500">Pass%:</span>
                  <input
                    type="number"
                    value={st.passMark}
                    onChange={(e) => {
                      const updated = [...stages];
                      updated[idx].passMark = Number(e.target.value);
                      setStages(updated);
                    }}
                    className="w-14 border border-slate-300 dark:border-slate-700 rounded px-1 py-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>Save & Publish Vacancy</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
