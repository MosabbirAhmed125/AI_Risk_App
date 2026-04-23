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
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import { supabase } from "../lib/supabaseClient";

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
				AI Impact:{" "}
				<span className="text-aqua-island-500 font-semibold">
					{Math.round(payload[0].value)}%
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
				of your skills
			</p>
		</div>
	);
}

// ───────────────────────────────────────────────────────────
// Data fetchers
// ───────────────────────────────────────────────────────────
async function fetchJobSeekerJobId(userId) {
	const { data, error } = await supabase
		.from("job_seekers")
		.select("current_job")
		.eq("user_id", userId)
		.single();
	if (error || !data?.current_job) return null;
	return data.current_job;
}

async function fetchDashboardMetrics(jobId) {
	if (!jobId) {
		return {
			avgSalary: null,
			peakSalary: null,
			salaryTrend: null,
		};
	}

	// Salaries
	const { data: salaries, error: salariesErr } = await supabase
		.from("salary_history")
		.select("year, average_salary")
		.eq("job_id", jobId);
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
	const { data: trend, error: trendErr } = await supabase
		.from("salary_trend")
		.select("salary_change")
		.eq("job_id", jobId)
		.single();
	if (trendErr && trendErr.code !== "PGRST116") throw trendErr;

	const salaryTrend = trend ? Number(trend.salary_change) : null;

	return { avgSalary, peakSalary, salaryTrend };
}

async function fetchUserSkillIds(userId) {
	const { data, error } = await supabase
		.from("skillsets")
		.select("skill_id")
		.eq("user_id", userId);
	if (error) throw error;
	return (data ?? []).map((r) => r.skill_id);
}

async function fetchLowestRiskSkills(skillIds) {
	if (!skillIds.length) return [];

	const { data: risks, error } = await supabase
		.from("skill_risk")
		.select("skill_id, ai_impact")
		.in("skill_id", skillIds);
	if (error) throw error;

	const skillIdSet = new Set(skillIds);
	const filteredRisks = (risks ?? []).filter((r) =>
		skillIdSet.has(r.skill_id),
	);

	if (!filteredRisks.length) return [];

	const skillRiskMap = new Map(
		filteredRisks.map((r) => [r.skill_id, Number(r.ai_impact) || 0]),
	);

	const skillIdsInRisk = filteredRisks.map((r) => r.skill_id);
	const { data: skills, error: skillsErr } = await supabase
		.from("skills")
		.select("skill_id, skill_name")
		.in("skill_id", skillIdsInRisk);
	if (skillsErr) throw skillsErr;

	const nameMap = new Map(
		(skills ?? []).map((s) => [s.skill_id, s.skill_name]),
	);

	return filteredRisks
		.map((r) => ({
			skill: nameMap.get(r.skill_id) ?? r.skill_id,
			impact: Number(r.ai_impact) || 0,
		}))
		.sort((a, b) => a.impact - b.impact)
		.slice(0, 10);
}

async function fetchUserAIImpactAverage(skillIds) {
	if (!skillIds.length) return null;

	const { data: risks, error } = await supabase
		.from("skill_risk")
		.select("ai_impact")
		.in("skill_id", skillIds);
	if (error) throw error;

	const impacts = (risks ?? [])
		.map((r) => Number(r.ai_impact))
		.filter((v) => typeof v === "number" && !Number.isNaN(v));

	return impacts.length
		? impacts.reduce((s, v) => s + v, 0) / impacts.length
		: null;
}

