import "../index.css";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
	ChevronDown,
	Search,
	Check,
	Zap,
	Activity,
	Gauge,
} from "lucide-react";

async function fetchUserSkills() {
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError) {
		console.error("Auth error:", authError);
		throw authError;
	}

	if (!user) {
		throw new Error("User not authenticated.");
	}

	const { data: skillsetRows, error: skillsetsError } = await supabase
		.from("skillsets")
		.select("skill_id")
		.eq("user_id", user.id);

	if (skillsetsError) {
		console.error("Error fetching skillsets:", skillsetsError);
		throw skillsetsError;
	}

	if (!skillsetRows || skillsetRows.length === 0) {
		return [];
	}

	const skillIds = [
		...new Set(skillsetRows.map((row) => row.skill_id).filter(Boolean)),
	];

	const { data: skillsRows, error: skillsError } = await supabase
		.from("skills")
		.select("skill_id, skill_name")
		.in("skill_id", skillIds);

	if (skillsError) {
		console.error("Error fetching skills:", skillsError);
		throw skillsError;
	}

	const { data: riskRows, error: riskError } = await supabase
		.from("skill_risk")
		.select("skill_id, ai_impact")
		.in("skill_id", skillIds);

	if (riskError) {
		console.error("Error fetching skill risk:", riskError);
		throw riskError;
	}

	const skillsMap = new Map(
		(skillsRows || []).map((row) => [row.skill_id, row.skill_name ?? ""]),
	);

	const riskMap = new Map(
		(riskRows || []).map((row) => [row.skill_id, row.ai_impact ?? 0]),
	);

	return skillIds
		.map((skillId) => ({
			skillId,
			name: skillsMap.get(skillId) ?? "",
			impact: Number(riskMap.get(skillId) ?? 0),
		}))
		.filter((item) => item.name.trim() !== "");
}

// ---------- Helpers ----------
function getImpactBucket(value) {
	if (value <= 33) return "low";
	if (value <= 66) return "medium";
	return "high";
}

function getImpactMeta(value) {
	const bucket = getImpactBucket(value);
	if (bucket === "low") {
		return {
			label: "Low",
			color: "var(--color-narvik-500)",
			soft: "rgba(69,174,57,0.12)",
			border: "rgba(69,174,57,0.35)",
			outlook: "Stable",
			sensitivity: "Low AI substitution pressure",
			description:
				"This skill remains highly defensible against AI automation. It relies on human judgment, contextual nuance, or hands-on capability that current models do not replicate well — keep investing in it as a core strength.",
		};
	}
	if (bucket === "medium") {
		return {
			label: "Medium",
			color: "var(--color-lightning-yellow-600)",
			soft: "rgba(214,117,9,0.12)",
			border: "rgba(214,117,9,0.4)",
			outlook: "Evolving",
			sensitivity: "Moderate augmentation pressure",
			description:
				"AI is actively reshaping how this skill is applied. Expect to work alongside intelligent tools, automate repetitive parts, and shift toward higher-leverage tasks. Pair it with complementary skills to stay ahead.",
		};
	}
	return {
		label: "High",
		color: "var(--color-coral-red-600)",
		soft: "rgba(229,29,41,0.12)",
		border: "rgba(229,29,41,0.4)",
		outlook: "Vulnerable",
		sensitivity: "High automation pressure",
		description:
			"This skill faces strong displacement risk from AI. Many of its core tasks can be automated end-to-end. Consider deepening into adjacent strategic, creative, or interpersonal skills to remain resilient.",
	};
}

