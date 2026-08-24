"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/design-system";
import { EmptyState } from "../shared/EmptyState";
import {
	CANDIDATE_COLUMNS,
	type CandidateColumnId,
} from "../config/candidateColumns";
import type { DashboardCandidate } from "@/features/dashboard/types/dashboard.types";

interface CandidateTableProps {
	candidates: DashboardCandidate[];
	loading?: boolean;
	visibleColumnIds?: CandidateColumnId[];
	onView?: (c: DashboardCandidate) => void;
	onViewProgress?: (c: DashboardCandidate) => void;
	onResume?: (c: DashboardCandidate) => void;
	onEdit?: (c: DashboardCandidate) => void;
	onDelete?: (c: DashboardCandidate) => void;
	onDownload?: (c: DashboardCandidate) => void;
	filterKey?: string;
}

/** Render candidate initials avatar with radiant border */
const InitialsAvatar: React.FC<{ name: string }> = ({ name }) => {
	const initials = name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();

	const colors = [
		["--accent-indigo-dim", "--accent-indigo"],
		["--accent-violet-dim", "--accent-violet"],
		["--accent-teal-dim", "--accent-teal"],
		["--accent-blue-dim", "--accent-blue"],
		["--accent-cyan-dim", "--accent-cyan"],
		["--status-success-bg", "--status-success-text"],
		["--accent-orange-dim", "--accent-orange"],
	];
	const colorIdx = name.charCodeAt(0) % colors.length;
	const [bg, fg] = colors[colorIdx];

	return (
		<span
			className='w-6 h-6 md:w-6.5 md:h-6.5 rounded-full flex items-center justify-center text-[10px] md:text-[10.5px] font-black shrink-0 transition-transform duration-150 group-hover:scale-105 shadow-2xs border border-white/10'
			style={{ background: `var(${bg})`, color: `var(${fg})` }}
			aria-hidden='true'>
			{initials}
		</span>
	);
};

/** Skeleton row for loading state */
const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
	<tr className='border-b border-[var(--border-soft)]'>
		{Array.from({ length: cols }).map((_, i) => (
			<td
				key={i}
				className='px-3 py-2'>
				<div
					className='h-3 rounded-[var(--radius-xs)]'
					style={{
						width:
							i === 0 ? "24px"
							: i === 1 ? "110px"
							: i % 2 === 0 ? "70px"
							: "55px",
						background: "var(--shimmer-base)",
						backgroundImage:
							"linear-gradient(90deg, var(--shimmer-base) 25%, var(--shimmer-highlight) 50%, var(--shimmer-base) 75%)",
						backgroundSize: "200% 100%",
						animation: "step-shimmer 1.8s ease-in-out infinite",
					}}
				/>
			</td>
		))}
	</tr>
);

/**
 * STEP Enterprise CandidateTable with Micro-Interactions
 *
 * Micro-interactions:
 * - Table filtering / pagination switching: Rows fade in (180ms easeOut)
 * - Row hover: 120ms background color transition with left accent indicator
 * - Row action icons: Smooth slide/glow on hover
 */
