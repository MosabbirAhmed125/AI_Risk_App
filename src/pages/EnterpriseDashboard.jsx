import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Building2,
	Users,
	DollarSign,
	Brain,
	TrendingUp,
	TrendingDown,
	Sparkles,
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
} from "recharts";

import "../index.css";
import EnterpriseSidebar from "../components/EnterpriseSidebar";

// ───────────────────────────────────────────────────────────
// Dummy data (replace with Supabase queries later)
// ───────────────────────────────────────────────────────────
const kpis = [
	{
		label: "Open Roles",
		value: "42",
		delta: "+8.2%",
		trend: "up",
		icon: Building2,
	},
	{
		label: "Active Candidates",
		value: "1,284",
		delta: "+12.4%",
		trend: "up",
		icon: Users,
	},
	{
		label: "Avg. Offer (USD)",
		value: "$92,450",
		delta: "+2.5%",
		trend: "up",
		icon: DollarSign,
	},
	{
		label: "AI Disruption Index",
		value: "37 / 100",
		delta: "-1.8%",
		trend: "down",
		icon: Brain,
	},
];

const demandedSkills = [
	{ skill: "Machine Learning", demand: 92 },
	{ skill: "React / Next.js", demand: 84 },
	{ skill: "Data Engineering", demand: 78 },
	{ skill: "Cloud (AWS/GCP)", demand: 73 },
	{ skill: "LLM Ops", demand: 69 },
	{ skill: "Product Design", demand: 58 },
	{ skill: "DevOps / SRE", demand: 54 },
];

const aiImpact = [
	{ name: "Low Risk", value: 28, fill: "#10b981" },
	{ name: "Moderate", value: 46, fill: "#f59e0b" },
	{ name: "High Risk", value: 72, fill: "#ef4444" },
];

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

function KpiCard({ label, value, delta, trend, icon: Icon, index }) {
	const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
	const trendColor =
		trend === "up" ? "text-emerald-400" : "text-red-ribbon-400";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.08 }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
		>
			<Card className="p-5 hover:border-red-ribbon-500/50 transition-colors">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-ubuntu uppercase tracking-widest text-shark-400">
							{label}
						</p>
						<p className="mt-2 text-3xl font-bold text-shark-100 font-ubuntu">
							{value}
						</p>
						<div
							className={`mt-2 flex items-center gap-1 text-sm ${trendColor}`}
						>
							<TrendIcon className="h-4 w-4" />
							<span className="font-medium">{delta}</span>
							<span className="text-shark-500 ml-1">
								vs last month
							</span>
						</div>
					</div>
					<div className="rounded-xl bg-red-ribbon-500/10 p-3 ring-1 ring-red-ribbon-500/30">
						<Icon className="h-5 w-5 text-red-ribbon-400" />
					</div>
				</div>
			</Card>
		</motion.div>
	);
}

