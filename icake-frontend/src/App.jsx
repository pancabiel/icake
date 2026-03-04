
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import OrderForm from "./pages/OrderForm";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Shopping from "./pages/Shoppping";
import Profile from "./pages/Profile";
import ItemsManager from "./pages/ItemsManager";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

function AppLayout() {
	return (
		<>
			<div className="pb-16">
				<Outlet />
			</div>
			<Footer />
		</>
	);
}

export default function App() {
	return (
		<Router>
			<ToastContainer />
			<Routes>
				{/* Public route — no footer */}
				<Route path="/login" element={<Login />} />

				{/* Protected routes — with footer */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						<Route path="/" element={<Home />} />
						<Route path="/calendar" element={<Calendar />} />
						<Route path="/newOrder" element={<OrderForm />} />
						<Route path="/shopping" element={<Shopping />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/cardapio" element={<ItemsManager />} />
					</Route>
				</Route>
			</Routes>
		</Router>
	);
}
