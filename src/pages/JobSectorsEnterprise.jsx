import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
	BrainCircuit,
	Activity,
	Gauge,
	Sparkles,
} from "lucide-react";
import "../index.css";
import EnterpriseSidebar from "../components/EnterpriseSidebar";

// ---------- Dummy data ----------
const DUMMY_SECTORS = [
	{ label: "Data Entry Clerk", aiImpact: 88 },
	{ label: "Software Engineer", aiImpact: 54 },
	{ label: "Data Scientist", aiImpact: 72 },
	{ label: "Graphic Designer", aiImpact: 41 },
	{ label: "Registered Nurse", aiImpact: 18 },
];

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
			text: "text-narvik-500",
			outlook: "Stable",
			automation: "Minimal automation sensitivity",
			description:
				"This sector shows limited exposure to AI automation. Human judgment, hands-on skill, and interpersonal nuance remain central to day-to-day work.",
		};
	}
	if (bucket === "medium") {
		return {
			label: "Medium",
			color: "var(--color-lightning-yellow-600)",
			soft: "rgba(214,117,9,0.12)",
			border: "rgba(214,117,9,0.4)",
			text: "text-lightning-yellow-600",
			outlook: "Transforming",
			automation: "Moderate automation sensitivity",
			description:
				"AI is reshaping core workflows in this sector. Expect augmented tooling, partial task automation, and a clear shift in required skill mix.",
		};
	}
	return {
		label: "High",
		color: "var(--color-coral-red-600)",
		soft: "rgba(229,29,41,0.12)",
		border: "rgba(229,29,41,0.4)",
		text: "text-coral-red-600",
		outlook: "Disrupting",
		automation: "High automation sensitivity",
		description:
			"This sector faces strong AI-driven disruption. Many repetitive tasks are being absorbed by automated systems, accelerating role redefinition.",
	};
}

