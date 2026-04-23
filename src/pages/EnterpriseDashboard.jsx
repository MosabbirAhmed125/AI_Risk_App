// src/pages/EnterpriseDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	Crown,
	Brain,
	Zap,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	RadialBarChart,
	RadialBar,
	PolarAngleAxis,
	Cell,
} from "recharts";

import "../index.css";
import EnterpriseSidebar from "../components/EnterpriseSidebar";
import { supabase } from "../lib/supabaseClient"; // adjust path if different

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
const formatCurrency = (n) =>
	typeof n === "number" && !Number.isNaN(n)
		? n.toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 0,
			})
		: "—";

const formatPercentChange = (n) => {
	if (typeof n !== "number" || Number.isNaN(n)) return "—";
	const sign = n > 0 ? "+" : "";
	return `${sign}${n.toFixed(1)}%`;
};

const formatAIImpact = (n) =>
	typeof n === "number" && !Number.isNaN(n) ? `${Math.round(n)}%` : "—";

const formatScore = (n) =>
	typeof n === "number" && !Number.isNaN(n) ? `${Math.round(n)} / 100` : "—";

// ───────────────────────────────────────────────────────────
// Reusable card shell
// ───────────────────────────────────────────────────────────
function Card({ children, className = "" }) {
	return (
		<div
			className={`rounded-2xl border border-shark-700/60 bg-shark-900/60 backdrop-blur-xl shadow-2xl shadow-black/40 ${className}`}
		>
			{children}
		</div>
	);
}

// ───────────────────────────────────────────────────────────
// Custom tooltips (consistent dark style)
// ───────────────────────────────────────────────────────────
function BarTooltip({ active, payload, label }) {
	if (!active || !payload || !payload.length) return null;
	return (
		<div className="rounded-xl border border-shark-700/70 bg-shark-950/95 backdrop-blur px-3 py-2 shadow-xl">
			<p className="font-ubuntu text-xs uppercase tracking-wider text-shark-400">
				{label}
			</p>
			<p className="font-ubuntu text-sm text-shark-100">
				Demand:{" "}
				<span className="text-red-ribbon-500 font-semibold">
					{payload[0].value}
				</span>
			</p>
		</div>
	);
}

function RadialTooltip({ active, payload }) {
	if (!active || !payload || !payload.length) return null;
	const item = payload[0].payload;
	return (
		<div className="rounded-xl border border-shark-700/70 bg-shark-950/95 backdrop-blur px-3 py-2 shadow-xl">
			<p className="font-ubuntu text-xs uppercase tracking-wider text-shark-400">
				{item.name}
			</p>
			<p className="font-ubuntu text-sm text-shark-100">
				<span className="font-semibold" style={{ color: item.fill }}>
					{item.value}%
				</span>{" "}
				of demanded skills
			</p>
		</div>
	);
}

// ───────────────────────────────────────────────────────────
// Data fetchers
// ───────────────────────────────────────────────────────────
async function fetchEnterpriseJobIds(userId) {
	const { data, error } = await supabase
		.from("hiring_fields")
		.select("field")
		.eq("company_id", userId);
	if (error) throw error;
	return (data ?? []).map((r) => r.field).filter(Boolean);
}

