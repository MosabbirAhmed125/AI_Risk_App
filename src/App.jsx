import "./index.css";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import LoginSignup from "./pages/LoginSignup";

function App() {
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
		<div>
			<Toaster position="top-center" />

			<LoginSignup></LoginSignup>
		</div>
	);
}

export default App;
