import { useNavigate } from "react-router-dom";
import "../index.css";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import AdminTable from "../components/AdminTable";

function AdminPanel() {
	const navigate = useNavigate();

	const testConnection = async () => {
		const { data, error } = await supabase
			.from("jobs")
			.select("*")
			.limit(5);

		if (error) {
			console.error(error);
			toast.error("Supabase error");
		} else {
			console.log(data);
			toast.success("Supabase connected!");
		}
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
			<p className="text-6xl font-borel text-shark-200">welcome!</p>
			<br></br>
			<AdminTable></AdminTable>

			<div className="absolute left-0">
				<AdminSidebar></AdminSidebar>
			</div>
		</motion.div>
	);
}

export default AdminPanel;