// ---------- Donut chart ----------
function ImpactDonut({ value }) {
	const meta = getImpactMeta(value);
	const data = [
		{ name: "Impact", value },
		{ name: "Remaining", value: 100 - value },
	];

	return (
		<div className="relative w-full h-full">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
					<defs>
						<linearGradient
							id="skillImpactFill"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="0%"
								stopColor={meta.color}
								stopOpacity={1}
							/>
							<stop
								offset="100%"
								stopColor={meta.color}
								stopOpacity={0.65}
							/>
						</linearGradient>
					</defs>
					<Pie
						data={data}
						dataKey="value"
						innerRadius="70%"
						outerRadius="94%"
						startAngle={90}
						endAngle={-270}
						stroke="none"
						paddingAngle={2}
						cornerRadius={8}
						animationDuration={900}
						animationEasing="ease-out"
					>
						<Cell fill="url(#skillImpactFill)" />
						<Cell fill="rgba(255,255,255,0.05)" />
					</Pie>
					<Tooltip
						cursor={false}
						contentStyle={{
							background: "var(--color-shark-900)",
							border: `1px solid ${meta.border}`,
							borderRadius: 10,
							fontFamily: "Ubuntu, sans-serif",
							fontSize: 12,
							color: "var(--color-shark-200)",
						}}
						itemStyle={{ color: meta.color }}
					/>
				</PieChart>
			</ResponsiveContainer>

			<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
				<motion.p
					key={value}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="text-6xl font-ubuntu font-bold leading-none"
					style={{ color: meta.color }}
				>
					{value}
					<span className="text-3xl align-top ml-0.5">%</span>
				</motion.p>
				<p className="mt-3 text-xs tracking-[0.3em] font-ubuntu font-bold uppercase text-shark-400">
					AI Impact
				</p>
			</div>
		</div>
	);
}

