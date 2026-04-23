import { useState, useMemo, Fragment, useEffect } from "react";
import "../index.css";
import { motion, AnimatePresence } from "framer-motion";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import { supabase } from "../lib/supabaseClient";
import {
	ChevronDown,
	Search,
	BadgeCheck,
	Check,
	BriefcaseBusiness,
	Compass,
} from "lucide-react";
import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ---------- Compact circular meter ----------
function CompactMeter({ value, color, label }) {
	const data = [
		{ name: "used", value },
		{ name: "unused", value: 100 - value },
	];

	return (
		<div className="flex flex-col items-center gap-2.5">
			<div className="relative w-24 h-24">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius="68%"
							outerRadius="94%"
							paddingAngle={2}
							dataKey="value"
							startAngle={90}
							endAngle={-270}
							stroke="none"
							cornerRadius={6}
							animationDuration={700}
							animationEasing="ease-out"
						>
							<Cell fill={color} />
							<Cell fill="rgba(255,255,255,0.05)" />
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<p
						className="text-lg font-ubuntu font-bold leading-none"
						style={{ color }}
					>
						{value}
						<span className="text-[10px] align-top ml-0.5">%</span>
					</p>
				</div>
			</div>
			<p className="text-[10px] font-ubuntu text-shark-400 uppercase tracking-[0.22em] font-bold">
				{label}
			</p>
		</div>
	);
}

// ---------- Skill card ----------
function SkillCard({ skill, index }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.35,
				delay: index * 0.05,
				ease: "easeOut",
			}}
			whileHover={{ y: -2, transition: { duration: 0.2 } }}
			className="group bg-shark-950 rounded-2xl border border-white/5 hover:border-aqua-island-500/40 px-5 py-4 transition-colors duration-200 shadow-lg shadow-black/20"
		>
			<div className="flex items-center justify-between gap-4">
				{/* Left: title + badge */}
				<div className="flex flex-col gap-2 min-w-0 flex-1">
					<h3 className="text-base font-ubuntu font-bold text-shark-100 truncate">
						{skill.name}
					</h3>
					<motion.div
						whileHover={{ scale: 1.04 }}
						className={`self-start rounded-lg px-2.5 py-1 flex items-center gap-1.5 border ${
							skill.owned
								? "bg-lightning-yellow-600/15 border-lightning-yellow-600/40"
								: "bg-shark-800/70 border-white/5"
						}`}
					>
						<BadgeCheck
							size={13}
							strokeWidth={2.5}
							className={
								skill.owned
									? "text-lightning-yellow-500"
									: "text-shark-400"
							}
						/>
						<span
							className={`text-[10px] font-ubuntu font-bold uppercase tracking-wider ${
								skill.owned
									? "text-lightning-yellow-400"
									: "text-shark-300"
							}`}
						>
							{skill.owned ? "OWNED" : "LEARN"}
						</span>
					</motion.div>
				</div>

				{/* Right: meters */}
				<div className="flex items-center gap-5 shrink-0">
					<CompactMeter
						value={skill.priority}
						color="var(--color-aqua-island-500)"
						label="Priority"
					/>
					<div className="w-px h-16 bg-white/5" />
					<CompactMeter
						value={skill.aiImpact}
						color="var(--color-red-ribbon-600)"
						label="AI Impact"
					/>
				</div>
			</div>
		</motion.div>
	);
}

