
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import OrderForm from "./pages/OrderForm";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Shopping from "./pages/Shoppping";
import Profile from "./pages/Profile";

export default function App() {
	return (
		<Router>
			<div className="pb-16"> {/* padding bottom so content isn't hidden behind footer */}
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/calendar" element={<Calendar />} />
					<Route path="/newOrder" element={<OrderForm />} />
					<Route path="/shopping" element={<Shopping />} />
					<Route path="/profile" element={<Profile />} />
				</Routes>
			</div>
			<Footer />
		</Router>
	);
}
