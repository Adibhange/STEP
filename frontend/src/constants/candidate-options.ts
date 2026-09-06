import { SelectOption } from "@/design-system/components/select/select";

export const QUALIFICATION_OPTIONS: SelectOption[] = [
	{ value: "B.Tech / B.E.", label: "B.Tech / B.E. (Engineering)" },
	{ value: "M.Tech / M.E.", label: "M.Tech / M.E. (Masters)" },
	{ value: "BCA / MCA", label: "BCA / MCA (Computer Applications)" },
	{ value: "B.Sc / M.Sc", label: "B.Sc / M.Sc (Computer Science / IT)" },
	{ value: "Diploma", label: "Diploma in Engineering" },
	{ value: "Other", label: "Other Degree" },
];

const CURRENT_YEAR = new Date().getFullYear();
export const PASSING_YEAR_OPTIONS: SelectOption[] = [
	{ value: String(CURRENT_YEAR), label: `${CURRENT_YEAR} (Final Year)` },
	{
		value: String(CURRENT_YEAR - 1),
		label: `${CURRENT_YEAR - 1} (Fresh Graduate)`,
	},
	{ value: String(CURRENT_YEAR - 2), label: String(CURRENT_YEAR - 2) },
	{ value: String(CURRENT_YEAR - 3), label: String(CURRENT_YEAR - 3) },
	{ value: String(CURRENT_YEAR - 4), label: String(CURRENT_YEAR - 4) },
	{ value: String(CURRENT_YEAR - 5), label: `${CURRENT_YEAR - 5} & Earlier` },
];

export const NOTICE_PERIOD_OPTIONS: SelectOption[] = [
	{ value: "0", label: "Immediate Joiner (0 Days)" },
	{ value: "15", label: "15 Days" },
	{ value: "30", label: "30 Days (1 Month)" },
	{ value: "45", label: "45 Days" },
	{ value: "60", label: "60 Days (2 Months)" },
	{ value: "90", label: "90 Days (3 Months)" },
];

export const GENDER_OPTIONS: SelectOption[] = [
	{ value: "Male", label: "Male" },
	{ value: "Female", label: "Female" },
	{ value: "Other", label: "Other" },
	{ value: "Prefer not to say", label: "Prefer not to say" },
];

export const EXPERIENCE_OPTIONS: SelectOption[] = [
	{ value: "1 - 2 Years", label: "1 - 2 Years" },
	{ value: "2 - 4 Years", label: "2 - 4 Years" },
	{ value: "4 - 6 Years", label: "4 - 6 Years" },
	{ value: "6 - 8 Years", label: "6 - 8 Years" },
	{ value: "8+ Years", label: "8+ Years" },
];

export const SOURCE_OPTIONS: SelectOption[] = [
	{ value: "Walk-in", label: "Walk-in / On-site Drive" },
	{ value: "Office", label: "Direct / Office Walk-in" },
	{ value: "Referral", label: "Employee Referral" },
	{ value: "Portal", label: "Candidate Portal / Online" },
	{ value: "Recruiter", label: "Recruiter Sourced" },
	{ value: "LinkedIn Jobs", label: "LinkedIn Jobs" },
	{ value: "Naukri / Indeed", label: "Naukri / Indeed" },
];

export const REF_TYPE_OPTIONS: SelectOption[] = [
	{ value: "Direct", label: "Direct (Careers / LinkedIn)" },
	{ value: "Internal", label: "Internal Employee Referral" },
	{ value: "External", label: "External Referral / Agency" },
];

export const MEETING_MODE_OPTIONS: SelectOption[] = [
	{ value: "In Office", label: "Face-to-Face (In Office)" },
	{ value: "Online", label: "Online Video Interview" },
];
