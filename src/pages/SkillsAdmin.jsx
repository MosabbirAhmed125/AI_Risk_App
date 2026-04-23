import "../index.css";
import "../assets/fonts/Ubuntu-bold";
import "../assets/fonts/Ubuntu-normal";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useMemo, useState } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { flexRender } from "@tanstack/react-table";

// ───────────────────────────────────────────────────────────
// Data fetchers
// ───────────────────────────────────────────────────────────
async function fetchSkillsWithRisk() {
	const { data: skills, error: skillsErr } = await supabase
		.from("skills")
		.select("skill_id, skill_name")
		.order("skill_name");

	if (skillsErr) throw skillsErr;

	const { data: risks, error: risksErr } = await supabase
		.from("skill_risk")
		.select("skill_id, ai_impact");

	if (risksErr) throw risksErr;

	const riskMap = new Map(
		(risks || []).map((r) => [r.skill_id, Number(r.ai_impact)]),
	);

	return (skills || []).map((skill) => ({
		skill_id: skill.skill_id,
		skill_name: skill.skill_name,
		ai_impact: riskMap.get(skill.skill_id) ?? null,
	}));
}

// ───────────────────────────────────────────────────────────
// Editable AI Impact Cell
// ───────────────────────────────────────────────────────────
function EditableAIImpactCell({ value, onChange, skillId }) {
	const handleChange = (e) => {
		const val = e.target.value;

		if (val === "") {
			onChange(skillId, null);
			return;
		}

		const num = parseInt(val, 10);
		if (!Number.isNaN(num) && num >= 0 && num <= 100) {
			onChange(skillId, num);
		}
	};

	return (
		<input
			type="number"
			min="0"
			max="100"
			value={value ?? ""}
			onChange={handleChange}
			className="w-20 px-3 py-2 text-center bg-shark-900 border border-lightning-yellow-500/40 text-shark-100 rounded-lg font-ubuntu font-bold focus:outline-none focus:border-lightning-yellow-500"
		/>
	);
}

// ───────────────────────────────────────────────────────────
// Skills Table
// ───────────────────────────────────────────────────────────
function SkillsTable({ table }) {
	const rows = table.getRowModel().rows;

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				when: "beforeChildren",
				staggerChildren: 0.05,
			},
		},
	};

	const rowVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	};

	return (
		<motion.div
			className="w-180 max-w-full mx-auto pb-6 flex flex-col gap-6"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<div className="w-full flex gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lightning-yellow-400" />

					<motion.input
						layout
						type="text"
						placeholder="Search by skill name or ID..."
						value={table.getState().globalFilter ?? ""}
						onChange={(e) => table.setGlobalFilter(e.target.value)}
						className="w-full pl-11 pr-4 py-3 border-2 border-lightning-yellow-500/40 text-shark-100 rounded-xl bg-shark-950 font-ubuntu font-bold focus:outline-none placeholder:text-shark-500"
						whileFocus={{
							scale: 1.01,
							boxShadow: "0 0 0 2px rgba(248,187,37,0.35)",
						}}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 25,
						}}
					/>
				</div>
			</div>

			<motion.div
				layout
				className="bg-transparent rounded-2xl border-2 border-lightning-yellow-500/50 overflow-hidden drop-shadow-lightning-yellow-500/30 drop-shadow-2xl"
			>
				<motion.div
					layout
					className="max-h-92 w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
				>
					<table className="min-w-full text-sm text-shark-100 border-collapse table-fixed font-ubuntu font-bold">
						<thead className="bg-shark-900 sticky top-0 z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr
									key={headerGroup.id}
									className="border-b border-shark-700"
								>
									{headerGroup.headers.map(
										(header, index) => (
											<th
												key={header.id}
												className="relative px-6 py-4 text-left font-semibold text-lightning-yellow-400"
											>
												{flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}

												{index !==
													headerGroup.headers.length -
														1 && (
													<span className="absolute right-0 top-3 bottom-3 w-0.5 bg-shark-600" />
												)}
											</th>
										),
									)}
								</tr>
							))}
						</thead>

						<motion.tbody layout>
							<AnimatePresence mode="popLayout">
								{rows.length > 0 ? (
									rows.map((row) => (
										<motion.tr
											layout
											key={row.id}
											variants={rowVariants}
											initial="hidden"
											animate="visible"
											exit="exit"
											transition={{ duration: 0.3 }}
											whileHover={{
												scale: 1.01,
												transition: { duration: 0.2 },
											}}
											className="border-b bg-shark-950 border-shark-900 hover:bg-shark-800/70"
										>
											{row
												.getVisibleCells()
												.map((cell, index) => (
													<td
														key={cell.id}
														className="relative px-6 py-3 wrap-break-word align-top text-shark-200"
													>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext(),
														)}

														{index !==
															row.getVisibleCells()
																.length -
																1 && (
															<span className="absolute right-0 top-2 bottom-2 w-0.5 bg-shark-700/70" />
														)}
													</td>
												))}
										</motion.tr>
									))
								) : (
									<motion.tr
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
									>
										<td
											colSpan={3}
											className="px-6 py-8 text-center text-shark-500 font-bold font-ubuntu"
										>
											No skills found.
										</td>
									</motion.tr>
								)}
							</AnimatePresence>
						</motion.tbody>
					</table>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}

