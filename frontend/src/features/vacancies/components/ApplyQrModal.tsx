"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Icon, EnterpriseModal } from "@/design-system";
import { getAppOrigin } from "@/lib/utils/url-helper";
import type { VacancyItem } from "../types/vacancy.types";

interface ApplyQrModalProps {
	vacancy: VacancyItem | null;
	isOpen: boolean;
	onClose: () => void;
}

export const ApplyQrModal: React.FC<ApplyQrModalProps> = ({
	vacancy,
	isOpen,
	onClose,
}) => {
	const [copied, setCopied] = useState(false);

	if (!vacancy) return null;

	const origin = getAppOrigin();
	const vacancyCode = (vacancy as any).vacancyCode || vacancy.code || String(vacancy.id);
	const applyUrl = `${origin}/apply/${vacancyCode}`;
	const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(applyUrl)}`;

	const isDirect =
		vacancy.driveType?.toLowerCase().includes("direct") ||
		(vacancy as any).hiringModel?.toLowerCase().includes("direct");

	const handleCopy = () => {
		if (typeof window !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText(applyUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2200);
			toast.success("Apply Link Copied", {
				description: "URL has been copied to your clipboard.",
			});
		}
	};

	const handleOpenTestLink = () => {
		window.open(applyUrl, "_blank", "noopener,noreferrer");
	};

	const handleDownloadQr = () => {
		window.open(qrImageUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<EnterpriseModal
			isOpen={isOpen}
			onClose={onClose}
			title='Vacancy Apply QR & Link'
			subtitle={`${vacancy.title} (${vacancyCode}) • ${vacancy.role}`}
			icon='qr-code'
			maxWidth='lg'
			headerAction={
				<span
					className={`text-[10px] font-bold px-2.5 py-1 rounded-full border font-mono whitespace-nowrap ${
						isDirect
							? "bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border-[var(--accent-violet)]/30"
							: "bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30"
					}`}>
					{isDirect ? "Direct Hiring" : "Walk-in Drive"}
				</span>
			}
			hideFooter>
			<div className='flex flex-col gap-5 py-1'>
				{/* Top Summary Info */}
				<div className='flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)]'>
					<div className='flex items-center gap-2 flex-wrap'>
						<span>📍 <strong>{vacancy.hiringLocation || "Main Center"}</strong></span>
						<span className='text-[var(--text-tertiary)]'>•</span>
						<span>🏢 <strong>{vacancy.department || "Engineering"}</strong></span>
						<span className='text-[var(--text-tertiary)]'>•</span>
						<span className='text-[var(--accent-indigo)] font-bold'>{vacancy.openPositions} Open Positions</span>
					</div>
					<span className='font-mono font-bold text-[11px] text-[var(--text-primary)] px-2 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border-default)]'>
						{vacancyCode}
					</span>
				</div>

				{/* High-Resolution QR Code Presentation */}
				<div className='flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] relative overflow-hidden'>
					<div className='relative p-3 bg-white rounded-2xl shadow-md border border-[var(--border-default)]'>
						<img
							src={qrImageUrl}
							alt={`QR Code for ${vacancy.title}`}
							className='w-52 h-52 object-contain rounded-lg'
						/>
						<div className='absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[9px] font-mono text-white font-bold'>
							STEP PORTAL
						</div>
					</div>

					<span className='text-xs font-semibold text-[var(--text-secondary)] mt-3.5 flex items-center gap-1.5'>
						<span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
						Scan with any mobile camera or QR reader
					</span>

					{/* Route Track Explanation */}
					<div className='mt-3.5 text-center max-w-sm'>
						<p className='text-[11.5px] text-[var(--text-tertiary)] leading-relaxed'>
							{isDirect ? (
								<>
									Candidates who apply through this link submit their profile directly for{" "}
									<strong className='text-[var(--text-secondary)]'>Round 1 HR Screening</strong>.
								</>
							) : (
								<>
									Candidates scanning this code will register for the{" "}
									<strong className='text-[var(--text-secondary)]'>Walk-in Drive</strong> and immediately take{" "}
									<strong className='text-[var(--text-secondary)]'>Round 1 Proctored Assessment</strong>.
								</>
							)}
						</p>
					</div>
				</div>

				{/* Direct URL Input & One-Click Copy */}
				<div className='flex flex-col gap-2'>
					<label className='text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono'>
						Candidate Registration URL
					</label>
					<div className='flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] focus-within:border-[var(--accent-indigo)] transition-colors'>
						<Icon name='link' size='xs' className='text-[var(--text-tertiary)] shrink-0' />
						<input
							type='text'
							readOnly
							value={applyUrl}
							className='w-full bg-transparent text-xs font-mono text-[var(--text-primary)] outline-none select-all truncate'
						/>
						<button
							type='button'
							onClick={handleCopy}
							className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
								copied
									? "bg-[var(--status-success)] text-white"
									: "bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-default)]"
							}`}>
							<Icon name={copied ? "check-circle" : "copy"} size='xs' />
							<span>{copied ? "Copied!" : "Copy"}</span>
						</button>
					</div>
				</div>

				{/* Modal Action Buttons */}
				<div className='flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-default)]'>
					<button
						type='button'
						onClick={handleDownloadQr}
						className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer'>
						<Icon name='download' size='xs' />
						<span>Download QR</span>
					</button>

					<div className='flex items-center gap-2'>
						<button
							type='button'
							onClick={onClose}
							className='px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer'>
							Close
						</button>
						<button
							type='button'
							onClick={handleOpenTestLink}
							className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-xs'>
							<Icon name='external-link' size='xs' />
							<span>Test Apply Link</span>
						</button>
					</div>
				</div>
			</div>
		</EnterpriseModal>
	);
};
