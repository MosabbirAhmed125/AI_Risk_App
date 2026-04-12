import { useState } from "react";
import { Eye, EyeOff, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

export default function LoginSignup() {
	const [isSignup, setIsSignup] = useState(false);
	const [selectedRole, setSelectedRole] = useState("");
	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);

	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");

	const [loginLoading, setLoginLoading] = useState(false);
	const [signupLoading, setSignupLoading] = useState(false);

	const navigate = useNavigate();

	const panelTransition = {
		type: "spring",
		stiffness: 260,
		damping: 28,
	};

	const formContainerVariants = {
		hidden: {},
		show: {
			transition: {
				staggerChildren: 0.06,
				delayChildren: 0.05,
			},
		},
	};

	const formItemVariants = {
		hidden: { opacity: 0, y: 10 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.25, ease: "easeOut" },
		},
	};

	const handleLogin = async (event) => {
		event.preventDefault();

		if (!loginEmail || !loginPassword) {
			toast.error("Please enter email and password");
			return;
		}

		setLoginLoading(true);

		const { error } = await supabase.auth.signInWithPassword({
			email: loginEmail,
			password: loginPassword,
		});

		setLoginLoading(false);

		if (error) {
			toast.error(error.message);
			setLoginEmail("");
			setLoginPassword("");
			return;
		}

		toast.success("Login successful!");
		navigate("/home");
	};

	const handleSignup = async (event) => {
		event.preventDefault();

		if (!signupEmail || !signupPassword) {
			toast.error("Please fill in all fields");
			return;
		}

		if (!selectedRole) {
			toast.error("Please select an account type");
			return;
		}

		setSignupLoading(true);

		const roleValue = selectedRole === "job" ? "job_seeker" : "enterprise";

		const { data: authData, error: authError } = await supabase.auth.signUp(
			{
				email: signupEmail,
				password: signupPassword,
			},
		);

		if (authError) {
			setSignupLoading(false);
			toast.error(authError.message);
			return;
		}

		const userId = authData?.user?.id;

		if (!userId) {
			setSignupLoading(false);
			toast.error("User account could not be created");
			return;
		}

		const { error: profileError } = await supabase.from("profiles").insert([
			{
				id: userId,
				role: roleValue,
			},
		]);

		if (profileError) {
			setSignupLoading(false);
			toast.error(profileError.message);
			return;
		}

		let secondaryTableError = null;

		if (roleValue === "job_seeker") {
			const { error } = await supabase.from("job_seekers").insert([
				{
					user_id: userId,
				},
			]);
			secondaryTableError = error;
		} else {
			const { error } = await supabase.from("enterprises").insert([
				{
					user_id: userId,
				},
			]);
			secondaryTableError = error;
		}

		if (secondaryTableError) {
			setSignupLoading(false);
			toast.error(secondaryTableError.message);
			return;
		}

		setSignupLoading(false);
		toast.success("Account created successfully!");

		setSignupEmail("");
		setSignupPassword("");
		setSelectedRole("");
		setShowSignupPassword(false);
		setIsSignup(false);
	};

	return (
		<div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,var(--color-shark-800),var(--color-shark-900),var(--color-shark-950))] bg-no-repeat font-ubuntu font-bold flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 24, scale: 0.97 }}
				animate={{
					opacity: 1,
					y: 0,
					scale: 1,
					rotateX: 0,
					rotateY: isSignup ? -1.2 : 1.2,
					boxShadow: isSignup
						? [
								"0 0 0 0 rgba(64,150,154,0.20), 0 0 32px 8px rgba(64,150,154,0.20), 0 0 72px 20px rgba(64,150,154,0.10)",
								"0 0 0 0 rgba(64,150,154,0.28), 0 0 48px 16px rgba(64,150,154,0.30), 0 0 96px 30px rgba(64,150,154,0.16)",
								"0 0 0 0 rgba(64,150,154,0.20), 0 0 32px 8px rgba(64,150,154,0.20), 0 0 72px 20px rgba(64,150,154,0.10)",
							]
						: [
								"0 0 0 0 rgba(215,67,57,0.20), 0 0 32px 8px rgba(215,67,57,0.20), 0 0 72px 20px rgba(215,67,57,0.10)",
								"0 0 0 0 rgba(215,67,57,0.28), 0 0 48px 16px rgba(215,67,57,0.30), 0 0 96px 30px rgba(215,67,57,0.16)",
								"0 0 0 0 rgba(215,67,57,0.20), 0 0 32px 8px rgba(215,67,57,0.20), 0 0 72px 20px rgba(215,67,57,0.10)",
							],
				}}
				transition={{
					opacity: { duration: 0.45, ease: "easeOut" },
					y: { duration: 0.45, ease: "easeOut" },
					scale: { duration: 0.45, ease: "easeOut" },
					rotateY: { duration: 0.6, ease: "easeInOut" },
					boxShadow: {
						duration: 2.2,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
				style={{ transformStyle: "preserve-3d" }}
				className="relative w-180 max-w-full min-h-105 overflow-hidden rounded-[18px] bg-shark-200"
			>
				<motion.div
					animate={{ x: isSignup ? "100%" : "0%" }}
					transition={panelTransition}
					className="absolute top-0 left-0 z-20 h-full w-1/2"
				>
					<div className="h-full w-full bg-shark-200 px-10 py-11 flex flex-col items-center justify-center text-center">
						<AnimatePresence mode="wait">
							{!isSignup && (
								<motion.form
									key="login-form"
									initial="hidden"
									animate="show"
									exit={{ opacity: 0, x: 20 }}
									variants={formContainerVariants}
									onSubmit={handleLogin}
									className="w-full flex flex-col items-center gap-5"
								>
									<motion.h1
										className="text-[34px] font-borel font-bold text-shark-900"
										variants={formItemVariants}
									>
										login
									</motion.h1>
									<motion.div
										variants={formItemVariants}
										className="relative w-full"
									>
										<motion.input
											type="email"
											placeholder="Email"
											value={loginEmail}
											onChange={(e) =>
												setLoginEmail(e.target.value)
											}
											required
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-md font-bold text-shark-900 outline-none transition ease-in-out duration-300 focus:bg-shark-400/60 placeholder:text-shark-500"
											variants={formItemVariants}
										/>
										<motion.span
											className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center text-shark-900"
											variants={formItemVariants}
										>
											<User size={18} strokeWidth={2} />
										</motion.span>
									</motion.div>
									<motion.div
										className="relative w-full"
										variants={formItemVariants}
									>
										<motion.input
											type={
												showLoginPassword
													? "text"
													: "password"
											}
											placeholder="Password"
											value={loginPassword}
											onChange={(e) =>
												setLoginPassword(e.target.value)
											}
											required
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-md font-bold text-shark-900 outline-none transition focus:bg-shark-400/50 placeholder:text-shark-500"
											variants={formItemVariants}
										/>
										<motion.button
											type="button"
											onClick={() =>
												setShowLoginPassword(
													(prev) => !prev,
												)
											}
											className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center rounded-lg bg-valencia-600 text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-valencia-600/70"
											variants={formItemVariants}
										>
											{showLoginPassword ? (
												<EyeOff
													size={18}
													strokeWidth={2}
												/>
											) : (
												<Eye
													size={18}
													strokeWidth={2}
												/>
											)}
										</motion.button>
									</motion.div>
									<motion.button
										type="submit"
										disabled={loginLoading}
										className="w-full rounded-lg bg-valencia-600 py-3 text-xl font-bold text-shark-200 transition ease-in-out duration-300 hover:scale-103 hover:shadow-lg hover:shadow-valencia-600/70 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
										variants={formItemVariants}
									>
										{loginLoading
											? "Logging in..."
											: "Login"}
									</motion.button>
									<motion.button
										type="button"
										onClick={() => setIsSignup(true)}
										className="w-full rounded-lg bg-aqua-island-500 py-3 text-xl font-bold text-shark-200 transition ease-in-out duration-300 hover:scale-103 hover:shadow-lg hover:shadow-aqua-island-500/70"
										variants={formItemVariants}
									>
										Signup
									</motion.button>
								</motion.form>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
				<motion.div
					animate={{
						x: isSignup ? "100%" : "0%",
						opacity: isSignup ? 1 : 0,
					}}
					transition={panelTransition}
					className={`absolute top-0 left-0 z-30 h-full w-1/2 ${isSignup ? "pointer-events-auto" : "pointer-events-none"}`}
				>
					<div className="h-full w-full bg-shark-200 px-10 py-11 flex flex-col items-center justify-center text-center">
						<AnimatePresence mode="wait">
							{isSignup && (
								<motion.form
									key="signup-form"
									initial="hidden"
									animate="show"
									exit={{ opacity: 0, x: -20 }}
									variants={formContainerVariants}
									onSubmit={handleSignup}
									className="w-full flex flex-col items-center gap-5"
								>
									<motion.h1
										className="text-[34px] font-borel font-bold text-shark-900"
										variants={formItemVariants}
									>
										signup
									</motion.h1>
									<motion.div
										className="relative w-full"
										variants={formItemVariants}
									>
										<motion.input
											type="email"
											placeholder="Email"
											value={signupEmail}
											onChange={(e) =>
												setSignupEmail(e.target.value)
											}
											required
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-sm font-bold text-shark-900 outline-none transition ease-in-out duration-300 focus:bg-shark-400/60 placeholder:text-shark-500"
											variants={formItemVariants}
										/>
										<motion.span
											className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center text-shark-900"
											variants={formItemVariants}
										>
											<User size={18} strokeWidth={2} />
										</motion.span>
									</motion.div>
									<motion.div
										className="relative w-full"
										variants={formItemVariants}
									>
										<motion.input
											type={
												showSignupPassword
													? "text"
													: "password"
											}
											placeholder="Password"
											value={signupPassword}
											onChange={(e) =>
												setSignupPassword(
													e.target.value,
												)
											}
											required
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-sm font-bold text-shark-900 outline-none transition ease-in-out duration-300 focus:bg-shark-400/60 placeholder:text-shark-500"
											variants={formItemVariants}
										/>
										<motion.button
											type="button"
											onClick={() =>
												setShowSignupPassword(
													(prev) => !prev,
												)
											}
											className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center rounded-lg bg-aqua-island-500 text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-aqua-island-500/70"
											variants={formItemVariants}
										>
											{showSignupPassword ? (
												<EyeOff
													size={18}
													strokeWidth={2}
												/>
											) : (
												<Eye
													size={18}
													strokeWidth={2}
												/>
											)}
										</motion.button>
									</motion.div>
									<motion.button
										type="button"
										onClick={() => setSelectedRole("job")}
										className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-bold transition ease-in-out duration-300 ${selectedRole === "job" ? "bg-aqua-island-500 text-shark-200 shadow-[0_3px_14px_rgba(64,150,154,0.35)]" : "bg-shark-300 text-shark-700 hover:bg-shark-400/60"}`}
										variants={formItemVariants}
									>
										<motion.span
											className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selectedRole === "job" ? "border-shark-900 bg-shark-900" : "border-aqua-island-500 bg-transparent"}`}
											variants={formItemVariants}
										/>
										Job Seeker / Job Holder
									</motion.button>
									<motion.button
										type="button"
										onClick={() => setSelectedRole("ent")}
										className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-bold transition ease-in-out duration-300 ${selectedRole === "ent" ? "bg-aqua-island-500 text-shark-200 shadow-[0_3px_14px_rgba(64,150,154,0.35)]" : "bg-shark-300 text-shark-700 hover:bg-shark-400/60"}`}
										variants={formItemVariants}
									>
										<motion.span
											className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selectedRole === "ent" ? "border-shark-900 bg-shark-900" : "border-aqua-island-500 bg-transparent"}`}
											variants={formItemVariants}
										/>
										Enterprise / Company
									</motion.button>
									<motion.div
										className="flex w-full gap-5"
										variants={formItemVariants}
									>
										<motion.button
											type="submit"
											disabled={signupLoading}
											className="flex-1 rounded-lg h-12 bg-aqua-island-500 text-xl font-bold text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:scale-103 hover:shadow-aqua-island-500/70 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
											variants={formItemVariants}
										>
											{signupLoading
												? "Creating..."
												: "Signup"}
										</motion.button>
										<motion.button
											type="button"
											onClick={() => {
												setIsSignup(false);
												setSelectedRole("");
												setSignupEmail("");
												setSignupPassword("");
												setShowSignupPassword(false);
											}}
											className="flex-1 rounded-lg h-12 bg-valencia-600 text-xl font-bold text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:scale-103 hover:shadow-valencia-600/70"
											variants={formItemVariants}
										>
											Login
										</motion.button>
									</motion.div>
								</motion.form>
							)}
						</AnimatePresence>
					</div>
				</motion.div>

				<motion.div
					animate={{ x: isSignup ? "-100%" : "0%" }}
					transition={panelTransition}
					className="absolute top-0 left-1/2 z-40 h-full w-1/2 overflow-hidden rounded-[18px]"
				>
					<motion.div
						animate={{
							backgroundColor: isSignup ? "#40969a" : "#d74339",
							boxShadow: isSignup
								? "0 20px 25px -5px rgba(64, 150, 154, 0.3)"
								: "0 20px 25px -5px rgba(215, 67, 57, 0.3)",
						}}
						transition={{ duration: 0.45 }}
						className="relative -left-full h-full w-[200%] rounded-[18px]"
					>
						<motion.div
							animate={{
								x: isSignup ? "100%" : "0%",
								y: [0, -5, 0],
								scale: [1, 1.015, 1],
							}}
							transition={{
								x: panelTransition,
								y: {
									duration: 3.2,
									repeat: Infinity,
									ease: "easeInOut",
								},
								scale: {
									duration: 3.2,
									repeat: Infinity,
									ease: "easeInOut",
								},
							}}
							className="absolute top-0 left-0 flex h-full w-1/2 items-center justify-center"
						>
							<Logo />
						</motion.div>

						<motion.div
							animate={{
								x: isSignup ? "100%" : "0%",
								y: [0, -5, 0],
								scale: [1, 1.015, 1],
							}}
							transition={{
								x: panelTransition,
								y: {
									duration: 3.2,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.2,
								},
								scale: {
									duration: 3.2,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.2,
								},
							}}
							className="absolute top-0 right-0 flex h-full w-1/2 items-center justify-center"
						>
							<Logo />
						</motion.div>
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}