// ---------- Page ----------
function Recommendations() {
	const [jobs, setJobs] = useState([]);
	const [selectedJob, setSelectedJob] = useState(null);
	const [jobSearch, setJobSearch] = useState("");
	const [skillsData, setSkillsData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [userId, setUserId] = useState(null);

	// Get current user
	useEffect(() => {
		const getCurrentUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) setUserId(user.id);
		};
		getCurrentUser();
	}, []);

	// Fetch jobs on component mount
	useEffect(() => {
		const fetchJobs = async () => {
			try {
				const { data, error } = await supabase
					.from("jobs")
					.select("job_id, job_title")
					.order("job_title", { ascending: true });

				if (error) throw error;
				setJobs(data || []);
			} catch (err) {
				console.error("Error fetching jobs:", err);
			}
		};

		fetchJobs();
	}, []);

	// Fetch skills for selected job
	useEffect(() => {
		if (!selectedJob || !userId) {
			setSkillsData([]);
			return;
		}

		const fetchSkillsForJob = async () => {
			setLoading(true);
			try {
				// Get top 10 skills by demand for this job
				const { data: skillMappings, error: mappingError } =
					await supabase
						.from("job_skill_mapping")
						.select("skill_id, skill_demand")
						.eq("job_id", selectedJob.job_id)
						.order("skill_demand", { ascending: false })
						.limit(10);

				if (mappingError) throw mappingError;

				// Get skill names and AI impact
				const skillsWithDetails = await Promise.all(
					(skillMappings || []).map(async (mapping) => {
						// Get skill name
						const { data: skillData, error: skillError } =
							await supabase
								.from("skills")
								.select("skill_name")
								.eq("skill_id", mapping.skill_id)
								.single();

						if (skillError)
							console.error("Error fetching skill:", skillError);

						// Get AI impact
						const { data: riskData, error: riskError } =
							await supabase
								.from("skill_risk")
								.select("ai_impact")
								.eq("skill_id", mapping.skill_id)
								.single();

						if (riskError)
							console.error("Error fetching risk:", riskError);

						// Check if user owns this skill
						const { data: userSkill, error: userSkillError } =
							await supabase
								.from("skillsets")
								.select("id")
								.eq("user_id", userId)
								.eq("skill_id", mapping.skill_id)
								.single();

						if (
							userSkillError &&
							userSkillError.code !== "PGRST116"
						) {
							console.error(
								"Error checking user skill:",
								userSkillError,
							);
						}

						return {
							name: skillData?.skill_name || mapping.skill_id,
							priority: mapping.skill_demand,
							aiImpact: riskData?.ai_impact || 0,
							owned: !!userSkill,
						};
					}),
				);

				setSkillsData(skillsWithDetails);
			} catch (err) {
				console.error("Error fetching skills data:", err);
				setSkillsData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchSkillsForJob();
	}, [selectedJob, userId]);

	const filteredJobs = useMemo(() => {
		if (!jobSearch.trim()) return jobs;
		return jobs.filter((j) =>
			j.job_title.toLowerCase().includes(jobSearch.toLowerCase()),
		);
	}, [jobs, jobSearch]);

	return (
		<motion.div
			animate={{
				backgroundSize: ["100% 100%", "115% 115%", "100% 100%"],
				backgroundPosition: ["50% 0%", "50% 15%", "50% 0%"],
			}}
			transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
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
						value={selectedJob}
						onChange={(val) => {
							setSelectedJob(val);
							setJobSearch("");
						}}
					>
						{({ open }) => (
							<div className="relative">
								<ListboxButton as={Fragment}>
									<motion.button
										layout
										className={`w-full px-5 py-4 border-2 rounded-xl text-left flex items-center justify-between bg-shark-950 font-ubuntu font-bold text-base focus:outline-none transition-colors ${
											open || selectedJob
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
												selectedJob
													? "text-shark-100"
													: "text-shark-500"
											}
										>
											{selectedJob
												? selectedJob.job_title
												: "Select job sector"}
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
														placeholder="Search job title..."
														value={jobSearch}
														onChange={(e) =>
															setJobSearch(
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

											<div className="max-h-64 overflow-y-auto pb-2 scrollbar-hide">
												{filteredJobs.length === 0 ? (
													<li className="px-5 py-4 text-shark-500 font-ubuntu text-sm">
														No results found.
													</li>
												) : (
													filteredJobs.map((job) => (
														<ListboxOption
															key={job.job_id}
															value={job}
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
																			job.job_title
																		}
																	</span>
																	{selected && (
																		<Check className="w-4 h-4 text-aqua-island-400" />
																	)}
																</li>
															)}
														</ListboxOption>
													))
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
				<div className="flex-1 min-h-0 max-h-195">
					<AnimatePresence mode="wait">
						{!selectedJob ? (
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
										<Compass
											size={36}
											className="text-aqua-island-500"
										/>
									</div>
									<p className="text-2xl font-ubuntu font-bold text-shark-200">
										No sector selected
									</p>
									<p className="mt-3 text-[15px] font-ubuntu text-shark-400 max-w-lg">
										Select a job sector from the dropdown
										above to see tailored skill
										recommendations, priorities, and AI
										impact insights.
									</p>
								</div>
							</motion.div>
						) : (
							<motion.div
								key={selectedJob.job_id}
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.98 }}
								transition={{ duration: 0.35, ease: "easeOut" }}
								className="h-full bg-shark-900 rounded-3xl border border-white/7 shadow-2xl overflow-hidden flex flex-col"
							>
								{/* Card header */}
								<div className="px-8 pt-5 pb-4 border-b border-white/5 shrink-0 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<BriefcaseBusiness
											size={20}
											className="text-aqua-island-500"
										/>
										<div>
											<h2 className="text-lg font-bold font-ubuntu text-shark-100">
												{selectedJob.job_title}
											</h2>
											<p className="text-xs font-ubuntu text-shark-500 mt-0.5">
												Recommended skills & AI impact
											</p>
										</div>
									</div>
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.1 }}
										className="px-3.5 py-1.5 rounded-full text-xs font-ubuntu font-bold uppercase tracking-widest border border-aqua-island-500/40 bg-aqua-island-500/10 text-aqua-island-400"
									>
										{skillsData.length} Skills
									</motion.div>
								</div>

								{/* Card body — recommendations list */}
								<div className="flex-1 min-h-0 p-5">
									<div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide pr-1">
										{loading ? (
											<div className="h-full flex items-center justify-center text-shark-400 font-ubuntu font-bold text-base">
												Loading skills...
											</div>
										) : skillsData.length > 0 ? (
											<div className="grid gap-3">
												{skillsData.map(
													(skill, idx) => (
														<SkillCard
															key={`${selectedJob.job_id}-${skill.name}-${idx}`}
															skill={skill}
															index={idx}
														/>
													),
												)}
											</div>
										) : (
											<div className="h-full flex items-center justify-center text-shark-500 font-ubuntu font-bold text-base">
												No recommendations found.
											</div>
										)}
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

export default Recommendations;