// ───────────────────────────────────────────────────────────
// Main component
// ───────────────────────────────────────────────────────────
function SkillsAdmin() {
	const [rows, setRows] = useState([]);
	const [editedRows, setEditedRows] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				const data = await fetchSkillsWithRisk();
				setRows(data);
			} catch (error) {
				console.error("Failed to load skills:", error);
				toast.error("Failed to load skills");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const handleAIImpactChange = (skillId, value) => {
		setRows((prev) =>
			prev.map((r) =>
				r.skill_id === skillId ? { ...r, ai_impact: value } : r,
			),
		);

		setEditedRows((prev) => ({
			...prev,
			[skillId]: value,
		}));
	};

	const handleSave = async () => {
		if (Object.keys(editedRows).length === 0) {
			toast("No changes to save");
			return;
		}

		setSaving(true);

		try {
			const updates = Object.entries(editedRows);

			for (const [skillId, aiImpact] of updates) {
				if (aiImpact === null || aiImpact === undefined) {
					throw new Error(
						`Invalid AI impact value for skill ${skillId}`,
					);
				}

				const { data: existing, error: fetchErr } = await supabase
					.from("skill_risk")
					.select("id")
					.eq("skill_id", skillId)
					.single();

				if (fetchErr && fetchErr.code !== "PGRST116") {
					throw fetchErr;
				}

				if (existing) {
					const { error: updateErr } = await supabase
						.from("skill_risk")
						.update({ ai_impact: aiImpact })
						.eq("skill_id", skillId);

					if (updateErr) throw updateErr;
				} else {
					const { error: insertErr } = await supabase
						.from("skill_risk")
						.insert({
							skill_id: skillId,
							ai_impact: aiImpact,
						});

					if (insertErr) throw insertErr;
				}
			}

			setEditedRows({});
			toast.success("Changes saved successfully!");
		} catch (error) {
			console.error("Save error:", error);
			toast.error("Failed to save changes");
		} finally {
			setSaving(false);
		}
	};

	const columns = useMemo(
		() => [
			{
				accessorKey: "skill_name",
				header: "Skill Name",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "skill_id",
				header: "Skill ID",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "ai_impact",
				header: "AI Impact %",
				cell: (info) => (
					<EditableAIImpactCell
						value={info.getValue()}
						onChange={handleAIImpactChange}
						skillId={info.row.original.skill_id}
					/>
				),
			},
		],
		[],
	);

	const table = useReactTable({
		data: rows,
		columns,
		state: {
			columnFilters,
			globalFilter,
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const query = String(filterValue).toLowerCase();
			return (
				row.original.skill_name.toLowerCase().includes(query) ||
				row.original.skill_id.toLowerCase().includes(query)
			);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

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
            bg-[radial-gradient(ellipse_at_top,var(--color-lightning-yellow-800),var(--color-shark-800),var(--color-shark-950))]
            bg-no-repeat"
		>
			<div className="scale-120 flex flex-col justify-center items-center">
				{loading ? (
					<div></div>
				) : (
					<>
						<SkillsTable table={table} />
						<br />
						<br />
						<motion.button
							type="button"
							onClick={handleSave}
							disabled={saving}
							className="rounded-lg w-fit h-fit bg-cello-500 px-5 pt-3 pb-1.5 text-2xl font-galhaudisplay-bold text-shark-200 transition hover:scale-103 hover:shadow-lg hover:shadow-cello-500/70 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving ? "Saving..." : "Save Changes"}
						</motion.button>
					</>
				)}
			</div>

			<div className="absolute left-0">
				<AdminSidebar />
			</div>
		</motion.div>
	);
}

export default SkillsAdmin;
