import "./index.css";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

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
		<div className="bg-cod-gray-900 h-screen flex flex-col items-center justify-center">
			<Toaster position="top-center" />

			<p className="font-ubuntu text-5xl font-bold text-pearl-bush-200">
				AI Job Risk App
			</p>

			<br />
			<br />

			<button
				onClick={testConnection}
				className="bg-elephant-600 text-2xl font-ubuntu font-bold
				text-pearl-bush-200 h-12 w-55 p-2 rounded-xl hover:bg-pearl-bush-200 hover:text-elephant-600 
				hover:shadow-xl hover:shadow-elephant-600 transition delay-75 duration-150 ease-in-out hover:scale-110"
			>
				Check Supabase
			</button>
		</div>
	);
}

export default App;
