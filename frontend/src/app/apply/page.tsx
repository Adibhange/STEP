"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	Icon,
	CustomSelect,
	CustomCalendarPicker,
	type SelectOption,
} from "@/design-system";
import { useGetMasterDataByCategoryQuery } from "@/store/services/api";
import { useRegisterUniversalCandidateMutation } from "@/store/services/candidatesApi";

// ── Canonical Options ─────────────────────────────────────────────────────────
const ROLE_OPTIONS: SelectOption[] = [
	{ value: "dotnet-architect", label: "Senior .NET Core Architect" },
	{ value: "react-fullstack", label: "Full Stack React / Node Lead" },
	{ value: "qa-automation", label: "QA Lead & Test Automation Engineer" },
	{ value: "devops-architect", label: "Cloud & DevOps Architect" },
	{ value: "ai-ml-engineer", label: "Python & AI/ML Engineer" },
	{
		value: "software-engineer",
		label: "Associate Software Engineer (Fresher)",
	},
];

const LOCATION_OPTIONS: SelectOption[] = [
	{ value: "pune-hinjawadi", label: "Pune Corporate Center (Hinjawadi)" },
	{ value: "mumbai-bkx", label: "Mumbai HQ (Bandra Kurla Complex)" },
	{ value: "bengaluru-tech", label: "Bengaluru Tech Park (Whitefield)" },
];

const QUALIFICATION_OPTIONS: SelectOption[] = [
	{ value: "B.Tech / B.E.", label: "B.Tech / B.E. (CS / IT / Core)" },
	{ value: "M.Tech / M.E.", label: "M.Tech / M.E. (Postgraduate)" },
	{ value: "BCA / MCA", label: "BCA / MCA (Computer Applications)" },
	{ value: "B.Sc / M.Sc IT", label: "B.Sc / M.Sc (Computer Science)" },
	{ value: "Diploma", label: "Diploma in Engineering" },
	{ value: "Other", label: "Other Equivalent Degree" },
];

const CURRENT_YEAR = new Date().getFullYear();

