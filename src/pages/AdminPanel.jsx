import { useNavigate } from "react-router-dom";
import "../index.css";
import "../assets/fonts/Ubuntu-bold";
import "../assets/fonts/Ubuntu-normal";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import AdminTable from "../components/AdminTable";
import { useEffect, useMemo, useState } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

async function fetchAdminUsers() {
	const { data, error } = await supabase
		.from("admin_users_view")
		.select("id, email, full_name, role")
		.order("email", { ascending: true });

	if (error) {
		console.error("Error fetching users:", error);
		throw error;
	}

	return (data || []).map((user) => ({
		id: user.id,
		email: user.email ?? "",
		name: user.full_name ?? "",
		role: user.role ?? "",
	}));
}

function AdminPanel() {
	const navigate = useNavigate();

	const [users, setUsers] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				setLoading(true);
				const data = await fetchAdminUsers();
				setUsers(data);
			} catch (error) {
				toast.error("Failed to load users.");
			} finally {
				setLoading(false);
			}
		};

		loadUsers();
	}, []);

	const columns = useMemo(
		() => [
			{
				accessorKey: "email",
				header: "Email",
				filterFn: "includesString",
			},
			{
				accessorKey: "name",
				header: "Name",
				filterFn: "includesString",
			},
			{
				accessorKey: "role",
				header: "Role",
				filterFn: "includesString",
			},
		],
		[],
	);

	const table = useReactTable({
		data: users,
		columns,
		state: {
			columnFilters,
			globalFilter,
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const query = filterValue.toLowerCase();

			return (
				row.original.email.toLowerCase().includes(query) ||
				row.original.name.toLowerCase().includes(query)
			);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const exportToPDF = () => {
		const doc = new jsPDF("p", "mm", "a4");

		doc.setFont("Ubuntu", "bold");
		doc.setFontSize(22);
		doc.text("Admin Users Report", 105, 20, { align: "center" });

		const tableColumn = ["Email", "Name", "Role"];

		const tableRows = table
			.getRowModel()
			.rows.map((row) => [
				row.original.email,
				row.original.name,
				row.original.role,
			]);

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
				fillColor: [239, 68, 68],
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
					cellWidth: 70,
					overflow: "linebreak",
					halign: "center",
					valign: "middle",
				},
				1: {
					cellWidth: 65,
					overflow: "linebreak",
					halign: "center",
					valign: "middle",
				},
				2: {
					cellWidth: 35,
					overflow: "linebreak",
					halign: "center",
					valign: "middle",
				},
			},
		});

		doc.save("admin_users_report.pdf");
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
				<AdminTable table={table}></AdminTable>
				<br></br>
				<br></br>
				<motion.button
					type="button"
					onClick={handleExportPDF}
					className="rounded-lg w-fit h-fit bg-cello-500 px-5 pt-3 pb-1.5 text-2xl font-galhaudisplay-bold text-shark-200 transition hover:scale-103 hover:shadow-lg hover:shadow-cello-500/70"
				>
					Export as PDF
				</motion.button>
			</div>

			<div className="absolute left-0">
				<AdminSidebar></AdminSidebar>
			</div>
		</motion.div>
	);
}

export default AdminPanel;
