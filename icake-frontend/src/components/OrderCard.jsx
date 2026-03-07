import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, CheckCircle, Trash2, Undo2, Clock, User, MapPin, CakeSlice } from "lucide-react";

export default function OrderCard({ date, name, address, items, onEdit, onConclude, onDelete, onUnconclude, readOnly }) {
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
		<div className="rounded-xl bg-white mb-4 relative shadow-sm border border-gray-100"
			style={{ borderLeft: "4px solid var(--main-red, #dc2626)" }}
		>
			<div className="p-4 pl-5">
				{/* Options menu button */}
				{(!readOnly || onUnconclude) && (
					<div className="absolute top-3 right-3 z-20" ref={menuRef}>
						<button
							onClick={() => setMenuOpen((prev) => !prev)}
							className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
							aria-label="Opções do pedido"
						>
							<MoreVertical size={18} className="text-gray-400" />
						</button>

						{menuOpen && (
							<div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-30 min-w-[160px] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
								{onUnconclude ? (
									<button
										onClick={() => { setMenuOpen(false); onUnconclude?.(); }}
										className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
									>
										<Undo2 size={15} className="text-orange-500" />
										<span>Reabrir</span>
									</button>
								) : (
									<>
										<button
											onClick={() => { setMenuOpen(false); onConclude?.(); }}
											className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
										>
											<CheckCircle size={15} className="text-green-500" />
											<span>Concluir</span>
										</button>
										<button
											onClick={() => { setMenuOpen(false); onEdit?.(); }}
											className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
										>
											<Pencil size={15} className="text-blue-500" />
											<span>Editar</span>
										</button>
										<div className="border-t my-1" />
										<button
											onClick={() => { setMenuOpen(false); onDelete?.(); }}
											className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors text-red-600"
										>
											<Trash2 size={15} />
											<span>Excluir</span>
										</button>
									</>
								)}
							</div>
						)}
					</div>
				)}

				{/* Date & Client */}
				<div className="flex items-center gap-1.5">
					<Clock size={25} style={{ color: "var(--main-red, #dc2626)" }} />
					<span className="text-black">{date}</span>
				</div>
				<div className="flex items-center gap-1.5 my-3">
					<User size={25} style={{ color: "var(--main-red, #dc2626)" }} />
					<span className="font-bold text-black">{name}</span>
				</div>

				{/* Divider */}
				<div className="border-t border-gray-100 my-3" />

				{/* Address */}
				<div className="flex items-center gap-1.5">
					<MapPin size={25} style={{ color: "var(--main-red, #dc2626)" }} />
					<span className="text-black">{address}</span>
				</div>

				{/* Items as badges */}
				{items && items.length > 0 && (
					<div className="flex items-start gap-1.5 mt-2.5">
						<CakeSlice size={25} className="mt-0.5 flex-shrink-0" style={{ color: "var(--main-red, #dc2626)" }} />
						<div className="flex flex-wrap gap-1.5">
							{items.map((item, idx) => (
								<span
									key={idx}
									className="bg-red-50 text-red-700 text-[15px] font-bold px-2.5 py-0.5 rounded-full border border-red-100"
								>
									{item.quantity} {item.name}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