// ---------- Page ----------
function MySkills() {
	const [skills, setSkills] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedSkill, setSelectedSkill] = useState(null);
	const [skillSearch, setSkillSearch] = useState("");

	useEffect(() => {
		const loadSkills = async () => {
			try {
				setLoading(true);
				const data = await fetchUserSkills();
				setSkills(data);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load your skills.");
			} finally {
				setLoading(false);
			}
		};

		loadSkills();
	}, []);

	const filteredSkills = useMemo(() => {
		if (!skillSearch.trim()) return skills;
		const q = skillSearch.toLowerCase();
		return skills.filter((s) => s.name.toLowerCase().includes(q));
	}, [skills, skillSearch]);

	const meta = selectedSkill ? getImpactMeta(selectedSkill.impact) : null;

	return (
		<motion.div
			animate={{
				backgroundSize: ["100% 100%", "115% 115%", "100% 100%"],
				backgroundPosition: ["50% 0%", "50% 15%", "50% 0%"],
			}}
			transition={{
				duration: 3.5,
				repeat: Infinity,
				ease: "easeInOut",
			}}
			className="h-screen w-full overflow-hidden flex items-center justify-center
            bg-[radial-gradient(ellipse_at_top,var(--color-aqua-island-800),var(--color-shark-800),var(--color-shark-950))]
            bg-no-repeat"
		>
			<div className="fixed top-0 left-0 h-screen z-40">
				<JobSeekerSidebar />
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.99 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="w-[min(1400px,calc(100vw-7rem))] h-[calc(100vh-2rem)] mx-auto flex flex-col gap-3"
			>
				{/* Dropdown */}
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="w-full max-w-3xl mx-auto shrink-0"
				>
					<Listbox
						value={selectedSkill}
						onChange={(val) => {
							setSelectedSkill(val);
							setSkillSearch("");
						}}
						disabled={loading || skills.length === 0}
					>
						{({ open }) => (
							<div className="relative">
								<ListboxButton as={Fragment}>
									<motion.button
										layout
										className={`w-full px-5 py-4 border-2 rounded-xl text-left flex items-center justify-between bg-shark-950 font-ubuntu font-bold text-base focus:outline-none transition-colors ${
											open || selectedSkill
												? "border-aqua-island-500"
												: "border-aqua-island-500/40"
										}`}
										whileFocus={{
											boxShadow:
												"0 0 0 2px rgba(67,180,172,0.35)",
										}}
									>
										<span
											className={
												selectedSkill
													? "text-shark-100"
													: "text-shark-500"
											}
										>
											{loading
												? "Loading your skills..."
												: skills.length === 0
													? "No skills found in your profile"
													: selectedSkill
														? selectedSkill.name
														: "Select one of your skills"}
										</span>
										<motion.div
											animate={{ rotate: open ? 180 : 0 }}
											transition={{ duration: 0.2 }}
										>
											<ChevronDown className="w-5 h-5 text-aqua-island-400" />
										</motion.div>
									</motion.button>
								</ListboxButton>

								<AnimatePresence>
									{open && (
										<ListboxOptions
											as={motion.ul}
											static
											initial={{
												opacity: 0,
												scale: 0.98,
											}}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.98 }}
											transition={{ duration: 0.15 }}
											className="absolute mt-2 w-full z-50 bg-shark-900 border border-aqua-island-500/40 rounded-xl shadow-2xl overflow-hidden"
										>
											<div className="px-3 pt-3 pb-2">
												<div className="relative">
													<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aqua-island-400" />
													<input
														type="text"
														placeholder="Search your skills..."
														value={skillSearch}
														onChange={(e) =>
															setSkillSearch(
																e.target.value,
															)
														}
														onClick={(e) =>
															e.stopPropagation()
														}
														onKeyDown={(e) =>
															e.stopPropagation()
														}
														className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-shark-950 border border-aqua-island-500/30 text-shark-200 font-ubuntu text-sm placeholder:text-shark-500 focus:outline-none focus:border-aqua-island-500"
													/>
												</div>
											</div>

											<div className="max-h-56 overflow-y-auto pb-2 scrollbar-hide">
												{filteredSkills.length === 0 ? (
													<li className="px-5 py-4 text-shark-500 font-ubuntu text-sm">
														No results found.
													</li>
												) : (
													filteredSkills.map(
														(skill) => (
															<ListboxOption
																key={
																	skill.skillId
																}
																value={skill}
																as={Fragment}
															>
																{({
																	active,
																	selected,
																}) => (
																	<li
																		className={`flex items-center justify-between px-5 py-3 text-sm font-ubuntu cursor-pointer transition-colors ${
																			active
																				? "bg-aqua-island-500/10 text-shark-100"
																				: "text-shark-200"
																		} ${selected ? "font-bold text-aqua-island-400" : ""}`}
																	>
																		<span>
																			{
																				skill.name
																			}
																		</span>
																		{selected && (
																			<Check className="w-4 h-4 text-aqua-island-400" />
																		)}
																	</li>
																)}
															</ListboxOption>
														),
													)
												)}
											</div>
										</ListboxOptions>
									)}
								</AnimatePresence>
							</div>
						)}
					</Listbox>
				</motion.div>

				{/* Card area */}
				<div className="flex-1 min-h-0">
					<AnimatePresence mode="wait">
						{!selectedSkill ? (
							<motion.div
								key="empty"
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.98 }}
								transition={{ duration: 0.3 }}
								className="h-full bg-shark-900 rounded-3xl border border-white/7 shadow-2xl flex items-center justify-center"
							>
								<div className="flex flex-col items-center text-center px-8">
									<div className="w-20 h-20 rounded-2xl bg-aqua-island-500/10 border border-aqua-island-500/30 flex items-center justify-center mb-5">
										<Zap
											size={36}
											className="text-aqua-island-500"
										/>
									</div>
									<p className="text-2xl font-ubuntu font-bold text-shark-200">
										{loading
											? "Loading your skills..."
											: skills.length === 0
												? "No skills in your profile yet"
												: "No skill selected"}
									</p>
									<p className="mt-3 text-[15px] font-ubuntu text-shark-400 max-w-lg">
										{skills.length === 0 && !loading
											? "Add skills to your profile to view AI impact analysis for each one."
											: "Select one of your skills from the dropdown above to view its AI impact analysis, outlook, and risk breakdown."}
									</p>
								</div>
							</motion.div>
						) : (
							<motion.div
								key={selectedSkill.skillId}
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.98 }}
								transition={{ duration: 0.35, ease: "easeOut" }}
								className="h-full bg-shark-900 rounded-3xl border border-white/7 shadow-2xl overflow-hidden flex flex-col"
							>
								{/* Card header */}
								<div className="px-8 pt-5 pb-4 border-b border-white/5 shrink-0 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Zap
											size={20}
											className="text-aqua-island-500"
										/>
										<div>
											<h2 className="text-lg font-bold font-ubuntu text-shark-100">
												{selectedSkill.name}
											</h2>
											<p className="text-xs font-ubuntu text-shark-500 mt-0.5">
												AI impact & skill outlook
											</p>
										</div>
									</div>
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.1 }}
										className="px-3.5 py-1.5 rounded-full text-xs font-ubuntu font-bold uppercase tracking-widest border"
										style={{
											color: meta.color,
											background: meta.soft,
											borderColor: meta.border,
										}}
									>
										{meta.label} Impact
									</motion.div>
								</div>

								{/* Card body */}
								<div className="flex-1 min-h-0 grid grid-cols-12 gap-4 p-5">
									{/* Donut */}
									<motion.div
										initial={{ opacity: 0, scale: 0.97 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{
											duration: 0.4,
											delay: 0.08,
										}}
										className="col-span-12 md:col-span-6 bg-shark-950 rounded-2xl border border-white/5 p-3 flex items-center justify-center min-h-0"
									>
										<div className="w-full h-full max-h-115 aspect-square">
											<ImpactDonut
												value={selectedSkill.impact}
											/>
										</div>
									</motion.div>

									{/* Right column */}
									<div className="col-span-12 md:col-span-6 flex flex-col gap-3 min-h-0">
										{/* Interpretation */}
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.98,
											}}
											animate={{ opacity: 1, scale: 1 }}
											transition={{
												duration: 0.35,
												delay: 0.14,
											}}
											className="bg-shark-950 rounded-2xl border border-white/5 px-4 py-3"
										>
											<p className="text-[10px] font-ubuntu uppercase tracking-[0.25em] text-shark-500 mb-2">
												Interpretation
											</p>
											<p className="text-[15px] font-ubuntu text-shark-200 leading-relaxed">
												{meta.description}
											</p>
										</motion.div>

										{/* Info chips */}
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.98,
											}}
											animate={{ opacity: 1, scale: 1 }}
											transition={{
												duration: 0.35,
												delay: 0.2,
											}}
											className="grid grid-cols-2 gap-3"
										>
											<div className="bg-shark-950 rounded-2xl border border-white/5 px-4 py-3">
												<div className="flex items-center gap-2 mb-1.5">
													<Activity
														size={14}
														className="text-aqua-island-500"
													/>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														Skill Outlook
													</p>
												</div>
												<p className="text-[15px] font-ubuntu font-bold text-shark-100">
													{meta.outlook}
												</p>
											</div>
											<div className="bg-shark-950 rounded-2xl border border-white/5 px-4 py-3">
												<div className="flex items-center gap-2 mb-1.5">
													<Gauge
														size={14}
														className="text-aqua-island-500"
													/>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														AI Sensitivity
													</p>
												</div>
												<p className="text-[15px] font-ubuntu font-bold text-shark-100">
													{meta.sensitivity}
												</p>
											</div>
										</motion.div>

										{/* Scale + analytics summary */}
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.98,
											}}
											animate={{ opacity: 1, scale: 1 }}
											transition={{
												duration: 0.35,
												delay: 0.26,
											}}
											className="bg-shark-950 rounded-2xl border border-white/5 px-4 py-3 flex-1 min-h-0 flex flex-col justify-between gap-3"
										>
											<div>
												<p className="text-[10px] font-ubuntu uppercase tracking-[0.25em] text-shark-500 mb-2.5">
													Impact Scale
												</p>
												<div className="flex items-center gap-3 flex-wrap">
													{[
														{
															label: "Low",
															range: "0–33",
															color: "var(--color-narvik-500)",
														},
														{
															label: "Medium",
															range: "34–66",
															color: "var(--color-lightning-yellow-600)",
														},
														{
															label: "High",
															range: "67–100",
															color: "var(--color-coral-red-600)",
														},
													].map((item) => {
														const isActive =
															item.label ===
															meta.label;
														return (
															<div
																key={item.label}
																className={`flex items-center gap-2 px-2.5 py-1 rounded-lg transition-colors ${
																	isActive
																		? "bg-white/5"
																		: ""
																}`}
															>
																<span
																	className="w-2.5 h-2.5 rounded-full"
																	style={{
																		background:
																			item.color,
																		boxShadow:
																			isActive
																				? `0 0 0 3px ${item.color}25`
																				: "none",
																	}}
																/>
																<span
																	className={`text-xs font-ubuntu font-bold ${
																		isActive
																			? "text-shark-100"
																			: "text-shark-400"
																	}`}
																>
																	{item.label}
																</span>
																<span className="text-[10px] font-ubuntu text-shark-500">
																	{item.range}
																</span>
															</div>
														);
													})}
												</div>
											</div>

											<div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-3">
												<div>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														Score
													</p>
													<p className="mt-1 text-lg font-ubuntu font-bold text-shark-100">
														{selectedSkill.impact}
														<span className="text-shark-500 text-xs">
															/100
														</span>
													</p>
												</div>
												<div>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														Risk Tier
													</p>
													<p
														className="mt-1 text-lg font-ubuntu font-bold"
														style={{
															color: meta.color,
														}}
													>
														{meta.label}
													</p>
												</div>
												<div>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														Confidence
													</p>
													<p className="mt-1 text-lg font-ubuntu font-bold text-shark-100">
														High
													</p>
												</div>
											</div>
										</motion.div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</motion.div>
	);
}

export default MySkills;
