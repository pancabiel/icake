import { Menu, Bell } from "lucide-react";

export default function Header() {
	const today = new Date().toLocaleDateString("pt-BR", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});

	return (
		<header className="flex items-center justify-between px-4 py-3 border-b">
			{/* Botão hambúrguer */}
			<button className="p-2">
				<Menu size={28} />
			</button>

			{/* Data centralizada */}
			<h1 className="text-lg font-semibold">{today}</h1>

			{/* Botão notificações */}
			<button className="p-2">
				<img src="/icon.png" width={30}/>
			</button>
		</header>
	);
}
