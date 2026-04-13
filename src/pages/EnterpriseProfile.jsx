import { useNavigate } from "react-router-dom";
import "../index.css";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import EnterpriseSidebar from "../components/EnterpriseSidebar";

function EnterpriseProfile() {
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
            bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))]
            bg-no-repeat"
		>
			<p className="text-6xl font-borel text-shark-200">welcome!</p>
			<br />
			<br />
			<button
				className="font-bold font-ubuntu text-shark-200 text-2xl bg-cello-500 bg-center rounded-lg py-3 px-4 border-transparent transition delay-75 duration-300 ease-in-out hover:scale-110 hover:bg-shark-200 hover:text-cello-500 hover:shadow-cello-500/50 hover:shadow-xl w-60 h-16 cursor-pointer"
				onClick={testConnection}
			>
				Check Supabase
			</button>

			<div className="absolute left-0">
				<EnterpriseSidebar></EnterpriseSidebar>
			</div>
		</motion.div>
	);
}

export default EnterpriseProfile;
