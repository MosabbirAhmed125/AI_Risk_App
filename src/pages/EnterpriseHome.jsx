// src/pages/EnterpriseHome.jsx
import "../index.css";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import EnterpriseSidebar from "../components/EnterpriseSidebar";

function EnterpriseHome() {
	return (
		<motion.div
			animate={{
				backgroundSize: ["100% 100%", "115% 115%", "100% 100%"],
				backgroundPosition: ["50% 0%", "50% 15%", "50% 0%"],
			}}
			transition={{
				duration: 3.5,
				repeat: Infinity,
				ease: "easeInOut",
			}}
			className="h-screen w-screen overflow-hidden flex items-center justify-center
				bg-[radial-gradient(ellipse_at_top,var(--color-red-ribbon-900),var(--color-shark-900),var(--color-shark-950))]
				bg-no-repeat"
		>
			{/* Sidebar — unchanged */}
			<div className="absolute left-0 top-0 h-full">
				<EnterpriseSidebar />
			</div>

			{/* Hero identity block */}
			<motion.div
				initial={{ opacity: 0, y: 16, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
				className="flex flex-col items-center justify-center text-center px-6 max-w-3xl"
			>
				{/* Logo */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
					className="relative h-64 w-64 flex items-center justify-center"
				>
					<BrainCircuit
						size={240}
						strokeWidth={1.6}
						className="absolute left-2 top-2 text-shark-900"
					/>
					<BrainCircuit
						size={240}
						strokeWidth={1.6}
						className="absolute left-0 top-0 text-shark-200"
					/>
				</motion.div>

				{/* App title */}
				<motion.span
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.25 }}
					className="text-shark-200 mt-4 text-[44px] font-gurvaco whitespace-nowrap leading-none tracking-[0.2em]"
				>
					INFLECTION
				</motion.span>

				{/* Subtitle */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-6 text-base md:text-lg font-ubuntu tracking-[0.25em] uppercase text-red-ribbon-500/90"
				>
					Career intelligence for the age of AI
				</motion.p>

				{/* Supporting description */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.55 }}
					className="mt-4 max-w-xl text-sm md:text-base font-ubuntu leading-relaxed text-shark-300"
				>
					Inflection maps how artificial intelligence is reshaping
					every job and every skill, surfacing risk for those who
					work, and signal for those who hire. Track salary momentum,
					skill demand, and AI impact across sectors, and stay ahead
					of the shift before it reaches you.
				</motion.p>

				{/* Subtle accent line */}
				<motion.div
					initial={{ opacity: 0, scaleX: 0 }}
					animate={{ opacity: 1, scaleX: 1 }}
					transition={{ duration: 0.8, delay: 0.7 }}
					className="mt-8 h-px w-32 bg-linear-to-r from-transparent via-red-ribbon-500/60 to-transparent"
				/>
			</motion.div>
		</motion.div>
	);
}

export default EnterpriseHome;
