"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, EnterpriseModal, tactilePopCardVariant } from "@/design-system";
import { CustomSelect, TablePagination } from "@/features/shared";
import type { MasterRecord } from "@/types/master.types";

export interface MasterColumn {
	key: keyof MasterRecord | string;
	label: string;
	render?: (record: MasterRecord) => React.ReactNode;
}

export interface MasterTableProps {
	title: string;
	description?: string;
	data: MasterRecord[];
	columns?: MasterColumn[];
	exampleName?: string;
	exampleCode?: string;
	onAdd?: (newRecord: Omit<MasterRecord, "id" | "updatedAt">) => void;
	onEdit?: (record: MasterRecord) => void;
	onToggleStatus?: (recordId: string | number) => void;
	onDelete?: (recordId: string | number) => void;
}

function generateUniqueCode(
	name: string,
	records: MasterRecord[],
	currentId?: string | number,
): string {
	const allWords = name.trim().split(/\s+/).filter(Boolean);
	const letterWords = allWords.filter((w) => /^[a-zA-Z]/.test(w));

	let baseCode = "";

	if (letterWords.length > 1) {
		baseCode = letterWords
			.map((w) => w[0])
			.join("")
			.toUpperCase();
	} else if (letterWords.length === 1) {
		const cleaned = letterWords[0].replace(/[^a-zA-Z]/g, "");
		baseCode = cleaned.substring(0, 3).toUpperCase();
	} else if (allWords.length > 0) {
		const cleaned = name.replace(/[^a-zA-Z]/g, "");
		baseCode = cleaned.substring(0, 3).toUpperCase();
	}

	if (!baseCode) baseCode = "REC";

	let candidate = baseCode;
	let counter = 2;

	const existingCodes = new Set(
		records
			.filter((r) => r.id !== currentId)
			.map((r) => r.code?.toUpperCase())
			.filter(Boolean),
	);

	while (existingCodes.has(candidate)) {
		candidate = `${baseCode}${counter}`;
		counter++;
	}

	return candidate;
}

/**
 * STEP Enterprise MasterTable Primitive
 *
 * Generic CRUD table component for Master Data taxonomies.
 */
