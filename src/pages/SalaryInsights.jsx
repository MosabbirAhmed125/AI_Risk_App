import { useNavigate } from "react-router-dom";
import "../index.css";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EnterpriseSidebar from "../components/EnterpriseSidebar";
import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, TrendingUp } from "lucide-react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

const SALARY_DATA = {
	"AI/ML Engineer": [
		{ year: "2015", salary: 98000 },
		{ year: "2016", salary: 105400 },
		{ year: "2017", salary: 112800 },
		{ year: "2018", salary: 121500 },
		{ year: "2019", salary: 118200 },
		{ year: "2020", salary: 130700 },
		{ year: "2021", salary: 148300 },
		{ year: "2022", salary: 162500 },
		{ year: "2023", salary: 155900 },
		{ year: "2024", salary: 174200 },
	],
	"Database Administrator": [
		{ year: "2015", salary: 72000 },
		{ year: "2016", salary: 74500 },
		{ year: "2017", salary: 71300 },
		{ year: "2018", salary: 78900 },
		{ year: "2019", salary: 81200 },
		{ year: "2020", salary: 79600 },
		{ year: "2021", salary: 85400 },
		{ year: "2022", salary: 89100 },
		{ year: "2023", salary: 93700 },
		{ year: "2024", salary: 97300 },
	],
	"Blockchain Developer": [
		{ year: "2015", salary: 68000 },
		{ year: "2016", salary: 79500 },
		{ year: "2017", salary: 110200 },
		{ year: "2018", salary: 135800 },
		{ year: "2019", salary: 118600 },
		{ year: "2020", salary: 124300 },
		{ year: "2021", salary: 158900 },
		{ year: "2022", salary: 143200 },
		{ year: "2023", salary: 136700 },
		{ year: "2024", salary: 151400 },
	],
	Accountant: [
		{ year: "2015", salary: 52000 },
		{ year: "2016", salary: 53800 },
		{ year: "2017", salary: 55200 },
		{ year: "2018", salary: 57900 },
		{ year: "2019", salary: 56400 },
		{ year: "2020", salary: 58100 },
		{ year: "2021", salary: 61300 },
		{ year: "2022", salary: 65800 },
		{ year: "2023", salary: 63200 },
		{ year: "2024", salary: 67500 },
	],
	"Assembly Line Worker": [
		{ year: "2015", salary: 31200 },
		{ year: "2016", salary: 32400 },
		{ year: "2017", salary: 31800 },
		{ year: "2018", salary: 33500 },
		{ year: "2019", salary: 34200 },
		{ year: "2020", salary: 32900 },
		{ year: "2021", salary: 35600 },
		{ year: "2022", salary: 37800 },
		{ year: "2023", salary: 36400 },
		{ year: "2024", salary: 39100 },
	],
};

const JOB_SECTORS = Object.keys(SALARY_DATA);

function CustomTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return (
		<div
			style={{
				background: "var(--color-shark-800)",
				border: "1px solid rgba(214,44,57,0.3)",
				borderRadius: "10px",
				padding: "10px 16px",
				fontFamily: "Ubuntu, sans-serif",
			}}
		>
			<p
				style={{
					color: "var(--color-shark-400)",
					fontSize: "12px",
					marginBottom: 4,
				}}
			>
				{label}
			</p>
			<p
				style={{
					color: "var(--color-red-ribbon-600)",
					fontSize: "15px",
					fontWeight: 700,
				}}
			>
				${payload[0].value.toLocaleString()}
			</p>
		</div>
	);
}

