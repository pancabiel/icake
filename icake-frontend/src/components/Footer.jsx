import { Home, PlusCircle, User, Calendar, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="flex justify-around items-center py-3 border-t bg-white fixed bottom-0 w-full">
			<NavLink
				to="/"
				end
				className={({ isActive }) =>
					`px-5 py-2 flex items-center justify-center transition-transform active:scale-70 ${isActive ? "text-[var(--main-red)]" : ""
					}`
				}
			>
				<Home size={28} />
			</NavLink>

			<NavLink
				to="/calendar"
				className={({ isActive }) =>
					`px-5 py-2 flex items-center justify-center transition-transform active:scale-70 ${isActive ? "text-[var(--main-red)]" : ""
					}`
				}
			>
				<Calendar size={28} />
			</NavLink>

			<NavLink
				to="/newOrder"
				className={({ isActive }) =>
					`px-5 py-2 flex items-center justify-center transition-transform active:scale-70 ${isActive ? "text-[var(--main-red)]" : ""
					}`
				}
			>
				<PlusCircle size={28} />
			</NavLink>

			<NavLink
				to="/shopping"
				className={({ isActive }) =>
					`px-5 py-2 flex items-center justify-center transition-transform active:scale-70 ${isActive ? "text-[var(--main-red)]" : ""
					}`
				}
			>
				<ShoppingCart size={28} />
			</NavLink>

			<NavLink
				to="/profile"
				className={({ isActive }) =>
					`px-5 py-2 flex items-center justify-center transition-transform active:scale-70 ${isActive ? "text-[var(--main-red)]" : ""
					}`
				}
			>
				<User size={28} />
			</NavLink>
		</footer>
	);
}
