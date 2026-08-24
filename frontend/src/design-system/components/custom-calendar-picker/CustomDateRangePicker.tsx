"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Icon } from "../../icon";

export interface CustomDateRangePickerProps {
	value?: string; // Format: "YYYY-MM-DD:YYYY-MM-DD" or "YYYY-MM-DD" or ""
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

const MONTHS_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const MONTHS_FULL = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function formatDateDisplay(dateStr: string): string {
	if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
	const [y, m, d] = dateStr.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTodayStr(): string {
	return new Date().toISOString().split("T")[0];
}

function getOffsetDateStr(daysOffset: number): string {
	const d = new Date();
	d.setDate(d.getDate() + daysOffset);
	return d.toISOString().split("T")[0];
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
	value = "",
	onChange,
	placeholder = "Any Date",
	className = "",
	disabled = false,
}) => {
	const [open, setOpen] = useState(false);

	// Parse value into from / to
	const { currentFrom, currentTo } = useMemo(() => {
		if (!value) return { currentFrom: "", currentTo: "" };
		const parts = value.split(":");
		return {
			currentFrom: parts[0] || "",
			currentTo: parts[1] || "",
		};
	}, [value]);

	// Draft state inside popover
	const [draftFrom, setDraftFrom] = useState<string>(currentFrom);
	const [draftTo, setDraftTo] = useState<string>(currentTo);
	const [hoverDate, setHoverDate] = useState<string | null>(null);

	// Calendar View month & year
	const [viewYear, setViewYear] = useState<number>(() => {
		if (currentFrom && /^\d{4}-\d{2}-\d{2}$/.test(currentFrom)) {
			return Number(currentFrom.split("-")[0]);
		}
		return new Date().getFullYear();
	});

	const [viewMonth, setViewMonth] = useState<number>(() => {
		if (currentFrom && /^\d{4}-\d{2}-\d{2}$/.test(currentFrom)) {
			return Number(currentFrom.split("-")[1]) - 1;
		}
		return new Date().getMonth();
	});

	// Sync draft when opening
	useEffect(() => {
		if (open) {
			setDraftFrom(currentFrom);
			setDraftTo(currentTo);
			setHoverDate(null);
			if (currentFrom && /^\d{4}-\d{2}-\d{2}$/.test(currentFrom)) {
				const [y, m] = currentFrom.split("-").map(Number);
				setViewYear(y);
				setViewMonth(m - 1);
			}
		}
	}, [open, currentFrom, currentTo]);

	// Quick Preset Handlers
	const applyPreset = (from: string, to: string) => {
		setDraftFrom(from);
		setDraftTo(to);
		onChange(
			from && to ? `${from}:${to}`
			: from ? `${from}:`
			: "",
		);
		setOpen(false);
	};

	const handleClear = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		setDraftFrom("");
		setDraftTo("");
		onChange("");
		setOpen(false);
	};

	const handleApply = () => {
		if (!draftFrom && !draftTo) {
			onChange("");
		} else if (draftFrom && !draftTo) {
			onChange(`${draftFrom}:${draftFrom}`);
		} else {
			onChange(`${draftFrom}:${draftTo}`);
		}
		setOpen(false);
	};

	// Calendar Day Click Logic
	const handleDayClick = (dateStr: string) => {
		if (!draftFrom || (draftFrom && draftTo)) {
			// Start fresh selection
			setDraftFrom(dateStr);
			setDraftTo("");
		} else if (draftFrom && !draftTo) {
			if (dateStr < draftFrom) {
				// Clicked a day before start -> make it the new start
				setDraftFrom(dateStr);
			} else {
				// Complete the range
				setDraftTo(dateStr);
			}
		}
	};

