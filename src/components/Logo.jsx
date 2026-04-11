import { BrainCircuit } from "lucide-react";

export default function Logo() {
	return (
		<div className="relative h-45 w-45">
			<BrainCircuit
				size={180}
				strokeWidth={1.8}
				className="absolute left-1.5 top-1.5 text-shark-900"
			/>
			<BrainCircuit
				size={180}
				strokeWidth={1.8}
				className="absolute left-0 top-0 text-shark-200"
			/>
		</div>
	);
}
