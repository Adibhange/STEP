import { SelectOption } from "@/design-system/components/select/select";

export const USER_ROLE_OPTIONS: SelectOption[] = [
	{ value: "Director", label: "Director" },
	{ value: "HR", label: "HR" },
	{ value: "Interviewer", label: "Interviewer" },
];

export const USER_ROLE_FILTER_OPTIONS: SelectOption[] = [
	{ value: "All", label: "All Roles" },
	...USER_ROLE_OPTIONS,
];

export const USER_STATUS_OPTIONS: SelectOption[] = [
	{ value: "Active", label: "Active" },
	{ value: "Inactive", label: "Inactive" },
];

export const USER_STATUS_FILTER_OPTIONS: SelectOption[] = [
	{ value: "All", label: "All Statuses" },
	{ value: "Active", label: "Active Only" },
	{ value: "Inactive", label: "Inactive Only" },
];
