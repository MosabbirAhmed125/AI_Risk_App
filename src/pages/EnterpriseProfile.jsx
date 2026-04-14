import { useState, useMemo, useEffect, useRef } from "react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
	Check,
	Eye,
	EyeOff,
	Calendar,
	ChevronDown,
	Shield,
	Building2,
	BriefcaseBusiness,
	Lock,
	MapPin,
	DollarSign,
} from "lucide-react";
import EnterpriseSidebar from "../components/EnterpriseSidebar";

const LS_KEY = "enterprise_profile";
const TAB_KEY = "enterprise_active_tab";

function loadProfile() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function saveProfile(data) {
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(data));
	} catch {}
}

function getInitialTab() {
	try {
		const t = localStorage.getItem(TAB_KEY);
		if (t && ["organization", "fields", "security"].includes(t)) return t;
	} catch {}
	return "organization";
}

function HiringFieldsSelector({ selectedFields, setSelectedFields }) {
	const allFields = useMemo(
		() => [
			"Software Engineering",
			"Data Science",
			"Research & Development",
			"E-Commerce",
			"Cybersecurity",
			"UI/UX Design",
			"Cloud Computing",
			"DevOps",
			"Product Management",
			"Digital Marketing",
			"Business Analysis",
			"Artificial Intelligence",
			"Machine Learning",
			"Sales & Operations",
			"Customer Support",
			"Finance & Accounting",
			"Human Resources",
			"Networking",
			"Mobile Development",
			"Quality Assurance",
		],
		[],
	);

	const [search, setSearch] = useState("");

	const toggleField = (field) => {
		setSelectedFields((prev) =>
			prev.includes(field)
				? prev.filter((f) => f !== field)
				: [...prev, field],
		);
	};

	const filteredFields = allFields.filter((field) =>
		field.toLowerCase().includes(search.toLowerCase()),
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
			className="w-full rounded-2xl border-2 border-red-ribbon-600 bg-shark-900 p-6 flex flex-col items-center drop-shadow-2xl"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<p className="mb-4 font-ubuntu text-xl font-bold text-red-ribbon-600">
				Select Hiring Fields
			</p>

			<motion.input
				type="text"
				placeholder="Search fields..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="mb-4 w-full rounded-lg border-2 border-shark-200 bg-shark-950 px-4 py-2 font-ubuntu text-shark-200 placeholder:text-shark-400 focus:outline-none"
				whileFocus={{
					scale: 1.02,
					boxShadow: "0 4px 12px rgba(214,44,57,0.2)",
					borderColor: "var(--color-red-ribbon-600)",
				}}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			/>

			<div
				className="w-210 max-w-213 max-h-78 overflow-y-auto overflow-x-hidden scrollbar-hide rounded-lg pr-2"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				<div className="space-y-2 px-2 py-1">
					{filteredFields.map((field) => {
						const isSelected = selectedFields.includes(field);

						return (
							<motion.button
								key={field}
								onClick={() => toggleField(field)}
								variants={itemVariants}
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.97 }}
								className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-left font-ubuntu text-sm font-bold origin-center ${
									isSelected
										? "bg-red-ribbon-600 text-shark-200"
										: "bg-shark-800 text-shark-200 hover:bg-red-ribbon-600 hover:text-shark-200"
								}`}
							>
								<span>{field}</span>

								{isSelected && (
									<Check className="h-4 w-4 text-shark-200" />
								)}
							</motion.button>
						);
					})}
				</div>
			</div>
		</motion.div>
	);
}

function PasswordField({ label, placeholder }) {
	const [show, setShow] = useState(false);
	const [val, setVal] = useState("");

	return (
		<div className="space-y-3">
			<label className="block text-sm font-bold font-ubuntu tracking-wide text-shark-100">
				{label}
			</label>
			<div className="relative">
				<Lock
					size={16}
					className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-ribbon-600"
				/>
				<input
					type={show ? "text" : "password"}
					placeholder={placeholder}
					value={val}
					onChange={(e) => setVal(e.target.value)}
					className="w-full pl-12 pr-12 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium outline-none border border-red-ribbon-600/10 text-shark-200 focus:border-red-ribbon-600/45 transition-all"
				/>
				<motion.button
					type="button"
					onClick={() => setShow(!show)}
					className="absolute top-0 right-0 flex items-center justify-center w-11.5 h-11.5 rounded-lg bg-red-ribbon-600 text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-red-ribbon-600/60"
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

function SelectField({ value, onChange, options, placeholder }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className={`w-full flex items-center justify-between px-4 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium transition-all border ${
					open
						? "border-red-ribbon-600/45"
						: "border-red-ribbon-600/10"
				} ${value ? "text-shark-200" : "text-shark-200"}`}
			>
				{value || placeholder}
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
						className="absolute z-50 w-full mt-1 bg-shark-900 rounded-xl overflow-hidden border border-red-ribbon-600/15 shadow-2xl"
					>
						<div className="py-2 max-h-48 overflow-y-auto scrollbar-hide">
							{options.map((option) => (
								<button
									type="button"
									key={option}
									onClick={() => {
										onChange(option);
										setOpen(false);
									}}
									className={`w-full flex items-center justify-between px-4 py-3 text-sm font-ubuntu font-medium text-left transition-colors ${
										value === option
											? "text-red-ribbon-600 bg-red-ribbon-600/10"
											: "text-shark-200 hover:bg-red-ribbon-600/12"
									}`}
								>
									{option}
									{value === option && (
										<Check
											size={14}
											strokeWidth={3}
											className="text-shark-200"
										/>
									)}
								</button>
							))}
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
						className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-ribbon-600 z-10"
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
						placeholderText={placeholder || "Select date"}
						className="w-full pl-12 pr-4 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium outline-none border border-red-ribbon-600/10 text-shark-200 focus:border-red-ribbon-600/45 transition-all"
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
							Icon === MapPin ||
							Icon === DollarSign ||
							Icon === Calendar
								? "text-red-ribbon-600"
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
					className={`w-full py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium outline-none border border-red-ribbon-600/10 text-shark-200 focus:border-red-ribbon-600/45 transition-all ${
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
				className="px-6 py-2.5 bg-red-ribbon-600 rounded-xl text-sm font-bold font-ubuntu text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-red-ribbon-600/70"
				whileHover={{ scale: 1.03 }}
				whileTap={{ scale: 0.97 }}
			>
				{label}
			</motion.button>
			{saved && (
				<motion.span
					initial={{ opacity: 0, x: -6 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0 }}
					className="flex items-center gap-1 text-xs font-ubuntu font-bold text-narvik-500"
				>
					<Check size={12} strokeWidth={3} /> Saved
				</motion.span>
			)}
		</div>
	);
}

function Card({ title, subtitle, children }) {
	return (
		<div className="bg-shark-900 rounded-3xl p-8 space-y-6 border border-shark-200/7 shadow-2xl">
			<div>
				<h3 className="text-xl font-bold font-ubuntu text-shark-200">
					{title}
				</h3>
				<p className="text-sm font-ubuntu mt-2 text-shark-200">
					{subtitle}
				</p>
			</div>
			<div className="h-px bg-shark-200/6" />
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
	{ id: "organization", label: "Organization", icon: Building2 },
	{ id: "fields", label: "Hiring Fields", icon: BriefcaseBusiness },
	{ id: "security", label: "Security", icon: Shield },
];

export default function EnterpriseProfile() {
	const [activeTab, setActiveTab] = useState(getInitialTab);
	const [savedBadge, setSavedBadge] = useState({
		organization: false,
		fields: false,
	});

	const [organization, setOrganization] = useState({
		name: "",
		category: "",
		companySize: "",
		avgSalary: "",
		location: "",
		founded: "",
	});

	const [hiringFields, setHiringFields] = useState([]);

	useEffect(() => {
		const saved = loadProfile();
		if (saved) {
			if (saved.organization) setOrganization(saved.organization);
			if (saved.hiringFields) setHiringFields(saved.hiringFields);
		}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(TAB_KEY, activeTab);
		} catch {}
	}, [activeTab]);

	const updateOrganization = (key, val) =>
		setOrganization((prev) => ({ ...prev, [key]: val }));

	const handleSaveOrganization = () => {
		saveProfile({ organization, hiringFields });
		setSavedBadge((p) => ({ ...p, organization: true }));
		setTimeout(
			() => setSavedBadge((p) => ({ ...p, organization: false })),
			2500,
		);
	};

	const handleSaveFields = () => {
		saveProfile({ organization, hiringFields });
		setSavedBadge((p) => ({ ...p, fields: true }));
		setTimeout(() => setSavedBadge((p) => ({ ...p, fields: false })), 2500);
	};

	const displayName = organization.name || null;

	const categories = [
		"Software",
		"Data Science",
		"Research Center",
		"E-Commerce",
		"Cybersecurity",
		"Cloud Services",
		"AI Solutions",
	];

	const companySizes = ["Small", "Medium", "Large"];

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
			className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-800),var(--color-shark-800),var(--color-shark-950))] bg-no-repeat"
		>
			<div className="max-w-5xl mx-auto px-8 py-12 space-y-6">
				<div className="bg-shark-900 rounded-3xl p-8 border border-shark-200/7 shadow-2xl">
					<div className="flex items-center gap-6">
						<div className="relative shrink-0">
							<div className="w-16 h-16 bg-red-ribbon-600 rounded-full flex items-center justify-center text-lg font-bold text-shark-200">
								<Building2 size={32} strokeWidth={2} />
							</div>
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h1
									className={`text-lg font-bold font-ubuntu ${
										displayName
											? "text-shark-200"
											: "text-shark-400"
									}`}
								>
									{displayName || "Your Organization's Name"}
								</h1>
							</div>
							<p className="text-sm font-ubuntu mt-1 text-shark-200">
								{organization.category ||
									"Category not set yet"}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-shark-900 rounded-3xl p-2 grid grid-cols-3 gap-2 border border-shark-200/7 shadow-xl">
					{TABS.map((tab) => {
						const active = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-bold font-ubuntu transition-colors duration-150 ${
									active
										? "text-red-ribbon-600"
										: "text-shark-200"
								} hover:text-shark-200`}
							>
								{active && (
									<motion.div
										layoutId="tab-bg-enterprise"
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
						{activeTab === "organization" && (
							<motion.div
								variants={tabVariants}
								initial="initial"
								animate="animate"
								exit="exit"
							>
								<Card
									title="Organization Information"
									subtitle="Update your organization details."
								>
									<div className="space-y-4">
										<Field
											label="Organization Name"
											placeholder=""
											value={organization.name}
											onChange={(v) =>
												updateOrganization("name", v)
											}
										/>

										<div className="space-y-2">
											<label className="block text-[14px] font-bold font-ubuntu tracking-wide text-shark-100">
												Category
											</label>
											<SelectField
												value={organization.category}
												onChange={(v) =>
													updateOrganization(
														"category",
														v,
													)
												}
												options={categories}
												placeholder="Select category"
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2.5">
												<label className="block text-[14px] font-bold font-ubuntu tracking-wide text-shark-100">
													Company Size
												</label>
												<SelectField
													value={
														organization.companySize
													}
													onChange={(v) =>
														updateOrganization(
															"companySize",
															v,
														)
													}
													options={companySizes}
													placeholder="Select company size"
												/>
											</div>

											<Field
												label="Average Salary (in USD)"
												placeholder=""
												type="number"
												icon={DollarSign}
												value={organization.avgSalary}
												onChange={(v) =>
													updateOrganization(
														"avgSalary",
														v,
													)
												}
											/>
										</div>

										<Field
											label="Location"
											placeholder=""
											icon={MapPin}
											value={organization.location}
											onChange={(v) =>
												updateOrganization(
													"location",
													v,
												)
											}
										/>

										<Field
											label="Founded"
											placeholder="Select date"
											type="date"
											icon={Calendar}
											value={organization.founded}
											onChange={(v) =>
												updateOrganization("founded", v)
											}
										/>

										<div className="pt-1">
											<SaveBtn
												label="Save Changes"
												onClick={handleSaveOrganization}
												saved={savedBadge.organization}
											/>
										</div>
									</div>
								</Card>
							</motion.div>
						)}

						{activeTab === "fields" && (
							<motion.div
								variants={tabVariants}
								initial="initial"
								animate="animate"
								exit="exit"
							>
								<Card
									title="Hiring Fields"
									subtitle="Select all fields that apply to your organization."
								>
									<HiringFieldsSelector
										selectedFields={hiringFields}
										setSelectedFields={setHiringFields}
									/>
									<div className="pt-1">
										<SaveBtn
											label="Save Fields"
											onClick={handleSaveFields}
											saved={savedBadge.fields}
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
										/>
										<PasswordField
											label="New Password"
											placeholder="Enter new password"
										/>
										<div className="pt-1">
											<SaveBtn label="Update Password" />
										</div>
									</div>
								</Card>
							</motion.div>
						)}
					</div>
				</AnimatePresence>
			</div>

			<div className="fixed top-0 left-0 h-screen">
				<EnterpriseSidebar />
			</div>
		</motion.div>
	);
}