function SectorDropdown({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const ref = useRef(null);

	const filtered = useMemo(
		() =>
			JOB_SECTORS.filter((s) =>
				s.toLowerCase().includes(search.toLowerCase()),
			),
		[search],
	);

	useEffect(() => {
		const handler = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((p) => !p)}
				className="w-full flex items-center justify-between px-4 py-3 bg-shark-800 rounded-xl text-sm font-ubuntu font-medium transition-all border border-red-ribbon-600/20 hover:border-red-ribbon-600/50 text-white"
			>
				<span className={value ? "text-white" : "text-shark-400"}>
					{value || "Select job sector"}
				</span>
				<ChevronDown
					size={16}
					className="text-red-ribbon-500 transition-transform duration-200"
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
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
						className="absolute z-50 w-full mt-1 bg-shark-900 rounded-xl overflow-hidden shadow-2xl"
						style={{ border: "1px solid rgba(214,44,57,0.15)" }}
					>
						<div className="p-2 border-b border-red-ribbon-600/10">
							<div className="relative">
								<Search
									size={14}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-shark-400"
								/>
								<input
									autoFocus
									type="text"
									placeholder="Search job title..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full rounded-lg bg-shark-800 pl-9 pr-3 py-2 text-sm font-ubuntu text-white placeholder:text-shark-500 outline-none border border-red-ribbon-600/10 focus:border-red-ribbon-600/40"
								/>
							</div>
						</div>

						<div className="py-1 max-h-56 overflow-y-auto scrollbar-hide">
							{filtered.length > 0 ? (
								filtered.map((sector) => (
									<button
										key={sector}
										type="button"
										onClick={() => {
											onChange(sector);
											setOpen(false);
											setSearch("");
										}}
										className={`w-full flex items-center justify-between px-4 py-3 text-sm font-ubuntu font-medium text-left transition-colors ${
											value === sector
												? "text-red-ribbon-600 bg-red-ribbon-600/8"
												: "text-shark-200 hover:bg-red-ribbon-600/6"
										}`}
									>
										<span>{sector}</span>
										{value === sector && (
											<Check
												size={14}
												strokeWidth={2.5}
												className="text-red-ribbon-600"
											/>
										)}
									</button>
								))
							) : (
								<div className="px-4 py-3 text-sm font-ubuntu text-shark-500">
									No sectors found.
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function SalaryInsights() {
	const navigate = useNavigate();
	const [sector, setSector] = useState("");
	const data = SALARY_DATA[sector] ?? [];

	const latestSalary = data.length ? data[data.length - 1].salary : 0;
	const firstSalary = data.length ? data[0].salary : 0;
	const maxSalary = data.length ? Math.max(...data.map((d) => d.salary)) : 0;
	const minSalary = data.length ? Math.min(...data.map((d) => d.salary)) : 0;
	const salary_trend =
		data.length && firstSalary
			? (((latestSalary - firstSalary) / firstSalary) * 100).toFixed(1)
			: 0;
	const yDomain = data.length
		? [Math.floor(minSalary * 0.9), Math.ceil(maxSalary * 1.05)]
		: [0, 100];

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
			className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))] bg-no-repeat"
		>
			<div className="w-full min-h-screen flex items-center justify-center px-8 py-6">
				<div className="max-w-6xl w-full h-[calc(100vh-48px)] mx-auto bg-shark-900 rounded-3xl border border-white/7 shadow-2xl overflow-hidden flex flex-col">
					<div className="px-8 pt-7 pb-5 border-b border-white/5 shrink-0">
						<div className="flex items-center gap-3 mb-1">
							<TrendingUp
								size={18}
								className="text-red-ribbon-600 shrink-0"
							/>
							<h2 className="text-lg font-bold font-ubuntu text-shark-100">
								Salary Insights
							</h2>
						</div>
						<p className="text-sm font-ubuntu text-shark-500">
							10 Year Salary Trend (2015 - 2024) by Job Sector
						</p>
					</div>

					<div className="px-10 py-6 flex-1 flex flex-col gap-6 min-h-0">
						<div className="shrink-0">
							<label className="block text-sm font-bold font-ubuntu tracking-wide text-shark-100 mb-3">
								Job Sector
							</label>
							<SectorDropdown
								value={sector}
								onChange={setSector}
							/>
						</div>

						<div className="grid grid-cols-3 gap-3 shrink-0">
							{[
								{
									label: "Latest (2024)",
									value: `$${latestSalary.toLocaleString()}`,
									accent: false,
								},
								{
									label: "Salary Trend",
									value: `+${salary_trend}%`,
									accent: true,
								},
								{
									label: "Peak",
									value: `$${maxSalary.toLocaleString()}`,
									accent: false,
								},
							].map((stat) => (
								<div
									key={stat.label}
									className={`rounded-2xl px-4 py-3 border ${
										stat.accent
											? "bg-red-ribbon-600/10 border-red-ribbon-600/25"
											: "bg-shark-800 border-white/6"
									}`}
								>
									<p className="text-xs font-ubuntu uppercase tracking-widest text-shark-500 mb-1">
										{stat.label}
									</p>
									<p
										className={`text-base font-bold font-ubuntu ${
											stat.accent
												? "text-red-ribbon-600"
												: "text-shark-200"
										}`}
									>
										{stat.value}
									</p>
								</div>
							))}
						</div>

						<div className="bg-shark-950 rounded-2xl border border-white/5 pt-6 pr-4 pb-6 pl-2 flex-1 min-h-0">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={data}
									margin={{
										top: 20,
										right: 28,
										left: 20,
										bottom: 50,
									}}
								>
									<defs>
										<linearGradient
											id="salaryGradient"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="var(--color-red-ribbon-600)"
												stopOpacity={0.3}
											/>
											<stop
												offset="95%"
												stopColor="var(--color-red-ribbon-600)"
												stopOpacity={0.02}
											/>
										</linearGradient>
									</defs>

									<CartesianGrid
										strokeDasharray="3 3"
										stroke="rgba(230,230,230,0.07)"
										vertical={false}
									/>

									<XAxis
										dataKey="year"
										tick={{
											fill: "var(--color-shark-400)",
											fontSize: 12,
											fontFamily: "Ubuntu, sans-serif",
										}}
										axisLine={{
											stroke: "rgba(230,230,230,0.1)",
										}}
										tickLine={false}
										tickMargin={12}
										label={{
											value: "Year",
											position: "insideBottom",
											offset: -10,
											fill: "var(--color-shark-400)",
											fontSize: 12,
											fontFamily: "Ubuntu, sans-serif",
											fontWeight: 700,
										}}
									/>

									<YAxis
										domain={yDomain}
										tickFormatter={(v) =>
											`$${(v / 1000).toFixed(0)}k`
										}
										tick={{
											fill: "var(--color-shark-400)",
											fontSize: 12,
											fontFamily: "Ubuntu, sans-serif",
										}}
										axisLine={false}
										tickLine={false}
										tickMargin={14}
										width={60}
										label={{
											value: "Avg. Salary (USD)",
											angle: -90,
											position: "insideLeft",
											offset: 0,
											fill: "var(--color-shark-400)",
											fontSize: 12,
											fontFamily: "Ubuntu, sans-serif",
											fontWeight: 700,
											dx: -10,
										}}
									/>

									<Tooltip content={<CustomTooltip />} />

									<Legend
										wrapperStyle={{
											fontFamily: "Ubuntu, sans-serif",
											fontSize: 13,
											fontWeight: 700,
											color: "var(--color-shark-300)",
											paddingTop: 28,
										}}
										formatter={() =>
											`${sector} — Annual Avg. Salary`
										}
									/>

									<Area
										type="monotone"
										dataKey="salary"
										stroke="var(--color-red-ribbon-600)"
										strokeWidth={2.5}
										fill="url(#salaryGradient)"
										dot={{
											r: 3.5,
											fill: "var(--color-red-ribbon-600)",
											strokeWidth: 0,
										}}
										activeDot={{
											r: 6,
											fill: "var(--color-red-ribbon-600)",
											stroke: "var(--color-shark-900)",
											strokeWidth: 2,
										}}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>

			<div className="fixed top-0 left-0 h-screen">
				<EnterpriseSidebar />
			</div>
		</motion.div>
	);
}

export default SalaryInsights;