export const CandidateTable: React.FC<CandidateTableProps> = ({
	candidates,
	loading = false,
	visibleColumnIds,
	onView,
	onViewProgress,
	filterKey = "table-root",
}) => {
	const columns = useMemo(
		() =>
			visibleColumnIds ?
				CANDIDATE_COLUMNS.filter((c) => visibleColumnIds.includes(c.id))
			:	CANDIDATE_COLUMNS,
		[visibleColumnIds],
	);

	const getStageBadgeStyle = (stage: string) => {
		const s = stage?.toLowerCase() || "";
		if (
			s.includes("screen") ||
			s.includes("applied") ||
			s.includes("register")
		) {
			return {
				bg: "var(--accent-cyan-dim)",
				color: "var(--accent-cyan)",
				border: "rgba(8, 145, 178, 0.35)",
				icon: "filter",
			};
		}
		if (
			s.includes("assess") ||
			s.includes("test") ||
			s.includes("tech 1") ||
			s.includes("l1") ||
			s.includes("aptitude")
		) {
			return {
				bg: "var(--accent-violet-dim)",
				color: "var(--accent-violet)",
				border: "rgba(139, 92, 246, 0.35)",
				icon: "clipboard-check",
			};
		}
		if (
			s.includes("interview") ||
			s.includes("f2f") ||
			s.includes("tech 2") ||
			s.includes("l2") ||
			s.includes("technical")
		) {
			return {
				bg: "var(--accent-indigo-dim)",
				color: "var(--accent-indigo)",
				border: "rgba(99, 102, 241, 0.35)",
				icon: "mic",
			};
		}
		if (
			s.includes("director") ||
			s.includes("mgmt") ||
			s.includes("final") ||
			s.includes("hr")
		) {
			return {
				bg: "var(--status-warning-bg)",
				color: "var(--status-warning-text)",
				border: "var(--status-warning-border)",
				icon: "shield",
			};
		}
		if (s.includes("offer")) {
			return {
				bg: "var(--accent-blue-dim)",
				color: "var(--accent-blue)",
				border: "rgba(37, 99, 235, 0.35)",
				icon: "send",
			};
		}
		if (s.includes("hired") || s.includes("join") || s.includes("select")) {
			return {
				bg: "var(--status-success-bg)",
				color: "var(--status-success-text)",
				border: "var(--status-success-border)",
				icon: "check-circle",
			};
		}
		if (s.includes("hold") || s.includes("withdraw") || s.includes("pause")) {
			return {
				bg: "var(--accent-orange-dim)",
				color: "var(--accent-orange)",
				border: "rgba(234, 88, 12, 0.35)",
				icon: "pause-circle",
			};
		}
		if (s.includes("reject") || s.includes("drop")) {
			return {
				bg: "var(--status-danger-bg)",
				color: "var(--status-danger-text)",
				border: "var(--status-danger-border)",
				icon: "x-circle",
			};
		}
		return {
			bg: "var(--surface-3)",
			color: "var(--text-secondary)",
			border: "var(--border-default)",
			icon: "users",
		};
	};

	const renderCell = (
		col: (typeof columns)[0],
		candidate: DashboardCandidate,
	) => {
		const cellPadding = "px-2 xl:px-2.5 py-1.5 md:py-2 min-w-0";
		const textSize = "text-[11.5px] md:text-[12px] xl:text-[12.5px]";

		switch (col.id) {
			case "avatar":
				return (
					<td
						key={col.id}
						className='pl-3.5 pr-2.5 py-1.5 md:py-2 w-12 text-center relative'>
						{/* Radiant left hover indicator line */}
						<div className='absolute left-0 inset-y-1 w-[3px] rounded-r bg-gradient-to-b from-(--accent-indigo) to-(--accent-violet) opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-150 pointer-events-none' />
						<InitialsAvatar name={candidate.name} />
					</td>
				);

			case "candidate":
				return (
					<td
						key={col.id}
						className='pl-2.5 pr-3 py-1.5 md:py-2 min-w-0'>
						<div className='flex flex-col gap-0.5 min-w-0'>
							<span
								className={`${textSize} font-bold text-text-primary truncate font-heading group-hover:text-accent-indigo transition-colors duration-150 block`}
								title={candidate.name}>
								{candidate.name}
							</span>
							<span className='text-[10px] text-text-tertiary font-mono opacity-90 truncate block'>
								{candidate.code}
							</span>
						</div>
					</td>
				);

			case "driveType": {
				const isDirect =
					candidate.registrationChannel === "Direct" ||
					candidate.source === "HomeTest";
				return (
					<td
						key={col.id}
						className={cellPadding}>
						{isDirect ?
							<span className='inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 whitespace-nowrap shadow-xs'>
								Direct
							</span>
						:	<span className='inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 whitespace-nowrap shadow-xs'>
								Walk-in
							</span>
						}
					</td>
				);
			}

			case "email":
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<span
							className={`${textSize} text-text-secondary truncate block`}
							title={candidate.email}>
							{candidate.email}
						</span>
					</td>
				);

			case "role":
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<span
							className={`${textSize} text-text-primary font-medium truncate block`}
							title={candidate.role}>
							{candidate.role}
						</span>
					</td>
				);

			case "experience":
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<span
							className={`${textSize} text-text-secondary font-medium tabular-figures whitespace-nowrap`}>
							{candidate.experience ||
								`${candidate.experienceYears ?? 0} Years`}
						</span>
					</td>
				);

			case "currentRound": {
				const badgeStyle = getStageBadgeStyle(candidate.currentRound);
				const isLiveActive =
					!candidate.currentRound?.toLowerCase().includes("reject") &&
					!candidate.currentRound?.toLowerCase().includes("hired");
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<button
							type='button'
							onClick={(e) => {
								e.stopPropagation();
								if (onViewProgress) onViewProgress(candidate);
								else onView?.(candidate);
							}}
							style={{
								background: badgeStyle.bg,
								color: badgeStyle.color,
								borderColor: badgeStyle.border,
							}}
							className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap font-sans shadow-xs truncate max-w-full hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer'
							title={`Click to view ${candidate.name}'s live pipeline progress`}>
							{isLiveActive && (
								<span className='relative flex size-1.5 shrink-0'>
									<span className='animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current' />
									<span className='relative inline-flex rounded-full size-1.5 bg-current' />
								</span>
							)}
							<Icon
								name={badgeStyle.icon as any}
								size='xs'
								className='shrink-0 opacity-85'
							/>
							<span className='truncate'>{candidate.currentRound}</span>
						</button>
					</td>
				);
			}

			case "assignedInterviewer":
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<div className='flex items-center gap-1.5 text-[var(--text-secondary)] min-w-0'>
							<span className='w-5 h-5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-mono font-bold text-[9px] border border-[var(--accent-indigo)]/30 flex items-center justify-center shrink-0'>
								{candidate.assignedInterviewer
									.split(" ")
									.map((w) => w[0])
									.join("")}
							</span>
							<span
								className={`${textSize} truncate font-medium text-[var(--text-primary)]`}
								title={candidate.assignedInterviewer}>
								{candidate.assignedInterviewer}
							</span>
						</div>
					</td>
				);

			case "hiringLocation":
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<span
							className={`${textSize} text-[var(--text-secondary)] truncate block`}
							title={candidate.hiringLocation}>
							{candidate.hiringLocation}
						</span>
					</td>
				);

			case "appliedDate":
				return (
					<td
						key={col.id}
						className={cellPadding}>
						<span
							className={`${textSize} text-[var(--text-secondary)] font-mono tabular-figures whitespace-nowrap`}>
							{new Date(candidate.appliedDate).toLocaleDateString("en-IN", {
								day: "2-digit",
								month: "short",
							})}
						</span>
					</td>
				);

			case "actions":
				return (
					<td
						key={col.id}
						className='pl-1 pr-3.5 sm:pr-4 py-1.5 md:py-2 text-right w-[135px]'>
						<button
							type='button'
							onClick={(e) => {
								e.stopPropagation();
								if (onViewProgress) onViewProgress(candidate);
								else onView?.(candidate);
							}}
							className='inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-border-default bg-surface-1 text-text-secondary text-[11px] font-semibold hover:bg-accent-indigo-dim hover:border-accent-indigo hover:text-accent-indigo hover:shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:scale-[1.02] active:scale-95 transition-all duration-150 cursor-pointer shadow-xs whitespace-nowrap'
							title={`View ${candidate.name}'s hiring progress flow`}>
							<Icon
								name='trending-up'
								size='xs'
								className='text-accent-indigo'
							/>
							<span>View Progress</span>
						</button>
					</td>
				);

			default:
				return (
					<td
						key={col.id}
						className={cellPadding}
					/>
				);
		}
	};

	return (
		<div className='w-full overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-step'>
			<table
				className='w-full min-w-[1450px] border-collapse table-fixed'
				aria-label='Candidates'
				role='grid'>
				<colgroup>
					{columns.map((col) => {
						let widthStyle = "140px";
						if (col.id === "avatar") widthStyle = "46px";
						else if (col.id === "candidate") widthStyle = "190px";
						else if (col.id === "driveType") widthStyle = "110px";
						else if (col.id === "email") widthStyle = "220px";
						else if (col.id === "role") widthStyle = "210px";
						else if (col.id === "experience") widthStyle = "95px";
						else if (col.id === "currentRound") widthStyle = "140px";
						else if (col.id === "assignedInterviewer") widthStyle = "170px";
						else if (col.id === "hiringLocation") widthStyle = "160px";
						else if (col.id === "appliedDate") widthStyle = "110px";
						else if (col.id === "actions") widthStyle = "135px";

						return (
							<col
								key={col.id}
								style={{ width: widthStyle }}
							/>
						);
					})}
				</colgroup>

				{/* Sticky Column headers */}
				<thead className='sticky top-0 z-10 bg-surface-2/95 backdrop-blur-md shadow-xs'>
					<tr className='border-b border-border-soft'>
						{columns.map((col) => {
							const isAvatar = col.id === "avatar";
							const isCandidate = col.id === "candidate";
							const isActions = col.id === "actions";
							const paddingClass =
								isAvatar ? "pl-3.5 pr-2 py-2 md:py-2.5 w-[46px] text-center"
								: isCandidate ? "pl-2.5 pr-3 py-2 md:py-2.5 text-left"
								: isActions ?
									"pl-1 pr-3.5 sm:pr-4 py-2 md:py-2.5 text-right w-[135px]"
								:	"px-2.5 py-2 md:py-2.5 text-left";

							return (
								<th
									key={col.id}
									scope='col'
									className={`${paddingClass} text-[10px] md:text-[10.5px] xl:text-[11px] font-bold text-text-secondary font-heading uppercase tracking-[0.05em] whitespace-nowrap select-none overflow-hidden
                    ${col.sortable ? "cursor-pointer hover:text-text-primary transition-colors" : ""}
                    ${
											col.align === "center" ? "text-center"
											: col.align === "right" ? "text-right"
											: "text-left"
										}`}
									aria-sort={col.sortable ? "none" : undefined}
									title={col.label}>
									<span className='inline-flex items-center gap-1 max-w-full overflow-hidden'>
										<span className='truncate'>{col.label}</span>
										{col.sortable && (
											<Icon
												name='chevrons-up-down'
												size='xs'
												className='opacity-40 shrink-0'
											/>
										)}
									</span>
								</th>
							);
						})}
					</tr>
				</thead>

				{/* Body with Smooth Fade Animation on Filter/Page Change */}
				<AnimatePresence mode='wait'>
					<motion.tbody
						key={filterKey}
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15, ease: [0.0, 0.0, 0.2, 1] }}>
						{loading ?
							Array.from({ length: 10 }).map((_, i) => (
								<SkeletonRow
									key={i}
									cols={columns.length}
								/>
							))
						: candidates.length === 0 ?
							<tr>
								<td colSpan={columns.length}>
									<EmptyState
										icon='users'
										title='No candidates found'
										description='Try adjusting your filters or add a new candidate to get started.'
									/>
								</td>
							</tr>
						:	candidates.map((candidate, rowIdx) => (
								<tr
									key={candidate.id}
									onClick={() => onView?.(candidate)}
									role='button'
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") onView?.(candidate);
									}}
									title={`Open ${candidate.name}'s profile`}
									className={`group border-b border-border-soft hover:bg-surface-hover transition-colors duration-150 cursor-pointer select-none relative
                    ${rowIdx % 2 === 1 ? "bg-table-row-stripe" : "bg-table-row"}`}>
									{columns.map((col) => renderCell(col, candidate))}
								</tr>
							))
						}
					</motion.tbody>
				</AnimatePresence>
			</table>
		</div>
	);
};