export const MasterTable: React.FC<MasterTableProps> = ({
	title,
	description,
	data,
	columns,
	exampleName = "Data Analyst",
	exampleCode = "DA",
	onAdd,
	onEdit,
	onToggleStatus,
	onDelete,
}) => {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"All" | "Active" | "Inactive"
	>("All");
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);

	// Modal form states
	const [formName, setFormName] = useState("");
	const [formCode, setFormCode] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formMinYears, setFormMinYears] = useState<string>("");
	const [formMaxYears, setFormMaxYears] = useState<string>("");
	const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

	const isExperience = title.toLowerCase().includes("experience");

	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const matchSearch =
				item.name.toLowerCase().includes(search.toLowerCase()) ||
				(item.code && item.code.toLowerCase().includes(search.toLowerCase())) ||
				(item.description &&
					item.description.toLowerCase().includes(search.toLowerCase()));

			const matchStatus =
				statusFilter === "All" || item.status === statusFilter;
			return matchSearch && matchStatus;
		});
	}, [data, search, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

	// Reset page when category title or total records change
	React.useEffect(() => {
		setCurrentPage(1);
	}, [title, data.length]);

	// Auto-clamp if currentPage exceeds totalPages (e.g. after filtering or deletion)
	React.useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		return filteredData.slice(start, start + rowsPerPage);
	}, [filteredData, currentPage, rowsPerPage]);

	const handleSearchChange = (val: string) => {
		setSearch(val);
		setCurrentPage(1);
	};

	const handleStatusFilterChange = (val: "All" | "Active" | "Inactive") => {
		setStatusFilter(val);
		setCurrentPage(1);
	};

	const handleOpenAdd = () => {
		setFormName("");
		setFormCode("");
		setFormDescription("");
		setFormMinYears("");
		setFormMaxYears("");
		setFormStatus("Active");
		setIsAddOpen(true);
	};

	const handleOpenEdit = (record: MasterRecord) => {
		setEditingRecord(record);
		setFormName(record.name);
		setFormCode(record.code || "");
		setFormDescription(record.description || "");
		setFormMinYears(
			record.minYears !== undefined && record.minYears !== null ?
				String(record.minYears)
			:	"",
		);
		setFormMaxYears(
			record.maxYears !== undefined && record.maxYears !== null ?
				String(record.maxYears)
			:	"",
		);
		setFormStatus(record.status || "Active");
	};

	const handleSaveAdd = (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formName.trim()) return;

		// Use custom code if provided, else auto-generate unique short code from record name
		const finalCode =
			formCode.trim() ?
				formCode.trim().toUpperCase()
			:	generateUniqueCode(formName, data);

		onAdd?.({
			name: formName.trim(),
			code: finalCode,
			description: formDescription.trim(),
			minYears: formMinYears ? parseFloat(formMinYears) : undefined,
			maxYears: formMaxYears ? parseFloat(formMaxYears) : undefined,
			status: formStatus,
		});
		setIsAddOpen(false);
	};

	const handleSaveEdit = (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingRecord || !formName.trim()) return;

		const finalCode =
			formCode.trim() ? formCode.trim().toUpperCase()
			: (
				formName.trim().toLowerCase() === editingRecord.name.toLowerCase() &&
				editingRecord.code
			) ?
				editingRecord.code
			:	generateUniqueCode(formName, data, editingRecord.id);

		onEdit?.({
			...editingRecord,
			name: formName.trim(),
			code: finalCode,
			description: formDescription.trim(),
			minYears: formMinYears ? parseFloat(formMinYears) : undefined,
			maxYears: formMaxYears ? parseFloat(formMaxYears) : undefined,
			status: formStatus,
			updatedAt: new Date().toISOString().split("T")[0],
		});
		setEditingRecord(null);
	};

	const defaultColumns: MasterColumn[] = [
		{
			key: "name",
			label: "Record Name",
			render: (r) => (
				<div className='flex flex-col'>
					<span className='font-bold text-text-primary text-[13px]'>
						{r.name}
					</span>
					{r.description && (
						<span
							className='text-[11px] text-text-tertiary truncate max-w-[220px]'
							title={r.description}>
							{r.description}
						</span>
					)}
				</div>
			),
		},
		...(isExperience ?
			[
				{
					key: "experienceRange",
					label: "Experience Bounds",
					render: (r: MasterRecord) => (
						<span className='inline-flex items-center gap-1 font-mono text-[11.5px] font-bold text-accent-indigo bg-accent-indigo-dim px-2.5 py-0.5 rounded border border-accent-indigo/20'>
							{r.minYears ?? 0} – {r.maxYears ?? 99} yrs
						</span>
					),
				},
			]
		:	[]),
		{
			key: "code",
			label: "Short Code",
			render: (r) => (
				<span className='font-mono text-[11.5px] font-extrabold text-accent-indigo bg-accent-indigo-dim px-2.5 py-0.5 rounded border border-accent-indigo/20'>
					{r.code || "—"}
				</span>
			),
		},
		{
			key: "status",
			label: "Status",
			render: (r) => (
				<button
					type='button'
					onClick={() => onToggleStatus?.(r.id)}
					className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all active:scale-95 ${
						r.status === "Active" ?
							"bg-status-success-bg text-status-success-text border-status-success-border"
						:	"bg-status-danger-bg text-status-danger-text border-status-danger-border"
					}`}
					title='Click to toggle status'>
					<span
						className={`size-1.5 rounded-full ${r.status === "Active" ? "bg-status-success" : "bg-status-danger"}`}
					/>
					<span>{r.status}</span>
				</button>
			),
		},
		{
			key: "updatedAt",
			label: "Last Updated",
			render: (r) => (
				<span className='text-[11.5px] text-text-tertiary font-sans'>
					{r.updatedAt}
				</span>
			),
		},
	];

	const activeColumns = columns || defaultColumns;

	return (
		<motion.div
			variants={tactilePopCardVariant}
			initial='hidden'
			animate='show'
			className='bg-surface-1 rounded-(--radius-lg) border border-border-default shadow-xs flex flex-col overflow-hidden w-full relative z-0'>
			{/* Top Highlight Catch */}
			<div className='absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none rounded-t-(--radius-lg)' />
			{/* Header Bar */}
			<div className='flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border-default bg-surface-1'>
				<div>
					<h3 className='text-base font-extrabold text-text-primary font-heading tracking-tight'>
						{title}
					</h3>
					{description && (
						<p className='text-xs text-text-tertiary mt-0.5'>{description}</p>
					)}
				</div>

				{/* Action Controls */}
				<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
					{/* Search */}
					<div className='relative flex items-center h-8.5 px-3 rounded-full border border-border-default bg-surface-2 w-full sm:w-56'>
						<Icon
							name='search'
							size='xs'
							className='text-text-tertiary shrink-0 mr-1.5'
						/>
						<input
							type='search'
							placeholder={`Search ${title.toLowerCase()}...`}
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							className='w-full bg-transparent outline-none text-xs text-text-primary placeholder:text-text-placeholder'
						/>
					</div>

					{/* Tokenized CustomSelect Dropdown */}
					<CustomSelect
						label='Status Filter'
						placeholder='All Statuses'
						value={statusFilter}
						options={[
							{ value: "All", label: "All Statuses" },
							{ value: "Active", label: "Active Only" },
							{ value: "Inactive", label: "Inactive Only" },
						]}
						onChange={(val) => handleStatusFilterChange((val || "All") as any)}
						widthClass='w-full sm:w-[130px]'
					/>

					{/* Add Button with Tactile Micro-interaction */}
					<motion.button
						type='button'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleOpenAdd}
						className='h-8.5 px-4 flex items-center justify-center gap-1.5 rounded-full bg-accent-indigo text-white text-xs font-bold hover:bg-accent-indigo-hover transition-all cursor-pointer shadow-xs w-full sm:w-auto shrink-0'>
						<Icon
							name='plus'
							size='xs'
						/>
						<span>Add Record</span>
					</motion.button>
				</div>
			</div>

			{/* Master Data Table */}
			<div className='overflow-x-auto scrollbar-step w-full'>
				<table className='w-full text-left border-collapse min-w-[640px]'>
					<colgroup>
						<col style={{ width: "32%", minWidth: "180px" }} />
						<col style={{ width: "15%", minWidth: "90px" }} />
						<col style={{ width: "18%", minWidth: "100px" }} />
						<col style={{ width: "20%", minWidth: "110px" }} />
						<col style={{ width: "15%", minWidth: "80px" }} />
					</colgroup>
					<thead>
						<tr className='border-b border-border-default bg-surface-2 text-[11px] font-bold text-text-tertiary uppercase tracking-wider'>
							{activeColumns.map((col) => (
								<th
									key={String(col.key)}
									className='py-2.5 px-4 font-mono whitespace-nowrap'>
									{col.label}
								</th>
							))}
							<th className='py-2.5 px-4 font-mono text-right whitespace-nowrap'>
								Actions
							</th>
						</tr>
					</thead>
					<AnimatePresence mode='wait'>
						<motion.tbody
							key={`${search}-${statusFilter}-${currentPage}-${rowsPerPage}`}
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.15, ease: [0.0, 0.0, 0.2, 1] }}
							className='divide-y divide-border-soft text-[12.5px]'>
							{paginatedData.length === 0 ?
								<tr>
									<td
										colSpan={activeColumns.length + 1}
										className='py-8 text-center text-text-tertiary'>
										No records found matching filter criteria.
									</td>
								</tr>
							:	paginatedData.map((record) => (
									<tr
										key={record.id}
										className='hover:bg-surface-hover transition-colors'>
										{activeColumns.map((col) => (
											<td
												key={String(col.key)}
												className='py-3 px-4 whitespace-nowrap'>
												{col.render ?
													col.render(record)
												:	String(record[col.key as keyof MasterRecord] ?? "—")}
											</td>
										))}
										<td className='py-3 px-4 text-right whitespace-nowrap'>
											<div className='flex items-center justify-end gap-1'>
												<button
													type='button'
													onClick={() => handleOpenEdit(record)}
													className='p-1.5 rounded hover:bg-surface-3 text-text-secondary hover:text-accent-indigo transition-colors cursor-pointer'
													title='Edit record'>
													<Icon
														name='pencil'
														size='xs'
													/>
												</button>
												<button
													type='button'
													onClick={() => onDelete?.(record.id)}
													className='p-1.5 rounded hover:bg-status-danger-bg text-text-tertiary hover:text-status-danger transition-colors cursor-pointer'
													title='Delete record'>
													<Icon
														name='trash-2'
														size='xs'
													/>
												</button>
											</div>
										</td>
									</tr>
								))
							}
						</motion.tbody>
					</AnimatePresence>
				</table>
			</div>

			{/* Table Pagination (Matching Dashboard Candidate Table) */}
			<TablePagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalRecords={filteredData.length}
				rowsPerPage={rowsPerPage}
				onPageChange={setCurrentPage}
				onRowsPerPageChange={(n) => setRowsPerPage(n)}
			/>

			{/* Add Modal with Enterprise Spring Dialog */}
			<EnterpriseModal
				isOpen={isAddOpen}
				onClose={() => setIsAddOpen(false)}
				title={`Add New ${title}`}
				subtitle={`Create a new master ${title.toLowerCase()} taxonomy record.`}
				icon='plus-circle'
				maxWidth='md'
				submitText='Save Record'
				cancelText='Cancel'
				onSubmit={handleSaveAdd}>
				<div className='flex flex-col gap-3.5'>
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
							Record Name *
						</label>
						<input
							type='text'
							required
							autoFocus
							value={formName}
							onChange={(e) => setFormName(e.target.value)}
							placeholder={`Enter ${title.toLowerCase()} name... (e.g. ${exampleName})`}
							className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo'
						/>
					</div>
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
							Short Code (Optional)
						</label>
						<input
							type='text'
							value={formCode}
							onChange={(e) => setFormCode(e.target.value)}
							placeholder={`Auto-generated if left blank (e.g. ${exampleCode})`}
							className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo font-mono'
						/>
					</div>
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
							Description (Optional)
						</label>
						<input
							type='text'
							value={formDescription}
							onChange={(e) => setFormDescription(e.target.value)}
							placeholder='Enter optional description...'
							className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo'
						/>
					</div>
					{isExperience && (
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
									Min Experience (Years)
								</label>
								<input
									type='number'
									step='0.5'
									min='0'
									max='99'
									value={formMinYears}
									onChange={(e) => setFormMinYears(e.target.value)}
									placeholder='e.g. 1.0'
									className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo font-mono'
								/>
							</div>
							<div>
								<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
									Max Experience (Years)
								</label>
								<input
									type='number'
									step='0.5'
									min='0'
									max='99'
									value={formMaxYears}
									onChange={(e) => setFormMaxYears(e.target.value)}
									placeholder='e.g. 3.0'
									className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo font-mono'
								/>
							</div>
						</div>
					)}
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase block mb-1'>
							Status
						</label>
						<CustomSelect
							label='Initial Status'
							value={formStatus}
							options={[
								{ value: "Active", label: "Active" },
								{ value: "Inactive", label: "Inactive" },
							]}
							onChange={(val) => setFormStatus((val || "Active") as any)}
							widthClass='w-full'
						/>
					</div>
				</div>
			</EnterpriseModal>

			{/* Edit Modal with Enterprise Spring Dialog */}
			<EnterpriseModal
				isOpen={!!editingRecord}
				onClose={() => setEditingRecord(null)}
				title={`Edit ${title} Record`}
				subtitle={`Update master code, title, description, or status.`}
				icon='edit-3'
				maxWidth='md'
				submitText='Update Record'
				cancelText='Cancel'
				onSubmit={handleSaveEdit}>
				<div className='flex flex-col gap-3.5'>
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
							Record Name *
						</label>
						<input
							type='text'
							required
							value={formName}
							onChange={(e) => setFormName(e.target.value)}
							className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo'
						/>
					</div>
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
							Short Code
						</label>
						<input
							type='text'
							value={formCode}
							onChange={(e) => setFormCode(e.target.value)}
							placeholder='Short Code'
							className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo font-mono'
						/>
					</div>
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
							Description (Optional)
						</label>
						<input
							type='text'
							value={formDescription}
							onChange={(e) => setFormDescription(e.target.value)}
							placeholder='Enter optional description...'
							className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo'
						/>
					</div>
					{isExperience && (
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
									Min Experience (Years)
								</label>
								<input
									type='number'
									step='0.5'
									min='0'
									max='99'
									value={formMinYears}
									onChange={(e) => setFormMinYears(e.target.value)}
									placeholder='e.g. 1.0'
									className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo font-mono'
								/>
							</div>
							<div>
								<label className='text-[11.5px] font-bold text-text-secondary uppercase'>
									Max Experience (Years)
								</label>
								<input
									type='number'
									step='0.5'
									min='0'
									max='99'
									value={formMaxYears}
									onChange={(e) => setFormMaxYears(e.target.value)}
									placeholder='e.g. 3.0'
									className='w-full mt-1 h-9.5 px-3 rounded-xl border border-border-default bg-surface-2 text-xs text-text-primary outline-none focus:border-accent-indigo font-mono'
								/>
							</div>
						</div>
					)}
					<div>
						<label className='text-[11.5px] font-bold text-text-secondary uppercase block mb-1'>
							Status
						</label>
						<CustomSelect
							label='Status'
							value={formStatus}
							options={[
								{ value: "Active", label: "Active" },
								{ value: "Inactive", label: "Inactive" },
							]}
							onChange={(val) => setFormStatus((val || "Active") as any)}
							widthClass='w-full'
						/>
					</div>
				</div>
			</EnterpriseModal>
		</motion.div>
	);
};
