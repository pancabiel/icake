import { Home, PlusCircle, User, Calendar, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="flex justify-around items-center py-3 border-t bg-white fixed bottom-0 w-full">
			<NavLink to="/" end>
				<Home size={28} />
			</NavLink>
			<NavLink to="/calendar">
				<Calendar size={28} />
			</NavLink>
			<NavLink to="/newOrder">
				<PlusCircle size={28} />
			</NavLink>
			<NavLink to="/shopping">
				<ShoppingCart size={28} />
			</NavLink>
			<NavLink to="/profile">
				<User size={28} />
			</NavLink>
		</footer>
	);
}
