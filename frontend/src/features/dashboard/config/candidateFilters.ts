/**
 * STEP Enterprise Platform — Candidate Filter Configuration
 *
 * All filter definitions live here. FilterBar reads this config to render
 * controls dynamically. Future filters only require a new entry.
 */

export type FilterId =
	| "role"
	| "stage"
	| "hiringLocation"
	| "appliedDate"
	| "status";

export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterDef {
	id: FilterId;
	label: string;
	placeholder: string;
	type: "select" | "date-range";
	options?: FilterOption[];
}

export const CANDIDATE_FILTERS: FilterDef[] = [
	{
		id: "role",
		label: "Role",
		placeholder: "All Roles",
		type: "select",
		options: [
			{
				value: "Senior Full Stack Engineer",
				label: "Senior Full Stack Engineer",
			},
			{ value: "Backend Engineer (.NET)", label: "Backend Engineer (.NET)" },
			{
				value: "Frontend Engineer (React/Next.js)",
				label: "Frontend Engineer (React/Next.js)",
			},
			{ value: "DevOps Architect", label: "DevOps Architect" },
			{ value: "QA Automation Engineer", label: "QA Automation Engineer" },
			{ value: "Data Engineer", label: "Data Engineer" },
			{ value: "UI/UX Designer", label: "UI/UX Designer" },
		],
	},
	{
		id: "stage",
		label: "Stage",
		placeholder: "All Stages",
		type: "select",
		options: [
			{ value: "Screening", label: "Screening" },
			{ value: "Technical", label: "Technical" },
			{ value: "HR Interview", label: "HR Interview" },
			{ value: "Director Round", label: "Director Round" },
		],
	},
	{
		id: "hiringLocation",
		label: "Hiring Location",
		placeholder: "All Locations",
		type: "select",
		options: [
			{ value: "Mumbai", label: "Mumbai" },
			{ value: "Pune", label: "Pune" },
			{ value: "Bengaluru", label: "Bengaluru" },
			{ value: "Remote India", label: "Remote India" },
		],
	},
	{
		id: "status",
		label: "Status",
		placeholder: "All Statuses",
		type: "select",
		options: [
			{ value: "Screening", label: "Screening" },
			{ value: "Interview", label: "Interview" },
			{ value: "Offered", label: "Offered" },
			{ value: "On Hold", label: "On Hold" },
			{ value: "Rejected", label: "Rejected" },
			{ value: "Hired", label: "Hired" },
		],
	},
	{
		id: "appliedDate",
		label: "Applied Date",
		placeholder: "Any Date",
		type: "date-range",
	},
];