// ---------- Donut chart card ----------
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
							id="impactFill"
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
						<Cell fill="url(#impactFill)" />
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

			{/* Center label */}
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
function JobSectorsEnterprise() {
	const navigate = useNavigate();
	const [selectedSector, setSelectedSector] = useState(null);
	const [sectorSearch, setSectorSearch] = useState("");

	const filteredSectors = useMemo(() => {
		if (!sectorSearch.trim()) return DUMMY_SECTORS;
		return DUMMY_SECTORS.filter((s) =>
			s.label.toLowerCase().includes(sectorSearch.toLowerCase()),
		);
	}, [sectorSearch]);

	const meta = selectedSector ? getImpactMeta(selectedSector.aiImpact) : null;

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
            bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))]
            bg-no-repeat"
		>
			<div className="fixed top-0 left-0 h-screen z-40">
				<EnterpriseSidebar />
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
						value={selectedSector}
						onChange={(val) => {
							setSelectedSector(val);
							setSectorSearch("");
						}}
					>
						{({ open }) => (
							<div className="relative">
								<ListboxButton as={Fragment}>
									<motion.button
										layout
										className={`w-full px-5 py-4 border-2 rounded-xl text-left flex items-center justify-between bg-shark-950 font-ubuntu font-bold text-base focus:outline-none transition-colors ${
											open || selectedSector
												? "border-red-ribbon-500"
												: "border-red-ribbon-500/40"
										}`}
										whileFocus={{
											boxShadow:
												"0 0 0 2px rgba(227,27,35,0.35)",
										}}
									>
										<span
											className={
												selectedSector
													? "text-shark-100"
													: "text-shark-500"
											}
										>
											{selectedSector
												? selectedSector.label
												: "Select job sector"}
										</span>
										<motion.div
											animate={{ rotate: open ? 180 : 0 }}
											transition={{ duration: 0.2 }}
										>
											<ChevronDown className="w-5 h-5 text-red-ribbon-400" />
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
											className="absolute mt-2 w-full z-50 bg-shark-900 border border-red-ribbon-500/40 rounded-xl shadow-2xl overflow-hidden"
										>
											<div className="px-3 pt-3 pb-2">
												<div className="relative">
													<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-ribbon-400" />
													<input
														type="text"
														placeholder="Search job title..."
														value={sectorSearch}
														onChange={(e) =>
															setSectorSearch(
																e.target.value,
															)
														}
														onClick={(e) =>
															e.stopPropagation()
														}
														onKeyDown={(e) =>
															e.stopPropagation()
														}
														className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-shark-950 border border-red-ribbon-500/30 text-shark-200 font-ubuntu text-sm placeholder:text-shark-500 focus:outline-none focus:border-red-ribbon-500"
													/>
												</div>
											</div>

											<div className="max-h-56 overflow-y-auto pb-2 scrollbar-hide">
												{filteredSectors.length ===
												0 ? (
													<li className="px-5 py-4 text-shark-500 font-ubuntu text-sm">
														No results found.
													</li>
												) : (
													filteredSectors.map(
														(sector) => (
															<ListboxOption
																key={
																	sector.label
																}
																value={sector}
																as={Fragment}
															>
																{({
																	active,
																	selected,
																}) => (
																	<li
																		className={`flex items-center justify-between px-5 py-3 text-sm font-ubuntu cursor-pointer transition-colors ${
																			active
																				? "bg-red-ribbon-500/10 text-shark-100"
																				: "text-shark-200"
																		} ${selected ? "font-bold text-red-ribbon-400" : ""}`}
																	>
																		<span>
																			{
																				sector.label
																			}
																		</span>
																		{selected && (
																			<Check className="w-4 h-4 text-red-ribbon-400" />
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
						{!selectedSector ? (
							<motion.div
								key="empty"
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.98 }}
								transition={{ duration: 0.3 }}
								className="h-full bg-shark-900 rounded-3xl border border-white/7 shadow-2xl flex items-center justify-center"
							>
								<div className="flex flex-col items-center text-center px-8">
									<div className="w-20 h-20 rounded-2xl bg-red-ribbon-500/10 border border-red-ribbon-500/30 flex items-center justify-center mb-5">
										<BrainCircuit
											size={36}
											className="text-red-ribbon-500"
										/>
									</div>
									<p className="text-2xl font-ubuntu font-bold text-shark-200">
										No sector selected
									</p>
									<p className="mt-3 text-[15px] font-ubuntu text-shark-400 max-w-lg">
										Select a job sector from the dropdown
										above to view its AI impact analysis,
										automation outlook, and enterprise
										insights.
									</p>
								</div>
							</motion.div>
						) : (
							<motion.div
								key={selectedSector.label}
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.98 }}
								transition={{ duration: 0.35, ease: "easeOut" }}
								className="h-full bg-shark-900 rounded-3xl border border-white/7 shadow-2xl overflow-hidden flex flex-col"
							>
								{/* Card header */}
								<div className="px-8 pt-5 pb-4 border-b border-white/5 shrink-0 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Sparkles
											size={20}
											className="text-red-ribbon-500"
										/>
										<div>
											<h2 className="text-lg font-bold font-ubuntu text-shark-100">
												{selectedSector.label}
											</h2>
											<p className="text-xs font-ubuntu text-shark-500 mt-0.5">
												AI impact & automation outlook
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
												value={selectedSector.aiImpact}
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
														className="text-red-ribbon-500"
													/>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														Sector Outlook
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
														className="text-red-ribbon-500"
													/>
													<p className="text-[10px] font-ubuntu uppercase tracking-[0.2em] text-shark-500">
														Automation
													</p>
												</div>
												<p className="text-[15px] font-ubuntu font-bold text-shark-100">
													{meta.automation}
												</p>
											</div>
										</motion.div>

										{/* Legend + analytics summary */}
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
														{
															selectedSector.aiImpact
														}
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

export default JobSectorsEnterprise;
