import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, CheckCircle, Trash2, Undo2 } from "lucide-react";

export default function OrderCard({ date, name, address, details, onEdit, onConclude, onDelete, onUnconclude, readOnly }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		}
		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpen]);

	return (
		<div className="border rounded-lg p-4 shadow-sm bg-white mb-4 relative">
			{/* Options menu button */}
			{(!readOnly || onUnconclude) && (
				<div className="absolute top-3 right-3" ref={menuRef}>
					<button
						onClick={() => setMenuOpen((prev) => !prev)}
						className="p-1 rounded-full hover:bg-gray-100 transition-colors"
						aria-label="Opções do pedido"
					>
						<MoreVertical size={20} className="text-gray-500" />
					</button>

					{menuOpen && (
						<div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-[160px] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
							{onUnconclude ? (
								<button
									onClick={() => { setMenuOpen(false); onUnconclude?.(); }}
									className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
								>
									<Undo2 size={16} className="text-orange-500" />
									<span>Reabrir</span>
								</button>
							) : (
								<>
									<button
										onClick={() => { setMenuOpen(false); onConclude?.(); }}
										className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
									>
										<CheckCircle size={16} className="text-green-500" />
										<span>Concluir</span>
									</button>
									<button
										onClick={() => { setMenuOpen(false); onEdit?.(); }}
										className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
									>
										<Pencil size={16} className="text-blue-500" />
										<span>Editar</span>
									</button>
									<div className="border-t my-1" />
									<button
										onClick={() => { setMenuOpen(false); onDelete?.(); }}
										className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors text-red-600"
									>
										<Trash2 size={16} />
										<span>Excluir</span>
									</button>
								</>
							)}
						</div>
					)}
				</div>
			)}

			<p className="font-semibold">Data: {date}</p>
			<p>Cliente: {name}</p>
			<p>Endereço: {address}</p>
			<p>Detalhes: {details}</p>
		</div>
	);
}
