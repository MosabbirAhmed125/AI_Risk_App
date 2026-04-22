import "../index.css";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EnterpriseSidebar from "../components/EnterpriseSidebar";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table";
import { ChevronDown, Search } from "lucide-react";
import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

async function fetchJobSectors() {
	const { data, error } = await supabase
		.from("jobs")
		.select("job_id, job_title")
		.order("job_title", { ascending: true });

	if (error) {
		console.error("Error fetching job sectors:", error);
		throw error;
	}

	return (data || []).map((job) => ({
		job_id: job.job_id,
		label: job.job_title ?? "",
	}));
}

async function fetchDemandedSkillsByJob(jobId) {
	const { data: mappings, error: mappingError } = await supabase
		.from("job_skill_mapping")
		.select("id, skill_id, skill_demand")
		.eq("job_id", jobId);

	if (mappingError) {
		console.error("Error fetching job skill mappings:", mappingError);
		throw mappingError;
	}

	if (!mappings || mappings.length === 0) {
		return [];
	}

	const skillIds = [
		...new Set(mappings.map((row) => row.skill_id).filter(Boolean)),
	];

	const { data: skillsRows, error: skillsError } = await supabase
		.from("skills")
		.select("skill_id, skill_name")
		.in("skill_id", skillIds);

	if (skillsError) {
		console.error("Error fetching skills:", skillsError);
		throw skillsError;
	}

	const skillsMap = new Map(
		(skillsRows || []).map((row) => [row.skill_id, row.skill_name ?? ""]),
	);

	return mappings
		.map((row) => ({
			id: row.id,
			name: skillsMap.get(row.skill_id) ?? "",
			demand: Number(row.skill_demand ?? 0),
		}))
		.filter((item) => item.name.trim() !== "");
}

