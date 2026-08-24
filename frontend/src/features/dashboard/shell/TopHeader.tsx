"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Badge } from "@/design-system";
import type {
	QuickNotification,
	CurrentUser,
} from "@/features/dashboard/types/dashboard.types";
import { useIdleTimerContext } from "@/hooks/useIdleTimer";
import { useTheme, type Theme } from "@/providers/theme-provider";
import {
	useAppDispatch,
	useAppSelector,
	selectCurrentUser,
	logout,
	notifyInfo,
} from "@/store";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface TopHeaderProps {
	onMobileMenuOpen: () => void;
}

/**
 * STEP Enterprise TopHeader — Clean Streamlined Profile Dropdown with Interactive Breadcrumbs
 */
export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuOpen }) => {
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const reduxUser = useAppSelector(selectCurrentUser);

	const { isIdle, formattedTime, resetTimer } = useIdleTimerContext();
	const { theme, toggleTheme, setThemeWithTransition } = useTheme();

	const [notifOpen, setNotifOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const notifRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const displayName =
		mounted ? reduxUser?.name || "Administrator" : "Administrator";
	const displayEmail =
		mounted ? reduxUser?.email || "admin@sthapatya.com" : "admin@sthapatya.com";
	const displayRole =
		mounted ?
			reduxUser?.role || "System Administrator"
		:	"System Administrator";
	const avatarInitials =
		(displayName || "Administrator")
			.split(" ")
			.map((w) => w[0])
			.filter(Boolean)
			.join("")
			.slice(0, 2)
			.toUpperCase() || "A";

	const user: CurrentUser = {
		name: displayName,
		email: displayEmail,
		role: displayRole,
		avatarInitials,
	};

	const notifications: QuickNotification[] = [];

	const isDirector = user.role?.toLowerCase().includes("director") ?? false;

	const unreadCount = notifications.filter((n) => !n.read).length;

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
				setNotifOpen(false);
			}
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setNotifOpen(false);
				setProfileOpen(false);
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);

	const notifIconMap: Record<string, string> = {
		info: "info",
		success: "check-circle",
		warning: "alert-triangle",
		error: "x-circle",
	};
	const notifColorMap: Record<string, string> = {
		info: "text-status-info",
		success: "text-status-success",
		warning: "text-status-warning",
		error: "text-status-danger",
	};

	const BREADCRUMB_MAP: { match: string; label: string; href: string }[] = [
		{
			match: "/dashboard/candidates",
			label: "Candidates",
			href: "/dashboard/candidates",
		},
		{
			match: "/dashboard/assessments",
			label: "Assessments",
			href: "/dashboard/assessments",
		},
		{
			match: "/dashboard/users",
			label: "Users & Access",
			href: "/dashboard/users",
		},
		{
			match: "/dashboard/vacancies",
			label: "Vacancies",
			href: "/dashboard/vacancies",
		},
		{
			match: "/dashboard/reports",
			label: "Reports",
			href: "/dashboard/reports",
		},
		{
			match: "/dashboard/settings",
			label: "Master Data & Settings",
			href: "/dashboard/settings",
		},
	];

	const activeCrumb = BREADCRUMB_MAP.find((b) => pathname?.includes(b.match));
	const isDashboardRoot = !activeCrumb;

	return (
		<header className='sticky top-0 z-30 h-(--header-height) flex items-center justify-between px-4 sm:px-6 bg-surface-1 border-b border-border-default backdrop-blur-md'>
			{/* Left: Mobile Menu Trigger + Interactive Breadcrumb */}
			<div className='flex items-center gap-3'>
				<button
					type='button'
					className='lg:hidden p-1.5 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors focus-ring-step cursor-pointer'
					onClick={onMobileMenuOpen}
					aria-label='Open navigation menu'>
					<Icon
						name='menu'
						size='sm'
					/>
				</button>

				<nav
					aria-label='Breadcrumb'
					className='flex items-center gap-1 sm:gap-2 text-(--type-body-md-size) select-none'>
					<button
						type='button'
						onClick={() => router.push("/dashboard")}
						className='text-[11px] sm:text-[13px] font-medium text-text-tertiary hover:text-accent-indigo hover:underline tracking-tight cursor-pointer transition-colors'>
						STEP
					</button>
					<Icon
						name='chevron-right'
						size='xs'
						className='text-text-tertiary opacity-60 shrink-0'
					/>

					<button
						type='button'
						onClick={() => router.push("/dashboard")}
						className={`text-[11px] sm:text-[13.5px] tracking-tight font-heading cursor-pointer transition-colors ${
							isDashboardRoot ?
								"font-bold text-text-primary"
							:	"font-medium text-text-tertiary hover:text-accent-indigo hover:underline"
						}`}>
						Dashboard
					</button>

					{activeCrumb && (
						<>
							<Icon
								name='chevron-right'
								size='xs'
								className='text-text-tertiary opacity-60 shrink-0'
							/>
							<button
								type='button'
								onClick={() => router.push(activeCrumb.href)}
								className='text-[11px] sm:text-[13.5px] font-bold text-text-primary tracking-tight font-heading hover:text-accent-indigo cursor-pointer truncate max-w-25 sm:max-w-none'>
								{activeCrumb.label}
							</button>
						</>
					)}
				</nav>
			</div>

			{/* Right: Idle Badge + Notifications + Profile */}
			<div className='flex items-center gap-3'>
				{/* Live Idle 15-Min Auto-Logout Badge */}
				{isIdle && (
					<button
						type='button'
						onClick={resetTimer}
						title='Auto-logout timer. Click or move mouse to reset.'
						className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-warning-bg border border-status-warning-border text-status-warning-text text-xs font-bold font-mono cursor-pointer hover:opacity-90 transition-all shadow-xs animate-pulse'>
						<Icon
							name='alert-triangle'
							size='xs'
						/>
						<span>{formattedTime}</span>
					</button>
				)}

				{/* Theme Toggle Trigger */}
				<button
					type='button'
					id='theme-toggle-trigger'
					className='size-8.5 flex items-center justify-center rounded-xl border border-border-default bg-surface-2/60 hover:bg-surface-2 hover:border-accent-indigo/40 text-text-secondary hover:text-text-primary hover:scale-[1.02] active:scale-95 transition-all duration-150 focus-ring-step cursor-pointer shadow-xs'
					onClick={(e) => toggleTheme(e)}
					aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
					title={`Current theme: ${theme}. Click to toggle.`}>
					<Icon
						name={theme === "dark" ? "sun" : "moon"}
						size='xs'
					/>
				</button>

				{/* Notification Bell Trigger */}
				<div
					className='relative'
					ref={notifRef}>
					<button
						type='button'
						id='notifications-trigger'
						className='relative size-8.5 flex items-center justify-center rounded-xl border border-border-default bg-surface-2/60 hover:bg-surface-2 hover:border-accent-indigo/40 text-text-secondary hover:text-text-primary hover:scale-[1.02] active:scale-95 transition-all duration-150 focus-ring-step cursor-pointer shadow-xs'
						onClick={() => {
							setNotifOpen((o) => !o);
							setProfileOpen(false);
						}}
						aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
						aria-expanded={notifOpen}
						aria-haspopup='true'>
						<Icon
							name='bell'
							size='xs'
						/>
						{unreadCount > 0 && (
							<span className='absolute top-1.5 right-1.5 size-2 rounded-full bg-status-danger ring-2 ring-surface-1' />
						)}
					</button>

					<AnimatePresence>
						{notifOpen && (
							<motion.div
								initial={{ opacity: 0, scale: 0.98, y: 6 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.98, y: 4 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className='absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-1 border border-border-default rounded-lg shadow-xl z-50 overflow-hidden origin-top-right'>
								<div className='flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-2'>
									<div className='flex items-center gap-2'>
										<span className='text-[13px] font-bold text-text-primary font-heading'>
											Notifications
										</span>
										{unreadCount > 0 && (
											<Badge
												variant='danger'
												size='sm'>
												{unreadCount} new
											</Badge>
										)}
									</div>
								</div>

								<div className='max-h-80 overflow-y-auto divide-y divide-border-soft scrollbar-step'>
									{notifications.length === 0 ?
										<div className='p-6 text-center text-xs text-text-tertiary'>
											No notifications available.
										</div>
									:	notifications.map((n) => (
											<div
												key={n.id}
												className={`p-3 text-xs flex items-start gap-3 hover:bg-surface-hover transition-colors ${
													!n.read ? "bg-accent-indigo-dim/20" : ""
												}`}>
												<div className='mt-0.5 shrink-0'>
													<Icon
														name={(notifIconMap[n.type] || "info") as any}
														size='xs'
														className={
															notifColorMap[n.type] || "text-text-secondary"
														}
													/>
												</div>
												<div className='flex-1 min-w-0'>
													<div className='font-semibold text-text-primary leading-tight'>
														{n.title}
													</div>
													<div className='text-text-secondary text-[11.5px] mt-0.5 leading-snug'>
														{n.description}
													</div>
													<div className='text-[10px] text-text-tertiary mt-1 font-mono'>
														{n.time}
													</div>
												</div>
											</div>
										))
									}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Profile Dropdown */}
				<div
					className='relative'
					ref={profileRef}>
					<button
						type='button'
						id='profile-menu-trigger'
						className='h-8.5 pl-1 pr-2.5 rounded-xl border border-border-default bg-surface-2/60 hover:bg-surface-2 hover:border-accent-indigo/40 transition-all focus-ring-step cursor-pointer flex items-center gap-2 shadow-xs'
						onClick={() => {
							setProfileOpen((o) => !o);
							setNotifOpen(false);
						}}
						aria-expanded={profileOpen}
						aria-haspopup='true'>
						<div className='size-6.5 rounded-lg bg-linear-to-br from-(--accent-indigo) to-[#4f46e5] text-white font-bold text-[11px] font-mono flex items-center justify-center shadow-xs border border-indigo-400/30 shrink-0'>
							{user.avatarInitials}
						</div>
						<div className='hidden sm:flex flex-col text-left justify-center min-w-0'>
							<span className='text-xs font-bold text-text-primary leading-none font-heading truncate max-w-32.5'>
								{user.name}
							</span>
							<span className='text-[10px] text-text-tertiary font-medium leading-none mt-0.5 truncate'>
								{user.role}
							</span>
						</div>
						<Icon
							name='chevron-down'
							size='xs'
							className={`text-text-tertiary transition-transform duration-150 shrink-0 ${
								profileOpen ? "rotate-180 text-text-primary" : ""
							}`}
						/>
					</button>

					<AnimatePresence>
						{profileOpen && (
							<motion.div
								initial={{ opacity: 0, scale: 0.98, y: 6 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.98, y: 4 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className='absolute right-0 top-full mt-2 w-64 bg-surface-1 border border-border-default rounded-lg shadow-xl z-50 overflow-hidden origin-top-right divide-y divide-border-default'>
								{/* User info header */}
								<div className='p-3.5 bg-surface-2 flex items-center gap-3'>
									<div className='size-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold text-[13px] flex items-center justify-center shrink-0 shadow-xs'>
										{user.avatarInitials}
									</div>
									<div className='flex flex-col min-w-0'>
										<span className='text-[13px] font-bold text-text-primary truncate font-heading leading-tight'>
											{user.name}
										</span>
										<span className='text-[11px] text-text-tertiary truncate font-medium'>
											{user.email}
										</span>
										<span className='inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold text-accent-indigo bg-accent-indigo-dim w-fit mt-1 uppercase tracking-wider border border-accent-indigo/25'>
											{user.role}
										</span>
									</div>
								</div>

								{/* Actions */}
								<div className='p-1.5 space-y-0.5 text-xs font-medium'>
									{/* Theme Selector */}
									<div className='px-3 py-2 flex items-center justify-between'>
										<span className='text-[11px] font-bold text-text-tertiary uppercase tracking-wider'>
											Theme
										</span>
										<div className='flex items-center gap-0.5 bg-surface-3 p-1 rounded-lg border border-border-default'>
											{(["light", "dark", "system"] as Theme[]).map((t) => (
												<button
													key={t}
													type='button'
													onClick={(e) => setThemeWithTransition(t, e)}
													className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all cursor-pointer ${
														theme === t ?
															"bg-accent-indigo text-white shadow-xs"
														:	"text-text-secondary hover:text-text-primary hover:bg-surface-hover"
													}`}>
													{t}
												</button>
											))}
										</div>
									</div>

									<button
										type='button'
										onClick={() => {
											setProfileOpen(false);
											setIsChangePasswordOpen(true);
										}}
										className='w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer'>
										<Icon
											name={isDirector ? "shield" : "lock"}
											size='xs'
											className='text-text-tertiary'
										/>
										<span>{isDirector ? "Change PIN" : "Change Password"}</span>
									</button>

									<button
										type='button'
										onClick={() => {
											setProfileOpen(false);
											router.push("/dashboard/settings");
										}}
										className='w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer'>
										<Icon
											name='settings'
											size='xs'
											className='text-text-tertiary'
										/>
										<span>System Settings</span>
									</button>
								</div>

								{/* Sign out */}
								<div className='p-1.5'>
									<button
										type='button'
										onClick={() => {
											setProfileOpen(false);
											dispatch(logout());
											dispatch(
												notifyInfo({
													title: "Signed Out",
													description: "You have been safely signed out.",
												}),
											);
											router.replace("/");
										}}
										className='w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-status-danger hover:bg-status-danger-bg transition-colors cursor-pointer font-semibold active:scale-[0.98]'>
										<Icon
											name='log-out'
											size='xs'
										/>
										<span>Sign Out</span>
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			<ChangePasswordModal
				isOpen={isChangePasswordOpen}
				onClose={() => setIsChangePasswordOpen(false)}
				isDirector={isDirector}
			/>
		</header>
	);
};
