import "../index.css";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

export default function AdminTable() {
	const dummyUsers = [
		{
			id: 1,
			email: "mosabbir.ahmed@email.com",
			name: "Mosabbir Ahmed",
			role: "Job Seeker",
		},
		{
			id: 2,
			email: "sadia.hoque@email.com",
			name: "Sadia Hoque",
			role: "Enterprise",
		},
		{
			id: 3,
			email: "rahat.khan@email.com",
			name: "Rahat Khan",
			role: "Job Seeker",
		},
		{
			id: 4,
			email: "admin@ai-risk.app",
			name: "System Admin",
			role: "Admin",
		},
		{
			id: 5,
			email: "tanvir.hasan@email.com",
			name: "Tanvir Hasan",
			role: "Enterprise",
		},
		{
			id: 6,
			email: "farzana.akter@email.com",
			name: "Farzana Akter",
			role: "Job Seeker",
		},
		{
			id: 7,
			email: "adnan.karim@email.com",
			name: "Adnan Karim",
			role: "Enterprise",
		},
		{
			id: 8,
			email: "mehjabin.sultana@email.com",
			name: "Mehjabin Sultana",
			role: "Job Seeker",
		},
	];

	const [search, setSearch] = useState("");

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase();

		if (!query) return dummyUsers;

		return dummyUsers.filter((user) =>
			[user.email, user.name, user.role].some((value) =>
				value.toLowerCase().includes(query),
			),
		);
	}, [search]);

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
						placeholder="Search by email, name, or role..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
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
							<tr className="border-b border-shark-700">
								<th className="relative px-6 py-4 text-left font-semibold text-lightning-yellow-400">
									Email
									<span className="absolute right-0 top-3 bottom-3 w-0.5 bg-shark-600" />
								</th>

								<th className="relative px-6 py-4 text-left font-semibold text-lightning-yellow-400">
									Name
									<span className="absolute right-0 top-3 bottom-3 w-0.5 bg-shark-600" />
								</th>

								<th className="px-6 py-4 text-left font-semibold text-lightning-yellow-400">
									Role
								</th>
							</tr>
						</thead>

						<motion.tbody layout>
							<AnimatePresence mode="popLayout">
								{filteredUsers.length > 0 ? (
									filteredUsers.map((user) => (
										<motion.tr
											layout
											key={user.id}
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
											<td className="relative px-6 py-3 wrap-break-word align-top text-shark-200">
												{user.email}
												<span className="absolute right-0 top-2 bottom-2 w-0.5 bg-shark-700/70" />
											</td>

											<td className="relative px-6 py-3 wrap-break-word align-top text-shark-200">
												{user.name}
												<span className="absolute right-0 top-2 bottom-2 w-0.5 bg-shark-700/70" />
											</td>

											<td className="px-6 py-3 align-top">
												<span
													className={`inline-flex rounded-md px-3 py-1 text-xs font-ubuntu font-bold ${
														user.role === "Admin"
															? "bg-lightning-yellow-600 text-shark-100"
															: user.role ===
																  "Enterprise"
																? "bg-red-ribbon-600 text-shark-100"
																: "bg-aqua-island-500 text-shark-100"
													}`}
												>
													{user.role}
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
