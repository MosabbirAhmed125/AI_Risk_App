import "../index.css";
import { useState, useMemo, useEffect, useRef } from "react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
	Check,
	Search,
	Eye,
	EyeOff,
	Camera,
	MapPin,
	Calendar,
	ChevronDown,
	Shield,
	User,
	Zap,
	Lock,
} from "lucide-react";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

function SkillsSelector({ options, selectedSkills, setSelectedSkills }) {
	const allSkills = options || [];
	const [search, setSearch] = useState("");

	const toggleSkill = (skill) => {
		setSelectedSkills((prev) =>
			prev.includes(skill)
				? prev.filter((s) => s !== skill)
				: [...prev, skill],
		);
	};

	const filteredSkills = allSkills.filter((skill) =>
		skill.skill_name?.toLowerCase().includes(search.toLowerCase()),
	);

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				delay: 0.4,
				when: "beforeChildren",
				staggerChildren: 0.05,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	return (
		<motion.div
			className="w-full rounded-2xl border-2 border-aqua-island-500 bg-shark-900 p-6 flex flex-col items-center drop-shadow-2xl"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<p className="mb-4 font-ubuntu text-xl font-bold text-aqua-island-500">
				Select Your Skills
			</p>

			<motion.input
				type="text"
				placeholder="Search skills..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="mb-4 w-full rounded-lg border-2 border-shark-200 bg-shark-950 px-4 py-2 font-ubuntu text-white placeholder:text-shark-400 focus:outline-none"
				whileFocus={{
					scale: 1.02,
					boxShadow: "0 4px 12px rgba(64,150,154,0.2)",
					borderColor: "var(--color-aqua-island-500)",
				}}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			/>

			<div
				className="w-210 max-w-213 max-h-78 overflow-y-auto overflow-x-hidden scrollbar-hide rounded-lg pr-2"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				<div className="space-y-2 px-2 py-1">
					{filteredSkills.map((skill) => {
						const isSelected = selectedSkills.includes(
							skill.skill_id,
						);

						return (
							<motion.button
								key={skill.skill_id}
								onClick={() => toggleSkill(skill.skill_id)}
								variants={itemVariants}
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.97 }}
								className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-left font-ubuntu text-sm font-bold origin-center ${
									isSelected
										? "bg-aqua-island-500 text-shark-900"
										: "bg-shark-800 text-shark-200 hover:bg-aqua-island-500 hover:text-shark-900"
								}`}
							>
								<span>{skill.skill_name}</span>

								{isSelected && (
									<Check className="h-4 w-4 text-shark-900" />
								)}
							</motion.button>
						);
					})}
				</div>
			</div>
		</motion.div>
	);
}

function PasswordField({ label, placeholder, value, onChange }) {
	const [show, setShow] = useState(false);
	return (
		<div className="space-y-3">
			<label className="block text-sm font-bold font-ubuntu tracking-wide text-shark-100">
				{label}
			</label>
			<div className="relative">
				<Lock
					size={16}
					className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-aqua-island-500"
				/>
				<input
					type={show ? "text" : "password"}
					placeholder={placeholder}
					value={value || ""}
					onChange={(e) => onChange && onChange(e.target.value)}
					className="w-full pl-12 pr-12 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium outline-none border border-aqua-island-500/10 text-white focus:border-aqua-island-500/45 transition-all"
				/>
				<motion.button
					type="button"
					onClick={() => setShow(!show)}
					className="absolute top-0 right-0 flex items-center justify-center w-11.5 h-11.5 rounded-lg bg-aqua-island-500 text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-aqua-island-500/60"
					whileHover={{ scale: 1.08 }}
					whileTap={{ scale: 0.92 }}
				>
					{show ? (
						<EyeOff size={16} strokeWidth={2} />
					) : (
						<Eye size={16} strokeWidth={2} />
					)}
				</motion.button>
			</div>
		</div>
	);
}

function JobSelect({ value, onChange, jobs = [] }) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const filteredJobs = useMemo(() => {
		return jobs.filter((job) =>
			job.toLowerCase().includes(search.toLowerCase()),
		);
	}, [jobs, search]);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className={`w-full flex items-center justify-between px-4 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium transition-all border ${
					open
						? "border-aqua-island-500/45"
						: "border-aqua-island-500/10"
				} ${value ? "text-white" : "text-shark-200"}`}
			>
				{value || "Select job title"}
				<ChevronDown
					size={16}
					className="text-shark-100"
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s",
					}}
				/>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.15 }}
						className="absolute z-50 w-full mt-1 bg-shark-900 rounded-xl overflow-hidden border border-aqua-island-500/15 shadow-2xl"
					>
						<div className="p-2 border-b border-aqua-island-500/10">
							<div className="relative">
								<Search
									size={15}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-shark-400"
								/>
								<input
									type="text"
									placeholder="Search job title..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full rounded-lg bg-shark-800 pl-10 pr-3 py-2 text-sm font-ubuntu font-medium text-white placeholder:text-shark-400 outline-none border border-aqua-island-500/10 focus:border-aqua-island-500/45"
								/>
							</div>
						</div>

						<div className="py-2 max-h-56 overflow-y-auto scrollbar-hide">
							{filteredJobs.length > 0 ? (
								filteredJobs.map((job) => (
									<button
										type="button"
										key={job}
										onClick={() => {
											onChange(job);
											setOpen(false);
											setSearch("");
										}}
										className={`w-full flex items-center justify-between px-4 py-3 text-sm font-ubuntu font-medium text-left transition-colors ${
											value === job
												? "text-aqua-island-500 bg-aqua-island-500/10"
												: "text-white hover:bg-aqua-island-500/12"
										}`}
									>
										{job}
										{value === job && (
											<Check
												size={14}
												strokeWidth={3}
												className="text-shark-200"
											/>
										)}
									</button>
								))
							) : (
								<div className="px-4 py-3 text-sm font-ubuntu font-medium text-shark-400">
									No matching jobs found.
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function Field({
	label,
	placeholder,
	type = "text",
	icon: Icon,
	value,
	onChange,
}) {
	const inputRef = useRef(null);

	if (type === "date") {
		return (
			<div className="space-y-3">
				<label className="block text-sm font-bold font-ubuntu tracking-wide text-shark-100">
					{label}
				</label>
				<div className="relative">
					<Calendar
						size={16}
						className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-aqua-island-500 z-10"
					/>
					<DatePicker
						selected={value ? new Date(value) : null}
						onChange={(date) =>
							onChange &&
							onChange(
								date ? date.toISOString().split("T")[0] : "",
							)
						}
						dateFormat="yyyy-MM-dd"
						placeholderText="Select date"
						className="w-full pl-12 pr-4 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium outline-none border border-aqua-island-500/10 text-white focus:border-aqua-island-500/45 transition-all"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<label className="block text-sm font-bold font-ubuntu tracking-wide text-shark-100">
				{label}
			</label>
			<div className="relative">
				{Icon && (
					<Icon
						size={16}
						className={`absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer ${
							Icon === MapPin || Icon === Calendar
								? "text-aqua-island-500"
								: "text-shark-100"
						}`}
						onClick={() => inputRef.current?.focus()}
					/>
				)}
				<input
					ref={inputRef}
					type={type}
					placeholder={placeholder}
					value={value || ""}
					onChange={(e) => onChange && onChange(e.target.value)}
					className={`w-full py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium outline-none border border-aqua-island-500/10 text-white focus:border-aqua-island-500/45 transition-all ${
						Icon ? "pl-12 pr-4" : "px-4"
					}`}
				/>
			</div>
		</div>
	);
}

function SaveBtn({ label, onClick, saved }) {
	return (
		<div className="flex items-center gap-3">
			<motion.button
				onClick={onClick}
				className="px-6 py-2.5 bg-aqua-island-500 rounded-xl text-sm font-bold font-ubuntu text-shark-900 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-aqua-island-500/70"
				whileHover={{ scale: 1.03 }}
				whileTap={{ scale: 0.97 }}
			>
				{label}
			</motion.button>
		</div>
	);
}

function Card({ title, subtitle, children }) {
	return (
		<div className="bg-shark-900 rounded-3xl p-8 space-y-6 border border-white/7 shadow-2xl">
			<div>
				<h3 className="text-xl font-bold font-ubuntu text-white">
					{title}
				</h3>
				<p className="text-sm font-ubuntu mt-2 text-shark-200">
					{subtitle}
				</p>
			</div>
			<div className="h-px bg-white/6" />
			{children}
		</div>
	);
}

const tabVariants = {
	initial: { opacity: 0, y: 10 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.2, ease: "easeOut" },
	},
	exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const TABS = [
	{ id: "personal", label: "Personal", icon: User },
	{ id: "skills", label: "Skills", icon: Zap },
	{ id: "security", label: "Security", icon: Shield },
];

const TAB_KEY = "jobseeker_active_tab";

function getInitialTab() {
	try {
		const t = localStorage.getItem(TAB_KEY);
		if (t && ["personal", "skills", "security"].includes(t)) return t;
	} catch {}
	return "personal";
}

export default function JobSeekerProfile() {
	const [activeTab, setActiveTab] = useState(getInitialTab);
	const [savedBadge, setSavedBadge] = useState({
		personal: false,
		skills: false,
		security: false,
	});
	const [profileLoading, setProfileLoading] = useState(true);
	const [jobs, setJobs] = useState([]);
	const [skillOptions, setSkillOptions] = useState([]);

	const [personal, setPersonal] = useState({
		fullName: "",
		job: "",
		education: "",
		university: "",
		address: "",
		dob: "",
	});
	const [skills, setSkills] = useState([]);
	const [passwords, setPasswords] = useState({
		current: "",
		new: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (sessionError || !session?.user?.id) {
					setProfileLoading(false);
					return;
				}

				const userId = session.user.id;

				// Fetch jobs
				const { data: jobsData, error: jobsError } = await supabase
					.from("jobs")
					.select("job_title")
					.order("job_title");

				if (!jobsError && jobsData) {
					setJobs(jobsData.map((j) => j.job_title));
				}

				const { data: skillsData, error: skillsError } = await supabase
					.from("skills")
					.select("skill_id, skill_name")
					.order("skill_name");

				if (!skillsError && skillsData) {
					setSkillOptions(skillsData);
				}

				// Fetch profile data
				const [
					{ data: profileData, error: profileError },
					{ data: jobSeekerData, error: jobSeekerError },
					{ data: skillsetData, error: skillsetError },
				] = await Promise.all([
					supabase
						.from("profiles")
						.select("full_name")
						.eq("id", userId)
						.single(),
					supabase
						.from("job_seekers")
						.select(
							"current_job, education_level, university, address, date_of_birth, jobs(job_title)",
						)
						.eq("user_id", userId)
						.single(),
					supabase
						.from("skillsets")
						.select("skill_id")
						.eq("user_id", userId),
				]);

				if (!profileError && profileData) {
					setPersonal((prev) => ({
						...prev,
						fullName: profileData.full_name || "",
					}));
				}

				if (!jobSeekerError && jobSeekerData) {
					setPersonal((prev) => ({
						...prev,
						job: jobSeekerData.jobs?.job_title || "",
						education: jobSeekerData.education_level || "",
						university: jobSeekerData.university || "",
						address: jobSeekerData.address || "",
						dob: jobSeekerData.date_of_birth || "",
					}));
				}

				if (!skillsetError && skillsetData) {
					const loadedSkills = skillsetData
						.map((item) => item.skill_id)
						.filter(Boolean);
					setSkills(loadedSkills);
				}
			} catch (error) {
				console.error("Failed to load profile data", error);
			} finally {
				setProfileLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(TAB_KEY, activeTab);
		} catch {}
	}, [activeTab]);

	const updatePersonal = (key, val) =>
		setPersonal((prev) => ({ ...prev, [key]: val }));

	const handleSavePersonal = async () => {
		try {
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session?.user?.id) {
				toast.error("Unable to save profile. Please login again.");
				return;
			}

			const userId = session.user.id;

			let currentJobId = null;
			if (personal.job) {
				const { data: jobData, error: jobQueryError } = await supabase
					.from("jobs")
					.select("job_id")
					.eq("job_title", personal.job)
					.single();

				if (jobQueryError || !jobData) {
					toast.error(
						"Selected job not found in database. Please try again.",
					);
					return;
				}

				currentJobId = jobData.job_id;
			}

			const updates = {
				current_job: currentJobId,
				education_level: personal.education || null,
				university: personal.university || null,
				address: personal.address || null,
				date_of_birth: personal.dob || null,
				user_id: userId,
			};

			const { error: profileError } = await supabase
				.from("profiles")
				.update({ full_name: personal.fullName || null })
				.eq("id", userId);

			const { error: jobError } = await supabase
				.from("job_seekers")
				.upsert([updates], { onConflict: "user_id" });

			if (profileError || jobError) {
				console.error(profileError || jobError);
				toast.error("Failed to save personal details.");
				return;
			}

			setSavedBadge((p) => ({ ...p, personal: true }));
			setTimeout(
				() => setSavedBadge((p) => ({ ...p, personal: false })),
				2500,
			);
			toast.success("Personal details saved.");
		} catch (error) {
			console.error("Failed to save personal profile", error);
			toast.error("Failed to save personal details.");
		}
	};

	const handleSaveSkills = async () => {
		try {
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session?.user?.id) {
				toast.error("Unable to save skills. Please login again.");
				return;
			}

			const userId = session.user.id;
			// skill_id is TEXT in the database, not numeric
			const selectedSkillIds = Array.from(
				new Set(
					skills
						.map((skillId) => String(skillId).trim())
						.filter((skillId) => skillId.length > 0),
				),
			);

			if (selectedSkillIds.length === 0) {
				// If no skills selected, just delete existing and return
				const { error: deleteError } = await supabase
					.from("skillsets")
					.delete()
					.eq("user_id", userId);

				if (deleteError) {
					console.error(deleteError);
					toast.error("Failed to save skills.");
					return;
				}

				setSavedBadge((p) => ({ ...p, skills: true }));
				setTimeout(
					() => setSavedBadge((p) => ({ ...p, skills: false })),
					2500,
				);
				toast.success("Skills saved.");
				return;
			}

			const { data: validSkills, error: validateError } = await supabase
				.from("skills")
				.select("skill_id")
				.in("skill_id", selectedSkillIds);

			if (validateError) {
				console.error(validateError);
				toast.error("Failed to validate selected skills.");
				return;
			}

			const validSkillIds = (validSkills || []).map(
				(item) => item.skill_id,
			);

			const { error: deleteError } = await supabase
				.from("skillsets")
				.delete()
				.eq("user_id", userId);

			if (deleteError) {
				console.error(deleteError);
				toast.error("Failed to save skills.");
				return;
			}

			if (validSkillIds.length > 0) {
				const { error: insertMappingError } = await supabase
					.from("skillsets")
					.insert(
						validSkillIds.map((skill_id) => ({
							user_id: userId,
							skill_id,
						})),
					);

				if (insertMappingError) {
					console.error(insertMappingError);
					toast.error("Failed to save skills.");
					return;
				}
			}

			setSavedBadge((p) => ({ ...p, skills: true }));
			setTimeout(
				() => setSavedBadge((p) => ({ ...p, skills: false })),
				2500,
			);
			toast.success("Skills saved.");
		} catch (error) {
			console.error("Failed to save skills", error);
			toast.error("Failed to save skills.");
		}
	};

	const updatePasswords = (key, val) =>
		setPasswords((prev) => ({ ...prev, [key]: val }));

	const handleSavePassword = async () => {
		try {
			if (!passwords.new) {
				toast.error("Please enter a new password.");
				return;
			}

			if (passwords.new.length < 6) {
				toast.error("Password must be at least 6 characters long.");
				return;
			}

			// For password verification, since Supabase doesn't allow direct current password check,
			// we'll proceed with update assuming the user is authenticated.
			// In a production app, you might want to implement re-authentication.

			const { error } = await supabase.auth.updateUser({
				password: passwords.new,
			});

			if (error) {
				console.error("Password update error:", error);
				toast.error("Failed to update password. Please try again.");
				return;
			}

			setPasswords({ current: "", new: "" });
			toast.success("Password updated successfully.");
		} catch (error) {
			console.error("Failed to update password", error);
			toast.error("Failed to update password.");
		}
	};

	const displayName = personal.fullName || null;

	const initials = personal.fullName
		? personal.fullName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<motion.div
			animate={{
				backgroundSize: ["100% 100%", "115% 115%", "100% 100%"],
				backgroundPosition: ["50% 0%", "50% 15%", "50% 0%"],
			}}
			transition={{
				duration: 2,
				repeat: Infinity,
				ease: "easeInOut",
			}}
			className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,var(--color-aqua-island-800),var(--color-shark-800),var(--color-shark-950))] bg-no-repeat"
		>
			<div className="max-w-5xl mx-auto px-8 py-12 space-y-6">
				<div className="bg-shark-900 rounded-3xl p-8 border border-white/7 shadow-2xl">
					<div className="flex items-center gap-6">
						<div className="relative shrink-0">
							<div className="w-16 h-16 bg-aqua-island-500 rounded-full flex items-center justify-center text-lg font-bold text-shark-200">
								<User size={32} strokeWidth={2}></User>
							</div>
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h1
									className={`text-lg font-bold font-ubuntu ${displayName ? "text-white" : "text-shark-400"}`}
								>
									{displayName || "Your Name"}
								</h1>
							</div>
							<p className="text-sm font-ubuntu mt-1 text-shark-200">
								{personal.job || "Job title not set"}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-shark-900 rounded-3xl p-2 grid grid-cols-3 gap-2 border border-white/7 shadow-xl">
					{TABS.map((tab) => {
						const active = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-bold font-ubuntu transition-colors duration-150 ${
									active
										? "text-aqua-island-500"
										: "text-shark-200"
								} hover:text-white`}
							>
								{active && (
									<motion.div
										layoutId="tab-bg"
										className="absolute inset-0 bg-shark-800 rounded-2xl"
										transition={{
											type: "spring",
											stiffness: 420,
											damping: 32,
										}}
									/>
								)}
								<tab.icon
									size={16}
									strokeWidth={2.5}
									className="relative z-10"
								/>
								<span className="relative z-10">
									{tab.label}
								</span>
							</button>
						);
					})}
				</div>

				<AnimatePresence mode="wait">
					<div key={activeTab}>
						{activeTab === "personal" && (
							<motion.div
								variants={tabVariants}
								initial="initial"
								animate="animate"
								exit="exit"
							>
								<Card
									title="Personal Information"
									subtitle="Update your personal details and public profile."
								>
									<div className="space-y-4">
										<Field
											label="Full Name"
											placeholder=""
											value={personal.fullName}
											onChange={(v) =>
												updatePersonal("fullName", v)
											}
										/>
										<div className="space-y-2">
											<label className="block text-[14px] font-bold font-ubuntu tracking-wide text-shark-100">
												Current Job
											</label>
											<JobSelect
												value={personal.job}
												onChange={(v) =>
													updatePersonal("job", v)
												}
												jobs={jobs}
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<Field
												label="Education Level"
												placeholder=""
												value={personal.education}
												onChange={(v) =>
													updatePersonal(
														"education",
														v,
													)
												}
											/>
											<Field
												label="University"
												placeholder=""
												value={personal.university}
												onChange={(v) =>
													updatePersonal(
														"university",
														v,
													)
												}
											/>
										</div>
										<Field
											label="Address"
											placeholder=""
											icon={MapPin}
											value={personal.address}
											onChange={(v) =>
												updatePersonal("address", v)
											}
										/>
										<Field
											label="Date of Birth"
											placeholder="Select date"
											type="date"
											icon={Calendar}
											value={personal.dob}
											onChange={(v) =>
												updatePersonal("dob", v)
											}
										/>
										<div className="pt-1">
											<SaveBtn
												label="Save Changes"
												onClick={handleSavePersonal}
												saved={savedBadge.personal}
											/>
										</div>
									</div>
								</Card>
							</motion.div>
						)}

						{activeTab === "skills" && (
							<motion.div
								variants={tabVariants}
								initial="initial"
								animate="animate"
								exit="exit"
							>
								<Card
									title="Skills"
									subtitle="Select all skills that apply to your profile."
								>
									<SkillsSelector
										options={skillOptions}
										selectedSkills={skills}
										setSelectedSkills={setSkills}
									/>
									<div className="pt-1">
										<SaveBtn
											label="Save Skills"
											onClick={handleSaveSkills}
											saved={savedBadge.skills}
										/>
									</div>
								</Card>
							</motion.div>
						)}

						{activeTab === "security" && (
							<motion.div
								variants={tabVariants}
								initial="initial"
								animate="animate"
								exit="exit"
							>
								<Card
									title="Security Settings"
									subtitle="Manage your account password."
								>
									<div className="space-y-4">
										<PasswordField
											label="Current Password"
											placeholder="Enter current password"
											value={passwords.current}
											onChange={(v) =>
												updatePasswords("current", v)
											}
										/>
										<PasswordField
											label="New Password"
											placeholder="Enter new password"
											value={passwords.new}
											onChange={(v) =>
												updatePasswords("new", v)
											}
										/>
										<div className="pt-1">
											<SaveBtn
												label="Update Password"
												onClick={handleSavePassword}
												saved={savedBadge.security}
											/>
										</div>
									</div>
								</Card>
							</motion.div>
						)}
					</div>
				</AnimatePresence>
			</div>
			<div className="fixed top-0 left-0 h-screen">
				<JobSeekerSidebar></JobSeekerSidebar>
			</div>
		</motion.div>
	);
}
