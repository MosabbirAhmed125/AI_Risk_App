import { useState } from "react";
import { Eye, EyeOff, User, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

export default function LoginSignup() {
	const [isSignup, setIsSignup] = useState(false);
	const [selectedRole, setSelectedRole] = useState("");
	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);

	const panelTransition = {
		type: "spring",
		stiffness: 260,
		damping: 28,
	};

	return (
		<div className="min-h-screen w-full bg-cod-gray-900 font-ubuntu font-bold flex items-center justify-center px-4">
			<div
				className={
					`relative w-180 max-w-full min-h-105 overflow-hidden rounded-[18px] bg-cod-gray-100 transition-shadow duration-500` +
					(isSignup
						? " shadow-[0_0_0_0_#40969a44,0_0_48px_16px_#40969a44,0_0_96px_32px_#40969a22]"
						: " shadow-[0_0_0_0_#d7433944,0_0_48px_16px_#d7433944,0_0_96px_32px_#d7433922]")
				}
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
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									transition={{ duration: 0.25 }}
									className="w-full flex flex-col items-center gap-5"
								>
									<h1 className="text-[34px] font-borel font-bold text-shark-900">
										login
									</h1>

									<div className="relative w-full">
										<input
											type="text"
											placeholder="Email"
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-md font-bold text-shark-900 outline-none transition ease-in-out duration-300 
											focus:bg-shark-400/60 placeholder:text-shark-500"
										/>
										<span className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center text-shark-900">
											<User size={18} strokeWidth={2} />
										</span>
									</div>

									<div className="relative w-full">
										<input
											type={
												showLoginPassword
													? "text"
													: "password"
											}
											placeholder="Password"
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-md font-bold text-shark-900 outline-none transition focus:bg-shark-400/50 placeholder:text-shark-500"
										/>
										<button
											type="button"
											onClick={() =>
												setShowLoginPassword(
													(prev) => !prev,
												)
											}
											className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center rounded-lg bg-valencia-600 text-shark-200 transition ease-in-out duration-300  hover:shadow-lg hover:shadow-valencia-600/70"
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
										</button>
									</div>

									<button
										type="submit"
										className="w-full rounded-lg bg-valencia-600 py-3 text-xl font-bold 
										text-shark-200 transition ease-in-out duration-300 hover:scale-103 
										hover:shadow-lg hover:shadow-valencia-600/70"
									>
										Login
									</button>

									<button
										type="button"
										onClick={() => setIsSignup(true)}
										className="w-full rounded-lg bg-aqua-island-500 py-3 text-xl font-bold 
										text-shark-200 transition ease-in-out duration-300 hover:scale-103
										hover:shadow-lg hover:shadow-aqua-island-500/70"
									>
										Signup
									</button>
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
					className={`absolute top-0 left-0 z-30 h-full w-1/2 ${
						isSignup ? "pointer-events-auto" : "pointer-events-none"
					}`}
				>
					<div className="h-full w-full bg-shark-200 px-10 py-11 flex flex-col items-center justify-center text-center">
						<AnimatePresence mode="wait">
							{isSignup && (
								<motion.form
									key="signup-form"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.25 }}
									className="w-full flex flex-col items-center gap-5"
								>
									<h1 className="text-[34px] font-borel font-bold text-shark-900">
										signup
									</h1>

									<div className="relative w-full">
										<input
											type="email"
											placeholder="Email"
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-sm font-bold text-shark-900 outline-none transition ease-in-out duration-300 focus:bg-shark-400/60 placeholder:text-shark-500"
										/>
										<span className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center text-shark-900">
											<User size={18} strokeWidth={2} />
										</span>
									</div>

									<div className="relative w-full">
										<input
											type={
												showSignupPassword
													? "text"
													: "password"
											}
											placeholder="Password"
											className="w-full rounded-lg border-none bg-shark-300 py-2.75 pl-4 pr-12 text-sm font-bold text-shark-900 outline-none transition ease-in-out duration-300 focus:bg-shark-400/60 placeholder:text-shark-500"
										/>
										<button
											type="button"
											onClick={() =>
												setShowSignupPassword(
													(prev) => !prev,
												)
											}
											className="absolute inset-y-0 right-0 flex w-10.5 items-center justify-center rounded-lg bg-aqua-island-500 text-shark-200 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-aqua-island-500/70"
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
										</button>
									</div>

									<button
										type="button"
										onClick={() => setSelectedRole("job")}
										className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-bold transition ease-in-out duration-300 ${
											selectedRole === "job"
												? "bg-aqua-island-500 text-shark-900 shadow-[0_3px_14px_rgba(64,150,154,0.35)]"
												: "bg-shark-300 text-shark-700 hover:bg-shark-400/60"
										}`}
									>
										<span
											className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
												selectedRole === "job"
													? "border-shark-900 bg-shark-900"
													: "border-aqua-island-500 bg-transparent"
											}`}
										/>
										Job Seeker / Job Holder
									</button>

									<button
										type="button"
										onClick={() => setSelectedRole("ent")}
										className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-bold transition ease-in-out duration-300 ${
											selectedRole === "ent"
												? "bg-aqua-island-500 text-shark-900 shadow-[0_3px_14px_rgba(64,150,154,0.35)]"
												: "bg-shark-300 text-shark-700 hover:bg-shark-400/60"
										}`}
									>
										<span
											className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
												selectedRole === "ent"
													? "border-shark-900 bg-shark-900"
													: "border-aqua-island-500 bg-transparent"
											}`}
										/>
										Enterprise / Company
									</button>

									<div className="flex w-full gap-5">
										<button
											type="submit"
											className="flex-1 rounded-lg h-12 bg-aqua-island-500 text-xl 
											font-bold text-shark-200 transition ease-in-out duration-300
											hover:shadow-lg hover:scale-103 hover:shadow-aqua-island-500/70"
										>
											Signup
										</button>

										<button
											type="button"
											onClick={() => setIsSignup(false)}
											className="flex-1 rounded-lg h-12 bg-valencia-600 text-xl
											font-bold text-shark-200 transition ease-in-out duration-300
											hover:shadow-lg hover:scale-103 hover:shadow-valencia-600/70"
										>
											Login
										</button>
									</div>
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
							animate={{ x: isSignup ? "100%" : "0%" }}
							transition={panelTransition}
							className="absolute top-0 left-0 flex h-full w-1/2 items-center justify-center"
						>
							<Logo />
						</motion.div>

						<motion.div
							animate={{ x: isSignup ? "100%" : "0%" }}
							transition={panelTransition}
							className="absolute top-0 right-0 flex h-full w-1/2 items-center justify-center"
						>
							<Logo />
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
