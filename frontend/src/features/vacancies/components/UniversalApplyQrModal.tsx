"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Icon, EnterpriseModal } from "@/design-system";
import { getAppOrigin } from "@/lib/utils/url-helper";

interface UniversalApplyQrModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const UniversalApplyQrModal: React.FC<UniversalApplyQrModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [copied, setCopied] = useState(false);

	const origin = getAppOrigin();
	const universalApplyUrl = `${origin}/apply`;
	const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(
		universalApplyUrl,
	)}`;

	const handleCopy = () => {
		if (typeof window !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText(universalApplyUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2200);
			toast.success("Universal Apply Link Copied", {
				description: "URL has been copied to your clipboard.",
			});
		}
	};

	const handleOpenTestLink = () => {
		window.open(universalApplyUrl, "_blank", "noopener,noreferrer");
	};

	const handleDownloadQr = () => {
		window.open(qrImageUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<EnterpriseModal
			isOpen={isOpen}
			onClose={onClose}
			title='Universal /apply Portal QR & Link'
			subtitle='Universal Candidate Intake — Supports all roles, hiring locations, and recruitment models'
			icon='qr-code'
			maxWidth='lg'
			headerAction={
				<span className='text-[10px] font-bold px-2.5 py-1 rounded-full border font-mono bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30 whitespace-nowrap'>
					Universal Intake Portal
				</span>
			}
			hideFooter>
			<div className='flex flex-col gap-5 py-1'>
				{/* Top Overview Banner */}
				<div className='p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs space-y-2'>
					<div className='flex items-center gap-2 font-bold text-[var(--text-primary)]'>
						<Icon name='sparkles' size='xs' className='text-[var(--accent-indigo)]' />
						<span>About the Universal Application Portal (`/apply`)</span>
					</div>
					<p className='text-[12px] text-[var(--text-secondary)] leading-relaxed'>
						This is STEP&apos;s universal entry gate for candidates. You can place this QR code on general recruitment banners, job fair booths, social media, or campus drives.
					</p>
				</div>

				{/* High-Resolution QR Code Presentation */}
				<div className='flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] relative overflow-hidden'>
					<div className='relative p-3.5 bg-white rounded-2xl shadow-md border border-[var(--border-default)]'>
						<img
							src={qrImageUrl}
							alt='Universal Application QR Code'
							className='w-52 h-52 object-contain rounded-lg'
						/>
						<div className='absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/80 backdrop-blur-xs rounded text-[9px] font-mono text-white font-bold tracking-wider'>
							STEP UNIVERSAL /APPLY
						</div>
					</div>

					<span className='text-xs font-semibold text-[var(--text-secondary)] mt-3.5 flex items-center gap-1.5'>
						<span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
						Universal QR Active — Scans direct to /apply
					</span>

					{/* 3-Step Candidate Journey Summary */}
					<div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[var(--border-default)]'>
						<div className='p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)] text-left space-y-1'>
							<div className='flex items-center gap-1.5 text-xs font-bold text-[var(--accent-indigo)]'>
								<Icon name='building' size='xs' />
								<span>Walk-in (At Center)</span>
							</div>
							<p className='text-[11px] text-[var(--text-tertiary)] leading-tight'>
								Enrolled in active Walk-in vacancy. Enters Round 1 Assessment immediately.
							</p>
						</div>

						<div className='p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)] text-left space-y-1'>
							<div className='flex items-center gap-1.5 text-xs font-bold text-[var(--accent-violet)]'>
								<Icon name='send' size='xs' />
								<span>Direct / Online</span>
							</div>
							<p className='text-[11px] text-[var(--text-tertiary)] leading-tight'>
								Enrolled in active Direct vacancy. Round 1 HR Screening is Auto-Passed.
							</p>
						</div>
					</div>
				</div>

				{/* Direct URL Input & One-Click Copy */}
				<div className='flex flex-col gap-2'>
					<label className='text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono'>
						Universal Application URL
					</label>
					<div className='flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] focus-within:border-[var(--accent-indigo)] transition-colors'>
						<Icon name='link' size='xs' className='text-[var(--text-tertiary)] shrink-0' />
						<input
							type='text'
							readOnly
							value={universalApplyUrl}
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
						<span>Download QR Poster</span>
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
							<span>Open Universal /apply</span>
						</button>
					</div>
				</div>
			</div>
		</EnterpriseModal>
	);
};
