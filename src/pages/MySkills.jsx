import "../index.css";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, ChevronDown } from "lucide-react";
import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

function MySkills() {
	const [skills, setSkills] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sortOrder, setSortOrder] = useState("asc");

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

	const sortedSkills = useMemo(() => {
		const copiedSkills = [...skills];

		copiedSkills.sort((a, b) => {
			if (sortOrder === "asc") {
				return a.impact - b.impact;
			}
			return b.impact - a.impact;
		});

		return copiedSkills;
	}, [skills, sortOrder]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				header: "Skill Name",
				filterFn: "includesString",
			},
			{
				accessorKey: "impact",
				header: "AI Impact",
			},
		],
		[],
	);

	const table = useReactTable({
		data: sortedSkills,
		columns,
		state: {
			columnFilters,
			globalFilter,
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const query = String(filterValue ?? "")
				.toLowerCase()
				.trim();
			return row.original.name.toLowerCase().includes(query);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const getImpactColor = (value) => {
		if (value <= 33) return "bg-narvik-600";
		if (value <= 66) return "bg-tree-poppy-500";
		return "bg-coral-red-600";
	};

	const exportToPDF = () => {
		const doc = new jsPDF("p", "mm", "a4");

		doc.setFont("Ubuntu", "bold");
		doc.setFontSize(22);
		doc.text("My Skills Report", 105, 20, { align: "center" });

		const tableColumn = ["Skill Name", "AI Impact (%)"];

		const tableRows = table
			.getRowModel()
			.rows.map((row) => [row.original.name, `${row.original.impact}%`]);

		autoTable(doc, {
			startY: 30,
			head: [tableColumn],
			body: tableRows,
			theme: "grid",
			styles: {
				font: "Ubuntu",
				fontStyle: "normal",
				fontSize: 14,
				halign: "center",
				valign: "middle",
				textColor: [17, 24, 39],
				lineColor: [17, 24, 39],
				lineWidth: 0.3,
			},
			headStyles: {
				font: "Ubuntu",
				fontStyle: "bold",
				fontSize: 16,
				fillColor: [67, 180, 172],
				textColor: 255,
				halign: "center",
				valign: "middle",
			},
			bodyStyles: {
				font: "Ubuntu",
				fontStyle: "normal",
				halign: "center",
				valign: "middle",
			},
			columnStyles: {
				0: {
					cellWidth: 110,
					overflow: "linebreak",
					halign: "center",
					valign: "middle",
				},
				1: {
					cellWidth: 60,
					overflow: "linebreak",
					halign: "center",
					valign: "middle",
				},
			},
		});

		doc.save("my_skills_report.pdf");
	};

	const handleExportPDF = () => {
		toast.promise(
			new Promise((resolve, reject) => {
				try {
					setTimeout(() => {
						exportToPDF();
						resolve();
					}, 1000);
				} catch (error) {
					reject(error);
				}
			}),
			{
				loading: "Generating PDF...",
				success: "PDF Downloaded Successfully!",
				error: "Failed to Download PDF.",
			},
		);
	};

	const rows = table.getRowModel().rows;
	const sortOptions = [
		{ label: "Ascending", value: "asc" },
		{ label: "Descending", value: "desc" },
	];

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
			className="h-screen flex flex-col items-center justify-center
            bg-[radial-gradient(ellipse_at_top,var(--color-aqua-island-800),var(--color-shark-800),var(--color-shark-950))]
            bg-no-repeat"
		>
			<div className="absolute left-0">
				<JobSeekerSidebar />
			</div>

			<div className="w-180 max-w-full mx-auto pb-6 flex flex-col gap-6">
				<div className="flex flex-col justify-center items-center h-fit mb-3">
					<p className="text-4xl font-sequel tracking-widest text-shark-200">
						SKILL RISK ANALYSIS
					</p>
				</div>

				<div className="w-full flex gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aqua-island-400" />

						<motion.input
							layout
							type="text"
							placeholder="Search by skill name..."
							value={table.getState().globalFilter ?? ""}
							onChange={(e) =>
								table.setGlobalFilter(e.target.value)
							}
							className="w-full pl-11 pr-4 py-3 border-2 border-aqua-island-500/40 text-shark-100 rounded-xl bg-shark-950 font-ubuntu font-bold focus:outline-none placeholder:text-shark-500"
							whileFocus={{
								scale: 1.01,
								boxShadow: "0 0 0 2px rgba(67,180,172,0.35)",
							}}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 25,
							}}
						/>
					</div>

					<div className="relative w-60">
						<Listbox value={sortOrder} onChange={setSortOrder}>
							{({ open }) => (
								<div className="relative">
									<ListboxButton as={Fragment}>
										<motion.button
											layout
											className={`w-full px-4 py-3 border-2 rounded-xl text-shark-100 text-left flex items-center justify-between bg-shark-950 font-ubuntu font-bold focus:outline-none ${
												open || sortOrder
													? "border-aqua-island-500"
													: "border-aqua-island-500/40"
											}`}
											whileFocus={{
												boxShadow:
													"0 0 0 2px rgba(67,180,172,0.35)",
											}}
										>
											<span>
												{sortOrder === "asc"
													? "Ascending"
													: "Descending"}
											</span>

											<motion.div
												animate={{
													rotate: open ? 180 : 0,
												}}
												transition={{ duration: 0.2 }}
											>
												<ChevronDown className="w-4 h-4 text-aqua-island-400" />
											</motion.div>
										</motion.button>
									</ListboxButton>

									<AnimatePresence>
										{open && (
											<ListboxOptions
												as={motion.ul}
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												className="absolute mt-2 w-full z-50 bg-shark-900 border border-aqua-island-500/40 rounded-xl shadow-xl overflow-hidden"
											>
												{sortOptions.map((option) => (
													<ListboxOption
														key={option.value}
														value={option.value}
														as={Fragment}
													>
														{({
															active,
															selected,
														}) => (
															<motion.li
																whileHover={{
																	scale: 1.02,
																}}
																className={`cursor-pointer px-4 py-3 font-ubuntu font-bold transition-colors ${
																	selected
																		? "bg-aqua-island-500/30 text-aqua-island-300"
																		: active
																			? "bg-aqua-island-500/20 text-aqua-island-300"
																			: "text-shark-200"
																}`}
															>
																{option.label}
															</motion.li>
														)}
													</ListboxOption>
												))}
											</ListboxOptions>
										)}
									</AnimatePresence>
								</div>
							)}
						</Listbox>
					</div>
				</div>

				<motion.div
					layout
					className="bg-transparent rounded-2xl border-2 border-aqua-island-500/50 overflow-hidden drop-shadow-aqua-island-500/30 drop-shadow-2xl"
				>
					<motion.div
						layout
						className="max-h-87 w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
					>
						<table className="min-w-full text-sm text-shark-100 border-collapse table-fixed font-ubuntu font-bold">
							<thead className="bg-shark-900 sticky top-0 z-10">
								<tr className="border-b border-shark-700">
									<th className="relative px-6 py-4 text-left font-semibold text-aqua-island-400">
										Skill Name
										<span className="absolute right-0 top-3 bottom-3 w-0.5 bg-shark-600" />
									</th>

									<th className="relative px-6 py-4 text-left font-semibold text-aqua-island-400">
										AI Impact
									</th>
								</tr>
							</thead>

							<motion.tbody layout>
								<AnimatePresence mode="popLayout">
									{loading ? (
										<motion.tr
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<td
												colSpan={2}
												className="px-6 py-8 text-center text-shark-500 font-bold font-ubuntu"
											>
												Loading your skills...
											</td>
										</motion.tr>
									) : rows.length > 0 ? (
										rows.map((row) => (
											<motion.tr
												layout
												key={row.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{ duration: 0.3 }}
												whileHover={{
													scale: 1.01,
													transition: {
														duration: 0.2,
													},
												}}
												className="border-b bg-shark-950 border-shark-900 hover:bg-shark-800/70"
											>
												<td className="relative px-6 py-3 wrap-break-word align-top text-shark-200">
													{row.original.name}
													<span className="absolute right-0 top-2 bottom-2 w-0.5 bg-shark-700/70" />
												</td>

												<td className="relative px-6 py-3 wrap-break-word align-top text-shark-200">
													<span
														className={`inline-flex rounded-md px-3 py-1 text-xs font-ubuntu font-bold text-shark-200 ${getImpactColor(
															row.original.impact,
														)}`}
													>
														{row.original.impact}%
													</span>
												</td>
											</motion.tr>
										))
									) : (
										<motion.tr
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<td
												colSpan={2}
												className="px-6 py-8 text-center text-shark-500 font-bold font-ubuntu"
											>
												No matching skills found.
											</td>
										</motion.tr>
									)}
								</AnimatePresence>
							</motion.tbody>
						</table>
					</motion.div>
				</motion.div>

				<br />
				<motion.button
					type="button"
					onClick={handleExportPDF}
					className="w-fit mx-auto rounded-lg bg-aqua-island-500 tracking-wider px-4 pt-3 pb-2 text-2xl font-galhaudisplay-bold text-shark-200 transition ease-in-out duration-300 hover:scale-103 hover:shadow-lg hover:shadow-aqua-island-500/70"
				>
					Export as PDF
				</motion.button>
			</div>
		</motion.div>
	);
}

export default MySkills;