async function fetchSkillAIDistribution(skillIds) {
	if (!skillIds.length) {
		return [
			{ name: "Low Risk", value: 0, fill: "#10b981" },
			{ name: "Moderate", value: 0, fill: "#f59e0b" },
			{ name: "High Risk", value: 0, fill: "#ef4444" },
		];
	}

	const { data: risks, error } = await supabase
		.from("skill_risk")
		.select("ai_impact")
		.in("skill_id", skillIds);
	if (error) throw error;

	const impacts = (risks ?? [])
		.map((r) => Number(r.ai_impact))
		.filter((v) => typeof v === "number" && !Number.isNaN(v));

	if (!impacts.length) {
		return [
			{ name: "Low Risk", value: 0, fill: "#10b981" },
			{ name: "Moderate", value: 0, fill: "#f59e0b" },
			{ name: "High Risk", value: 0, fill: "#ef4444" },
		];
	}

	let low = 0,
		mid = 0,
		high = 0;
	for (const v of impacts) {
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
export default function JobSeekerDashboard() {
	const [loading, setLoading] = useState(true);
	const [metrics, setMetrics] = useState({
		avgSalary: null,
		peakSalary: null,
		salaryTrend: null,
	});
	const [userAIImpact, setUserAIImpact] = useState(null);
	const [lowestRiskSkills, setLowestRiskSkills] = useState([]);
	const [skillDistribution, setSkillDistribution] = useState([]);

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

				const jobId = await fetchJobSeekerJobId(user.id);
				const m = await fetchDashboardMetrics(jobId);

				const skillIds = await fetchUserSkillIds(user.id);
				const [avgAI, skills, dist] = await Promise.all([
					fetchUserAIImpactAverage(skillIds),
					fetchLowestRiskSkills(skillIds),
					fetchSkillAIDistribution(skillIds),
				]);

				if (cancelled) return;
				setMetrics(m);
				setUserAIImpact(avgAI);
				setLowestRiskSkills(skills);
				setSkillDistribution(dist);
			} catch (e) {
				console.error("[JobSeekerDashboard] data error:", e);
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
						: "text-aqua-island-500",
			},
			{
				label: "Your Avg. AI Impact",
				value: formatAIImpact(userAIImpact),
				icon: Brain,
			},
		],
		[metrics, userAIImpact],
	);

	return (
		<div
			className="min-h-screen w-full overflow-hidden
        bg-[radial-gradient(ellipse_at_top,var(--color-aqua-island-800),var(--color-shark-800),var(--color-shark-950))]
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
											<div className="w-11 h-11 rounded-xl flex items-center justify-center bg-aqua-island-500/15 text-aqua-island-500 border border-aqua-island-500/30">
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
						{/* Lowest Risk Skills */}
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
											Lowest AI-Risk Skills
										</h2>
										<p className="font-ubuntu text-xs text-shark-400 mt-0.5">
											Top 10 skills from your profile
										</p>
									</div>
									<Zap
										size={16}
										className="text-aqua-island-500"
									/>
								</div>

								<div className="flex-1 min-h-0">
									{lowestRiskSkills.length === 0 &&
									!loading ? (
										<div className="h-full flex items-center justify-center text-shark-400 font-ubuntu text-sm">
											No skills saved yet. Add skills to
											see your risk profile.
										</div>
									) : (
										<ResponsiveContainer
											width="100%"
											height="100%"
										>
											<BarChart
												data={lowestRiskSkills}
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
													domain={[0, 100]}
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
														fill: "rgba(64,150,154,0.08)",
													}}
													content={<BarTooltip />}
												/>
												<Bar
													dataKey="impact"
													fill="var(--color-aqua-island-500)"
													radius={0}
													barSize={18}
												/>
											</BarChart>
										</ResponsiveContainer>
									)}
								</div>
							</Card>
						</motion.div>

						{/* Skill AI Distribution */}
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
											Skill Risk Distribution
										</h2>
										<p className="font-ubuntu text-xs text-shark-400 mt-0.5">
											Across your skill profile
										</p>
									</div>
									<Brain
										size={16}
										className="text-aqua-island-500"
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
											data={skillDistribution}
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
												{skillDistribution.map(
													(entry) => (
														<Cell
															key={entry.name}
															fill={entry.fill}
														/>
													),
												)}
											</RadialBar>
											<Tooltip
												content={<RadialTooltip />}
											/>
										</RadialBarChart>
									</ResponsiveContainer>
								</div>

								<div className="mt-3 flex items-center justify-between gap-2">
									{skillDistribution.map((seg) => (
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
				<JobSeekerSidebar />
			</div>
		</div>
	);
}
