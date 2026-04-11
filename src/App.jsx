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
			<Toaster position="top-center" />

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
