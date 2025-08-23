import { useEffect, useState } from "react";
import Header from "../components/Header";
import OrderCard from "../components/OrderCard";

export default function Home() {
	const [orders, setOrders] = useState([]);

	useEffect(() => {
		fetch("http://localhost:8080/api/orders")
			.then((res) => res.json())
			.then((data) => setOrders(data))
			.catch((err) => console.error("Error fetching orders:", err));
	}, []);

	return <div>
		<Header />
		<div className="p-4">
				{orders.length === 0 ? (
					<p>No orders yet.</p>
				) : (
					orders.map((order) => (
						<OrderCard
							key={order.id}
							date={new Date(order.date).toLocaleDateString("pt-BR")}
							name={order.clientName}
							address={order.address}
							details={order.items
								.map((item) => `${item.quantity}x ${item.itemName}`)
								.join(", ")}
						/>
					))
				)}
		</div>
	</div>;
}