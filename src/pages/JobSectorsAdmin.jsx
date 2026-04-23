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

function JobSectorsAdmin() {

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
			<div className="absolute left-0">
				<AdminSidebar></AdminSidebar>
			</div>
		</motion.div>
	);
}

export default JobSectorsAdmin;
