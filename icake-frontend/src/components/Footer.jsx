import { Home, PlusCircle, User, Calendar, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="flex justify-around items-center py-3 border-t bg-white fixed bottom-0 w-full">
			<NavLink to="/" end className="px-20 py-2 flex items-center justify-center">
				<Home size={28} />
			</NavLink>

			<NavLink to="/calendar" className="px-20 py-2 flex items-center justify-center">
				<Calendar size={28} />
			</NavLink>

			<NavLink to="/newOrder" className="px-20 py-2 flex items-center justify-center">
				<PlusCircle size={28} />
			</NavLink>

			<NavLink to="/shopping" className="px-20 py-2 flex items-center justify-center">
				<ShoppingCart size={28} />
			</NavLink>

			<NavLink to="/profile" className="px-20 py-2 flex items-center justify-center">
				<User size={28} />
			</NavLink>
		</footer>
	);
}
