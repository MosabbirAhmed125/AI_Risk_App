import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
	Home,
	LayoutDashboard,
	BrainCircuit,
	BriefcaseBusiness,
	ChartLine,
	ScanSearch,
	User,
	LogOut,
	ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
	{ label: "Home", icon: Home, path: "/enterprise-home" },
	{
		label: "Dashboard",
		icon: LayoutDashboard,
		path: "/enterprise-dashboard",
	},
	{
		label: "Job Sectors",
		icon: BriefcaseBusiness,
		path: "/enterprise/job-sectors",
	},
	{ label: "Demanded Skills", icon: ScanSearch, path: "/demanded-skills" },
	{
		label: "Salary Insights",
		icon: ChartLine,
		path: "/salary-insights",
	},
];

const bottomItems = [
	{ label: "Profile", icon: User, path: "/enterprise-profile" },
];

function NavItem({ label, icon: Icon, collapsed, onClick, active = false }) {
	return (
		<button
			onClick={onClick}
			className={`
                group flex items-center gap-4 w-full px-4 py-3.5 rounded-[10px]
                transition-colors duration-200
                ${
					active
						? "bg-red-ribbon-600 text-shark-200"
						: "hover:bg-red-ribbon-600"
				}
                ${collapsed ? "justify-center px-0" : ""}
            `}
		>
			<Icon
				size={22}
				strokeWidth={2.5}
				className={`
                    shrink-0 transition-colors duration-200
                    ${
						active
							? "text-shark-200"
							: "text-red-ribbon-600 group-hover:text-shark-200"
					}
                `}
			/>
			{!collapsed && (
				<span className="text-shark-200 text-[15px] font-bold font-ubuntu whitespace-nowrap">
					{label}
				</span>
			)}
		</button>
	);
}

export default function EnterpriseSidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path) => {
		if (path === "/") {
			return location.pathname === "/";
		}

		return location.pathname.startsWith(path);
	};

	let handleLogout = async () => {
		await supabase.auth.signOut();
		toast.success("Successfully logged out!");
		navigate("/");
	};

	return (
		<div className="relative h-screen">
			<AnimatePresence>
				{!collapsed && (
					<motion.div
						initial={{ opacity: 0, x: -4, scaleY: 0.92 }}
						animate={{ opacity: 0.5, x: 0, scaleY: 1 }}
						exit={{ opacity: 0, x: -4, scaleY: 0.92 }}
						transition={{
							duration: 0.28,
							ease: "easeOut",
						}}
						className="
                            pointer-events-none absolute top-8 -right-4 h-[calc(100%-4rem)] w-6
                            rounded-full bg-red-ribbon-600 blur-xl z-0
                        "
					/>
				)}
			</AnimatePresence>

			<div
				className={`
                    relative z-10 bg-shark-900 h-full flex flex-col
                    rounded-tr-3xl rounded-br-3xl
                    transition-all duration-250 ease-in-out
                    ${collapsed ? "w-18" : "w-72"}
                    py-7 overflow-visible
                `}
			>
				<div
					className={`flex items-center px-4 pb-6 mb-3
                        ${collapsed ? "justify-center" : "justify-between"}`}
				>
					{!collapsed && (
						<div className="flex items-center gap-3 overflow-hidden">
							<div className="relative w-9 h-9 shrink-0 bg-red-ribbon-600 rounded-lg flex items-center justify-center">
								<BrainCircuit
									size={25}
									strokeWidth={2}
									className="absolute text-shark-900 translate-x-[1.5px] translate-y-[1.5px]"
								/>
								<BrainCircuit
									size={25}
									strokeWidth={2}
									className="absolute text-shark-200"
								/>
							</div>
							<span
								className="text-shark-200 mt-2 text-[28px] font-gurvaco
								whitespace-nowrap leading-none tracking-wider"
							>
								INFLECTION
							</span>
						</div>
					)}

					<button
						onClick={() => setCollapsed(!collapsed)}
						className="w-9 h-9 shrink-0 bg-red-ribbon-600 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
					>
						<ChevronLeft
							size={17}
							strokeWidth={2.5}
							className={`text-shark-200 transition-transform duration-250 ${
								collapsed ? "rotate-180" : ""
							}`}
						/>
					</button>
				</div>

				<nav className="flex flex-col flex-1 px-3 gap-1">
					{navItems.map((item) => (
						<NavItem
							key={item.label}
							{...item}
							collapsed={collapsed}
							active={isActive(item.path)}
							onClick={() => navigate(item.path)}
						/>
					))}

					<div className="flex-1" />

					{bottomItems.map((item) => (
						<NavItem
							key={item.label}
							{...item}
							collapsed={collapsed}
							active={isActive(item.path)}
							onClick={() => navigate(item.path)}
						/>
					))}

					<NavItem
						label="Logout"
						icon={LogOut}
						collapsed={collapsed}
						onClick={handleLogout}
					/>
				</nav>
			</div>
		</div>
	);
}