function DemandedSkills() {
	const [jobSectors, setJobSectors] = useState([]);
	const [selectedSector, setSelectedSector] = useState(null);
	const [sectorSearch, setSectorSearch] = useState("");
	const [globalFilter, setGlobalFilter] = useState("");
	const [sortOrder, setSortOrder] = useState("desc");
	const [skills, setSkills] = useState([]);
	const [loadingSectors, setLoadingSectors] = useState(true);
	const [loadingSkills, setLoadingSkills] = useState(false);

	useEffect(() => {
		const loadJobSectors = async () => {
			try {
				setLoadingSectors(true);
				const data = await fetchJobSectors();
				setJobSectors(data);
			} catch (error) {
				toast.error("Failed to load job sectors.");
			} finally {
				setLoadingSectors(false);
			}
		};

		loadJobSectors();
	}, []);

	useEffect(() => {
		const loadDemandedSkills = async () => {
			if (!selectedSector?.job_id) {
				setSkills([]);
				return;
			}

			try {
				setLoadingSkills(true);
				const data = await fetchDemandedSkillsByJob(
					selectedSector.job_id,
				);
				setSkills(data);
			} catch (error) {
				toast.error("Failed to load demanded skills.");
				setSkills([]);
			} finally {
				setLoadingSkills(false);
			}
		};

		loadDemandedSkills();
	}, [selectedSector]);

	const sortOptions = [
		{ label: "Ascending", value: "asc" },
		{ label: "Descending", value: "desc" },
	];

	const filteredSectors = useMemo(() => {
		if (!sectorSearch.trim()) return jobSectors;
		return jobSectors.filter((sector) =>
			sector.label.toLowerCase().includes(sectorSearch.toLowerCase()),
		);
	}, [jobSectors, sectorSearch]);

	const tableData = useMemo(() => {
		const copiedSkills = [...skills];

		copiedSkills.sort((a, b) => {
			if (sortOrder === "asc") {
				return a.demand - b.demand;
			}
			return b.demand - a.demand;
		});

		return copiedSkills;
	}, [skills, sortOrder]);

	const chartData = useMemo(() => {
		return tableData.slice(0, 10);
	}, [tableData]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				header: "Skill Name",
				filterFn: "includesString",
			},
			{
				accessorKey: "demand",
				header: "Demand",
			},
		],
		[],
	);

	const table = useReactTable({
		data: tableData,
		columns,
		state: { globalFilter },
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

	const getDemandColor = (value) => {
		if (value <= 33) return "bg-coral-red-600";
		if (value <= 66) return "bg-tree-poppy-500";
		return "bg-narvik-600";
	};

	const exportToPDF = () => {
		if (!selectedSector) {
			toast.error("Please select a job sector first.");
			return;
		}

		const doc = new jsPDF("p", "mm", "a4");

		doc.setFont("Helvetica", "bold");
		doc.setFontSize(22);
		doc.text(`${selectedSector.label} Demanded Skills Report`, 105, 20, {
			align: "center",
		});

		const tableColumn = ["Skill Name", "Demand"];

		const tableRows = table
			.getRowModel()
			.rows.map((row) => [row.original.name, `${row.original.demand}%`]);

		autoTable(doc, {
			startY: 30,
			head: [tableColumn],
			body: tableRows,
			theme: "grid",
			styles: {
				font: "helvetica",
				fontStyle: "normal",
				fontSize: 14,
				halign: "center",
				valign: "middle",
				textColor: [17, 24, 39],
				lineColor: [17, 24, 39],
				lineWidth: 0.3,
			},
			headStyles: {
				font: "helvetica",
				fontStyle: "bold",
				fontSize: 16,
				fillColor: [229, 29, 41],
				textColor: 255,
				halign: "center",
				valign: "middle",
			},
			bodyStyles: {
				font: "helvetica",
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

		doc.save(
			`${selectedSector.label.toLowerCase().replaceAll("/", "-").replaceAll(" ", "_")}_demanded_skills_report.pdf`,
		);
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
            bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))]
            bg-no-repeat"
		>
			<div className="absolute left-0">
				<EnterpriseSidebar />
			</div>

			<div className="w-232 max-w-[calc(100vw-8rem)] mx-auto pb-6 flex flex-col gap-7 scale-110">
				<div className="w-full flex gap-5">
					<div className="relative flex-1">
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
											className={`w-full px-5 py-4 border-2 rounded-xl text-shark-100 text-left flex items-center justify-between bg-shark-950 font-ubuntu font-bold text-lg focus:outline-none ${
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
												{loadingSectors
													? "Loading job sectors..."
													: selectedSector
														? selectedSector.label
														: "Select job sector"}
											</span>
											<motion.div
												animate={{
													rotate: open ? 180 : 0,
												}}
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
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												className="absolute mt-2 w-full z-50 bg-shark-900 border border-red-ribbon-500/40 rounded-xl shadow-xl overflow-hidden"
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
																	e.target
																		.value,
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

												<div className="max-h-60 overflow-y-auto scrollbar-hide">
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
																		sector.job_id
																	}
																	value={
																		sector
																	}
																	as={
																		Fragment
																	}
																>
																	{({
																		active,
																		selected,
																	}) => (
																		<motion.li
																			whileHover={{
																				scale: 1.01,
																			}}
																			className={`cursor-pointer px-5 py-4 font-ubuntu font-bold text-lg transition-colors ${
																				selected
																					? "bg-red-ribbon-500/30 text-red-ribbon-300"
																					: active
																						? "bg-red-ribbon-500/20 text-red-ribbon-300"
																						: "text-shark-200"
																			}`}
																		>
																			{
																				sector.label
																			}
																		</motion.li>
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
					</div>

					<div className="relative w-72">
						<Listbox value={sortOrder} onChange={setSortOrder}>
							{({ open }) => (
								<div className="relative">
									<ListboxButton as={Fragment}>
										<motion.button
											layout
											className={`w-full px-5 py-4 border-2 rounded-xl text-shark-100 text-left flex items-center justify-between bg-shark-950 font-ubuntu font-bold text-lg focus:outline-none ${
												open || sortOrder
													? "border-red-ribbon-500"
													: "border-red-ribbon-500/40"
											}`}
											whileFocus={{
												boxShadow:
													"0 0 0 2px rgba(227,27,35,0.35)",
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
												<ChevronDown className="w-5 h-5 text-red-ribbon-400" />
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
												className="absolute mt-2 w-full z-50 bg-shark-900 border border-red-ribbon-500/40 rounded-xl shadow-xl overflow-hidden"
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
																className={`cursor-pointer px-5 py-4 font-ubuntu font-bold text-lg transition-colors ${
																	selected
																		? "bg-red-ribbon-500/30 text-red-ribbon-300"
																		: active
																			? "bg-red-ribbon-500/20 text-red-ribbon-300"
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
					className="bg-transparent rounded-2xl border-2 border-red-ribbon-500/50 overflow-hidden drop-shadow-red-ribbon-500/30 drop-shadow-2xl"
				>
					<motion.div
						layout
						className="max-h-113 w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
					>
						<table className="min-w-full text-base text-shark-100 border-collapse table-fixed font-ubuntu font-bold">
							<thead className="bg-shark-900 sticky top-0 z-10">
								<tr className="border-b border-shark-700">
									<th className="relative px-7 py-5 text-left font-semibold text-red-ribbon-500">
										Skill Name
										<span className="absolute right-0 top-3 bottom-3 w-0.5 bg-shark-600" />
									</th>
									<th className="relative px-7 py-5 text-left font-semibold text-red-ribbon-500">
										Demand
									</th>
								</tr>
							</thead>

							<motion.tbody layout>
								<AnimatePresence mode="popLayout">
									{!selectedSector ? (
										<motion.tr
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<td
												colSpan={2}
												className="px-7 py-10 text-center text-shark-500 font-bold font-ubuntu text-lg"
											>
												Select a job sector to view
												demanded skills.
											</td>
										</motion.tr>
									) : loadingSkills ? (
										<motion.tr
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<td
												colSpan={2}
												className="px-7 py-10 text-center text-shark-500 font-bold font-ubuntu text-lg"
											>
												Loading demanded skills...
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
												<td className="relative px-7 py-4 wrap-break-word align-top text-shark-200 text-lg">
													{row.original.name}
													<span className="absolute right-0 top-2 bottom-2 w-0.5 bg-shark-700/70" />
												</td>
												<td className="relative px-7 py-4 wrap-break-word align-top text-shark-200">
													<span
														className={`inline-flex rounded-md px-4 py-1.5 text-sm font-ubuntu font-bold text-shark-200 ${getDemandColor(
															row.original.demand,
														)}`}
													>
														{row.original.demand}%
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
												className="px-7 py-10 text-center text-shark-500 font-bold font-ubuntu text-lg"
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

				<br></br>
				<div className="flex items-center justify-center">
					<motion.button
						type="button"
						onClick={handleExportPDF}
						className="rounded-lg w-fit h-fit bg-red-ribbon-600 px-5 pt-3 pb-1.5 text-3xl font-galhaudisplay-bold text-shark-200 transition hover:scale-103 hover:shadow-lg hover:shadow-red-ribbon-600/70"
					>
						Export as PDF
					</motion.button>
				</div>
			</div>
		</motion.div>
	);
}

export default DemandedSkills;