async function fetchDashboardMetrics(jobIds) {
	if (!jobIds.length) {
		return {
			avgSalary: null,
			peakSalary: null,
			salaryTrend: null,
			avgAiImpact: null,
		};
	}

	// Salaries
	const { data: salaries, error: salariesErr } = await supabase
		.from("salary_history")
		.select("job_id, year, average_salary")
		.in("job_id", jobIds);
	if (salariesErr) throw salariesErr;

	const sal2025 = (salaries ?? []).filter((r) => Number(r.year) === 2025);
	const avgSalary = sal2025.length
		? sal2025.reduce((s, r) => s + Number(r.average_salary), 0) /
			sal2025.length
		: null;

	const peakSalary = (salaries ?? []).length
		? Math.max(...salaries.map((r) => Number(r.average_salary)))
		: null;

	// Salary trend
	const { data: trends, error: trendsErr } = await supabase
		.from("salary_trend")
		.select("job_id, salary_change")
		.in("job_id", jobIds);
	if (trendsErr) throw trendsErr;

	const salaryTrend = (trends ?? []).length
		? trends.reduce((s, r) => s + Number(r.salary_change), 0) /
			trends.length
		: null;

	// Avg AI impact (unweighted across demanded-skill occurrences)
	// We treat each (job_id, skill_id) demanded-skill occurrence as one entry
	// in the pool, then average the corresponding skill_risk.ai_impact.
	const { data: mappings, error: mapErr } = await supabase
		.from("job_skill_mapping")
		.select("skill_id")
		.in("job_id", jobIds);
	if (mapErr) throw mapErr;

	const occurrences = (mappings ?? []).map((m) => m.skill_id);
	let avgAiImpact = null;
	if (occurrences.length) {
		const uniqueSkillIds = [...new Set(occurrences)];
		const { data: risks, error: riskErr } = await supabase
			.from("skill_risk")
			.select("skill_id, ai_impact")
			.in("skill_id", uniqueSkillIds);
		if (riskErr) throw riskErr;

		const riskMap = new Map(
			(risks ?? []).map((r) => [r.skill_id, Number(r.ai_impact)]),
		);
		const impacts = occurrences
			.map((sid) => riskMap.get(sid))
			.filter((v) => typeof v === "number" && !Number.isNaN(v));
		avgAiImpact = impacts.length
			? impacts.reduce((s, v) => s + v, 0) / impacts.length
			: null;
	}

	return { avgSalary, peakSalary, salaryTrend, avgAiImpact };
}

async function fetchTopDemandedSkills(jobIds) {
	if (!jobIds.length) return [];

	const { data: mappings, error } = await supabase
		.from("job_skill_mapping")
		.select("skill_id, skill_demand")
		.in("job_id", jobIds);
	if (error) throw error;
	if (!mappings?.length) return [];

	// Aggregate total demand per skill across connected sectors
	const totals = new Map();
	for (const m of mappings) {
		totals.set(
			m.skill_id,
			(totals.get(m.skill_id) ?? 0) + Number(m.skill_demand),
		);
	}

	const skillIds = [...totals.keys()];
	const { data: skills, error: skillsErr } = await supabase
		.from("skills")
		.select("skill_id, skill_name")
		.in("skill_id", skillIds);
	if (skillsErr) throw skillsErr;

	const nameMap = new Map(
		(skills ?? []).map((s) => [s.skill_id, s.skill_name]),
	);

	return [...totals.entries()]
		.map(([skill_id, demand]) => ({
			skill: nameMap.get(skill_id) ?? skill_id,
			demand,
		}))
		.sort((a, b) => b.demand - a.demand)
		.slice(0, 10);
}

async function fetchAiImpactDistribution(jobIds) {
	if (!jobIds.length) {
		return [
			{ name: "Low Risk", value: 0, fill: "#10b981" },
			{ name: "Moderate", value: 0, fill: "#f59e0b" },
			{ name: "High Risk", value: 0, fill: "#ef4444" },
		];
	}

	const { data: mappings, error } = await supabase
		.from("job_skill_mapping")
		.select("skill_id")
		.in("job_id", jobIds);
	if (error) throw error;

	const occurrences = (mappings ?? []).map((m) => m.skill_id);
	if (!occurrences.length) {
		return [
			{ name: "Low Risk", value: 0, fill: "#10b981" },
			{ name: "Moderate", value: 0, fill: "#f59e0b" },
			{ name: "High Risk", value: 0, fill: "#ef4444" },
		];
	}

	const uniqueSkillIds = [...new Set(occurrences)];
	const { data: risks, error: riskErr } = await supabase
		.from("skill_risk")
		.select("skill_id, ai_impact")
		.in("skill_id", uniqueSkillIds);
	if (riskErr) throw riskErr;

	const riskMap = new Map(
		(risks ?? []).map((r) => [r.skill_id, Number(r.ai_impact)]),
	);

	let low = 0,
		mid = 0,
		high = 0;
	for (const sid of occurrences) {
		const v = riskMap.get(sid);
		if (typeof v !== "number" || Number.isNaN(v)) continue;
		if (v <= 33) low++;
		else if (v <= 66) mid++;
		else high++;
	}
	const total = low + mid + high || 1;
	const pct = (n) => Math.round((n / total) * 100);

	return [
		{ name: "Low Risk", value: pct(low), fill: "#10b981" },
		{ name: "Moderate", value: pct(mid), fill: "#f59e0b" },
		{ name: "High Risk", value: pct(high), fill: "#ef4444" },
	];
}

