"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIdleTimer, IdleTimerContext } from "@/hooks/useIdleTimer";
import {
	useAppSelector,
	useAppDispatch,
	selectIsAuthenticated,
	selectIsAuthInitialized,
	selectIsLoggingOut,
	resetLogoutState,
	syncFromStorage,
	notifyError,
} from "@/store";

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const pathname = usePathname();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isInitialized = useAppSelector(selectIsAuthInitialized);
	const isLoggingOut = useAppSelector(selectIsLoggingOut);

	const isDashboardRoute = pathname?.startsWith("/dashboard");

	// Sync state from persistent storage on client mount
	useEffect(() => {
		dispatch(syncFromStorage());
	}, [dispatch]);

	const currentUser = useAppSelector((state) => state.auth.user);

	// Route protection guard — only evaluate after storage hydration
	useEffect(() => {
		if (!isInitialized) return;

		const token =
			typeof window !== "undefined" ? localStorage.getItem("step_token") : null;
		const hasToken = Boolean(token && token.trim().length > 0);

		// If unauthenticated on a protected dashboard route
		if (isDashboardRoute && !isAuthenticated && !hasToken) {
			if (!isLoggingOut) {
				dispatch(
					notifyError({
						title: "Authentication Required",
						description: "Please sign in to access your workspace.",
					}),
				);
			}
			router.replace("/");
			return;
		}

		// RBAC: Interviewers cannot access /dashboard/users or /dashboard/settings
		if (isDashboardRoute && (isAuthenticated || hasToken) && currentUser) {
			const isRestrictedAdminRoute =
				pathname.startsWith("/dashboard/users") ||
				pathname.startsWith("/dashboard/settings");
			if (isRestrictedAdminRoute && currentUser.role === "Interviewer") {
				dispatch(
					notifyError({
						title: "Access Restricted",
						description:
							"You do not have administrative permissions to view this section.",
					}),
				);
				router.replace("/dashboard");
				return;
			}
		}

		if (pathname === "/" && (isAuthenticated || hasToken) && !isLoggingOut) {
			router.replace("/dashboard");
		}

		if (pathname === "/" && isLoggingOut) {
			dispatch(resetLogoutState());
		}
	}, [
		pathname,
		isDashboardRoute,
		isAuthenticated,
		isInitialized,
		isLoggingOut,
		currentUser,
		router,
		dispatch,
	]);

	// Activate idle timer when authenticated in dashboard
	const idleTimer = useIdleTimer({
		enabled: isAuthenticated && Boolean(isDashboardRoute),
	});

	return (
		<IdleTimerContext.Provider value={idleTimer}>
			{children}
		</IdleTimerContext.Provider>
	);
};
