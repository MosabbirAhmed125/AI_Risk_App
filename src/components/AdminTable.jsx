import "../index.css";
import { motion, AnimatePresence } from "framer-motion";
import { flexRender } from "@tanstack/react-table";
import { Search } from "lucide-react";

export default function AdminTable({ table }) {
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
						placeholder="Search by email or name..."
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
					className="max-h-87 w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
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
														{index === 2 ? (
															<span
																className={`inline-flex rounded-md px-3 py-1 text-xs font-ubuntu font-bold ${
																	cell.getValue() ===
																	"admin"
																		? "bg-lightning-yellow-600 text-shark-100"
																		: cell.getValue() ===
																			  "enterprise"
																			? "bg-red-ribbon-600 text-shark-100"
																			: "bg-aqua-island-500 text-shark-100"
																}`}
															>
																{String(
																	cell.getValue() ||
																		"",
																)}
															</span>
														) : (
															flexRender(
																cell.column
																	.columnDef
																	.cell ??
																	cell.column
																		.columnDef
																		.accessorKey,
																cell.getContext(),
															)
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
											No matching users found.
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