	// Calendar Month Navigation
	const handlePrevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((y) => y - 1);
		} else {
			setViewMonth((m) => m - 1);
		}
	};

	const handleNextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((y) => y + 1);
		} else {
			setViewMonth((m) => m + 1);
		}
	};

	// Calendar Day Grid Computation
	const days = useMemo(() => {
		const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
		const list: { day: number; isCurrentMonth: boolean; dateStr: string }[] =
			[];

		// Preceding month filler days
		for (let i = firstDayIndex - 1; i >= 0; i--) {
			const dayNum = prevMonthDays - i;
			const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
			const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
			list.push({
				day: dayNum,
				isCurrentMonth: false,
				dateStr: `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
			});
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			list.push({
				day: i,
				isCurrentMonth: true,
				dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
			});
		}

		// Trailing month filler days
		const totalCells = Math.ceil(list.length / 7) * 7;
		const remaining = totalCells - list.length;
		for (let i = 1; i <= remaining; i++) {
			const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
			const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
			list.push({
				day: i,
				isCurrentMonth: false,
				dateStr: `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
			});
		}

		return list;
	}, [viewYear, viewMonth]);

	// Display trigger label
	const displayLabel = useMemo(() => {
		if (!currentFrom && !currentTo) return placeholder;
		if (currentFrom && currentTo) {
			if (currentFrom === currentTo) return formatDateDisplay(currentFrom);
			return `${formatDateDisplay(currentFrom)} – ${formatDateDisplay(currentTo)}`;
		}
		if (currentFrom) return `Since ${formatDateDisplay(currentFrom)}`;
		if (currentTo) return `Until ${formatDateDisplay(currentTo)}`;
		return placeholder;
	}, [currentFrom, currentTo, placeholder]);

	const hasValue = Boolean(currentFrom || currentTo);

	return (
		<PopoverPrimitive.Root
			open={open}
			onOpenChange={setOpen}>
			<PopoverPrimitive.Trigger asChild>
				<button
					type='button'
					disabled={disabled}
					className={`h-10 px-3.5 rounded-xl text-xs border flex items-center justify-between gap-1.5 transition-all duration-150 ease-out cursor-pointer select-none focus-ring-step outline-none ${
						hasValue ?
							"bg-[var(--surface-2)] border-[var(--accent-indigo)]/50 text-[var(--text-primary)] font-semibold shadow-2xs"
						:	"bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium shadow-2xs"
					} ${open ? "border-[var(--accent-indigo)] ring-2 ring-[var(--accent-indigo)]/20" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
					title={displayLabel}>
					<span className='truncate'>{displayLabel}</span>

					<div className='flex items-center gap-1 shrink-0'>
						{hasValue && (
							<span
								role='button'
								tabIndex={0}
								onClick={handleClear}
								onKeyDown={(e) => e.key === "Enter" && handleClear()}
								className='size-4 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer'
								title='Clear date filter'>
								<Icon
									name='x'
									size='xs'
								/>
							</span>
						)}
						<Icon
							name='chevron-down'
							size='xs'
							className={`shrink-0 transition-transform duration-150 ${
								hasValue ?
									"text-[var(--accent-indigo)]"
								:	"text-[var(--text-tertiary)]"
							} ${open ? "rotate-180 text-[var(--accent-indigo)]" : ""}`}
						/>
					</div>
				</button>
			</PopoverPrimitive.Trigger>

			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					align='start'
					sideOffset={6}
					className='z-[99999] w-[460px] max-w-[95vw] bg-surface-1 border border-border-default rounded-2xl shadow-xl p-4 backdrop-blur-md outline-none select-none animate-in fade-in zoom-in-95 duration-150'>
					<div className='flex flex-col sm:flex-row gap-4'>
						{/* Left Column: Quick Presets */}
						<div className='flex flex-col gap-1 sm:w-36 shrink-0 border-b sm:border-b-0 sm:border-r border-border-soft pb-3 sm:pb-0 sm:pr-3'>
							<span className='text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-2 mb-1'>
								Quick Presets
							</span>

							<button
								type='button'
								onClick={() => applyPreset(getTodayStr(), getTodayStr())}
								className='w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer'>
								Today
							</button>

							<button
								type='button'
								onClick={() => applyPreset(getOffsetDateStr(-6), getTodayStr())}
								className='w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer'>
								Last 7 Days
							</button>

							<button
								type='button'
								onClick={() =>
									applyPreset(getOffsetDateStr(-29), getTodayStr())
								}
								className='w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer'>
								Last 30 Days
							</button>

							<button
								type='button'
								onClick={() => {
									const now = new Date();
									const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
									applyPreset(firstDay, getTodayStr());
								}}
								className='w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer'>
								This Month
							</button>

							<button
								type='button'
								onClick={() => applyPreset("", "")}
								className='w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-status-danger-text hover:bg-status-danger-bg transition-colors cursor-pointer mt-auto'>
								All Time (Clear)
							</button>
						</div>

						{/* Right Column: Interactive Month Calendar */}
						<div className='flex-1 min-w-0 flex flex-col'>
							{/* Calendar Month Header */}
							<div className='flex items-center justify-between mb-2.5 pb-2 border-b border-border-soft'>
								<button
									type='button'
									onClick={handlePrevMonth}
									className='size-7 rounded-lg border border-border-default hover:border-border-strong bg-surface-2 hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer'
									title='Previous Month'>
									<Icon
										name='chevron-left'
										size='xs'
									/>
								</button>

								<span className='font-bold text-xs text-text-primary'>
									{MONTHS_FULL[viewMonth]} {viewYear}
								</span>

								<button
									type='button'
									onClick={handleNextMonth}
									className='size-7 rounded-lg border border-border-default hover:border-border-strong bg-surface-2 hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer'
									title='Next Month'>
									<Icon
										name='chevron-right'
										size='xs'
									/>
								</button>
							</div>

							{/* Day Name Headers */}
							<div className='grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-text-tertiary uppercase'>
								<span>Su</span>
								<span>Mo</span>
								<span>Tu</span>
								<span>We</span>
								<span>Th</span>
								<span>Fr</span>
								<span>Sa</span>
							</div>

							{/* Day Grid */}
							<div className='grid grid-cols-7 gap-1'>
								{days.map((item, idx) => {
									const isStart = draftFrom === item.dateStr;
									const isEnd = draftTo === item.dateStr;
									const effectiveEnd =
										draftTo ||
										(draftFrom && hoverDate && hoverDate >= draftFrom ?
											hoverDate
										:	null);
									const inRange =
										draftFrom &&
										effectiveEnd &&
										item.dateStr > draftFrom &&
										item.dateStr < effectiveEnd;

									return (
										<button
											key={idx}
											type='button'
											onClick={() => handleDayClick(item.dateStr)}
											onMouseEnter={() => setHoverDate(item.dateStr)}
											className={`h-7 text-xs rounded-lg flex items-center justify-center font-medium transition-all cursor-pointer relative ${
												!item.isCurrentMonth ?
													"text-text-tertiary opacity-30"
												:	"text-text-primary"
											} ${
												isStart || isEnd ?
													"bg-accent-indigo text-white font-bold shadow-xs z-10"
												: inRange ?
													"bg-accent-indigo-dim text-accent-indigo rounded-none font-semibold"
												:	"hover:bg-surface-hover"
											}`}>
											{item.day}
										</button>
									);
								})}
							</div>

							{/* Footer Range Info & Actions */}
							<div className='mt-3 pt-2.5 border-t border-border-soft flex items-center justify-between gap-2'>
								<span className='text-[11px] text-text-tertiary font-mono truncate'>
									{draftFrom ?
										<>
											<strong className='text-text-primary'>
												{formatDateDisplay(draftFrom)}
											</strong>
											{draftTo ?
												<>
													{" "}
													→{" "}
													<strong className='text-text-primary'>
														{formatDateDisplay(draftTo)}
													</strong>
												</>
											:	" (Select end date)"}
										</>
									:	"Select date range"}
								</span>

								<div className='flex items-center gap-1.5 shrink-0'>
									<button
										type='button'
										onClick={() => handleClear()}
										className='h-7 px-2 rounded-lg text-xs font-semibold text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer'>
										Reset
									</button>
									<button
										type='button'
										onClick={handleApply}
										className='h-7 px-3 rounded-lg bg-accent-indigo hover:bg-accent-indigo-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer'>
										Apply
									</button>
								</div>
							</div>
						</div>
					</div>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
};