// ───────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────
function EnterpriseDashboard() {
	const navigate = useNavigate();

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
			className="min-h-screen flex
      bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))]
      bg-no-repeat"
		>
			{/* Sidebar */}
			<div className="shrink-0">
				<EnterpriseSidebar />
			</div>

			{/* Main content */}
			<main className="flex-1 px-6 py-8 lg:px-10 lg:py-10 overflow-y-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between"
				>
					<div>
						<h1 className="mt-1 text-4xl lg:text-5xl font-borel text-shark-100">
							Dashboard
						</h1>
						<p className="mt-2 text-shark-400 font-ubuntu">
							Real-time hiring, salary, and AI-impact signals
							across your sectors.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button className="rounded-xl border border-shark-700 bg-shark-900/60 px-4 py-2 text-sm font-ubuntu text-shark-200 hover:border-red-ribbon-500/60 transition">
							Export Report
						</button>
						<button className="rounded-xl bg-red-ribbon-500 px-4 py-2 text-sm font-ubuntu font-semibold text-white hover:bg-red-ribbon-600 transition shadow-lg shadow-red-ribbon-500/30">
							+ New Posting
						</button>
					</div>
				</motion.div>

				{/* KPI grid */}
				<section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
					{kpis.map((kpi, i) => (
						<KpiCard key={kpi.label} index={i} {...kpi} />
					))}
				</section>

				{/* Charts row */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Demanded skills — 2/3 width */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="lg:col-span-2"
					>
						<Card className="p-6">
							<div className="mb-6 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-bold font-ubuntu text-shark-100">
										Most Demanded Skills
									</h2>
									<p className="text-sm text-shark-400 mt-1">
										Technology sector · last 30 days
									</p>
								</div>
								<select className="rounded-lg bg-shark-950/80 border border-shark-700 text-shark-200 text-sm px-3 py-2 font-ubuntu focus:outline-none focus:border-red-ribbon-500">
									<option>Technology</option>
									<option>Finance</option>
									<option>Healthcare</option>
								</select>
							</div>

							<ResponsiveContainer width="100%" height={340}>
								<BarChart
									data={demandedSkills}
									layout="vertical"
									margin={{
										left: 20,
										right: 20,
										top: 5,
										bottom: 5,
									}}
								>
									<defs>
										<linearGradient
											id="barGrad"
											x1="0"
											y1="0"
											x2="1"
											y2="0"
										>
											<stop
												offset="0%"
												stopColor="#ef4444"
												stopOpacity={0.9}
											/>
											<stop
												offset="100%"
												stopColor="#b91c1c"
												stopOpacity={0.9}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke="#ffffff10"
										horizontal={false}
									/>
									<XAxis
										type="number"
										domain={[0, 100]}
										stroke="#9ca3af"
										fontSize={12}
									/>
									<YAxis
										type="category"
										dataKey="skill"
										stroke="#d1d5db"
										fontSize={12}
										width={130}
									/>
									<Tooltip
										cursor={{ fill: "#ffffff08" }}
										contentStyle={{
											background: "#0b0b0d",
											border: "1px solid #ef4444",
											borderRadius: "12px",
											color: "#f3f4f6",
										}}
										formatter={(v) => [
											`${v}% demand`,
											"Demand",
										]}
									/>
									<Bar
										dataKey="demand"
										fill="url(#barGrad)"
										radius={[0, 8, 8, 0]}
										barSize={22}
									/>
								</BarChart>
							</ResponsiveContainer>
						</Card>
					</motion.div>

					{/* AI Impact radial — 1/3 width */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<Card className="p-6 h-full">
							<div className="mb-2">
								<h2 className="text-xl font-bold font-ubuntu text-shark-100">
									AI Impact Distribution
								</h2>
								<p className="text-sm text-shark-400 mt-1">
									Risk across active sectors
								</p>
							</div>

							<ResponsiveContainer width="100%" height={260}>
								<RadialBarChart
									innerRadius="40%"
									outerRadius="100%"
									data={aiImpact}
									startAngle={90}
									endAngle={-270}
								>
									<PolarAngleAxis
										type="number"
										domain={[0, 100]}
										angleAxisId={0}
										tick={false}
									/>
									<RadialBar
										background={{ fill: "#ffffff08" }}
										dataKey="value"
										cornerRadius={10}
									/>
									<Tooltip
										contentStyle={{
											background: "#0b0b0d",
											border: "1px solid #ef4444",
											borderRadius: "12px",
											color: "#f3f4f6",
										}}
									/>
								</RadialBarChart>
							</ResponsiveContainer>

							{/* Legend */}
							<div className="mt-4 space-y-2">
								{aiImpact.map((seg) => (
									<div
										key={seg.name}
										className="flex items-center justify-between text-sm font-ubuntu"
									>
										<div className="flex items-center gap-2">
											<span
												className="h-3 w-3 rounded-full"
												style={{ background: seg.fill }}
											/>
											<span className="text-shark-300">
												{seg.name}
											</span>
										</div>
										<span className="font-semibold text-shark-100">
											{seg.value}%
										</span>
									</div>
								))}
							</div>
						</Card>
					</motion.div>
				</section>

				{/* Footer hint */}
				<p className="mt-8 text-center text-xs text-shark-500 font-ubuntu">
					Data shown is illustrative. Wire up Supabase queries to{" "}
					<code>jobs</code>, <code>job_skill_mapping</code>, and{" "}
					<code>job_risk</code> to go live.
				</p>
			</main>
		</motion.div>
	);
}

export default EnterpriseDashboard;