// ───────────────────────────────────────────────────────────
// Main component
// ───────────────────────────────────────────────────────────
export default function EnterpriseDashboard() {
	const [loading, setLoading] = useState(true);
	const [metrics, setMetrics] = useState({
		avgSalary: null,
		peakSalary: null,
		salaryTrend: null,
		avgAiImpact: null,
	});
	const [demandedSkills, setDemandedSkills] = useState([]);
	const [aiImpact, setAiImpact] = useState([]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					if (!cancelled) setLoading(false);
					return;
				}

				const jobIds = await fetchEnterpriseJobIds(user.id);
				const [m, skills, dist] = await Promise.all([
					fetchDashboardMetrics(jobIds),
					fetchTopDemandedSkills(jobIds),
					fetchAiImpactDistribution(jobIds),
				]);

				if (cancelled) return;
				setMetrics(m);
				setDemandedSkills(skills);
				setAiImpact(dist);
			} catch (e) {
				console.error("[EnterpriseDashboard] data error:", e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const kpis = useMemo(
		() => [
			{
				label: "Avg. Salary (2025)",
				value: formatCurrency(metrics.avgSalary),
				icon: DollarSign,
			},
			{
				label: "Peak Salary",
				value: formatCurrency(metrics.peakSalary),
				icon: Crown,
			},
			{
				label: "Salary Trend",
				value: formatPercentChange(metrics.salaryTrend),
				icon:
					(metrics.salaryTrend ?? 0) >= 0 ? TrendingUp : TrendingDown,
				accent:
					(metrics.salaryTrend ?? 0) >= 0
						? "text-emerald-400"
						: "text-red-ribbon-500",
			},
			{
				label: "Avg. AI Impact",
				value: formatAIImpact(metrics.avgAiImpact),
				icon: Brain,
			},
		],
		[metrics],
	);

	return (
		<div
			className="min-h-screen w-full overflow-hidden
        bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))]
        bg-no-repeat"
		>
			<main className="ml-24 mr-6 py-6 h-screen flex flex-col">
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex-1 min-h-0 grid grid-rows-[auto_1fr] gap-6"
				>
					{/* KPI ROW */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						{kpis.map((kpi, i) => {
							const Icon = kpi.icon;
							return (
								<motion.div
									key={kpi.label}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.35,
										delay: i * 0.05,
									}}
								>
									<Card className="p-6 h-full">
										<div className="flex items-start justify-between">
											<div>
												<p className="font-ubuntu text-xs uppercase tracking-[0.2em] text-shark-400">
													{kpi.label}
												</p>
												<p
													className={`mt-3 font-ubuntu text-3xl text-shark-50 ${
														kpi.accent ?? ""
													}`}
												>
													{loading ? "…" : kpi.value}
												</p>
											</div>
											<div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-ribbon-500/15 text-red-ribbon-500 border border-red-ribbon-500/30">
												<Icon size={20} />
											</div>
										</div>
									</Card>
								</motion.div>
							);
						})}
					</div>

					{/* CHARTS ROW */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
						{/* Most Demanded Skills */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
							className="lg:col-span-2 min-h-0"
						>
							<Card className="p-6 h-full flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h2 className="font-ubuntu font-bold text-lg text-shark-100">
											Most Demanded Skills
										</h2>
										<p className="font-ubuntu text-xs text-shark-400 mt-0.5">
											Top 10 across your connected job
											sectors
										</p>
									</div>
									<Zap
										size={16}
										className="text-red-ribbon-500"
									/>
								</div>

								<div className="flex-1 min-h-0">
									{demandedSkills.length === 0 && !loading ? (
										<div className="h-full flex items-center justify-center text-shark-400 font-ubuntu text-sm">
											No demanded skills yet for your
											hiring fields.
										</div>
									) : (
										<ResponsiveContainer
											width="100%"
											height="100%"
										>
											<BarChart
												data={demandedSkills}
												layout="vertical"
												margin={{
													top: 4,
													right: 24,
													left: 8,
													bottom: 4,
												}}
											>
												<CartesianGrid
													stroke="rgba(255,255,255,0.06)"
													horizontal={false}
												/>
												<XAxis
													type="number"
													stroke="rgba(255,255,255,0.4)"
													tick={{
														fill: "rgba(255,255,255,0.55)",
														fontSize: 11,
													}}
													domain={[0, "dataMax + 10"]}
												/>
												<YAxis
													type="category"
													dataKey="skill"
													width={140}
													stroke="rgba(255,255,255,0.4)"
													tick={{
														fill: "rgba(255,255,255,0.7)",
														fontSize: 12,
													}}
												/>
												<Tooltip
													cursor={{
														fill: "rgba(229,29,41,0.08)",
													}}
													content={<BarTooltip />}
												/>
												<Bar
													dataKey="demand"
													fill="var(--color-red-ribbon-500)"
													radius={0}
													barSize={18}
												/>
											</BarChart>
										</ResponsiveContainer>
									)}
								</div>
							</Card>
						</motion.div>

						{/* AI Impact Distribution */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.15 }}
							className="min-h-0"
						>
							<Card className="p-6 h-full flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h2 className="font-ubuntu text-lg text-shark-100">
											AI Impact Distribution
										</h2>
										<p className="font-ubuntu text-xs text-shark-400 mt-0.5">
											Across demanded skills in your
											sectors
										</p>
									</div>
									<Brain
										size={16}
										className="text-red-ribbon-500"
									/>
								</div>

								<div className="flex-1 min-h-0">
									<ResponsiveContainer
										width="100%"
										height="100%"
									>
										<RadialBarChart
											innerRadius="35%"
											outerRadius="100%"
											data={aiImpact}
											startAngle={90}
											endAngle={-270}
										>
											<PolarAngleAxis
												type="number"
												domain={[0, 100]}
												tick={false}
											/>
											<RadialBar
												background={{
													fill: "rgba(255,255,255,0.05)",
												}}
												dataKey="value"
												cornerRadius={15}
											>
												{aiImpact.map((entry) => (
													<Cell
														key={entry.name}
														fill={entry.fill}
													/>
												))}
											</RadialBar>
											<Tooltip
												content={<RadialTooltip />}
											/>
										</RadialBarChart>
									</ResponsiveContainer>
								</div>

								<div className="mt-3 flex items-center justify-between gap-2">
									{aiImpact.map((seg) => (
										<div
											key={seg.name}
											className="flex items-center gap-2 font-ubuntu text-xs text-shark-300"
										>
											<span
												className="w-2.5 h-2.5 rounded-full"
												style={{
													backgroundColor: seg.fill,
													boxShadow: `0 0 8px ${seg.fill}`,
												}}
											/>
											{seg.name}
											<span className="text-shark-500">
												{seg.value}%
											</span>
										</div>
									))}
								</div>
							</Card>
						</motion.div>
					</div>
				</motion.div>
			</main>

			<div className="fixed top-0 left-0">
				<EnterpriseSidebar />
			</div>
		</div>
	);
}
