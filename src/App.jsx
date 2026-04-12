import "./index.css";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import LoginSignup from "./pages/LoginSignup";
import Home from "./pages/Home";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

function App() {
	let [session, setSession] = useState(null);
	let [loading, setLoading] = useState(true);
	const location = useLocation();

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});

		let { data: listener } = supabase.auth.onAuthStateChange(
			(_event, supabaseSession) => {
				setSession(supabaseSession);
			},
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	if (loading) return <p>Loading...</p>;

	return (
		<div>
			<Toaster
				position="top-center"
				toastOptions={{
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
				}}
			/>

			<Routes location={location} key={location.pathname}>
				<Route
					path="/"
					element={
						!session ? (
							<LoginSignup></LoginSignup>
						) : (
							<Navigate to="/home" />
						)
					}
				/>
				<Route
					path="/home"
					element={session ? <Home></Home> : <Navigate to="/" />}
				/>
			</Routes>
		</div>
	);
}

export default App;
