import "./index.css";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "./lib/supabaseClient";
import { Toaster, toast } from "react-hot-toast";
import LoginSignup from "./pages/LoginSignup";
import AdminPanel from "./pages/AdminPanel";
import DemandedSkills from "./pages/DemandedSkills";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import EnterpriseProfile from "./pages/EnterpriseProfile";
import JobSectors from "./pages/JobSectors";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import MySkills from "./pages/MySkills";
import Recommendations from "./pages/Recommendations";
import SalaryInsights from "./pages/SalaryInsights";
import AdminHome from "./pages/AdminHome";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import JobSeekerHome from "./pages/JobSeekerHome";
import EnterpriseHome from "./pages/EnterpriseHome";

function App() {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const [roleLoading, setRoleLoading] = useState(false);
	const [userRole, setUserRole] = useState(null);
	const location = useLocation();

	const fetchUserRole = async (userId) => {
		setRoleLoading(true);

		const { data, error } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", userId)
			.single();

		if (error || !data?.role) {
			console.error("Role fetch error:", error);
			setUserRole(null);
			setRoleLoading(false);
			return;
		}

		setUserRole(data.role);
		setRoleLoading(false);
	};

	useEffect(() => {
		const initializeAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			setSession(session);

			if (session?.user?.id) {
				await fetchUserRole(session.user.id);
			} else {
				setUserRole(null);
				setRoleLoading(false);
			}

			setLoading(false);
		};

		initializeAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
			setSession(supabaseSession);

			if (supabaseSession?.user?.id) {
				fetchUserRole(supabaseSession.user.id);
			} else {
				setUserRole(null);
				setRoleLoading(false);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	if (loading || (session && roleLoading)) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-shark-900">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{
						duration: 1,
						repeat: Infinity,
						ease: "linear",
					}}
					className="absolute"
				>
					<LoaderCircle
						className="text-shark-200"
						size={64}
						strokeWidth={3}
					/>
				</motion.div>
			</div>
		);
	}

	const toasterOptions = {
		className: "font-ubuntu font-bold",
		style: {
			background: "#e5e6e5",
			color: "#1a1a1a",
			border: "none",
		},

		success: {
			iconTheme: {
				primary: "#275ca2",
				secondary: "#e5e6e5",
			},
			style: {
				boxShadow: `
					0 0 0 2px rgba(39,92,162,0.15),
					0 6px 18px rgba(39,92,162,0.35),
					0 2px 6px rgba(0,0,0,0.2)
				`,
			},
		},

		error: {
			iconTheme: {
				primary: "#e53945",
				secondary: "#e5e6e5",
			},
			style: {
				boxShadow: `
					0 0 0 2px rgba(229,57,69,0.15),
					0 6px 18px rgba(229,57,69,0.35),
					0 2px 6px rgba(0,0,0,0.2)
				`,
			},
		},

		loading: {
			iconTheme: {
				primary: "#1a1a1a",
				secondary: "#e5e6e5",
			},
		},
	};

	return (
		<div>
			<Toaster position="top-center" toastOptions={toasterOptions} />

			<Routes location={location} key={location.pathname}>
				<Route
					path="/"
					element={
						!session ? (
							<LoginSignup />
						) : userRole === "job_seeker" ? (
							<Navigate to="/job-seeker-home" replace />
						) : userRole === "enterprise" ? (
							<Navigate to="/enterprise-home" replace />
						) : userRole === "admin" ? (
							<Navigate to="/admin-panel" replace />
						) : (
							<LoginSignup />
						)
					}
				/>

				<Route
					path="/job-seeker-home"
					element={
						session && userRole === "job_seeker" ? (
							<JobSeekerHome />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/job-seeker-dashboard"
					element={
						session && userRole === "job_seeker" ? (
							<JobSeekerDashboard />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/job-seeker-profile"
					element={
						session && userRole === "job_seeker" ? (
							<JobSeekerProfile />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/my-skills"
					element={
						session && userRole === "job_seeker" ? (
							<MySkills />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/recommendations"
					element={
						session && userRole === "job_seeker" ? (
							<Recommendations />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/job-sectors"
					element={
						session && userRole === "job_seeker" ? (
							<JobSectors />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/enterprise-home"
					element={
						session && userRole === "enterprise" ? (
							<EnterpriseHome />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/enterprise-dashboard"
					element={
						session && userRole === "enterprise" ? (
							<EnterpriseDashboard />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/enterprise-profile"
					element={
						session && userRole === "enterprise" ? (
							<EnterpriseProfile />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/demanded-skills"
					element={
						session && userRole === "enterprise" ? (
							<DemandedSkills />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/salary-insights"
					element={
						session && userRole === "enterprise" ? (
							<SalaryInsights />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/admin"
					element={
						session && userRole === "admin" ? (
							<AdminHome />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>

				<Route
					path="/admin/panel"
					element={
						session && userRole === "admin" ? (
							<AdminPanel />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
