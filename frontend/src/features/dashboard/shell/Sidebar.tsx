"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/design-system";
import { toast } from "@/design-system/feedback/toast";
import { useAppSelector, selectCurrentUser } from "@/store";
import {
	NAV_ITEMS,
	NAV_SECTIONS,
	type NavItem,
} from "../config/sidebar.config";

interface SidebarProps {
	mobileOpen: boolean;
	onMobileClose: () => void;
}

/**
 * STEP Enterprise Sidebar — Phase 1 Frozen Architecture
 *
 * Sections: RECRUITMENT, ANALYTICS, ADMINISTRATION
 * Default State: CLOSED / COLLAPSED (64px) on initial page load per user request.
 * Expands on hover-enter, collapses on hover-leave.
 */
export const Sidebar: React.FC<SidebarProps> = ({
	mobileOpen,
	onMobileClose,
}) => {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(true);
	const [mounted, setMounted] = useState(false);
	const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentUser = useAppSelector(selectCurrentUser);

	useEffect(() => {
		setMounted(true);
	}, []);

	const userRole = (
		mounted && currentUser?.role ?
			currentUser.role
		:	"Director") as "Director" | "HR" | "Interviewer" | "Administrator";

	const handleMouseEnter = useCallback(() => {
		if (collapseTimerRef.current) {
			clearTimeout(collapseTimerRef.current);
			collapseTimerRef.current = null;
		}
		setCollapsed(false);
	}, []);

	const handleMouseLeave = useCallback(() => {
		collapseTimerRef.current = setTimeout(() => {
			setCollapsed(true);
		}, 250);
	}, []);

	useEffect(() => {
		return () => {
			if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
		};
	}, []);

	useEffect(() => {
		onMobileClose();
	}, [pathname, onMobileClose]);

	const [isHeaderHovered, setIsHeaderHovered] = useState(false);

	const sections = (
		Object.keys(NAV_SECTIONS) as Array<keyof typeof NAV_SECTIONS>
	)
		.map((sectionKey) => {
			const filteredItems = NAV_ITEMS.filter((item) => {
				if (item.section !== sectionKey) return false;
				if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
				return item.allowedRoles.includes(userRole);
			});
			return {
				key: sectionKey,
				label: NAV_SECTIONS[sectionKey],
				items: filteredItems,
			};
		})
		.filter((section) => section.items.length > 0);

	const isActive = (href: string) => {
		if (href === "/dashboard") return pathname === "/dashboard";
		return pathname.startsWith(href);
	};

	const sidebarContent = (
		<nav
			aria-label='Main navigation'
			className={`flex flex-col h-full bg-surface-1 border-r border-border-default overflow-hidden transition-[width] duration-200 ease-out
        ${collapsed ? "w-[64px]" : "w-(--sidebar-width)"}`}>
			{/* Brand Logo */}
			<div
				onMouseEnter={() => setIsHeaderHovered(true)}
				onMouseLeave={() => setIsHeaderHovered(false)}
				className='flex items-center gap-(--space-sm) px-(--space-md) border-b border-border-default shrink-0 h-(--header-height) overflow-hidden cursor-pointer'>
				<span
					className='size-8 rounded-(--radius-md) bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shrink-0 transition-transform duration-150 active:scale-95 shadow-xs'
					aria-label='STEP'>
					S
				</span>
				{!collapsed && (
					<motion.div
						initial={{ opacity: 0, x: -6 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.15 }}
						className='flex flex-col min-w-0 flex-1 overflow-hidden'>
						<span className='font-black text-text-primary text-base tracking-tight leading-none'>
							STEP
						</span>

						{/* Hover Marquee Auto-Scroll Container */}
						<div className='w-full overflow-hidden relative mt-0.5'>
							<motion.div
								animate={
									isHeaderHovered ? { x: ["0%", "-52%", "0%"] } : { x: "0%" }
								}
								transition={
									isHeaderHovered ?
										{
											duration: 4.5,
											ease: "easeInOut",
											repeat: Infinity,
											repeatDelay: 0.5,
										}
									:	{ duration: 0.3, ease: "easeOut" }
								}
								className='whitespace-nowrap text-[10px] font-bold tracking-wider uppercase inline-block'>
								<span
									className={
										isHeaderHovered ? "text-accent-indigo" : (
											"text-text-tertiary"
										)
									}>
									STHAPATYA TALENT EXCELLENCE PLATFORM
								</span>
							</motion.div>
						</div>
					</motion.div>
				)}
			</div>

			{/* Navigation Sections */}
			<div className='flex-1 overflow-y-auto overflow-x-hidden py-(--space-xs) scrollbar-step'>
				{sections.map((section) => (
					<div
						key={section.key}
						className='mb-(--space-xs)'>
						{!collapsed && (
							<div className='px-(--space-md) py-(--space-2xs) mb-(--space-3xs)'>
								<span className='text-[10px] font-bold text-text-tertiary tracking-[0.08em] uppercase'>
									{section.label}
								</span>
							</div>
						)}

						{section.items.map((item) => (
							<NavItemRow
								key={item.id}
								item={item}
								active={isActive(item.href)}
								collapsed={collapsed}
							/>
						))}
					</div>
				))}
			</div>
		</nav>
	);

	return (
		<>
			<aside
				className='hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-20'
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				aria-label='Sidebar'>
				{sidebarContent}
			</aside>

			{/* Mobile Drawer Overlay */}
			{mobileOpen && (
				<div
					className='fixed inset-0 z-40 flex lg:hidden'
					role='dialog'
					aria-modal='true'
					aria-label='Navigation menu'>
					<div
						className='absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200'
						onClick={onMobileClose}
						aria-hidden='true'
					/>
					<div
						className='relative z-10 flex flex-col h-full w-(--sidebar-width) bg-surface-1 shadow-(--shadow-xl)'
						style={{
							animation:
								"step-slide-in-left 220ms cubic-bezier(0, 0, 0.2, 1) both",
						}}>
						<button
							type='button'
							className='absolute top-3 right-3 p-1.5 rounded-(--radius-md) text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors z-20'
							onClick={onMobileClose}
							aria-label='Close navigation'>
							<Icon
								name='x'
								size='sm'
							/>
						</button>

						<nav
							className='flex flex-col h-full overflow-hidden'
							aria-label='Main navigation'>
							<div className='flex items-center gap-(--space-sm) px-(--space-md) pr-12 border-b border-border-default h-(--header-height) shrink-0'>
								<span className='size-8 rounded-(--radius-md) bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shrink-0'>
									S
								</span>
								<div className='flex flex-col min-w-0'>
									<span className='font-black text-text-primary text-base tracking-tight leading-none'>
										STEP
									</span>
									<span className='text-[10px] font-bold text-text-tertiary tracking-wider uppercase mt-0.5 truncate'>
										Talent Platform
									</span>
								</div>
							</div>
							<div className='flex-1 overflow-y-auto py-(--space-xs) scrollbar-step'>
								{sections.map((section) => (
									<div
										key={section.key}
										className='mb-(--space-xs)'>
										<div className='px-(--space-md) py-(--space-2xs) mb-(--space-3xs)'>
											<span className='text-[10px] font-bold text-text-tertiary tracking-[0.08em] uppercase'>
												{section.label}
											</span>
										</div>
										{section.items.map((item) => (
											<NavItemRow
												key={item.id}
												item={item}
												active={isActive(item.href)}
												collapsed={false}
											/>
										))}
									</div>
								))}
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
};

// ── NavItemRow ────────────────────────────────────────────────────────────────

interface NavItemRowProps {
	item: NavItem;
	active: boolean;
	collapsed: boolean;
}

const NavItemRow: React.FC<NavItemRowProps> = ({ item, active, collapsed }) => {
	const handleClick = (e: React.MouseEvent) => {
		if (item.isDisabled) {
			e.preventDefault();
			toast.info("Module Under Maintenance", {
				description: `${item.label} module is currently disabled / in progress.`,
			});
		}
	};

	return (
		<Link
			href={item.href}
			onClick={handleClick}
			aria-label={item.label}
			aria-current={active ? "page" : undefined}
			className={`
        relative group flex items-center mx-2 my-0.5 rounded-(--radius-md)
        transition-all duration-150 focus-ring-step overflow-hidden
        ${collapsed ? "justify-center px-0 py-1.5 h-9" : "gap-2.5 px-3 py-1.5"}
        ${
					item.isDisabled ? "opacity-60 cursor-not-allowed text-slate-400"
					: active ?
						"bg-accent-indigo-dim text-accent-indigo-hover font-semibold shadow-2xs"
					:	"text-text-secondary hover:bg-surface-hover hover:text-text-primary"
				}
      `}>
			{active && (
				<motion.span
					layoutId='activeSidebarIndicator'
					className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent-indigo rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]'
					transition={{ type: "spring", stiffness: 400, damping: 35 }}
				/>
			)}

			<span
				className={`shrink-0 transition-transform duration-150 ${active ? "text-accent-indigo" : "text-text-tertiary group-hover:text-text-secondary"}`}>
				<Icon
					name={item.icon as any}
					size='md'
				/>
			</span>

			{!collapsed && (
				<>
					<span className='flex-1 text-(--type-body-md-size) font-medium truncate leading-none'>
						{item.label}
					</span>
					{item.badge !== undefined && (
						<span
							className={`text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shrink-0 font-mono ${
								item.isDisabled ?
									"bg-surface-3 text-text-tertiary border border-border-default"
								:	"bg-accent-indigo text-white shadow-xs"
							}`}>
							{typeof item.badge === "number" && item.badge > 99 ?
								"99+"
							:	item.badge}
						</span>
					)}
				</>
			)}

			{collapsed && active && (
				<span className='absolute right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-accent-indigo shadow-[0_0_6px_rgba(99,102,241,0.6)]' />
			)}
		</Link>
	);
};
