import {
	createApi,
	fetchBaseQuery,
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { ApiEnvelope, AuthResultData } from "./types";

export const getApiBaseUrl = (): string => {
	const envUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5125/api/v2";
	return envUrl.replace(/\/+$/, "");
};

const rawBaseQuery = fetchBaseQuery({
	baseUrl: getApiBaseUrl(),
	prepareHeaders: (headers) => {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("step_token") : null;
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}
		return headers;
	},
});

const executeRawQuery = (
	args: string | FetchArgs,
	api: any,
	extraOptions: any,
) => {
	const base = getApiBaseUrl(); // e.g. http://localhost:5125/api/v2

	if (typeof args === "string") {
		// If route already starts with /v2/ and baseUrl ends with /api/v2, strip redundant /v2 prefix
		let cleanUrl = args;
		if (cleanUrl.startsWith("/v2/") && base.endsWith("/v2")) {
			cleanUrl = cleanUrl.replace(/^\/v2/, "");
		}
		return rawBaseQuery(cleanUrl, api, extraOptions);
	} else if (typeof args === "object" && args.url) {
		let cleanUrl = args.url;
		if (cleanUrl.startsWith("/v2/") && base.endsWith("/v2")) {
			cleanUrl = cleanUrl.replace(/^\/v2/, "");
		}
		return rawBaseQuery({ ...args, url: cleanUrl }, api, extraOptions);
	}

	return rawBaseQuery(args, api, extraOptions);
};

export const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	let result = await executeRawQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401) {
		const refreshToken =
			typeof window !== "undefined" ?
				localStorage.getItem("step_refresh_token")
			:	null;
		if (refreshToken) {
			const refreshResult = await rawBaseQuery(
				{
					url: "/auth/refresh-token",
					method: "POST",
					body: { refreshToken },
				},
				api,
				extraOptions,
			);

			const responseEnvelope = refreshResult.data as
				| ApiEnvelope<AuthResultData>
				| undefined;
			if (
				responseEnvelope &&
				responseEnvelope.success &&
				responseEnvelope.data?.accessToken
			) {
				const newData = responseEnvelope.data;
				localStorage.setItem("step_token", newData.accessToken);
				if (newData.refreshToken) {
					localStorage.setItem("step_refresh_token", newData.refreshToken);
				}
				if (newData.user) {
					localStorage.setItem("step_email", newData.user.email || "");
					localStorage.setItem("step_role", newData.user.role || "");
					localStorage.setItem(
						"step_name",
						`${newData.user.firstName || ""} ${newData.user.lastName || ""}`.trim(),
					);
					localStorage.setItem(
						"step_emp_code",
						newData.user.employeeCode || "",
					);
					localStorage.setItem(
						"step_user_id",
						newData.user.id ? String(newData.user.id) : "",
					);
				}
				// Retry initial request with new token
				result = await executeRawQuery(args, api, extraOptions);
			} else {
				localStorage.removeItem("step_token");
				localStorage.removeItem("step_refresh_token");
				if (
					typeof window !== "undefined" &&
					window.location.pathname !== "/" &&
					!window.location.pathname.startsWith("/exam") &&
					!window.location.pathname.startsWith("/apply")
				) {
					window.location.href = "/";
				}
			}
		} else {
			localStorage.removeItem("step_token");
			if (
				typeof window !== "undefined" &&
				window.location.pathname !== "/" &&
				!window.location.pathname.startsWith("/exam") &&
				!window.location.pathname.startsWith("/apply")
			) {
				window.location.href = "/";
			}
		}
	}

	return result;
};

export const stepApi = createApi({
	reducerPath: "stepApi",
	baseQuery: baseQueryWithReauth,
	tagTypes: [
		"Vacancies",
		"Candidates",
		"Users",
		"MasterData",
		"Exams",
		"Interviews",
		"Offers",
		"Reports",
		"QRCodes",
		"QuestionPapers",
		"QuestionBank",
	],
	endpoints: () => ({}),
});