const PASSING_YEAR_OPTIONS: SelectOption[] = [
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

const NOTICE_PERIOD_OPTIONS: SelectOption[] = [
	{ value: "0", label: "Immediate Joiner (0 Days)" },
	{ value: "15", label: "15 Days" },
	{ value: "30", label: "30 Days (1 Month)" },
	{ value: "60", label: "60 Days (2 Months)" },
	{ value: "90", label: "90 Days (3 Months)" },
];

const GENDER_OPTIONS: SelectOption[] = [
	{ value: "Male", label: "Male" },
	{ value: "Female", label: "Female" },
	{ value: "Other", label: "Other" },
];

const REF_TYPE_OPTIONS: SelectOption[] = [
	{ value: "Direct", label: "Direct (Careers / LinkedIn)" },
	{ value: "Internal", label: "Internal Employee Referral" },
	{ value: "External", label: "Placement Agency / Partner" },
];

// ── Validation Regex ──────────────────────────────────────────────────────────
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const CITY_REGEX = /^[a-zA-Z\s,.-]+$/;

function UniversalRegistrationContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialChannelParam =
		searchParams.get("channel") || searchParams.get("type");

	// Master Data queries
	const { data: rolesMasterRes } = useGetMasterDataByCategoryQuery("roles");
	const { data: locationsMasterRes } =
		useGetMasterDataByCategoryQuery("hiringlocations");

	const dynamicRoles: SelectOption[] = React.useMemo(() => {
		if (
			rolesMasterRes?.data &&
			Array.isArray(rolesMasterRes.data) &&
			rolesMasterRes.data.length > 0
		) {
			return rolesMasterRes.data.map((r: any) => ({
				value: String(r.id),
				label: r.name || r.title || r.code,
			}));
		}
		return ROLE_OPTIONS;
	}, [rolesMasterRes]);

	const dynamicLocations: SelectOption[] = React.useMemo(() => {
		if (
			locationsMasterRes?.data &&
			Array.isArray(locationsMasterRes.data) &&
			locationsMasterRes.data.length > 0
		) {
			return locationsMasterRes.data.map((l: any) => ({
				value: String(l.id),
				label: l.name || l.title || l.code,
			}));
		}
		return LOCATION_OPTIONS;
	}, [locationsMasterRes]);

	// ── Stepper State (1: Role/Track, 2: Personal/Academics, 3: Experience/Uploads)
	const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

	// ── Form State ──────────────────────────────────────────────────────────────
	const [applicationChannel, setApplicationChannel] = useState<
		"Walk-in" | "Direct"
	>(
		initialChannelParam?.toLowerCase().includes("walk") ? "Walk-in" : "Walk-in",
	);
	const [selectedRole, setSelectedRole] = useState<string>(
		ROLE_OPTIONS[0].value,
	);
	const [selectedLocation, setSelectedLocation] = useState<string>(
		LOCATION_OPTIONS[0].value,
	);
	const [candidateType, setCandidateType] = useState<"Fresher" | "Experienced">(
		"Experienced",
	);

	const [registerUniversal, { isLoading: isRegistering }] =
		useRegisterUniversalCandidateMutation();

	// Personal Info
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [gender, setGender] = useState("Male");
	const [dob, setDob] = useState("2000-01-15");
	const [currentCity, setCurrentCity] = useState("");

	// Academics
	const [qualification, setQualification] = useState("B.Tech / B.E.");
	const [collegeName, setCollegeName] = useState("");
	const [passingYear, setPassingYear] = useState("2024");
	const [cgpaOrPercentage, setCgpaOrPercentage] = useState("");

	// Professional Experience
	const [experienceYears, setExperienceYears] = useState("3.5");
	const [currentCompany, setCurrentCompany] = useState("");
	const [currentCtc, setCurrentCtc] = useState("");
	const [expectedCtc, setExpectedCtc] = useState("");
	const [noticePeriod, setNoticePeriod] = useState("30");

	// Referral Info
	const [refType, setRefType] = useState<"Direct" | "Internal" | "External">(
		"Direct",
	);
	const [refName, setRefName] = useState("");
	const [refMobile, setRefMobile] = useState("");

	// Uploads
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<{
		name: string;
		type: string;
		base64: string;
	} | null>(null);
	const [resumeData, setResumeData] = useState<{
		name: string;
		sizeStr: string;
		type: string;
		base64: string;
	} | null>(null);
	const [fileErrors, setFileErrors] = useState<{
		photo?: string;
		resume?: string;
	}>({});

	// Validation State
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submissionResult, setSubmissionResult] = useState<any>(null);

	const photoInputRef = useRef<HTMLInputElement>(null);
	const resumeInputRef = useRef<HTMLInputElement>(null);

	// Sync defaults
	useEffect(() => {
		if (
			dynamicRoles.length > 0 &&
			!dynamicRoles.find((r) => r.value === selectedRole)
		) {
			setSelectedRole(dynamicRoles[0].value);
		}
	}, [dynamicRoles, selectedRole]);

	useEffect(() => {
		if (
			dynamicLocations.length > 0 &&
			!dynamicLocations.find((l) => l.value === selectedLocation)
		) {
			setSelectedLocation(dynamicLocations[0].value);
		}
	}, [dynamicLocations, selectedLocation]);

	// ── Field Validation ────────────────────────────────────────────────────────
	const validateField = (name: string, value: string): string => {
		switch (name) {
			case "firstName":
				if (!value.trim()) return "First name is required.";
				if (value.trim().length < 2) return "Min 2 characters required.";
				if (!NAME_REGEX.test(value.trim())) return "Letters only.";
				return "";
			case "lastName":
				if (!value.trim()) return "Last name is required.";
				if (value.trim().length < 2) return "Min 2 characters required.";
				if (!NAME_REGEX.test(value.trim())) return "Letters only.";
				return "";
			case "email":
				if (!value.trim()) return "Email is required.";
				if (!EMAIL_REGEX.test(value.trim())) return "Valid email required.";
				return "";
			case "phone": {
				const cleanPhone = value.replace(/[\s+-]/g, "");
				if (!cleanPhone) return "Mobile number is required.";
				if (!PHONE_REGEX.test(cleanPhone))
					return "Valid 10-digit number required.";
				return "";
			}
			case "dob":
				if (!value) return "Date of Birth required.";
				return "";
			case "currentCity":
				if (!value.trim()) return "Current city required.";
				if (!CITY_REGEX.test(value.trim())) return "Letters only.";
				return "";
			case "collegeName":
				if (candidateType === "Fresher" && !value.trim())
					return "College name required.";
				return "";
			case "cgpaOrPercentage":
				if (candidateType === "Fresher" && !value.trim())
					return "Score required.";
				if (value.trim()) {
					const num = Number(value.trim());
					if (isNaN(num) || num <= 0 || num > 100)
						return "Valid score required.";
				}
				return "";
			case "experienceYears":
				if (candidateType === "Experienced") {
					const num = Number(value);
					if (isNaN(num) || num <= 0 || num > 40)
						return "Experience between 1-40 yrs.";
				}
				return "";
			case "currentCompany":
				if (candidateType === "Experienced" && !value.trim())
					return "Company required.";
				return "";
			case "refName":
				if (refType !== "Direct" && !value.trim())
					return "Referrer name required.";
				return "";
			default:
				return "";
		}
	};

	const handleBlur = (field: string, value: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		const err = validateField(field, value);
		setErrors((prev) => ({ ...prev, [field]: err }));
	};

	// ── Step Navigation ─────────────────────────────────────────────────────────
	const handleProceedToStep2 = () => {
		setCurrentStep(2);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleProceedToStep3 = () => {
		const step2Errors: Record<string, string> = {
			firstName: validateField("firstName", firstName),
			lastName: validateField("lastName", lastName),
			email: validateField("email", email),
			phone: validateField("phone", phone),
			dob: validateField("dob", dob),
			currentCity: validateField("currentCity", currentCity),
			collegeName: validateField("collegeName", collegeName),
			cgpaOrPercentage: validateField("cgpaOrPercentage", cgpaOrPercentage),
		};

		const hasStep2Error = Object.values(step2Errors).some((err) => !!err);
		if (hasStep2Error) {
			setErrors((prev) => ({ ...prev, ...step2Errors }));
			setTouched((prev) => ({
				...prev,
				firstName: true,
				lastName: true,
				email: true,
				phone: true,
				dob: true,
				currentCity: true,
				collegeName: true,
				cgpaOrPercentage: true,
			}));
			return;
		}

		setCurrentStep(3);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// ── File Handlers ───────────────────────────────────────────────────────────
	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setFileErrors((prev) => ({
				...prev,
				photo: "Image files only (JPG, PNG).",
			}));
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			setFileErrors((prev) => ({ ...prev, photo: "Max 2MB allowed." }));
			return;
		}

		setFileErrors((prev) => ({ ...prev, photo: undefined }));
		const reader = new FileReader();
		reader.onload = (event) => {
			const b64 = event.target?.result as string;
			setPhotoPreview(b64);
			setPhotoFile({
				name: file.name,
				type: file.type || "image/jpeg",
				base64: b64,
			});
		};
		reader.readAsDataURL(file);
	};

	const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const validExtensions = [".pdf", ".docx", ".doc"];
		const fileExt = file.name
			.substring(file.name.lastIndexOf("."))
			.toLowerCase();
		if (!validExtensions.includes(fileExt)) {
			setFileErrors((prev) => ({
				...prev,
				resume: "PDF or Word (.docx) only.",
			}));
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setFileErrors((prev) => ({ ...prev, resume: "Max 5MB allowed." }));
			return;
		}

		const sizeStr =
			file.size > 1024 * 1024 ?
				`${(file.size / (1024 * 1024)).toFixed(1)} MB`
			:	`${Math.round(file.size / 1024)} KB`;

		setFileErrors((prev) => ({ ...prev, resume: undefined }));
		const reader = new FileReader();
		reader.onload = (event) => {
			const b64 = event.target?.result as string;
			setResumeData({
				name: file.name,
				sizeStr,
				type: file.type || "application/pdf",
				base64: b64,
			});
		};
		reader.readAsDataURL(file);
	};

	// ── Form Submit ─────────────────────────────────────────────────────────────
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formErrors: Record<string, string> = {
			firstName: validateField("firstName", firstName),
			lastName: validateField("lastName", lastName),
			email: validateField("email", email),
			phone: validateField("phone", phone),
			dob: validateField("dob", dob),
			currentCity: validateField("currentCity", currentCity),
			collegeName: validateField("collegeName", collegeName),
			cgpaOrPercentage: validateField("cgpaOrPercentage", cgpaOrPercentage),
			experienceYears: validateField("experienceYears", experienceYears),
			currentCompany: validateField("currentCompany", currentCompany),
			refName: validateField("refName", refName),
		};

		const hasError = Object.values(formErrors).some((err) => !!err);
		if (hasError) {
			setErrors(formErrors);
			if (
				formErrors.firstName ||
				formErrors.lastName ||
				formErrors.email ||
				formErrors.phone ||
				formErrors.dob ||
				formErrors.currentCity ||
				formErrors.collegeName ||
				formErrors.cgpaOrPercentage
			) {
				setCurrentStep(2);
			} else {
				setCurrentStep(3);
			}
			return;
		}

		setIsSubmitting(true);

		try {
			const roleLabel =
				dynamicRoles.find((r) => r.value === selectedRole)?.label ||
				"Software Engineering";
			const locationLabel =
				dynamicLocations.find((l) => l.value === selectedLocation)?.label ||
				"Pune Corporate Center";

			const payload = {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.trim().toLowerCase(),
				phone: phone.trim(),
				roleIdentifier: selectedRole,
				locationIdentifier: selectedLocation,
				applicationChannel: applicationChannel,
				totalExperienceYears:
					candidateType === "Fresher" ? 0 : Number(experienceYears) || 0,
				seniorityBracket: candidateType,
				currentCTC: currentCtc ? Number(currentCtc) : null,
				expectedCTC: expectedCtc ? Number(expectedCtc) : null,
				noticePeriodDays: noticePeriod ? Number(noticePeriod) : null,
				currentLocation: currentCity.trim(),
				highestQualification: qualification,
				gender: gender,
				dob: dob,
				currentCompany:
					candidateType === "Experienced" ? currentCompany.trim() : null,
				currentDesignation:
					candidateType === "Experienced" ? currentCompany.trim() : null,
				institutionName:
					candidateType === "Fresher" ? collegeName.trim() : null,
				yearOfPassing: passingYear ? Number(passingYear) : null,
				marksPercentage: cgpaOrPercentage ? Number(cgpaOrPercentage) : null,
				refType: refType,
				refName: refType !== "Direct" ? refName.trim() : null,
				refMobile: refType !== "Direct" ? refMobile.trim() : null,
				photoBase64: photoFile?.base64 || null,
				photoFileName: photoFile?.name || null,
				photoContentType: photoFile?.type || null,
				resumeBase64: resumeData?.base64 || null,
				resumeFileName: resumeData?.name || null,
				resumeContentType: resumeData?.type || null,
			};

			const response = await registerUniversal(payload).unwrap();
			const resData = response?.data || response;

			setSubmissionResult({
				success: true,
				candidateCode:
					resData.candidateCode ||
					resData.candidate?.candidateCode ||
					`CND-${CURRENT_YEAR}-${Math.floor(1000 + Math.random() * 9000)}`,
				candidateName:
					resData.candidateName || `${firstName.trim()} ${lastName.trim()}`,
				roleTitle: resData.roleTitle || roleLabel,
				hiringLocation: resData.hiringLocation || locationLabel,
				channel: resData.channel || applicationChannel,
				testPasscode:
					resData.examPasscode ||
					(applicationChannel === "Walk-in" ? "1234" : undefined),
				examPortalUrl:
					resData.examPortalUrl ||
					(applicationChannel === "Walk-in" ?
						`/exam?code=${resData.candidateCode || `CND-${CURRENT_YEAR}-1001`}&pass=1234`
					:	undefined),
			});
		} catch (err: any) {
			const errorMsg =
				err?.data?.message ||
				err?.data?.errors?.[0]?.errorMessage ||
				err?.message ||
				"Failed to submit registration. Please verify your details.";
			setErrors({ global: errorMsg });
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── Success View ────────────────────────────────────────────────────────────
	if (submissionResult) {
		return (
			<div className='min-h-screen bg-canvas text-text-primary flex flex-col justify-center items-center p-4 sm:p-6'>
				<motion.div
					initial={{ opacity: 0, scale: 0.96, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					className='w-full max-w-xl bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden'>
					<div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-indigo via-accent-cyan to-accent-indigo' />

					<div className='flex flex-col items-center text-center mb-6'>
						<div className='size-14 rounded-2xl bg-status-success-bg border border-status-success-border flex items-center justify-center text-status-success-text shadow-lg mb-3.5'>
							<Icon
								name='check-circle'
								size='xl'
							/>
						</div>
						<h1 className='text-2xl font-bold font-heading text-text-primary tracking-tight'>
							Registration Successful!
						</h1>
						<p className='text-xs text-text-secondary mt-1 max-w-sm'>
							Welcome,{" "}
							<strong className='text-text-primary'>
								{submissionResult.candidateName}
							</strong>
							. Your profile has been created in the STEP platform.
						</p>
					</div>

					<div className='bg-surface-2 border border-border-default rounded-2xl p-4 mb-5 flex items-center justify-between'>
						<div>
							<span className='text-[10px] font-bold uppercase tracking-wider text-text-tertiary block'>
								Candidate Identification Code
							</span>
							<div className='text-xl font-mono font-bold text-accent-indigo mt-0.5'>
								{submissionResult.candidateCode}
							</div>
						</div>
						<span className='px-2.5 py-1 rounded-full text-[11px] font-bold bg-accent-indigo-dim text-accent-indigo border border-accent-indigo/20'>
							{submissionResult.channel.toUpperCase()}
						</span>
					</div>

					<div className='space-y-2 text-xs text-text-secondary bg-surface-2/40 p-4 rounded-xl border border-border-soft mb-6'>
						<div className='flex justify-between py-1 border-b border-border-soft'>
							<span className='text-text-tertiary'>Designation:</span>
							<strong className='text-text-primary font-medium'>
								{submissionResult.roleTitle}
							</strong>
						</div>
						<div className='flex justify-between py-1 border-b border-border-soft'>
							<span className='text-text-tertiary'>Assessment Center:</span>
							<strong className='text-text-primary font-medium'>
								{submissionResult.hiringLocation}
							</strong>
						</div>
						<div className='flex justify-between py-1'>
							<span className='text-text-tertiary'>Assigned Stage:</span>
							<strong className='text-status-success-text font-bold'>
								{submissionResult.channel === "Walk-in" ?
									"Round 1: Proctored Assessment"
								:	"HR Resume Review"}
							</strong>
						</div>
					</div>

					{submissionResult.channel === "Walk-in" ?
						<div className='space-y-2.5'>
							<button
								type='button'
								onClick={() => router.push(submissionResult.examPortalUrl)}
								className='w-full h-12 bg-accent-indigo hover:bg-accent-indigo-hover text-text-on-accent font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-indigo/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer'>
								<Icon
									name='code-2'
									size='sm'
								/>
								<span>Start Proctored Assessment Now</span>
								<Icon
									name='arrow-right'
									size='xs'
								/>
							</button>
							<p className='text-[10.5px] text-center text-text-tertiary'>
								Please ensure webcam & microphone permissions are enabled on the
								next page.
							</p>
						</div>
					:	<div className='text-center space-y-3'>
							<div className='p-3 bg-status-info-bg border border-status-info-border rounded-xl text-status-info-text text-xs'>
								Our talent team will review your application and contact you
								with interview schedules.
							</div>
							<button
								type='button'
								onClick={() => window.location.reload()}
								className='text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer'>
								Submit Another Application
							</button>
						</div>
					}
				</motion.div>
			</div>
		);
	}

	// ── Main Stepper Layout (Strict 50/50 Dual-Column Grid System) ──────────────
	return (
		<div className='min-h-screen bg-canvas text-text-primary py-8 px-4 sm:px-6'>
			<div className='max-w-2xl mx-auto space-y-5'>
				{/* Top Header Card */}
				<div className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-xl'>
					<div className='flex items-center justify-between gap-4'>
						<div className='flex items-center gap-3'>
							<div className='size-10 rounded-2xl bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center text-white font-bold text-lg shadow-md'>
								S
							</div>
							<div>
								<div className='flex items-center gap-2'>
									<span className='text-[10px] font-bold font-mono uppercase tracking-widest text-accent-indigo'>
										STEP PLATFORM
									</span>
									<span className='text-[9px] px-2 py-0.5 rounded-full bg-surface-3 text-text-secondary font-bold'>
										UNIVERSAL INTAKE
									</span>
								</div>
								<h1 className='text-xl font-bold font-heading text-text-primary'>
									Candidate Registration
								</h1>
							</div>
						</div>

						<div className='text-right hidden sm:block'>
							<span className='text-xs font-bold text-text-secondary'>
								SCIPL Enterprise
							</span>
							<p className='text-[10.5px] text-text-tertiary'>
								Talent Excellence Platform
							</p>
						</div>
					</div>

					{/* Reception Reassurance Banner */}
					<div className='mt-4 p-2.5 rounded-xl bg-accent-indigo-dim/50 border border-accent-indigo/15 flex items-center gap-2 text-xs text-text-secondary'>
						<div className='size-5 rounded-md bg-accent-indigo text-white flex items-center justify-center shrink-0'>
							<Icon
								name='zap'
								size='xs'
							/>
						</div>
						<span>
							<strong>⚡ Takes ~2 minutes.</strong> On-site passcode will unlock
							immediately upon submission.
						</span>
					</div>

					{/* Stepper Progress Indicator */}
					<div className='mt-5 pt-4 border-t border-border-soft'>
						<div className='flex items-center justify-between relative'>
							<div className='absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-surface-3 w-full rounded-full z-0' />
							<div
								className='absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-indigo rounded-full z-0 transition-all duration-300 ease-out'
								style={{
									width:
										currentStep === 1 ? "16%"
										: currentStep === 2 ? "50%"
										: "100%",
								}}
							/>

							<button
								type='button'
								onClick={() => setCurrentStep(1)}
								className={`relative z-10 size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
									currentStep >= 1 ?
										"bg-accent-indigo text-white shadow-sm ring-4 ring-surface-1"
									:	"bg-surface-3 text-text-tertiary"
								}`}>
								1
							</button>

							<button
								type='button'
								onClick={() => handleProceedToStep2()}
								className={`relative z-10 size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
									currentStep >= 2 ?
										"bg-accent-indigo text-white shadow-sm ring-4 ring-surface-1"
									:	"bg-surface-3 text-text-tertiary ring-4 ring-surface-1"
								}`}>
								2
							</button>

							<button
								type='button'
								onClick={() => handleProceedToStep3()}
								className={`relative z-10 size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
									currentStep === 3 ?
										"bg-accent-indigo text-white shadow-sm ring-4 ring-surface-1"
									:	"bg-surface-3 text-text-tertiary ring-4 ring-surface-1"
								}`}>
								3
							</button>
						</div>

						<div className='flex justify-between text-[10.5px] font-bold text-text-secondary mt-2'>
							<span
								className={
									currentStep === 1 ?
										"text-accent-indigo font-bold"
									:	"text-text-tertiary"
								}>
								1. Role & Location
							</span>
							<span
								className={
									currentStep === 2 ?
										"text-accent-indigo font-bold"
									:	"text-text-tertiary"
								}>
								2. Profile & Academics
							</span>
							<span
								className={
									currentStep === 3 ?
										"text-accent-indigo font-bold"
									:	"text-text-tertiary"
								}>
								3. Experience & Documents
							</span>
						</div>
					</div>
				</div>

				{/* Stepper Views */}
				<form
					onSubmit={handleSubmit}
					noValidate>
					{/* Cooldown & Submission Error Banner */}
					{errors.global && (
						<motion.div
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							className='mb-4 p-4 rounded-2xl bg-status-danger-bg/15 border border-status-danger-border flex items-start gap-3 shadow-sm'>
							<div className='size-8 rounded-xl bg-status-danger-bg border border-status-danger-border flex items-center justify-center text-status-danger-text shrink-0 mt-0.5'>
								<Icon
									name='alert-triangle'
									size='xs'
								/>
							</div>
							<div className='space-y-1 flex-1'>
								<h4 className='text-xs font-bold text-status-danger-text uppercase tracking-wider'>
									{(
										errors.global.toLowerCase().includes("cooldown") ||
										errors.global.toLowerCase().includes("already applied")
									) ?
										"90-Day Application Cooldown Active"
									:	"Registration Failed"}
								</h4>
								<p className='text-xs text-text-primary leading-relaxed'>
									{errors.global}
								</p>
							</div>
							<button
								type='button'
								onClick={() =>
									setErrors((prev) => {
										const next = { ...prev };
										delete next.global;
										return next;
									})
								}
								className='text-text-tertiary hover:text-text-primary text-xs p-1 cursor-pointer'>
								<Icon
									name='x'
									size='xs'
								/>
							</button>
						</motion.div>
					)}

					<AnimatePresence mode='wait'>
						{/* ══════════════════════════════════════════════════════════════════
                STEP 1: Target Position & Location (Strict 50/50 Dual Column)
            ══════════════════════════════════════════════════════════════════ */}
						{currentStep === 1 && (
							<motion.div
								key='step1'
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								transition={{ duration: 0.2 }}
								className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-sm space-y-5'>
								{/* Row 1: Intake Stream Dual Cards (50% / 50%) */}
								<div>
									<label className='text-xs font-bold text-text-secondary block mb-1.5'>
										Application Intake Stream{" "}
										<span className='text-status-danger-text'>*</span>
									</label>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<button
											type='button'
											onClick={() => setApplicationChannel("Walk-in")}
											className={`h-16 p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
												applicationChannel === "Walk-in" ?
													"bg-accent-indigo-dim/60 border-accent-indigo text-text-primary shadow-xs ring-1 ring-accent-indigo/60"
												:	"bg-surface-2/60 border-border-default text-text-secondary hover:border-border-strong hover:bg-surface-2"
											}`}>
											<div
												className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
													applicationChannel === "Walk-in" ?
														"bg-accent-indigo text-white"
													:	"bg-surface-3 text-text-tertiary"
												}`}>
												<Icon
													name='building'
													size='xs'
												/>
											</div>
											<div className='min-w-0'>
												<div className='text-xs font-bold text-text-primary flex items-center gap-1'>
													<span>Walk-in (At Office)</span>
													{applicationChannel === "Walk-in" && (
														<Icon
															name='check-circle'
															size='xs'
															className='text-accent-indigo'
														/>
													)}
												</div>
												<span className='text-[10.5px] text-text-tertiary block truncate'>
													On-site candidate at center
												</span>
											</div>
										</button>

										<button
											type='button'
											onClick={() => setApplicationChannel("Direct")}
											className={`h-16 p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
												applicationChannel === "Direct" ?
													"bg-accent-cyan/10 border-accent-cyan text-text-primary shadow-xs ring-1 ring-accent-cyan/60"
												:	"bg-surface-2/60 border-border-default text-text-secondary hover:border-border-strong hover:bg-surface-2"
											}`}>
											<div
												className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
													applicationChannel === "Direct" ?
														"bg-accent-cyan text-white"
													:	"bg-surface-3 text-text-tertiary"
												}`}>
												<Icon
													name='send'
													size='xs'
												/>
											</div>
											<div className='min-w-0'>
												<div className='text-xs font-bold text-text-primary flex items-center gap-1'>
													<span>Direct / Online</span>
													{applicationChannel === "Direct" && (
														<Icon
															name='check-circle'
															size='xs'
															className='text-accent-cyan'
														/>
													)}
												</div>
												<span className='text-[10.5px] text-text-tertiary block truncate'>
													Careers page / LinkedIn
												</span>
											</div>
										</button>
									</div>
								</div>

								{/* Row 2: Target Role & Assessment Center (50% / 50% Equal Grid) */}
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<label className='text-xs font-bold text-text-secondary block mb-1.5'>
											Target Designation / Role{" "}
											<span className='text-status-danger-text'>*</span>
										</label>
										<CustomSelect
											options={dynamicRoles}
											value={selectedRole}
											onChange={(val) => setSelectedRole(val)}
											placeholder='Select Target Role'
											widthClass='w-full'
										/>
									</div>

									<div>
										<label className='text-xs font-bold text-text-secondary block mb-1.5'>
											Assessment / Office Center{" "}
											<span className='text-status-danger-text'>*</span>
										</label>
										<CustomSelect
											options={dynamicLocations}
											value={selectedLocation}
											onChange={(val) => setSelectedLocation(val)}
											placeholder='Select Hiring Location'
											widthClass='w-full'
										/>
									</div>
								</div>

								{/* Row 3: Seniority Bracket (50% / 50% Equal Grid) */}
								<div>
									<label className='text-xs font-bold text-text-secondary block mb-1.5'>
										Candidate Seniority Bracket{" "}
										<span className='text-status-danger-text'>*</span>
									</label>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<button
											type='button'
											onClick={() => setCandidateType("Fresher")}
											className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
												candidateType === "Fresher" ?
													"bg-surface-2 border-accent-indigo text-accent-indigo ring-1 ring-accent-indigo shadow-xs"
												:	"bg-surface-2/60 text-text-secondary border-border-default hover:bg-surface-2"
											}`}>
											<Icon
												name='user'
												size='xs'
											/>
											<span>Fresher / Trainee (0-1 Yr)</span>
										</button>

										<button
											type='button'
											onClick={() => setCandidateType("Experienced")}
											className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
												candidateType === "Experienced" ?
													"bg-surface-2 border-accent-indigo text-accent-indigo ring-1 ring-accent-indigo shadow-xs"
												:	"bg-surface-2/60 text-text-secondary border-border-default hover:bg-surface-2"
											}`}>
											<Icon
												name='trending-up'
												size='xs'
											/>
											<span>Experienced (1+ Yrs)</span>
										</button>
									</div>
								</div>

								{/* Continue CTA */}
								<div className='pt-2 border-t border-border-soft'>
									<button
										type='button'
										onClick={handleProceedToStep2}
										className='w-full h-11 bg-accent-indigo hover:bg-accent-indigo-hover text-text-on-accent font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-accent-indigo/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer'>
										<span>Continue to Personal Details</span>
										<Icon
											name='arrow-right'
											size='xs'
										/>
									</button>
								</div>
							</motion.div>
						)}

						{/* ══════════════════════════════════════════════════════════════════
                STEP 2: Personal Profile & Academics (Strict 50/50 Dual Column)
            ══════════════════════════════════════════════════════════════════ */}
						{currentStep === 2 && (
							<motion.div
								key='step2'
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								transition={{ duration: 0.2 }}
								className='space-y-4'>
								{/* Personal Information (Every row exactly 50% / 50%) */}
								<div className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-sm space-y-4'>
									<div className='flex items-center gap-2 pb-2 border-b border-border-soft'>
										<div className='size-6 rounded-lg bg-accent-indigo-dim border border-accent-indigo/30 flex items-center justify-center text-accent-indigo'>
											<Icon
												name='user'
												size='xs'
											/>
										</div>
										<h2 className='text-sm font-bold font-heading text-text-primary'>
											Personal & Contact Details
										</h2>
									</div>

									{/* Row 1: First Name | Last Name */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												First Name{" "}
												<span className='text-status-danger-text'>*</span>
											</label>
											<div className='relative'>
												<Icon
													name='user'
													size='xs'
													className='absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none'
												/>
												<input
													type='text'
													value={firstName}
													onChange={(e) => setFirstName(e.target.value)}
													onBlur={() => handleBlur("firstName", firstName)}
													placeholder='e.g. Aarav'
													className={`w-full h-10 pl-8.5 pr-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border transition-all outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15 ${
														touched.firstName && errors.firstName ?
															"border-status-danger-border bg-status-danger-bg/10"
														:	"border-border-default"
													}`}
												/>
											</div>
											{touched.firstName && errors.firstName && (
												<p className='text-[10.5px] text-status-danger-text mt-1'>
													{errors.firstName}
												</p>
											)}
										</div>

										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Last Name{" "}
												<span className='text-status-danger-text'>*</span>
											</label>
											<div className='relative'>
												<Icon
													name='user'
													size='xs'
													className='absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none'
												/>
												<input
													type='text'
													value={lastName}
													onChange={(e) => setLastName(e.target.value)}
													onBlur={() => handleBlur("lastName", lastName)}
													placeholder='e.g. Sharma'
													className={`w-full h-10 pl-8.5 pr-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border transition-all outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15 ${
														touched.lastName && errors.lastName ?
															"border-status-danger-border bg-status-danger-bg/10"
														:	"border-border-default"
													}`}
												/>
											</div>
											{touched.lastName && errors.lastName && (
												<p className='text-[10.5px] text-status-danger-text mt-1'>
													{errors.lastName}
												</p>
											)}
										</div>
									</div>

									{/* Row 2: Email Address | Mobile Number */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Email Address{" "}
												<span className='text-status-danger-text'>*</span>
											</label>
											<div className='relative'>
												<Icon
													name='mail'
													size='xs'
													className='absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none'
												/>
												<input
													type='email'
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													onBlur={() => handleBlur("email", email)}
													placeholder='name@example.com'
													className={`w-full h-10 pl-8.5 pr-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border transition-all outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15 ${
														touched.email && errors.email ?
															"border-status-danger-border bg-status-danger-bg/10"
														:	"border-border-default"
													}`}
												/>
											</div>
											{touched.email && errors.email && (
												<p className='text-[10.5px] text-status-danger-text mt-1'>
													{errors.email}
												</p>
											)}
										</div>

										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Mobile Number{" "}
												<span className='text-status-danger-text'>*</span>
											</label>
											<div className='relative'>
												<Icon
													name='phone'
													size='xs'
													className='absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none'
												/>
												<input
													type='tel'
													maxLength={10}
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													onBlur={() => handleBlur("phone", phone)}
													placeholder='10-digit mobile'
													className={`w-full h-10 pl-8.5 pr-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border transition-all outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15 ${
														touched.phone && errors.phone ?
															"border-status-danger-border bg-status-danger-bg/10"
														:	"border-border-default"
													}`}
												/>
											</div>
											{touched.phone && errors.phone && (
												<p className='text-[10.5px] text-status-danger-text mt-1'>
													{errors.phone}
												</p>
											)}
										</div>
									</div>

									{/* Row 3: Date of Birth | Gender */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Date of Birth{" "}
												<span className='text-status-danger-text'>*</span>
											</label>
											<CustomCalendarPicker
												value={dob}
												onChange={(val) => setDob(val)}
											/>
										</div>

										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Gender
											</label>
											<CustomSelect
												options={GENDER_OPTIONS}
												value={gender}
												onChange={(val) => setGender(val)}
												widthClass='w-full'
											/>
										</div>
									</div>

									{/* Row 4: Current City / Residence (Full Width Address/City Line) */}
									<div className='sm:col-span-2'>
										<label className='text-xs font-bold text-text-secondary block mb-1'>
											Current City / Location{" "}
											<span className='text-status-danger-text'>*</span>
										</label>
										<div className='relative'>
											<Icon
												name='map-pin'
												size='xs'
												className='absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none'
											/>
											<input
												type='text'
												value={currentCity}
												onChange={(e) => setCurrentCity(e.target.value)}
												onBlur={() => handleBlur("currentCity", currentCity)}
												placeholder='e.g. Pune, Maharashtra'
												className={`w-full h-10 pl-8.5 pr-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border transition-all outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15 ${
													touched.currentCity && errors.currentCity ?
														"border-status-danger-border bg-status-danger-bg/10"
													:	"border-border-default"
												}`}
											/>
										</div>
										{touched.currentCity && errors.currentCity && (
											<p className='text-[10.5px] text-status-danger-text mt-1'>
												{errors.currentCity}
											</p>
										)}
									</div>
								</div>

								{/* Academics (Every row exactly 50% / 50%) */}
								<div className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-sm space-y-4'>
									<div className='flex items-center gap-2 pb-2 border-b border-border-soft'>
										<div className='size-6 rounded-lg bg-accent-indigo-dim border border-accent-indigo/30 flex items-center justify-center text-accent-indigo'>
											<Icon
												name='clipboard-check'
												size='xs'
											/>
										</div>
										<h2 className='text-sm font-bold font-heading text-text-primary'>
											Academic Credentials
										</h2>
									</div>

									{/* Row 1: Highest Degree | College Name */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Highest Degree
											</label>
											<CustomSelect
												options={QUALIFICATION_OPTIONS}
												value={qualification}
												onChange={(val) => setQualification(val)}
												widthClass='w-full'
											/>
										</div>

										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												College / University{" "}
												{candidateType === "Fresher" && (
													<span className='text-status-danger-text'>*</span>
												)}
											</label>
											<input
												type='text'
												value={collegeName}
												onChange={(e) => setCollegeName(e.target.value)}
												onBlur={() => handleBlur("collegeName", collegeName)}
												placeholder='e.g. COEP Technological Univ'
												className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
											/>
										</div>
									</div>

									{/* Row 2: Year of Graduation | Aggregate Score */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Year of Graduation
											</label>
											<CustomSelect
												options={PASSING_YEAR_OPTIONS}
												value={passingYear}
												onChange={(val) => setPassingYear(val)}
												widthClass='w-full'
											/>
										</div>

										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Aggregate Score (% or CGPA){" "}
												{candidateType === "Fresher" && (
													<span className='text-status-danger-text'>*</span>
												)}
											</label>
											<input
												type='text'
												value={cgpaOrPercentage}
												onChange={(e) => setCgpaOrPercentage(e.target.value)}
												onBlur={() =>
													handleBlur("cgpaOrPercentage", cgpaOrPercentage)
												}
												placeholder='e.g. 8.4 CGPA or 80%'
												className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
											/>
										</div>
									</div>
								</div>

								{/* Step 2 Bottom Navigation (50% / 50%) */}
								<div className='grid grid-cols-2 gap-4 pt-1'>
									<button
										type='button'
										onClick={() => setCurrentStep(1)}
										className='h-10 px-4 rounded-xl border border-border-default bg-surface-2/60 hover:bg-surface-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer'>
										<Icon
											name='arrow-left'
											size='xs'
										/>
										<span>Back</span>
									</button>

									<button
										type='button'
										onClick={handleProceedToStep3}
										className='h-10 px-4 bg-accent-indigo hover:bg-accent-indigo-hover text-text-on-accent font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-accent-indigo/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer'>
										<span>Continue to Step 3</span>
										<Icon
											name='arrow-right'
											size='xs'
										/>
									</button>
								</div>
							</motion.div>
						)}

						{/* ══════════════════════════════════════════════════════════════════
                STEP 3: Experience & Documents (Strict 50/50 Dual Column)
            ══════════════════════════════════════════════════════════════════ */}
						{currentStep === 3 && (
							<motion.div
								key='step3'
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								transition={{ duration: 0.2 }}
								className='space-y-4'>
								{/* Work Experience */}
								{candidateType === "Experienced" && (
									<div className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-sm space-y-4'>
										<div className='flex items-center gap-2 pb-2 border-b border-border-soft'>
											<div className='size-6 rounded-lg bg-accent-indigo-dim border border-accent-indigo/30 flex items-center justify-center text-accent-indigo'>
												<Icon
													name='trending-up'
													size='xs'
												/>
											</div>
											<h2 className='text-sm font-bold font-heading text-text-primary'>
												Work Experience & Compensation
											</h2>
										</div>

										{/* Row 1: Employer | Experience */}
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Current / Previous Employer{" "}
													<span className='text-status-danger-text'>*</span>
												</label>
												<input
													type='text'
													value={currentCompany}
													onChange={(e) => setCurrentCompany(e.target.value)}
													onBlur={() =>
														handleBlur("currentCompany", currentCompany)
													}
													placeholder='e.g. Infosys / TCS'
													className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
												/>
											</div>

											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Total Exp (Years){" "}
													<span className='text-status-danger-text'>*</span>
												</label>
												<input
													type='number'
													step='0.1'
													min='0'
													max='40'
													value={experienceYears}
													onChange={(e) => setExperienceYears(e.target.value)}
													onBlur={() =>
														handleBlur("experienceYears", experienceYears)
													}
													placeholder='e.g. 3.5'
													className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
												/>
											</div>
										</div>

										{/* Row 2: Current CTC | Expected CTC */}
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Current CTC (LPA)
												</label>
												<input
													type='number'
													step='0.5'
													value={currentCtc}
													onChange={(e) => setCurrentCtc(e.target.value)}
													placeholder='e.g. 10.5'
													className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
												/>
											</div>

											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Expected CTC (LPA)
												</label>
												<input
													type='number'
													step='0.5'
													value={expectedCtc}
													onChange={(e) => setExpectedCtc(e.target.value)}
													placeholder='e.g. 14.0'
													className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
												/>
											</div>
										</div>

										{/* Row 3: Notice Period | Application Source */}
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Notice Period
												</label>
												<CustomSelect
													options={NOTICE_PERIOD_OPTIONS}
													value={noticePeriod}
													onChange={(val) => setNoticePeriod(val)}
													widthClass='w-full'
												/>
											</div>

											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Application Source
												</label>
												<CustomSelect
													options={REF_TYPE_OPTIONS}
													value={refType}
													onChange={(val: any) => setRefType(val)}
													widthClass='w-full'
												/>
											</div>
										</div>
									</div>
								)}

								{/* Referral (if not Direct) */}
								{refType !== "Direct" && (
									<div className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-sm space-y-4'>
										<div className='flex items-center gap-2 pb-2 border-b border-border-soft'>
											<div className='size-6 rounded-lg bg-accent-indigo-dim border border-accent-indigo/30 flex items-center justify-center text-accent-indigo'>
												<Icon
													name='user'
													size='xs'
												/>
											</div>
											<h2 className='text-sm font-bold font-heading text-text-primary'>
												Referral Details
											</h2>
										</div>

										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Referrer Name{" "}
													<span className='text-status-danger-text'>*</span>
												</label>
												<input
													type='text'
													value={refName}
													onChange={(e) => setRefName(e.target.value)}
													placeholder='e.g. Rahul Patil'
													className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
												/>
											</div>
											<div>
												<label className='text-xs font-bold text-text-secondary block mb-1'>
													Referrer Contact Mobile
												</label>
												<input
													type='tel'
													maxLength={10}
													value={refMobile}
													onChange={(e) => setRefMobile(e.target.value)}
													placeholder='10-digit mobile'
													className='w-full h-10 px-3 rounded-xl text-xs bg-surface-2/60 text-text-primary border border-border-default outline-none focus:border-accent-indigo focus:bg-surface-1 focus:ring-2 focus:ring-accent-indigo/15'
												/>
											</div>
										</div>
									</div>
								)}

								{/* Document Dropzones (Strict 50% / 50%) */}
								<div className='bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 shadow-sm space-y-4'>
									<div className='flex items-center gap-2 pb-2 border-b border-border-soft'>
										<div className='size-6 rounded-lg bg-accent-indigo-dim border border-accent-indigo/30 flex items-center justify-center text-accent-indigo'>
											<Icon
												name='file-text'
												size='xs'
											/>
										</div>
										<h2 className='text-sm font-bold font-heading text-text-primary'>
											Document Attachments
										</h2>
									</div>

									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										{/* Photo Upload */}
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Profile Photo (Optional)
											</label>
											<input
												ref={photoInputRef}
												type='file'
												accept='image/*'
												onChange={handlePhotoChange}
												className='hidden'
											/>

											{photoPreview ?
												<div className='h-16 p-2.5 bg-surface-2/80 border border-accent-indigo/30 rounded-2xl flex items-center justify-between gap-2.5'>
													<div className='flex items-center gap-2.5 min-w-0'>
														<img
															src={photoPreview}
															alt='Photo'
															className='size-10 rounded-xl object-cover border border-border-default shrink-0'
														/>
														<div className='min-w-0'>
															<span className='text-xs font-bold text-text-primary block truncate'>
																{photoFile?.name}
															</span>
															<span className='text-[10px] text-status-success-text font-bold flex items-center gap-1'>
																<Icon
																	name='check'
																	size='xs'
																/>{" "}
																Ready
															</span>
														</div>
													</div>
													<button
														type='button'
														onClick={() => {
															setPhotoPreview(null);
															setPhotoFile(null);
														}}
														className='p-1.5 rounded-lg text-text-tertiary hover:text-status-danger-text transition-colors'>
														<Icon
															name='x'
															size='xs'
														/>
													</button>
												</div>
											:	<div
													onClick={() => photoInputRef.current?.click()}
													className='h-16 border-2 border-dashed border-border-default hover:border-accent-indigo/60 bg-surface-2/40 hover:bg-surface-2 rounded-2xl px-3.5 flex items-center gap-3 cursor-pointer transition-all'>
													<div className='size-8 rounded-lg bg-surface-3 text-text-tertiary flex items-center justify-center shrink-0'>
														<Icon
															name='user'
															size='xs'
														/>
													</div>
													<div className='min-w-0'>
														<span className='text-xs font-bold text-text-primary block truncate'>
															Upload Photo
														</span>
														<span className='text-[10px] text-text-tertiary'>
															PNG, JPG (Max 2MB)
														</span>
													</div>
												</div>
											}
										</div>

										{/* Resume Upload */}
										<div>
											<label className='text-xs font-bold text-text-secondary block mb-1'>
												Resume / CV (PDF or Word)
											</label>
											<input
												ref={resumeInputRef}
												type='file'
												accept='.pdf,.docx,.doc'
												onChange={handleResumeChange}
												className='hidden'
											/>

											{resumeData ?
												<div className='h-16 p-2.5 bg-surface-2/80 border border-accent-indigo/30 rounded-2xl flex items-center justify-between gap-2.5'>
													<div className='flex items-center gap-2.5 min-w-0'>
														<div className='size-10 rounded-xl bg-accent-indigo-dim text-accent-indigo flex items-center justify-center shrink-0'>
															<Icon
																name='file-text'
																size='sm'
															/>
														</div>
														<div className='min-w-0'>
															<span className='text-xs font-bold text-text-primary block truncate'>
																{resumeData.name}
															</span>
															<span className='text-[10px] text-status-success-text font-bold flex items-center gap-1'>
																<Icon
																	name='check'
																	size='xs'
																/>{" "}
																{resumeData.sizeStr}
															</span>
														</div>
													</div>
													<button
														type='button'
														onClick={() => setResumeData(null)}
														className='p-1.5 rounded-lg text-text-tertiary hover:text-status-danger-text transition-colors'>
														<Icon
															name='x'
															size='xs'
														/>
													</button>
												</div>
											:	<div
													onClick={() => resumeInputRef.current?.click()}
													className='h-16 border-2 border-dashed border-border-default hover:border-accent-indigo/60 bg-surface-2/40 hover:bg-surface-2 rounded-2xl px-3.5 flex items-center gap-3 cursor-pointer transition-all'>
													<div className='size-8 rounded-lg bg-accent-indigo-dim text-accent-indigo flex items-center justify-center shrink-0'>
														<Icon
															name='file-text'
															size='xs'
														/>
													</div>
													<div className='min-w-0'>
														<span className='text-xs font-bold text-text-primary block truncate'>
															Upload Resume
														</span>
														<span className='text-[10px] text-text-tertiary'>
															PDF, DOCX (Max 5MB)
														</span>
													</div>
												</div>
											}
										</div>
									</div>
								</div>

								{/* Step 3 Action Navigation (50% / 50%) */}
								<div className='grid grid-cols-2 gap-4 pt-1'>
									<button
										type='button'
										onClick={() => setCurrentStep(2)}
										className='h-11 px-4 rounded-xl border border-border-default bg-surface-2/60 hover:bg-surface-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer'>
										<Icon
											name='arrow-left'
											size='xs'
										/>
										<span>Back</span>
									</button>

									<button
										type='submit'
										disabled={isSubmitting}
										className='h-11 bg-accent-indigo hover:bg-accent-indigo-hover disabled:opacity-50 text-text-on-accent font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-indigo/25 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer'>
										{isSubmitting ?
											<>
												<Icon
													name='loader'
													size='xs'
													className='animate-spin'
												/>
												<span>Finalizing...</span>
											</>
										:	<>
												<Icon
													name='send'
													size='xs'
												/>
												<span>Submit Registration</span>
												<Icon
													name='arrow-right'
													size='xs'
												/>
											</>
										}
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</form>
			</div>
		</div>
	);
}

export default function UniversalRegistrationPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen bg-canvas flex items-center justify-center'>
					<Icon
						name='loader'
						size='lg'
						className='animate-spin text-accent-indigo'
					/>
				</div>
			}>
			<UniversalRegistrationContent />
		</Suspense>
	);
}
