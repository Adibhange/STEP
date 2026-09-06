import { SelectOption } from "@/design-system/components/select/select";

export const VACANCY_ROLE_OPTIONS: SelectOption[] = [
	{ value: "dotnet-architect", label: "Senior .NET Core Architect" },
	{ value: "react-fullstack", label: "Full Stack React / Node Lead" },
	{ value: "qa-automation", label: "QA Lead & Test Automation Engineer" },
	{ value: "devops-architect", label: "Cloud & DevOps Architect" },
	{ value: "ai-ml-engineer", label: "Python & AI/ML Engineer" },
	{
		value: "software-engineer",
		label: "Associate Software Engineer (Fresher)",
	},
	{ value: "Senior Full Stack Engineer", label: "Senior Full Stack Engineer" },
	{ value: "Backend Engineer (.NET)", label: "Backend Engineer (.NET)" },
	{
		value: "Frontend Engineer (React/Next)",
		label: "Frontend Engineer (React/Next)",
	},
	{ value: "DevOps Architect", label: "DevOps Architect" },
	{ value: "QA Automation Engineer", label: "QA Automation Engineer" },
	{ value: "Data Engineer", label: "Data Engineer" },
	{ value: "UI/UX Designer", label: "UI/UX Designer" },
	{ value: "Product Manager", label: "Product Manager" },
	{ value: "System Administrator", label: "System Administrator" },
];

export const LOCATION_OPTIONS: SelectOption[] = [
	{ value: "pune-hinjawadi", label: "Pune Corporate Center (Hinjawadi)" },
	{ value: "mumbai-bkx", label: "Mumbai HQ (Bandra Kurla Complex)" },
	{ value: "bengaluru-tech", label: "Bengaluru Tech Park (Whitefield)" },
	{ value: "Mumbai HQ", label: "Mumbai HQ" },
	{ value: "Pune Center", label: "Pune Center" },
	{ value: "Bangalore Tech Park", label: "Bangalore Tech Park" },
	{ value: "Hyderabad Center", label: "Hyderabad Center" },
	{ value: "Mumbai, Maharashtra", label: "Mumbai, Maharashtra" },
	{ value: "Pune, Maharashtra", label: "Pune, Maharashtra" },
	{ value: "Bengaluru, Karnataka", label: "Bengaluru, Karnataka" },
	{ value: "Hyderabad, Telangana", label: "Hyderabad, Telangana" },
	{ value: "Delhi NCR", label: "Delhi NCR" },
	{ value: "Remote India", label: "Remote (India)" },
];

export const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
	{ value: "Full Time", label: "Full-time Permanent" },
	{ value: "Contractual", label: "Contractual / Fixed Term" },
	{ value: "Internship", label: "Graduate Internship" },
	{ value: "Part Time", label: "Part-time Specialist" },
];
