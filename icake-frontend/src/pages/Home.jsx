import { useEffect, useState } from "react";
import Header from "../components/Header";
import OrderCard from "../components/OrderCard";
import { fetchOrders } from "@/api";

export default function Home() {
	const [orders, setOrders] = useState([]);

	useEffect(() => {
    fetchOrders()
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
								.map((orderItem) => `${orderItem.quantity}x ${orderItem.item.name}`)
								.join(", ")}
						/>
					))
				)}
		</div>
	</div>;
}