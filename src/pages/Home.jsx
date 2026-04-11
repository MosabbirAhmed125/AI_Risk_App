import "../index.css";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

function Home() {
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

	let handleLogout = async () => {
		await supabase.auth.signOut();
		toast.success("Successfully logged out!");
		navigate("/");
	};

	return (
		<div className="h-screen flex flex-col items-center justify-center bg-shark-900">
			<p className="text-6xl font-borel text-shark-200">welcome!</p>
			<br></br>
			<br></br>
			<button
				className="font-bold font-ubuntu text-shark-200 text-2xl bg-cello-500 bg-center rounded-lg py-3 px-4 border-transparent transition delay-75 duration-300 ease-in-out hover:scale-110 hover:bg-shark-200 hover:text-cello-500
                hover:shadow-cello-500/50 hover:shadow-xl w-60 h-16 cursor-pointer"
				onClick={testConnection}
			>
				Check Supabase
			</button>
			<br></br>
			<br></br>
			<button
				className="font-bold font-ubuntu text-shark-200 text-2xl bg-alizarin-crimson-600 bg-center rounded-lg py-3 px-4 border-transparent transition delay-75 duration-300 ease-in-out hover:scale-110 hover:bg-shark-200 hover:text-alizarin-crimson-600
                hover:shadow-alizarin-crimson-600/50 hover:shadow-xl w-60 h-16 cursor-pointer"
				onClick={handleLogout}
			>
				Logout
			</button>
		</div>
	);
}

export default Home;
